import { z } from 'zod';
import { LevelSchema, MistakeCategorySchema, SkillSchema } from './common.js';
import { LessonStepSchema } from './content.js';

const score = z.number().min(0).max(1);
const shortText = z.string().min(1).max(500);

export const MISTAKE_SOURCES = [
  'lesson',
  'exercise',
  'tutor',
  'friend',
  'scenario',
  'speech',
] as const;
export const MistakeSourceSchema = z.enum(MISTAKE_SOURCES);
export type MistakeSource = z.infer<typeof MistakeSourceSchema>;

export const CONVERSATION_MODES = ['tutor', 'friend', 'scenario'] as const;
export const ConversationModeSchema = z.enum(CONVERSATION_MODES);
export type ConversationMode = z.infer<typeof ConversationModeSchema>;

export const InputModeSchema = z.enum(['text', 'voice']);
export type InputMode = z.infer<typeof InputModeSchema>;

const base = {
  /** Client-generated UUID: makes sync idempotent. */
  id: z.uuid(),
  occurredAt: z.iso.datetime({ offset: true }),
};

export const LearningEventSchema = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('lesson.step_completed'),
    payload: z.object({ lessonId: z.string().min(1), step: LessonStepSchema, score: score.optional() }),
  }),
  z.object({
    ...base,
    type: z.literal('lesson.completed'),
    payload: z.object({ lessonId: z.string().min(1), level: LevelSchema, score }),
  }),
  z.object({
    ...base,
    type: z.literal('card.added'),
    payload: z.object({
      itemId: z.string().min(1),
      source: z.enum(['lesson', 'lookup', 'mistake', 'manual']),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('card.reviewed'),
    payload: z.object({
      itemId: z.string().min(1),
      rating: z.number().int().min(1).max(4),
      level: LevelSchema.optional(),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('exercise.attempted'),
    payload: z.object({
      exerciseId: z.string().optional(),
      skill: SkillSchema,
      level: LevelSchema,
      score,
      patternId: z.string().optional(),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('mistake.recorded'),
    payload: z.object({
      patternId: z.string().min(1),
      category: MistakeCategorySchema,
      original: shortText,
      correction: shortText,
      explanation: z.string().min(1).max(1000),
      source: MistakeSourceSchema,
    }),
  }),
  z.object({
    ...base,
    type: z.literal('speech.attempted'),
    payload: z.object({
      target: shortText,
      transcript: z.string().max(500),
      score,
      level: LevelSchema,
      sounds: z.array(z.object({ sound: z.string().min(1), ok: z.boolean() })).max(50),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('utterance.produced'),
    payload: z.object({
      mode: z.enum(['tutor', 'friend', 'scenario', 'lesson']),
      level: LevelSchema,
      words: z.number().int().min(0).max(500),
      sentences: z.number().int().min(0).max(50),
      errors: z.number().int().min(0).max(50),
      inputMode: InputModeSchema,
      latencyMs: z.number().int().min(0).max(600_000).optional(),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('scenario.completed'),
    payload: z.object({
      scenarioId: z.string().min(1),
      level: LevelSchema,
      achieved: z.boolean(),
      score,
      canDoId: z.string().optional(),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('listening.completed'),
    payload: z.object({
      itemId: z.string().min(1),
      level: LevelSchema,
      speed: z.enum(['slow', 'normal']),
      score,
    }),
  }),
]);
export type LearningEvent = z.infer<typeof LearningEventSchema>;
export type LearningEventType = LearningEvent['type'];
export type EventOf<T extends LearningEventType> = Extract<LearningEvent, { type: T }>;
export type EventPayload<T extends LearningEventType> = EventOf<T>['payload'];

/** Web Crypto is available in browsers and Node ≥ 19; core has no DOM/Node type deps. */
const webCrypto = (globalThis as unknown as { crypto: { randomUUID(): string } }).crypto;

/** Build an event with a fresh id and timestamp (uses the platform's crypto.randomUUID). */
export function createEvent<T extends LearningEventType>(
  type: T,
  payload: EventPayload<T>,
  occurredAt: Date = new Date(),
): EventOf<T> {
  return {
    id: webCrypto.randomUUID(),
    type,
    occurredAt: occurredAt.toISOString(),
    payload,
  } as EventOf<T>;
}
