import type { FastifyInstance } from 'fastify';
import { generatePlan } from '@praat/core';
import { planCatalog } from '@praat/content';
import type { Authenticate } from '../auth/plugin.js';
import type { AppContext } from '../context.js';
import { getProfile } from '../services/profile.js';
import { loadLearnerState } from '../services/progress.js';

export async function progressRoutes(app: FastifyInstance, { database }: AppContext, authenticate: Authenticate) {
  const { db } = database;
  const catalog = planCatalog();

  app.get('/progress/state', { preHandler: authenticate }, async (request) => loadLearnerState(db, request.userId));

  app.get('/progress/plan', { preHandler: authenticate }, async (request) => {
    const [state, profile] = await Promise.all([loadLearnerState(db, request.userId), getProfile(db, request.userId)]);
    return generatePlan(state, profile, catalog, new Date());
  });
}
