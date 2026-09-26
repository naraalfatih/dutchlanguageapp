import type { FastifyInstance } from 'fastify';
import type { Authenticate } from '../auth/plugin.js';
import type { AppContext } from '../context.js';
import { AppError } from '../errors.js';

/**
 * Server-side speech is optional. Until a TTS/STT provider is configured these endpoints
 * answer 501 and the client uses on-device speech (Web Speech API / platform voices).
 * The contract is documented in docs/06-api.md so a provider can be added without client changes.
 */
export async function speechRoutes(app: FastifyInstance, _ctx: AppContext, authenticate: Authenticate) {
  const notConfigured = () => {
    throw new AppError(501, 'not_configured', 'Server speech is not configured; use on-device speech.');
  };
  app.get('/speech/tts', { preHandler: authenticate }, async () => notConfigured());
  app.post('/speech/transcribe', { preHandler: authenticate, bodyLimit: 2_097_152 }, async () => notConfigured());
}
