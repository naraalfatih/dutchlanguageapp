import { and, asc, desc, eq, gt, sql } from 'drizzle-orm';
import {
  applyEvents,
  initialLearnerState,
  initialSkills,
  LevelSchema,
  RECENT_MISTAKES_LIMIT,
  SKILLS,
  type LearnerState,
  type LearningEvent,
  type Level,
  type MistakeCategory,
  type MistakeSource,
} from '@praat/core';
import type { Db } from '../db/client.js';
import {
  canDoProgress,
  learnerStats,
  learningEvents,
  lessonProgress,
  mistakePatternStats,
  mistakes,
  skillEstimates,
  srsCards,
  userProfiles,
} from '../db/schema.js';

const iso = (d: Date | null) => (d ? d.toISOString() : null);
const MAX_FUTURE_MS = 5 * 60_000;

async function profileLevel(db: Db, userId: string): Promise<Level> {
  const [profile] = await db
    .select({ level: userProfiles.selfReportedLevel })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));
  const parsed = LevelSchema.safeParse(profile?.level);
  return parsed.success ? parsed.data : 'A0';
}

/** Rebuild the learner state from the projection tables. */
export async function loadLearnerState(db: Db, userId: string): Promise<LearnerState> {
  const level = await profileLevel(db, userId);
  const state = initialLearnerState(level);

  const [lessonRows, cardRows, patternRows, mistakeRows, skillRows, canDoRows, statsRows] = await Promise.all([
    db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId)),
    db.select().from(srsCards).where(eq(srsCards.userId, userId)),
    db.select().from(mistakePatternStats).where(eq(mistakePatternStats.userId, userId)),
    db.select().from(mistakes).where(eq(mistakes.userId, userId)).orderBy(desc(mistakes.occurredAt)).limit(RECENT_MISTAKES_LIMIT),
    db.select().from(skillEstimates).where(eq(skillEstimates.userId, userId)),
    db.select().from(canDoProgress).where(eq(canDoProgress.userId, userId)),
    db.select().from(learnerStats).where(eq(learnerStats.userId, userId)),
  ]);

  for (const row of lessonRows) {
    state.lessons[row.lessonId] = {
      status: row.status as 'started' | 'completed',
      stepsCompleted: row.stepsCompleted,
      bestScore: row.bestScore,
      startedAt: row.startedAt.toISOString(),
      completedAt: iso(row.completedAt),
    };
  }
  for (const row of cardRows) {
    state.cards[row.itemId] = {
      itemId: row.itemId,
      state: row.state,
      stability: row.stability,
      difficulty: row.difficulty,
      reps: row.reps,
      lapses: row.lapses,
      due: row.dueAt.toISOString(),
      lastReview: iso(row.lastReviewAt),
      source: row.source,
    };
  }
  for (const row of patternRows) {
    state.patterns[row.patternId] = {
      patternId: row.patternId,
      category: row.category as MistakeCategory,
      occurrences: row.occurrences,
      drillAttempts: row.drillAttempts,
      drillCorrect: row.drillCorrect,
      errorsByDay: row.errorsByDay,
      drillsByDay: row.drillsByDay,
      firstSeenAt: row.firstSeenAt.toISOString(),
      lastSeenAt: row.lastSeenAt.toISOString(),
    };
  }
  state.recentMistakes = mistakeRows.map((row) => ({
    id: row.id,
    patternId: row.patternId,
    category: row.category as MistakeCategory,
    original: row.original,
    correction: row.correction,
    explanation: row.explanation,
    source: row.source as MistakeSource,
    occurredAt: row.occurredAt.toISOString(),
  }));
  const seeded = initialSkills(level);
  for (const skill of SKILLS) {
    const row = skillRows.find((r) => r.skill === skill);
    state.skills[skill] = row
      ? { rating: row.rating, evidence: row.evidenceCount, updatedAt: iso(row.updatedAt), history: row.history }
      : seeded[skill];
  }
  for (const row of canDoRows) {
    state.canDo[row.canDoId] = { demonstratedAt: row.demonstratedAt.toISOString(), evidence: row.evidence };
  }
  const stats = statsRows[0];
  if (stats) {
    state.stats = {
      sentencesProduced: stats.sentencesProduced,
      wordsProduced: stats.wordsProduced,
      speakingTurns: stats.speakingTurns,
      voiceTurns: stats.voiceTurns,
      reviewsDone: stats.reviewsDone,
      listeningCompleted: stats.listeningCompleted,
      sentencesByDay: stats.sentencesByDay,
      activeDays: stats.activeDays,
    };
    state.lastEventAt = iso(stats.lastEventAt);
  }
  return state;
}

function changedKeys<T>(before: Record<string, T>, after: Record<string, T>): string[] {
  return Object.keys(after).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
}

const d = (value: string | null) => (value ? new Date(value) : null);

