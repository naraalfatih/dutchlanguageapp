import type { FastifyInstance } from 'fastify';
import { EvaluateSentenceInputSchema } from '@praat/core';
import type { AiProvider } from '../ai/index.js';
import type { Authenticate } from '../auth/plugin.js';
import type { AppContext } from '../context.js';
import { parse } from '../errors.js';
import { aiRequestsToday, recordAiUsage } from '../services/ai-usage.js';
import { getProfile } from '../services/profile.js';

export async function evaluateRoutes(app: FastifyInstance, { database, ai, config }: AppContext, authenticate: Authenticate) {
  const { db } = database;

  /** Checks a learner's sentence for a speaking task (lesson "Speak" step, drills). */
  app.post(
    '/evaluate/sentence',
    { preHandler: authenticate, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (request) => {
      const input = parse(EvaluateSentenceInputSchema, request.body);
      const profile = await getProfile(db, request.userId);
      let provider: AiProvider = ai.primary;
      let quotaExceeded = false;
      if (provider.name !== 'offline' && (await aiRequestsToday(db, request.userId)) >= config.ai.dailyTurnLimit) {
        provider = ai.offline;
        quotaExceeded = true;
      }
      const task = input.task
        ? {
            prompt: input.task.prompt,
            ...(input.task.mustInclude ? { intents: input.task.mustInclude } : {}),
            ...(input.task.modelAnswers ? { modelAnswers: input.task.modelAnswers } : {}),
            ...(input.task.register ? { register: input.task.register } : {}),
          }
        : undefined;
      const result = await provider.evaluate({
        text: input.text,
        level: input.level,
        task,
        correctionStyle: profile.correctionStyle,
      });
      if (result.usage) await recordAiUsage(db, request.userId, result.usage);
      return {
        achieved: result.achieved,
        feedback: result.feedback,
        score: result.score,
        source: result.source,
        ...(quotaExceeded ? { quotaExceeded } : {}),
      };
    },
  );
}
