import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SyncRequestSchema } from '@praat/core';
import type { Authenticate } from '../auth/plugin.js';
import type { AppContext } from '../context.js';
import { parse } from '../errors.js';
import { ingestEvents, listEvents } from '../services/progress.js';

const PullQuerySchema = z.object({
  after: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(500).default(200),
});

export async function syncRoutes(app: FastifyInstance, { database }: AppContext, authenticate: Authenticate) {
  const { db } = database;

  /** Push: idempotent by event id, so clients can safely retry a batch. */
  app.post('/sync/events', { preHandler: authenticate, bodyLimit: 1_048_576 }, async (request) => {
    const input = parse(SyncRequestSchema, request.body);
    return ingestEvents(db, request.userId, input.events, input.deviceId);
  });

  /** Pull the event log, e.g. to restore a new device. */
  app.get('/sync/events', { preHandler: authenticate }, async (request) => {
    const query = parse(PullQuerySchema, request.query);
    return listEvents(db, request.userId, query.after, query.limit);
  });
}
