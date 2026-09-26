import {
  evaluateFreeResponse,
  friendOpening,
  friendTurn,
  scenarioTurn,
  startScenario,
  tutorOpening,
  tutorTurn,
} from '@praat/core';
import { limitCorrections } from './merge.js';
import type { AiProvider, EvaluationRequest, EvaluationResult, TurnContext, TurnResult } from './types.js';

/**
 * Deterministic, rule-based conversation partner. Used when no AI key is configured,
 * when the daily AI quota is used up, and as a fallback if the AI call fails.
 */
export class OfflineProvider implements AiProvider {
  readonly name = 'offline' as const;

  async opening(ctx: TurnContext): Promise<TurnResult> {
    if (ctx.mode === 'scenario' && ctx.scenario) {
      const { state, response } = startScenario(ctx.scenario);
      return { response, scenarioState: state };
    }
    if (ctx.mode === 'friend' && ctx.persona) {
      return { response: friendOpening(ctx.persona, ctx.level, ctx.persona.opening) };
    }
    if (ctx.persona?.opening[ctx.level] && ctx.mode === 'tutor' && !ctx.topic) {
      return { response: { ...tutorOpening(ctx.level), reply: ctx.persona.opening[ctx.level]! } };
    }
    return { response: tutorOpening(ctx.level, ctx.topic) };
  }

  async reply(ctx: TurnContext, learnerText: string): Promise<TurnResult> {
    if (ctx.mode === 'scenario' && ctx.scenario && ctx.scenarioState) {
      const result = scenarioTurn(ctx.scenario, ctx.scenarioState, learnerText, ctx.level);
      return { response: withLimitedCorrections(result.response, ctx.correctionStyle), scenarioState: result.state };
    }
    if (ctx.mode === 'friend' && ctx.persona) {
      return { response: withLimitedCorrections(friendTurn(ctx.persona, ctx.level, learnerText, ctx.turnIndex), ctx.correctionStyle) };
    }
    return { response: withLimitedCorrections(tutorTurn(ctx.level, learnerText, ctx.turnIndex), ctx.correctionStyle) };
  }

  async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    const result = evaluateFreeResponse(request.text, request.task ?? {});
    const corrections = limitCorrections(result.corrections, request.correctionStyle);
    return {
      achieved: result.achieved,
      feedback: { ...result.feedback, corrections },
      corrections,
      score: result.score,
      source: 'offline',
    };
  }
}

function withLimitedCorrections(response: TurnResult['response'], style: 'gentle' | 'thorough') {
  if (!response.feedback) return response;
  return { ...response, feedback: { ...response.feedback, corrections: limitCorrections(response.feedback.corrections, style) } };
}
