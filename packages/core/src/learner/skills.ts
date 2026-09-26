/**
 * Skill model: an Elo-style logistic item-response estimate per skill on the continuous
 * CEFR scale (A0 = 0 … C1 = 5). A learner "at" level L succeeds on level-L tasks ~75% of the time.
 */

import { LEVEL_VALUE, levelFromValue, SKILLS, type Level, type Skill } from '../schemas/common.js';
import type { SkillEstimate } from '../schemas/state.js';
import { dayKey } from './dates.js';

const SLOPE = 1.7;
const OFFSET = Math.log(0.75 / 0.25); // success probability 0.75 at rating === difficulty
const MAX_RATING = 6;
const HISTORY_DAYS = 120;

export function expectedScore(rating: number, difficulty: number): number {
  return 1 / (1 + Math.exp(-(SLOPE * (rating - difficulty) + OFFSET)));
}

export function stepSize(evidence: number): number {
  return Math.max(0.05, 0.5 / Math.sqrt(1 + evidence / 3));
}

export function initialSkillEstimate(level: Level): SkillEstimate {
  return { rating: LEVEL_VALUE[level], evidence: 0, updatedAt: null, history: [] };
}

export function initialSkills(level: Level): Record<Skill, SkillEstimate> {
  return Object.fromEntries(SKILLS.map((skill) => [skill, initialSkillEstimate(level)])) as Record<Skill, SkillEstimate>;
}

export interface Evidence {
  /** Difficulty on the CEFR scale (usually LEVEL_VALUE of the item). */
  difficulty: number;
  /** Outcome 0–1. */
  score: number;
  at: string;
}

export function updateSkill(estimate: SkillEstimate, evidence: Evidence): SkillEstimate {
  const expected = expectedScore(estimate.rating, evidence.difficulty);
  const k = stepSize(estimate.evidence);
  const rating = Math.min(MAX_RATING, Math.max(0, estimate.rating + k * (evidence.score - expected)));
  const day = dayKey(evidence.at);
  const history = estimate.history.filter((h) => h.day !== day);
  history.push({ day, rating: Math.round(rating * 1000) / 1000 });
  while (history.length > HISTORY_DAYS) history.shift();
  return {
    rating,
    evidence: estimate.evidence + 1,
    updatedAt: evidence.at,
    history,
  };
}

export interface SkillLevel {
  level: Level;
  /** Progress through the current level, 0–1. */
  progress: number;
  rating: number;
  /** Low evidence → the estimate is still mostly the learner's self-report. */
  confident: boolean;
}

export function describeSkill(estimate: SkillEstimate): SkillLevel {
  const clamped = Math.min(5.999, Math.max(0, estimate.rating));
  return {
    level: levelFromValue(clamped),
    progress: clamped - Math.floor(clamped),
    rating: estimate.rating,
    confident: estimate.evidence >= 8,
  };
}

/** Overall communicative level: speaking and listening weigh most. */
export function overallRating(skills: Record<Skill, SkillEstimate>): number {
  const weights: Record<Skill, number> = {
    speaking: 0.3,
    listening: 0.25,
    vocabulary: 0.15,
    grammar: 0.15,
    pronunciation: 0.1,
    fluency: 0.05,
  };
  return SKILLS.reduce((sum, skill) => sum + skills[skill].rating * weights[skill], 0);
}

/** Rating change over the last `days` days, from the stored daily history. */
export function skillTrend(estimate: SkillEstimate, now: Date, days = 28): number {
  if (estimate.history.length < 2) return 0;
  const cutoff = dayKey(new Date(now.getTime() - days * 86_400_000));
  const before = [...estimate.history].reverse().find((h) => h.day <= cutoff) ?? estimate.history[0]!;
  return estimate.rating - before.rating;
}
