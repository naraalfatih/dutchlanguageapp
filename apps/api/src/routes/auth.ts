import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type {} from '@fastify/cookie';
import { eq } from 'drizzle-orm';
import { LoginInputSchema, RegisterInputSchema, type AuthResponse } from '@praat/core';
import { dummyPasswordHash, hashPassword, verifyPassword } from '../auth/password.js';
import {
  issueRefreshToken,
  revokeByToken,
  rotateRefreshToken,
  signAccessToken,
  type IssuedRefreshToken,
} from '../auth/tokens.js';
import type { AppContext } from '../context.js';
import { userProfiles, users } from '../db/schema.js';
import { AppError, conflict, parse, unauthorized } from '../errors.js';
import { toPublicUser } from '../services/profile.js';

export const REFRESH_COOKIE = 'praat_rt';
export const AUTH_PATH = '/api/v1/auth';

/** Stricter per-IP limit for credential endpoints (brute force, credential stuffing). */
const authRateLimit = { rateLimit: { max: 10, timeWindow: '1 minute' } };

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === '23505' || e?.cause?.code === '23505';
}

export async function authRoutes(app: FastifyInstance, { config, database }: AppContext) {
  const { db } = database;

  function setRefreshCookie(reply: FastifyReply, token: IssuedRefreshToken) {
    reply.setCookie(REFRESH_COOKIE, token.token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: 'strict',
      path: AUTH_PATH,
      expires: token.expiresAt,
    });
  }

  function clearRefreshCookie(reply: FastifyReply) {
    reply.clearCookie(REFRESH_COOKIE, { path: AUTH_PATH, httpOnly: true, secure: config.cookieSecure, sameSite: 'strict' });
  }

  async function session(request: FastifyRequest, reply: FastifyReply, user: typeof users.$inferSelect): Promise<AuthResponse> {
    const refresh = await issueRefreshToken(db, config, user.id, { userAgent: request.headers['user-agent'] });
    setRefreshCookie(reply, refresh);
    return {
      user: toPublicUser(user),
      accessToken: await signAccessToken(config, user.id),
      expiresIn: config.accessTokenTtlSeconds,
    };
  }

  app.post('/auth/register', { config: authRateLimit }, async (request, reply) => {
    const input = parse(RegisterInputSchema, request.body);
    const passwordHash = await hashPassword(input.password);
    let user: typeof users.$inferSelect;
    try {
      user = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(users)
          .values({ email: input.email, passwordHash, displayName: input.displayName })
          .returning();
        await tx.insert(userProfiles).values({ userId: created!.id });
        return created!;
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw conflict('An account with this email already exists. Try signing in.');
      throw error;
    }
    const body = await session(request, reply, user);
    return reply.status(201).send(body);
  });

  app.post('/auth/login', { config: authRateLimit }, async (request, reply) => {
    const input = parse(LoginInputSchema, request.body);
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    // Always run one scrypt verification so response time doesn't reveal whether the email exists.
    const valid = await verifyPassword(input.password, user?.passwordHash ?? (await dummyPasswordHash()));
    if (!user || !valid) throw new AppError(401, 'invalid_credentials', 'Email or password is incorrect.');
    return reply.send(await session(request, reply, user));
  });

  app.post('/auth/refresh', { config: authRateLimit }, async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE];
    if (!token) throw unauthorized('Please sign in.');
    const result = await rotateRefreshToken(db, config, token, request.headers['user-agent']);
    if (!result.ok) {
      clearRefreshCookie(reply);
      if (result.reason === 'reused') request.log.warn('Refresh token reuse detected; token family revoked');
      throw unauthorized('Your session has ended. Please sign in again.');
    }
    const [user] = await db.select().from(users).where(eq(users.id, result.userId)).limit(1);
    if (!user) throw unauthorized('Please sign in.');
    setRefreshCookie(reply, result.next);
    return reply.send({
      user: toPublicUser(user),
      accessToken: await signAccessToken(config, user.id),
      expiresIn: config.accessTokenTtlSeconds,
    } satisfies AuthResponse);
  });

  app.post('/auth/logout', async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE];
    if (token) await revokeByToken(db, token);
    clearRefreshCookie(reply);
    return reply.status(204).send();
  });
}
