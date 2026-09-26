/**
 * FSRS-4.5 (Free Spaced Repetition Scheduler) — a memory model with three variables:
 *  - Difficulty D ∈ [1, 10]: how hard the item is for this learner
 *  - Stability  S (days): time for retrievability to fall from 100% to 90%
 *  - Retrievability R ∈ [0, 1]: probability of recall right now
 *
 * Reference: Ye, J. et al. (2022); open-spaced-repetition/fsrs4anki (v4.5 formulas and
 * default parameters). Short-term learning steps are simplified to fixed minutes, which
 * suits a speaking app where new chunks were already practised inside the lesson.
 */

import type { CardState } from '../schemas/state.js';

export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy
export const RATING_LABELS: Record<Rating, string> = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };

export const CardStateKind = { New: 0, Learning: 1, Review: 2, Relearning: 3 } as const;

/** FSRS-4.5 default parameters (w0 … w16). */
export const DEFAULT_WEIGHTS = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272,
  2.8755,
] as const;

const DECAY = -0.5;
const FACTOR = 19 / 81; // 0.9^(1/DECAY) − 1
const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;

export interface SchedulerOptions {
  /** Target probability of recall at review time. */
  requestRetention: number;
  maximumIntervalDays: number;
  weights: readonly number[];
  /** Minutes until a failed / new-and-failed card is shown again. */
  learningStepMinutes: number;
  relearningStepMinutes: number;
}

export const DEFAULT_SCHEDULER_OPTIONS: SchedulerOptions = {
  requestRetention: 0.9,
  maximumIntervalDays: 3 * 365,
  weights: DEFAULT_WEIGHTS,
  learningStepMinutes: 1,
  relearningStepMinutes: 10,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

export function intervalForStability(stability: number, options: SchedulerOptions = DEFAULT_SCHEDULER_OPTIONS): number {
  const raw = (stability / FACTOR) * (Math.pow(options.requestRetention, 1 / DECAY) - 1);
  return clamp(Math.round(raw), 1, options.maximumIntervalDays);
}

export function initialStability(rating: Rating, w: readonly number[] = DEFAULT_WEIGHTS): number {
  return Math.max(w[rating - 1]!, 0.1);
}

export function initialDifficulty(rating: Rating, w: readonly number[] = DEFAULT_WEIGHTS): number {
  return clamp(w[4]! - (rating - 3) * w[5]!, 1, 10);
}

export function nextDifficulty(d: number, rating: Rating, w: readonly number[] = DEFAULT_WEIGHTS): number {
  const next = d - w[6]! * (rating - 3);
  // Mean reversion towards the initial difficulty of a "Good" first answer.
  return clamp(w[7]! * w[4]! + (1 - w[7]!) * next, 1, 10);
}

export function nextRecallStability(
  d: number,
  s: number,
  r: number,
  rating: Rating,
  w: readonly number[] = DEFAULT_WEIGHTS,
): number {
  const hardPenalty = rating === 2 ? w[15]! : 1;
  const easyBonus = rating === 4 ? w[16]! : 1;
  return s * (1 + Math.exp(w[8]!) * (11 - d) * Math.pow(s, -w[9]!) * (Math.exp((1 - r) * w[10]!) - 1) * hardPenalty * easyBonus);
}

export function nextForgetStability(d: number, s: number, r: number, w: readonly number[] = DEFAULT_WEIGHTS): number {
  const next = w[11]! * Math.pow(d, -w[12]!) * (Math.pow(s + 1, w[13]!) - 1) * Math.exp((1 - r) * w[14]!);
  // A lapse never increases stability.
  return Math.min(next, s);
}

export function newCard(itemId: string, now: Date, source = 'lesson'): CardState {
  return {
    itemId,
    state: CardStateKind.New,
    stability: 0,
    difficulty: 0,
    reps: 0,
    lapses: 0,
    due: now.toISOString(),
    lastReview: null,
    source,
  };
}

/** Apply a review to a card and return its next state. Pure. */
export function reviewCard(
  card: CardState,
  rating: Rating,
  now: Date,
  options: SchedulerOptions = DEFAULT_SCHEDULER_OPTIONS,
): CardState {
  const w = options.weights;
  const base = { ...card, reps: card.reps + 1, lastReview: now.toISOString() };
  const inMinutes = (minutes: number) => new Date(now.getTime() + minutes * MINUTE_MS).toISOString();
  const inDays = (days: number) => new Date(now.getTime() + days * DAY_MS).toISOString();

  if (card.state === CardStateKind.New) {
    const stability = initialStability(rating, w);
    const difficulty = initialDifficulty(rating, w);
    if (rating === 1) {
      return { ...base, state: CardStateKind.Learning, stability, difficulty, due: inMinutes(options.learningStepMinutes) };
    }
    return {
      ...base,
      state: CardStateKind.Review,
      stability,
      difficulty,
      due: inDays(intervalForStability(stability, options)),
    };
  }

  if (card.state === CardStateKind.Learning || card.state === CardStateKind.Relearning) {
    const difficulty = nextDifficulty(card.difficulty, rating, w);
    if (rating === 1) {
      const stability = Math.max(0.1, card.stability * 0.8);
      return { ...base, stability, difficulty, due: inMinutes(options.learningStepMinutes) };
    }
    // Graduating: a successful same-day review nudges stability up for Good/Easy.
    const factor = rating === 2 ? 1 : rating === 3 ? 1.2 : 1.6;
    const stability = Math.max(card.stability * factor, 0.1);
    return {
      ...base,
      state: CardStateKind.Review,
      stability,
      difficulty,
      due: inDays(intervalForStability(stability, options)),
    };
  }

  // Review state
  const elapsedDays = card.lastReview ? Math.max(0, (now.getTime() - new Date(card.lastReview).getTime()) / DAY_MS) : 0;
  const r = retrievability(elapsedDays, card.stability);
  const difficulty = nextDifficulty(card.difficulty, rating, w);

  if (rating === 1) {
    const stability = Math.max(0.1, nextForgetStability(card.difficulty, card.stability, r, w));
    return {
      ...base,
      state: CardStateKind.Relearning,
      lapses: card.lapses + 1,
      stability,
      difficulty,
      due: inMinutes(options.relearningStepMinutes),
    };
  }

  const stability = nextRecallStability(card.difficulty, card.stability, r, rating, w);
  return {
    ...base,
    state: CardStateKind.Review,
    stability,
    difficulty,
    due: inDays(intervalForStability(stability, options)),
  };
}

export function isDue(card: CardState, now: Date): boolean {
  return new Date(card.due).getTime() <= now.getTime();
}

/** Predicted recall probability right now (1 for cards never reviewed is not meaningful → 0). */
export function currentRetrievability(card: CardState, now: Date): number {
  if (!card.lastReview || card.state === CardStateKind.New) return 0;
  const elapsed = (now.getTime() - new Date(card.lastReview).getTime()) / DAY_MS;
  return retrievability(elapsed, card.stability);
}

/** Preview the next due date for each rating (for "Again · 1m / Good · 4d" buttons). */
export function previewIntervals(card: CardState, now: Date): Record<Rating, string> {
  const result = {} as Record<Rating, string>;
  for (const rating of [1, 2, 3, 4] as Rating[]) {
    const next = reviewCard(card, rating, now);
    result[rating] = formatDelay(new Date(next.due).getTime() - now.getTime());
  }
  return result;
}

export function formatDelay(ms: number): string {
  const minutes = Math.round(ms / MINUTE_MS);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days}d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo`;
  return `${(days / 365).toFixed(1)}y`;
}
