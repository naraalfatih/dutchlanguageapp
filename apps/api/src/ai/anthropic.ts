import type {
  BetaMessage,
  BetaMessageParam,
  MessageCreateParamsNonStreaming,
} from '@anthropic-ai/sdk/resources/beta/messages/messages';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import {
  CorrectionSchema,
  GlossaryItemSchema,
  MAX_ATTEMPTS_PER_BEAT,
  detectMistakes,
  evaluateFreeResponse,
  glossFor,
  nextScenarioState,
  scenarioProgress,
  type GlossaryItem,
  type TurnResponse,
} from '@praat/core';
import { z } from 'zod';
import { limitCorrections, mergeCorrections } from './merge.js';
import type { OfflineProvider } from './offline.js';
import {
  CORE_SYSTEM_PROMPT,
  conversationSystemPrompt,
  evaluationPrompt,
  turnContextBlock,
  type ScenarioTurnInfo,
} from './prompts.js';
import type {
  AiProvider,
  EvaluationRequest,
  EvaluationResult,
  HistoryMessage,
  TurnContext,
  TurnResult,
  Usage,
} from './types.js';

/** The slice of the Anthropic client this provider uses (lets tests pass a fake). */
export interface MessagesClient {
  beta: {
    messages: {
      create(params: MessageCreateParamsNonStreaming): PromiseLike<BetaMessage>;
    };
  };
}

export interface AnthropicOptions {
  model: string;
  effort: 'low' | 'medium' | 'high';
  maxTokens: number;
  /** Opt into server-side fallbacks so a declined request is retried on another model. */
  fallbacks: boolean;
}

export interface Log {
  warn(obj: object, msg?: string): void;
}

// Structured-output schemas. No length/number constraints: the model is steered by the
// prompt, and the server-side validators below (merge, limit) keep the result tidy.
const NaturalSchema = z.object({ nl: z.string(), en: z.string(), note: z.string().nullable() }).nullable();

export const AiTurnSchema = z.object({
  reply: z.object({ nl: z.string(), en: z.string() }),
  understood: z.boolean(),
  corrections: z.array(CorrectionSchema),
  natural: NaturalSchema,
  praise: z.string().nullable(),
  glossary: z.array(GlossaryItemSchema),
  /** Scenario mode: did the learner achieve the current step? Null in free conversation. */
  taskAchieved: z.boolean().nullable(),
});
export type AiTurn = z.infer<typeof AiTurnSchema>;

export const AiEvaluationSchema = z.object({
  achieved: z.boolean(),
  understood: z.boolean(),
  corrections: z.array(CorrectionSchema),
  natural: NaturalSchema,
  praise: z.string().nullable(),
});

const turnFormat = betaZodOutputFormat(AiTurnSchema);
const evaluationFormat = betaZodOutputFormat(AiEvaluationSchema);

/** Messages kept from the conversation so far; older turns are dropped. */
const HISTORY_LIMIT = 24;

class ModelUnavailable extends Error {}

/**
 * Conversation partner backed by Claude. Each turn: the rule-based detector runs first
 * (high-precision corrections with stable pattern ids), then one structured-output call
 * produces the in-character reply plus feedback. Anything unexpected (refusal, invalid
 * output, network error) falls back to the offline engine so the learner is never stuck.
 */
