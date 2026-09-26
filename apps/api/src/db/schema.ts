import { sql } from 'drizzle-orm';
import {
  bigserial,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  ...timestamps,
});

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  goals: jsonb('goals').$type<string[]>().notNull().default([]),
  region: text('region').notNull().default('nl'),
  selfReportedLevel: text('self_reported_level').notNull().default('A0'),
  dailyMinutes: integer('daily_minutes').notNull().default(10),
  nativeLanguage: text('native_language').notNull().default('en'),
  correctionStyle: text('correction_style').notNull().default('gentle'),
  speechRate: real('speech_rate').notNull().default(1),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    familyId: uuid('family_id').notNull(),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    replacedBy: uuid('replaced_by'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('refresh_tokens_family_idx').on(t.familyId), index('refresh_tokens_user_idx').on(t.userId)],
);

/** Append-only learning event log — the source of truth for all progress. */
export const learningEvents = pgTable(
  'learning_events',
  {
    id: uuid('id').primaryKey(),
    seq: bigserial('seq', { mode: 'number' }).notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    payload: jsonb('payload').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    deviceId: text('device_id'),
  },
  (t) => [index('learning_events_user_seq_idx').on(t.userId, t.seq)],
);

// ---------------------------------------------------------------- Projections

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').notNull(),
    status: text('status').notNull(),
    stepsCompleted: jsonb('steps_completed').$type<string[]>().notNull().default([]),
    bestScore: real('best_score'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const srsCards = pgTable(
  'srs_cards',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    itemId: text('item_id').notNull(),
    state: smallint('state').notNull(),
    stability: real('stability').notNull(),
    difficulty: real('difficulty').notNull(),
    reps: integer('reps').notNull(),
    lapses: integer('lapses').notNull(),
    dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
    lastReviewAt: timestamp('last_review_at', { withTimezone: true }),
    source: text('source').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] }), index('srs_cards_due_idx').on(t.userId, t.dueAt)],
);

export const mistakes = pgTable(
  'mistakes',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    patternId: text('pattern_id').notNull(),
    category: text('category').notNull(),
    original: text('original').notNull(),
    correction: text('correction').notNull(),
    explanation: text('explanation').notNull(),
    source: text('source').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  },
  (t) => [index('mistakes_user_pattern_idx').on(t.userId, t.patternId, t.occurredAt)],
);

export const mistakePatternStats = pgTable(
  'mistake_pattern_stats',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    patternId: text('pattern_id').notNull(),
    category: text('category').notNull(),
    occurrences: integer('occurrences').notNull(),
    drillAttempts: integer('drill_attempts').notNull(),
    drillCorrect: integer('drill_correct').notNull(),
    errorsByDay: jsonb('errors_by_day').$type<Record<string, number>>().notNull(),
    drillsByDay: jsonb('drills_by_day').$type<Record<string, [number, number]>>().notNull(),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.patternId] })],
);

export const skillEstimates = pgTable(
  'skill_estimates',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    skill: text('skill').notNull(),
    rating: real('rating').notNull(),
    evidenceCount: integer('evidence_count').notNull(),
    history: jsonb('history').$type<{ day: string; rating: number }[]>().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.skill] })],
);

export const canDoProgress = pgTable(
  'can_do_progress',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    canDoId: text('can_do_id').notNull(),
    demonstratedAt: timestamp('demonstrated_at', { withTimezone: true }).notNull(),
    evidence: text('evidence').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.canDoId] })],
);

export const learnerStats = pgTable('learner_stats', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  sentencesProduced: integer('sentences_produced').notNull().default(0),
  wordsProduced: integer('words_produced').notNull().default(0),
  speakingTurns: integer('speaking_turns').notNull().default(0),
  voiceTurns: integer('voice_turns').notNull().default(0),
  reviewsDone: integer('reviews_done').notNull().default(0),
  listeningCompleted: integer('listening_completed').notNull().default(0),
  sentencesByDay: jsonb('sentences_by_day').$type<Record<string, number>>().notNull().default({}),
  activeDays: jsonb('active_days').$type<string[]>().notNull().default([]),
  lastEventAt: timestamp('last_event_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------- Conversations

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mode: text('mode').notNull(),
    personaId: text('persona_id'),
    scenarioId: text('scenario_id'),
    level: text('level').notNull(),
    title: text('title').notNull(),
    engineState: jsonb('engine_state')
      .notNull()
      .default(sql`'{}'::jsonb`),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('conversations_user_idx').on(t.userId, t.updatedAt)],
);

export const conversationMessages = pgTable(
  'conversation_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    text: text('text').notNull(),
    translation: text('translation'),
    feedback: jsonb('feedback'),
    glossary: jsonb('glossary'),
    inputMode: text('input_mode'),
    source: text('source'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('conversation_messages_conv_idx').on(t.conversationId, t.createdAt)],
);

export const aiUsage = pgTable(
  'ai_usage',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    day: date('day').notNull(),
    requests: integer('requests').notNull().default(0),
    inputTokens: integer('input_tokens').notNull().default(0),
    outputTokens: integer('output_tokens').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

export const ttsCache = pgTable('tts_cache', {
  key: text('key').primaryKey(),
  voice: text('voice').notNull(),
  rate: real('rate').notNull(),
  text: text('text').notNull(),
  contentType: text('content_type').notNull(),
  storageKey: text('storage_key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