/** Write every projection row that differs between two states. */
export async function persistStateDiff(db: Db, userId: string, before: LearnerState, after: LearnerState): Promise<void> {
  for (const lessonId of changedKeys(before.lessons, after.lessons)) {
    const l = after.lessons[lessonId]!;
    const values = {
      status: l.status,
      stepsCompleted: l.stepsCompleted,
      bestScore: l.bestScore,
      startedAt: new Date(l.startedAt),
      completedAt: d(l.completedAt),
    };
    await db
      .insert(lessonProgress)
      .values({ userId, lessonId, ...values })
      .onConflictDoUpdate({ target: [lessonProgress.userId, lessonProgress.lessonId], set: values });
  }

  for (const itemId of changedKeys(before.cards, after.cards)) {
    const c = after.cards[itemId]!;
    const values = {
      state: c.state,
      stability: c.stability,
      difficulty: c.difficulty,
      reps: c.reps,
      lapses: c.lapses,
      dueAt: new Date(c.due),
      lastReviewAt: d(c.lastReview),
      source: c.source,
    };
    await db
      .insert(srsCards)
      .values({ userId, itemId, ...values })
      .onConflictDoUpdate({ target: [srsCards.userId, srsCards.itemId], set: values });
  }

  for (const patternId of changedKeys(before.patterns, after.patterns)) {
    const p = after.patterns[patternId]!;
    const values = {
      category: p.category,
      occurrences: p.occurrences,
      drillAttempts: p.drillAttempts,
      drillCorrect: p.drillCorrect,
      errorsByDay: p.errorsByDay,
      drillsByDay: p.drillsByDay,
      firstSeenAt: new Date(p.firstSeenAt),
      lastSeenAt: new Date(p.lastSeenAt),
    };
    await db
      .insert(mistakePatternStats)
      .values({ userId, patternId, ...values })
      .onConflictDoUpdate({ target: [mistakePatternStats.userId, mistakePatternStats.patternId], set: values });
  }

  for (const skill of changedKeys(before.skills, after.skills)) {
    const s = after.skills[skill as keyof LearnerState['skills']];
    const values = { rating: s.rating, evidenceCount: s.evidence, history: s.history, updatedAt: d(s.updatedAt) };
    await db
      .insert(skillEstimates)
      .values({ userId, skill, ...values })
      .onConflictDoUpdate({ target: [skillEstimates.userId, skillEstimates.skill], set: values });
  }

  for (const canDoId of changedKeys(before.canDo, after.canDo)) {
    const c = after.canDo[canDoId]!;
    await db
      .insert(canDoProgress)
      .values({ userId, canDoId, demonstratedAt: new Date(c.demonstratedAt), evidence: c.evidence })
      .onConflictDoNothing();
  }

  const knownMistakes = new Set(before.recentMistakes.map((m) => m.id));
  const newMistakes = after.recentMistakes.filter((m) => !knownMistakes.has(m.id));
  if (newMistakes.length) {
    await db
      .insert(mistakes)
      .values(
        newMistakes.map((m) => ({
          id: m.id,
          userId,
          patternId: m.patternId,
          category: m.category,
          original: m.original,
          correction: m.correction,
          explanation: m.explanation,
          source: m.source,
          occurredAt: new Date(m.occurredAt),
        })),
      )
      .onConflictDoNothing();
  }

  if (JSON.stringify(before.stats) !== JSON.stringify(after.stats) || before.lastEventAt !== after.lastEventAt) {
    const values = { ...after.stats, lastEventAt: d(after.lastEventAt), updatedAt: new Date() };
    await db
      .insert(learnerStats)
      .values({ userId, ...values })
      .onConflictDoUpdate({ target: learnerStats.userId, set: values });
  }
}

export interface IngestResult {
  accepted: number;
  duplicates: number;
  state: LearnerState;
}

/**
 * Store events idempotently (by client-generated id) and update the projections with the
 * shared reducer. Serialised per user with an advisory lock so concurrent syncs can't race.
 */
export async function ingestEvents(db: Db, userId: string, events: LearningEvent[], deviceId?: string): Promise<IngestResult> {
  return db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    await t.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);
    const now = Date.now();
    const normalized = events.map((event) => {
      const at = new Date(event.occurredAt).getTime();
      return at > now + MAX_FUTURE_MS ? { ...event, occurredAt: new Date(now).toISOString() } : event;
    });
    const inserted = normalized.length
      ? await t
          .insert(learningEvents)
          .values(
            normalized.map((event) => ({
              id: event.id,
              userId,
              type: event.type,
              payload: event.payload,
              occurredAt: new Date(event.occurredAt),
              deviceId: deviceId ?? null,
            })),
          )
          .onConflictDoNothing({ target: learningEvents.id })
          .returning({ id: learningEvents.id })
      : [];
    const acceptedIds = new Set(inserted.map((row) => row.id));
    const accepted = normalized
      .map((event, index) => ({ event, index }))
      .filter(({ event }) => acceptedIds.has(event.id))
      .sort((a, b) => a.event.occurredAt.localeCompare(b.event.occurredAt) || a.index - b.index)
      .map(({ event }) => event);

    const before = await loadLearnerState(t, userId);
    const after = applyEvents(before, accepted);
    await persistStateDiff(t, userId, before, after);
    return { accepted: accepted.length, duplicates: events.length - accepted.length, state: after };
  });
}

export async function listEvents(db: Db, userId: string, afterSeq: number, limit: number) {
  const rows = await db
    .select()
    .from(learningEvents)
    .where(and(eq(learningEvents.userId, userId), gt(learningEvents.seq, afterSeq)))
    .orderBy(asc(learningEvents.seq))
    .limit(limit);
  return {
    events: rows.map((row) => ({
      id: row.id,
      type: row.type,
      occurredAt: row.occurredAt.toISOString(),
      payload: row.payload,
    })) as LearningEvent[],
    nextCursor: rows.length === limit ? rows[rows.length - 1]!.seq : null,
  };
}
