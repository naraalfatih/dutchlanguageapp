/**
 * Mistake Diary analytics: turns raw pattern stats into the dashboard the learner sees
 * ("Word order — Improved 35%", "de/het — Needs practice", "G sound — Improving").
 */

import type { MistakeCategory } from '../schemas/common.js';
import type { Exercise } from '../schemas/content.js';
import type { LearnerState, MistakeEntry, PatternStats } from '../schemas/state.js';
import { getPattern, patternTitle } from '../language/patterns.js';
import { daysBetween, sumWindow } from './dates.js';

export type PatternStatus = 'needs-practice' | 'improving' | 'mastered' | 'new';

export interface PatternInsight {
  patternId: string;
  title: string;
  category: MistakeCategory;
  rule: string;
  occurrences: number;
  recentErrors: number;
  previousErrors: number;
  /** Errors per 100 produced sentences, last 14 days. */
  recentRate: number | null;
  previousRate: number | null;
  /** Relative drop in error rate (0.35 = 35% fewer errors), or accuracy gain for sounds. */
  improvement: number | null;
  drillAccuracy: number | null;
  status: PatternStatus;
  label: string;
  lastSeenAt: string;
  examples: MistakeEntry[];
}

const RECENT_DAYS = 14;
const PREVIOUS_DAYS = 56;

function drillWindow(stats: PatternStats, now: Date, from: number, to: number): { attempts: number; correct: number } {
  const attempts: Record<string, number> = {};
  const correct: Record<string, number> = {};
  for (const [day, [a, c]] of Object.entries(stats.drillsByDay)) {
    attempts[day] = a;
    correct[day] = c;
  }
  return { attempts: sumWindow(attempts, now, from, to), correct: sumWindow(correct, now, from, to) };
}

function round(value: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function analyzePattern(state: LearnerState, stats: PatternStats, now: Date): PatternInsight {
  const pattern = getPattern(stats.patternId);
  const recentErrors = sumWindow(stats.errorsByDay, now, 0, RECENT_DAYS);
  const previousErrors = sumWindow(stats.errorsByDay, now, RECENT_DAYS, PREVIOUS_DAYS);
  const recentSentences = sumWindow(state.stats.sentencesByDay, now, 0, RECENT_DAYS);
  const previousSentences = sumWindow(state.stats.sentencesByDay, now, RECENT_DAYS, PREVIOUS_DAYS);
  const recentRate = recentSentences > 0 ? round((recentErrors / recentSentences) * 100) : null;
  const previousRate = previousSentences > 0 ? round((previousErrors / previousSentences) * 100) : null;

  const recentDrills = drillWindow(stats, now, 0, RECENT_DAYS * 2);
  const previousDrills = drillWindow(stats, now, RECENT_DAYS * 2, PREVIOUS_DAYS * 2);
  const drillAccuracy = recentDrills.attempts > 0 ? recentDrills.correct / recentDrills.attempts : null;
  const previousAccuracy = previousDrills.attempts > 0 ? previousDrills.correct / previousDrills.attempts : null;

  const daysSinceSeen = daysBetween(stats.lastSeenAt, now);
  const daysSinceFirst = daysBetween(stats.firstSeenAt, now);

  let status: PatternStatus;
  let improvement: number | null = null;

  if (stats.category === 'pronunciation') {
    const totalAttempts = stats.drillAttempts;
    if (drillAccuracy !== null && previousAccuracy !== null) improvement = round(drillAccuracy - previousAccuracy, 2);
    if (drillAccuracy !== null && drillAccuracy >= 0.9 && totalAttempts >= 8) status = 'mastered';
    else if (totalAttempts < 3) status = 'new';
    else if (improvement !== null && improvement >= 0.1) status = 'improving';
    else if (drillAccuracy !== null && drillAccuracy < 0.6) status = 'needs-practice';
    else status = drillAccuracy === null ? 'needs-practice' : 'improving';
  } else {
    if (previousRate !== null && previousRate > 0 && recentRate !== null) {
      improvement = round((previousRate - recentRate) / previousRate, 2);
    }
    if (stats.occurrences <= 1 && daysSinceFirst <= RECENT_DAYS) status = 'new';
    else if (recentErrors === 0 && daysSinceSeen > RECENT_DAYS && (drillAccuracy === null || drillAccuracy >= 0.85)) {
      status = 'mastered';
    } else if (improvement !== null && improvement >= 0.2) status = 'improving';
    else if (drillAccuracy !== null && drillAccuracy >= 0.8 && recentErrors <= 1) status = 'improving';
    else status = 'needs-practice';
  }

  const label =
    status === 'improving' && improvement !== null && improvement > 0 && stats.category !== 'pronunciation'
      ? `Improved ${Math.round(improvement * 100)}%`
      : { 'needs-practice': 'Needs practice', improving: 'Improving', mastered: 'Mastered', new: 'New' }[status];

  return {
    patternId: stats.patternId,
    title: pattern?.title ?? patternTitle(stats.patternId),
    category: stats.category,
    rule: pattern?.rule ?? '',
    occurrences: stats.occurrences,
    recentErrors,
    previousErrors,
    recentRate,
    previousRate,
    improvement,
    drillAccuracy: drillAccuracy === null ? null : round(drillAccuracy, 2),
    status,
    label,
    lastSeenAt: stats.lastSeenAt,
    examples: state.recentMistakes.filter((m) => m.patternId === stats.patternId).slice(0, 5),
  };
}

const STATUS_ORDER: Record<PatternStatus, number> = { 'needs-practice': 0, new: 1, improving: 2, mastered: 3 };

/** All tracked patterns with at least one error, most important first. */
export function analyzePatterns(state: LearnerState, now: Date = new Date()): PatternInsight[] {
  return Object.values(state.patterns)
    .filter((stats) => stats.occurrences > 0)
    .map((stats) => analyzePattern(state, stats, now))
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        b.recentErrors - a.recentErrors ||
        b.occurrences - a.occurrences,
    );
}

/**
 * A personalised drill: the learner's own recent mistakes of this pattern ("fix your own
 * sentence" — generation effect), interleaved with the pattern's practice bank.
 */
export function buildDrill(state: LearnerState, patternId: string, limit = 6): Exercise[] {
  const pattern = getPattern(patternId);
  const own: Exercise[] = [];
  const seen = new Set<string>();
  for (const mistake of state.recentMistakes) {
    if (mistake.patternId !== patternId || seen.has(mistake.original)) continue;
    seen.add(mistake.original);
    own.push({
      id: `own.${mistake.id}`,
      type: 'translate',
      patternId,
      prompt: `Fix your sentence: “${mistake.original}”`,
      accept: [mistake.correction],
      hint: mistake.explanation,
    });
    if (own.length >= Math.ceil(limit / 2)) break;
  }
  const bank = pattern?.drills ?? [];
  const result: Exercise[] = [];
  let i = 0;
  let j = 0;
  while (result.length < limit && (i < own.length || j < bank.length)) {
    if (i < own.length) result.push(own[i++]!);
    if (result.length < limit && j < bank.length) result.push(bank[j++]!);
  }
  return result;
}
