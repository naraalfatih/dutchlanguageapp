import { z } from 'zod';
import { BilingualSchema, MistakeCategorySchema } from './common.js';

export const SEVERITIES = ['meaning', 'grammar', 'naturalness', 'register'] as const;
export const SeveritySchema = z.enum(SEVERITIES);
export type Severity = z.infer<typeof SeveritySchema>;

export const CorrectionSchema = z.object({
  /** What the learner wrote (sentence or fragment). */
  original: z.string(),
  /** The natural, correct version. */
  corrected: z.string(),
  /** Short, kind explanation in English. */
  explanation: z.string(),
  category: MistakeCategorySchema,
  /** A known pattern id from the catalogue (e.g. `word-order-v2`), or `other`. */
  patternId: z.string(),
  severity: SeveritySchema,
});
export type Correction = z.infer<typeof CorrectionSchema>;

export const TurnFeedbackSchema = z.object({
  /** Would a Dutch speaker understand what the learner meant? */
  understood: z.boolean(),
  corrections: z.array(CorrectionSchema),
  /** A more natural way to say it, when the learner's sentence is fine but textbook-like. */
  natural: z.object({ nl: z.string(), en: z.string(), note: z.string().nullable() }).nullable(),
  /** Specific positive reinforcement ("Nice use of 'even'!"). */
  praise: z.string().nullable(),
});
export type TurnFeedback = z.infer<typeof TurnFeedbackSchema>;

export const GlossaryItemSchema = z.object({
  term: z.string(),
  meaning: z.string(),
  note: z.string().nullable(),
});
export type GlossaryItem = z.infer<typeof GlossaryItemSchema>;

export const TaskProgressSchema = z.object({
  beatId: z.string().nullable(),
  /** Did the learner achieve the current beat's goal? */
  achieved: z.boolean(),
  /** Is the whole scenario finished? */
  completed: z.boolean(),
  /** 0–1 share of beats completed. */
  progress: z.number().min(0).max(1),
  /** The next thing the learner should do (English). */
  nextTask: z.string().nullable(),
});
export type TaskProgress = z.infer<typeof TaskProgressSchema>;

export const TurnResponseSchema = z.object({
  reply: BilingualSchema,
  feedback: TurnFeedbackSchema.nullable(),
  glossary: z.array(GlossaryItemSchema),
  task: TaskProgressSchema.nullable(),
  source: z.enum(['ai', 'offline']),
  quotaExceeded: z.boolean().optional(),
  debrief: z.string().nullable().optional(),
});
export type TurnResponse = z.infer<typeof TurnResponseSchema>;
