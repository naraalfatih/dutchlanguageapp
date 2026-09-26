import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateConversationInputSchema, TurnInputSchema } from '@praat/core';
import type { Authenticate } from '../auth/plugin.js';
import type { AppContext } from '../context.js';
import { parse } from '../errors.js';
import {
  createConversation,
  getConversation,
  listConversations,
  takeTurn,
  type ConversationDeps,
} from '../services/conversations.js';

const IdParamsSchema = z.object({ id: z.uuid() });
const ListQuerySchema = z.object({ limit: z.coerce.number().int().min(1).max(50).default(20) });

/** AI turns cost money: a per-user burst limit on top of the daily quota. */
const turnRateLimit = {
  rateLimit: { max: 20, timeWindow: '1 minute', keyGenerator: (r: { userId?: string; ip: string }) => r.userId || r.ip },
};

export async function conversationRoutes(app: FastifyInstance, { database, ai, config }: AppContext, authenticate: Authenticate) {
  const deps: ConversationDeps = { db: database.db, ai, dailyTurnLimit: config.ai.dailyTurnLimit };

  app.post('/conversations', { preHandler: authenticate }, async (request, reply) => {
    const input = parse(CreateConversationInputSchema, request.body);
    const { conversation, turn } = await createConversation(deps, request.userId, input);
    return reply.status(201).send({ conversation, opening: turn });
  });

  app.get('/conversations', { preHandler: authenticate }, async (request) => {
    const { limit } = parse(ListQuerySchema, request.query);
    return { conversations: await listConversations(deps.db, request.userId, limit) };
  });

  app.get('/conversations/:id', { preHandler: authenticate }, async (request) => {
    const { id } = parse(IdParamsSchema, request.params);
    return getConversation(deps.db, request.userId, id);
  });

  app.post('/conversations/:id/turns', { preHandler: authenticate, config: turnRateLimit }, async (request) => {
    const { id } = parse(IdParamsSchema, request.params);
    const input = parse(TurnInputSchema, request.body);
    return takeTurn(deps, request.userId, id, input);
  });
}
