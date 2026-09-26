import type { FastifyInstance } from 'fastify';
import { CONTENT_VERSION } from '@praat/content';
import type { AppContext } from '../context.js';

export const API_VERSION = '0.1.0';

export async function healthRoutes(app: FastifyInstance, { database, ai }: AppContext) {
  app.get('/health', async (request, reply) => {
    let db: 'ok' | 'error' = 'ok';
    try {
      await database.ping();
    } catch (error) {
      request.log.error({ err: error }, 'Database ping failed');
      db = 'error';
    }
    return reply.status(db === 'ok' ? 200 : 503).send({
      status: db === 'ok' ? 'ok' : 'degraded',
      db,
      ai: ai.primary.name,
      version: API_VERSION,
      contentVersion: CONTENT_VERSION,
    });
  });
}