export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic' as const;

  constructor(
    private readonly client: MessagesClient,
    private readonly options: AnthropicOptions,
    private readonly offline: OfflineProvider,
    private readonly log?: Log,
  ) {}

  /** Openings are authored content: instant, free and always level-appropriate. */
  opening(ctx: TurnContext): Promise<TurnResult> {
    return this.offline.opening(ctx);
  }

  async reply(ctx: TurnContext, learnerText: string): Promise<TurnResult> {
    const scenario = ctx.mode === 'scenario' ? ctx.scenario : undefined;
    const state = ctx.scenarioState;
    // A finished scenario only needs a polite goodbye; no model call required.
    if (scenario && (!state || state.completed)) return this.offline.reply(ctx, learnerText);

    const register = scenario?.register;
    const detection = detectMistakes(learnerText, register ? { register } : {});

    let info: ScenarioTurnInfo | undefined;
    if (scenario && state) {
      const beat = scenario.beats[state.beatIndex]!;
      const check = evaluateFreeResponse(learnerText, {
        intents: beat.intents,
        register: scenario.register,
        modelAnswers: beat.modelAnswers,
      });
      info = {
        beat,
        next: scenario.beats[state.beatIndex + 1],
        keywordMatch: check.achieved,
        lastAttempt: state.attempts + 1 >= MAX_ATTEMPTS_PER_BEAT,
      };
    }

    let ai: AiTurn;
    let usage: Usage;
    try {
      ({ output: ai, usage } = await this.call(
        [
          { type: 'text', text: CORE_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: conversationSystemPrompt(ctx), cache_control: { type: 'ephemeral' } },
        ],
        conversationMessages(ctx.history, `${turnContextBlock(ctx, detection.corrections, info)}\n<learner_message>\n${learnerText}\n</learner_message>`),
        turnFormat,
      ));
    } catch (error) {
      this.log?.warn({ err: error instanceof Error ? error.message : String(error) }, 'AI turn failed; using offline engine');
      return this.offline.reply(ctx, learnerText);
    }

    const corrections = limitCorrections(mergeCorrections(detection.corrections, ai.corrections), ctx.correctionStyle);
    const glossary = mergeGlossary(ai.glossary, glossFor(ai.reply.nl));
    const response: TurnResponse = {
      reply: { nl: ai.reply.nl.trim() || '…', en: ai.reply.en.trim() || '…' },
      feedback: {
        understood: ai.understood,
        corrections,
        natural: ai.natural,
        praise: ai.praise,
      },
      glossary,
      task: null,
      source: 'ai',
      debrief: null,
    };

    if (!scenario || !state || !info) return { response, usage };

    // The model judges meaning; the keyword check is the fallback when it abstains.
    const achieved = ai.taskAchieved ?? info.keywordMatch;
    const moveOn = achieved || info.lastAttempt;
    const next = nextScenarioState(scenario, state, achieved, moveOn);
    if (moveOn && !achieved && response.feedback && !response.feedback.natural) {
      response.feedback.natural = {
        nl: info.beat.modelAnswers[0]!,
        en: 'Here is one way to say it.',
        note: info.beat.culturalNote ?? null,
      };
    }
    const upcoming = next.completed ? undefined : scenario.beats[next.beatIndex];
    response.task = {
      beatId: info.beat.id,
      achieved,
      completed: next.completed,
      progress: scenarioProgress(scenario, next),
      nextTask: moveOn ? (upcoming?.task ?? null) : info.beat.task,
    };
    response.debrief = next.completed ? scenario.debrief : null;
    return { response, scenarioState: next, usage };
  }

  async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    const detection = detectMistakes(request.text, request.task?.register ? { register: request.task.register } : {});
    const baseline = evaluateFreeResponse(request.text, request.task ?? {});
    try {
      const { output, usage } = await this.call(
        [{ type: 'text', text: CORE_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        [
          {
            role: 'user',
            content: `${evaluationPrompt(request, detection.corrections)}\n<learner_answer>\n${request.text}\n</learner_answer>\nThere is no character reply in this mode.`,
          },
        ],
        evaluationFormat,
      );
      const corrections = limitCorrections(mergeCorrections(detection.corrections, output.corrections), request.correctionStyle);
      const serious = corrections.filter((c) => c.severity !== 'naturalness').length;
      const accuracy = Math.max(0, 1 - 0.15 * serious);
      return {
        achieved: output.achieved,
        feedback: { understood: output.understood, corrections, natural: output.natural, praise: output.praise },
        corrections,
        score: Math.round(((output.achieved ? 0.6 : 0) + 0.4 * accuracy) * 100) / 100,
        source: 'ai',
        usage,
      };
    } catch (error) {
      this.log?.warn({ err: error instanceof Error ? error.message : String(error) }, 'AI evaluation failed; using offline evaluator');
      const corrections = limitCorrections(baseline.corrections, request.correctionStyle);
      return {
        achieved: baseline.achieved,
        feedback: { ...baseline.feedback, corrections },
        corrections,
        score: baseline.score,
        source: 'offline',
      };
    }
  }

  private async call<T>(
    system: Exclude<MessageCreateParamsNonStreaming['system'], string | undefined>,
    messages: BetaMessageParam[],
    format: { parse(content: string): T } & NonNullable<NonNullable<MessageCreateParamsNonStreaming['output_config']>['format']>,
  ): Promise<{ output: T; usage: Usage }> {
    const { model, effort, maxTokens, fallbacks } = this.options;
    const params: MessageCreateParamsNonStreaming = {
      model,
      max_tokens: maxTokens,
      system,
      messages,
      output_config: { effort, format },
      ...(fallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    };
    const message = await this.client.beta.messages.create(params);
    if (message.stop_reason === 'refusal') throw new ModelUnavailable('model declined the request');
    if (message.stop_reason === 'max_tokens') throw new ModelUnavailable('output truncated');
    const text = finalText(message);
    if (!text) throw new ModelUnavailable('no text in response');
    return { output: format.parse(text), usage: usageOf(message) };
  }
}

/**
 * The structured output after the last fallback boundary. When a server-side fallback
 * happened, text before the `fallback` block came from the model that declined.
 */
export function finalText(message: BetaMessage): string {
  let start = 0;
  message.content.forEach((block, index) => {
    if (block.type === 'fallback') start = index + 1;
  });
  return message.content
    .slice(start)
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')
    .trim();
}

function usageOf(message: BetaMessage): Usage {
  const u = message.usage;
  return {
    inputTokens: u.input_tokens + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0),
    outputTokens: u.output_tokens,
  };
}

