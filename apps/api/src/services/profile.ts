import { eq } from 'drizzle-orm';
import {
  DEFAULT_PROFILE,
  GoalSchema,
  LevelSchema,
  RegionSchema,
  type Profile,
  type ProfileInput,
  type PublicUser,
} from '@praat/core';
import type { Db } from '../db/client.js';
import { userProfiles, users } from '../db/schema.js';

type ProfileRow = typeof userProfiles.$inferSelect;

function toProfile(row: ProfileRow | undefined): Profile {
  if (!row) return DEFAULT_PROFILE;
  const minutes = [5, 10, 20, 30].includes(row.dailyMinutes) ? (row.dailyMinutes as Profile['dailyMinutes']) : 10;
  return {
    goals: row.goals.flatMap((g) => {
      const parsed = GoalSchema.safeParse(g);
      return parsed.success ? [parsed.data] : [];
    }),
    region: RegionSchema.catch('nl').parse(row.region),
    level: LevelSchema.catch('A0').parse(row.selfReportedLevel),
    dailyMinutes: minutes,
    nativeLanguage: row.nativeLanguage,
    correctionStyle: row.correctionStyle === 'thorough' ? 'thorough' : 'gentle',
    speechRate: row.speechRate,
    onboarded: row.onboardedAt !== null,
  };
}

export async function getProfile(db: Db, userId: string): Promise<Profile> {
  const [row] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
  return toProfile(row);
}

/**
 * Partial update. Changing the level re-seeds skill estimates that have no evidence yet:
 * skills without a projection row are derived from the profile level on load.
 */
export async function updateProfile(db: Db, userId: string, input: ProfileInput): Promise<Profile> {
  const values: Partial<typeof userProfiles.$inferInsert> = { updatedAt: new Date() };
  if (input.goals !== undefined) values.goals = input.goals;
  if (input.region !== undefined) values.region = input.region;
  if (input.level !== undefined) values.selfReportedLevel = input.level;
  if (input.dailyMinutes !== undefined) values.dailyMinutes = input.dailyMinutes;
  if (input.nativeLanguage !== undefined) values.nativeLanguage = input.nativeLanguage;
  if (input.correctionStyle !== undefined) values.correctionStyle = input.correctionStyle;
  if (input.speechRate !== undefined) values.speechRate = input.speechRate;
  if (input.onboarded !== undefined) values.onboardedAt = input.onboarded ? new Date() : null;

  const [row] = await db
    .insert(userProfiles)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: userProfiles.userId, set: values })
    .returning();
  return toProfile(row);
}

export function toPublicUser(row: typeof users.$inferSelect): PublicUser {
  return { id: row.id, email: row.email, displayName: row.displayName, createdAt: row.createdAt.toISOString() };
}
