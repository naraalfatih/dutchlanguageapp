import { z } from 'zod';
import { MistakeCategorySchema, SkillSchema } from './common.js';
import { MistakeSourceSchema } from './events.js';

const isoDate = z.string(); // ISO timestamp
const dayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const LessonProgressSchema = z.object({
  status: z.enum(['started', 'completed']),
  stepsCompleted: z.array(z.string()),
  bestScore: z.number().min(0).max(1).nullable(),
  startedAt: isoDate,
  completedAt: isoDate.nullable(),
});
export type LessonProgress = z.infer<typeof LessonProgressSchema>;

export const CardStateSchema = z.object({
  itemId: z.string(),
  /** 0 new, 1 learning, 2 review, 3 relearning */
  state: z.number().int().min(0).max(3),
  stability: z.number(),
  difficulty: z.number(),
  reps: z.number().int(),
  lapses: z.number().int(),
  due: isoDate,
  lastReview: isoDate.nullable(),
  source: z.string(),
});
export type CardState = z.infer<typeof CardStateSchema>;

export const PatternStatsSchema = z.object({
  patternId: z.string(),
  category: MistakeCategorySchema,
  occurrences: z.number().int(),
  drillAttempts: z.number().int(),
  drillCorrect: z.number().int(),
  errorsByDay: z.record(dayKey, z.number().int()),
  /** day → [attempts, correct] */
  drillsByDay: z.record(dayKey, z.tuple([z.number().int(), z.number().int()])),
  firstSeenAt: isoDate,
  lastSeenAt: isoDate,
});
export type PatternStats = z.infer<typeof PatternStatsSchema>;

export const MistakeEntrySchema = z.object({
  id: z.string(),
  patternId: z.string(),
  category: MistakeCategorySchema,
  original: z.string(),
  correction: z.string(),
  explanation: z.string(),
  source: MistakeSourceSchema,
  occurredAt: isoDate,
});
export type MistakeEntry = z.infer<typeof MistakeEntrySchema>;

export const SkillEstimateSchema = z.object({
  /** Continuous CEFR scale: A0 = 0 … C1 = 5. */
  rating: z.number(),
  evidence: z.number().int(),
  updatedAt: isoDate.nullable(),
  history: z.array(z.object({ day: dayKey, rating: z.number() })),
});
export type SkillEstimate = z.infer<typeof SkillEstimateSchema>;

export const LearnerStatsSchema = z.object({
  sentencesProduced: z.number().int(),
  wordsProduced: z.number().int(),
  speakingTurns: z.number().int(),
  voiceTurns: z.number().int(),
  reviewsDone: z.number().int(),
  listeningCompleted: z.number().int(),
  sentencesByDay: z.record(dayKey, z.number().int()),
  activeDays: z.array(dayKey),
});
export type LearnerStats = z.infer<typeof LearnerStatsSchema>;

export const LearnerStateSchema = z.object({
  version: z.literal(1),
  lessons: z.record(z.string(), LessonProgressSchema),
  cards: z.record(z.string(), CardStateSchema),
  patterns: z.record(z.string(), PatternStatsSchema),
  recentMistakes: z.array(MistakeEntrySchema),
  skills: z.record(SkillSchema, SkillEstimateSchema),
  canDo: z.record(z.string(), z.object({ demonstratedAt: isoDate, evidence: z.string() })),
  stats: LearnerStatsSchema,
  lastEventAt: isoDate.nullable(),
});
export type LearnerState = z.infer<typeof LearnerStateSchema>;
