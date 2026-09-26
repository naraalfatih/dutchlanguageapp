import { z } from 'zod';
import { GoalSchema, LevelSchema, RegionSchema } from './common.js';

export const DAILY_MINUTES = [5, 10, 20, 30] as const;

export const ProfileSchema = z.object({
  goals: z.array(GoalSchema).max(6),
  region: RegionSchema,
  /** Self-reported level from onboarding; seeds the skill model. */
  level: LevelSchema,
  dailyMinutes: z.union([z.literal(5), z.literal(10), z.literal(20), z.literal(30)]),
  nativeLanguage: z.string().min(2).max(8),
  correctionStyle: z.enum(['gentle', 'thorough']),
  speechRate: z.number().min(0.6).max(1.2),
  onboarded: z.boolean(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const ProfileInputSchema = ProfileSchema.partial();
export type ProfileInput = z.infer<typeof ProfileInputSchema>;

export const DEFAULT_PROFILE: Profile = {
  goals: [],
  region: 'nl',
  level: 'A0',
  dailyMinutes: 10,
  nativeLanguage: 'en',
  correctionStyle: 'gentle',
  speechRate: 1,
  onboarded: false,
};
