import { evaluateFreeResponse, limitCorrections, offlineOpening, offlineReply } from '@praat/core';
import type { AiProvider, EvaluationRequest, EvaluationResult, TurnContext, TurnResult } from './types.js';

/**
 * Deterministic, rule-based conversation partner (the same engine the app uses offline).
 * Used when no AI key is configured, when the daily AI quota is used up, and as a
 * fallback if the AI call fails.
 */
export class OfflineProvider implements AiProvider {
  readonly name = 'offline' as const;

  async opening(ctx: TurnContext): Promise<TurnResult> {
    return offlineOpening(ctx);
  }

  async reply(ctx: TurnContext, learnerText: string): Promise<TurnResult> {
    return offlineReply(ctx, learnerText);
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