/**
 * Chat history as alternating user/assistant messages. The character speaks first, so the
 * transcript opens with a short stage direction; consecutive same-role messages are joined.
 * A cache breakpoint on the last history message lets the next turn reuse the whole prefix.
 */
export function conversationMessages(history: HistoryMessage[], finalUserContent: string): BetaMessageParam[] {
  const recent = history.slice(-HISTORY_LIMIT);
  const turns: { role: 'user' | 'assistant'; text: string }[] = [];
  if (recent[0]?.role !== 'learner') turns.push({ role: 'user', text: '(The conversation begins. You speak first.)' });
  for (const m of recent) {
    const role = m.role === 'learner' ? 'user' : 'assistant';
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.text = `${last.text}\n${m.text}`;
    else turns.push({ role, text: m.text });
  }
  const messages: BetaMessageParam[] = turns.map((t) => ({ role: t.role, content: t.text }));
  const lastHistory = messages[messages.length - 1];
  if (lastHistory && messages.length > 1) {
    const text = turns[turns.length - 1]!.text;
    lastHistory.content = [{ type: 'text', text, cache_control: { type: 'ephemeral' } }];
  }
  if (lastHistory?.role === 'user') {
    // History ended with the learner (e.g. a previous turn failed): fold into the final message.
    const previous = turns[turns.length - 1]!.text;
    messages[messages.length - 1] = { role: 'user', content: `${previous}\n\n${finalUserContent}` };
  } else {
    messages.push({ role: 'user', content: finalUserContent });
  }
  return messages;
}

function mergeGlossary(model: GlossaryItem[], known: GlossaryItem[]): GlossaryItem[] {
  const seen = new Set(model.map((g) => g.term.toLowerCase()));
  return [...model, ...known.filter((g) => !seen.has(g.term.toLowerCase()))].slice(0, 4);
}

