import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Config } from '../config.js';
import { unauthorized } from '../errors.js';
import { verifyAccessToken } from './tokens.js';

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by the `authenticate` pre-handler on protected routes. */
    userId: string;
  }
}

export function registerAuth(app: FastifyInstance, config: Config) {
  app.decorateRequest('userId', '');

  /** Pre-handler for protected routes: requires a valid `Authorization: Bearer` access token. */
  return async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const header = request.headers.authorization;
    const match = header ? /^Bearer\s+(\S+)$/i.exec(header) : null;
    if (!match) throw unauthorized();
    const claims = await verifyAccessToken(config, match[1]!);
    if (!claims) throw unauthorized('Your session has expired. Please sign in again.');
    request.userId = claims.userId;
  };
}

export type Authenticate = ReturnType<typeof registerAuth>;
