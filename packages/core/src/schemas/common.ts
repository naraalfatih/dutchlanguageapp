import { z } from 'zod';

export const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'] as const;
export const LevelSchema = z.enum(LEVELS);
export type Level = z.infer<typeof LevelSchema>;

/** Position of a CEFR level on the continuous skill scale used by the learner model. */
export const LEVEL_VALUE: Record<Level, number> = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

export function levelFromValue(value: number): Level {
  const index = Math.max(0, Math.min(LEVELS.length - 1, Math.floor(value)));
  return LEVELS[index]!;
}

export const SKILLS = ['speaking', 'listening', 'vocabulary', 'grammar', 'pronunciation', 'fluency'] as const;
export const SkillSchema = z.enum(SKILLS);
export type Skill = z.infer<typeof SkillSchema>;

export const REGISTERS = ['formal', 'neutral', 'informal'] as const;
export const RegisterSchema = z.enum(REGISTERS);
export type Register = z.infer<typeof RegisterSchema>;

export const MISTAKE_CATEGORIES = ['grammar', 'vocabulary', 'pronunciation', 'naturalness', 'register'] as const;
export const MistakeCategorySchema = z.enum(MISTAKE_CATEGORIES);
export type MistakeCategory = z.infer<typeof MistakeCategorySchema>;

export const GOALS = ['moving', 'work', 'study', 'travel', 'partner', 'culture'] as const;
export const GoalSchema = z.enum(GOALS);
export type Goal = z.infer<typeof GoalSchema>;

export const REGIONS = ['nl', 'be'] as const;
export const RegionSchema = z.enum(REGIONS);
export type Region = z.infer<typeof RegionSchema>;

export const BilingualSchema = z.object({
  nl: z.string().min(1),
  en: z.string().min(1),
});
export type Bilingual = z.infer<typeof BilingualSchema>;
