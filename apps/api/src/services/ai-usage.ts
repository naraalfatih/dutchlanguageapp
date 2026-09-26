import { and, eq, sql } from 'drizzle-orm';
import { dayKey } from '@praat/core';
import type { Usage } from '../ai/types.js';
import type { Db } from '../db/client.js';
import { aiUsage } from '../db/schema.js';

/** AI requests the user made today (UTC). */
export async function aiRequestsToday(db: Db, userId: string, now = new Date()): Promise<number> {
  const [row] = await db
    .select({ requests: aiUsage.requests })
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.day, dayKey(now))));
  return row?.requests ?? 0;
}

export async function recordAiUsage(db: Db, userId: string, usage: Usage, now = new Date()): Promise<void> {
  await db
    .insert(aiUsage)
    .values({
      userId,
      day: dayKey(now),
      requests: 1,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    })
    .onConflictDoUpdate({
      target: [aiUsage.userId, aiUsage.day],
      set: {
        requests: sql`${aiUsage.requests} + 1`,
        inputTokens: sql`${aiUsage.inputTokens} + ${usage.inputTokens}`,
        outputTokens: sql`${aiUsage.outputTokens} + ${usage.outputTokens}`,
      },
    });
}
