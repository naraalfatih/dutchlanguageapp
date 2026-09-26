/**
 * The offline conversation partner as pure functions, shared by the API (fallback when no
 * AI is available) and the app (practice mode without a connection or account). Also
 * derives the learning events a conversation turn produces, so both sides record the
 * same evidence for the learner model and the Mistake Diary.
 */

import type { Level } from '../schemas/common.js';
import type { Persona, Scenario } from '../schemas/content.js';
import type { Correction, TurnResponse } from '../schemas/conversation.js';
import { createEvent, type ConversationMode, type InputMode, type LearningEvent } from '../schemas/events.js';
import { countWords, splitSentences } from '../language/normalize.js';
import { friendOpening, friendTurn } from './friend-engine.js';
import { scenarioAchieved, scenarioScore, scenarioTurn, startScenario, type ScenarioEngineState } from './scenario-engine.js';
import { tutorOpening, tutorTurn } from './tutor-engine.js';

export type CorrectionStyle = 'gentle' | 'thorough';

export interface OfflineContext {
  mode: ConversationMode;
  level: Level;
  correctionStyle: CorrectionStyle;
  persona?: Persona | undefined;
  scenario?: Scenario | undefined;
  scenarioState?: ScenarioEngineState | undefined;
  topic?: string | undefined;
  /** Number of learner turns so far (0 for the first reply). */
  turnIndex: number;
}

export interface OfflineResult {
  response: TurnResponse;
  scenarioState?: ScenarioEngineState | undefined;
}

const SEVERITY_ORDER: Record<Correction['severity'], number> = { meaning: 0, grammar: 1, register: 2, naturalness: 3 };

/** Most important first; gentle mode shows at most three corrections, thorough six. */
export function limitCorrections(corrections: Correction[], style: CorrectionStyle): Correction[] {
  const sorted = [...corrections].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  return sorted.slice(0, style === 'gentle' ? 3 : 6);
}

function withLimitedCorrections(response: TurnResponse, style: CorrectionStyle): TurnResponse {
  if (!response.feedback) return response;
  return { ...response, feedback: { ...response.feedback, corrections: limitCorrections(response.feedback.corrections, style) } };
}

export function offlineOpening(ctx: OfflineContext): OfflineResult {
  if (ctx.mode === 'scenario' && ctx.scenario) {
    const { state, response } = startScenario(ctx.scenario);
    return { response, scenarioState: state };
  }
  if (ctx.mode === 'friend' && ctx.persona) {
    return { response: friendOpening(ctx.persona, ctx.level, ctx.persona.opening) };
  }
  const authored = ctx.mode === 'tutor' && !ctx.topic ? ctx.persona?.opening[ctx.level] : undefined;
  if (authored) return { response: { ...tutorOpening(ctx.level), reply: authored } };
  return { response: tutorOpening(ctx.level, ctx.topic) };
}

export function offlineReply(ctx: OfflineContext, text: string): OfflineResult {
  if (ctx.mode === 'scenario' && ctx.scenario && ctx.scenarioState) {
    const result = scenarioTurn(ctx.scenario, ctx.scenarioState, text, ctx.level);
    return { response: withLimitedCorrections(result.response, ctx.correctionStyle), scenarioState: result.state };
  }
  if (ctx.mode === 'friend' && ctx.persona) {
    return { response: withLimitedCorrections(friendTurn(ctx.persona, ctx.level, text, ctx.turnIndex), ctx.correctionStyle) };
  }
  return { response: withLimitedCorrections(tutorTurn(ctx.level, text, ctx.turnIndex), ctx.correctionStyle) };
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export interface TurnEventInput {
  mode: ConversationMode | 'lesson';
  level: Level;
  text: string;
  inputMode: InputMode;
  latencyMs?: number | undefined;
  corrections: Correction[];
  /** Set when this turn finished a scenario. */
  completedScenario?: { scenario: Scenario; state: ScenarioEngineState } | undefined;
}

/**
 * Learning events for one learner utterance: the utterance itself (speaking/grammar
 * evidence), one diary entry per correction, and the scenario result when it finished.
 */
export function turnEvents(input: TurnEventInput, now: Date = new Date()): LearningEvent[] {
  const serious = input.corrections.filter((c) => c.severity !== 'naturalness').length;
  const events: LearningEvent[] = [
    createEvent(
      'utterance.produced',
      {
        mode: input.mode,
        level: input.level,
        words: Math.min(500, countWords(input.text)),
        sentences: Math.min(50, splitSentences(input.text).length),
        errors: Math.min(50, serious),
        inputMode: input.inputMode,
        ...(input.latencyMs !== undefined ? { latencyMs: Math.min(600_000, Math.max(0, Math.round(input.latencyMs))) } : {}),
      },
      now,
    ),
  ];
  for (const c of input.corrections) {
    if (!c.original.trim() || !c.corrected.trim() || !c.explanation.trim()) continue;
    events.push(
      createEvent(
        'mistake.recorded',
        {
          patternId: c.patternId,
          category: c.category,
          original: clip(c.original, 500),
          correction: clip(c.corrected, 500),
          explanation: clip(c.explanation, 1000),
          source: input.mode,
        },
        now,
      ),
    );
  }
  const done = input.completedScenario;
  if (done?.state.completed) {
    events.push(
      createEvent(
        'scenario.completed',
        {
          scenarioId: done.scenario.id,
          level: input.level,
          achieved: scenarioAchieved(done.scenario, done.state),
          score: scenarioScore(done.scenario, done.state),
          ...(done.scenario.canDoId ? { canDoId: done.scenario.canDoId } : {}),
        },
        now,
      ),
    );
  }
  return events;
}
