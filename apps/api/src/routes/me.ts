import type { FastifyInstance } from 'fastify';
import type {} from '@fastify/cookie';
import { asc, eq, inArray } from 'drizzle-orm';
import { ProfileInputSchema } from '@praat/core';
import type { Authenticate } from '../auth/plugin.js';
import type { AppContext } from '../context.js';
import { conversationMessages, conversations, learningEvents, users } from '../db/schema.js';
import { notFound, parse } from '../errors.js';
import { loadLearnerState } from '../services/progress.js';
import { getProfile, toPublicUser, updateProfile } from '../services/profile.js';
import { REFRESH_COOKIE, AUTH_PATH } from './auth.js';

export async function meRoutes(app: FastifyInstance, { database, config }: AppContext, authenticate: Authenticate) {
  const { db } = database;

  app.get('/me', { preHandler: authenticate }, async (request) => {
    const [user] = await db.select().from(users).where(eq(users.id, request.userId)).limit(1);
    if (!user) throw notFound('Account not found.');
    return { user: toPublicUser(user), profile: await getProfile(db, user.id) };
  });

  app.patch('/me/profile', { preHandler: authenticate }, async (request) => {
    const input = parse(ProfileInputSchema, request.body);
    return { profile: await updateProfile(db, request.userId, input) };
  });

  /** GDPR access and portability: everything we store about the learner, as JSON. */
  app.get('/me/export', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.userId;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw notFound('Account not found.');
    const [profile, state, events, convs] = await Promise.all([
      getProfile(db, userId),
      loadLearnerState(db, userId),
      db.select().from(learningEvents).where(eq(learningEvents.userId, userId)).orderBy(asc(learningEvents.seq)),
      db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(asc(conversations.createdAt)),
    ]);
    const messages = convs.length
      ? await db
          .select()
          .from(conversationMessages)
          .where(
            inArray(
              conversationMessages.conversationId,
              convs.map((c) => c.id),
            ),
          )
          .orderBy(asc(conversationMessages.createdAt))
      : [];
    reply.header('Content-Disposition', 'attachment; filename="praat-export.json"');
    return {
      exportedAt: new Date().toISOString(),
      user: toPublicUser(user),
      profile,
      learnerState: state,
      events: events.map((e) => ({ id: e.id, type: e.type, occurredAt: e.occurredAt.toISOString(), payload: e.payload })),
      conversations: convs.map((c) => ({
        id: c.id,
        mode: c.mode,
        title: c.title,
        level: c.level,
        createdAt: c.createdAt.toISOString(),
        messages: messages
          .filter((m) => m.conversationId === c.id)
          .map((m) => ({
            role: m.role,
            text: m.text,
            translation: m.translation,
            feedback: m.feedback,
            createdAt: m.createdAt.toISOString(),
          })),
      })),
    };
  });

  /** GDPR erasure: deletes the account; every table cascades from users. */
  app.delete('/me', { preHandler: authenticate }, async (request, reply) => {
    await db.delete(users).where(eq(users.id, request.userId));
    reply.clearCookie(REFRESH_COOKIE, { path: AUTH_PATH, httpOnly: true, secure: config.cookieSecure, sameSite: 'strict' });
    return reply.status(204).send();
  });
}
