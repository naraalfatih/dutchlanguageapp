import { describe, expect, it } from 'vitest';
import {
  CardStateKind,
  currentRetrievability,
  formatDelay,
  initialDifficulty,
  intervalForStability,
  isDue,
  newCard,
  nextDifficulty,
  previewIntervals,
  retrievability,
  reviewCard,
} from '../src/srs/fsrs.js';

const DAY = 86_400_000;
const t0 = new Date('2026-01-01T09:00:00Z');

describe('FSRS memory model', () => {
  it('has 90% retrievability after exactly one stability period', () => {
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 5);
    expect(retrievability(0, 10)).toBe(1);
    expect(retrievability(30, 10)).toBeLessThan(0.9);
  });

  it('schedules the interval equal to stability at 90% requested retention', () => {
    expect(intervalForStability(10)).toBe(10);
    expect(intervalForStability(0.2)).toBe(1);
    expect(intervalForStability(100_000)).toBe(3 * 365);
  });

  it('keeps difficulty within 1..10 and lowers it on Easy', () => {
    const d = initialDifficulty(3);
    expect(nextDifficulty(d, 4)).toBeLessThan(d);
    expect(nextDifficulty(d, 1)).toBeGreaterThan(d);
    let hard = 10;
    for (let i = 0; i < 20; i++) hard = nextDifficulty(hard, 1);
    expect(hard).toBeLessThanOrEqual(10);
  });
});

describe('reviewCard', () => {
  it('schedules a new card: Again in minutes, Good in days, Easy later than Good', () => {
    const card = newCard('p1', t0);
    const again = reviewCard(card, 1, t0);
    const good = reviewCard(card, 3, t0);
    const easy = reviewCard(card, 4, t0);
    expect(again.state).toBe(CardStateKind.Learning);
    expect(new Date(again.due).getTime() - t0.getTime()).toBe(60_000);
    expect(good.state).toBe(CardStateKind.Review);
    expect(new Date(good.due).getTime()).toBeGreaterThan(t0.getTime() + DAY);
    expect(new Date(easy.due).getTime()).toBeGreaterThan(new Date(good.due).getTime());
  });

  it('grows the interval with successful reviews', () => {
    let card = reviewCard(newCard('p1', t0), 3, t0);
    const intervals: number[] = [];
    for (let i = 0; i < 4; i++) {
      const now = new Date(card.due);
      const before = now.getTime();
      card = reviewCard(card, 3, now);
      intervals.push((new Date(card.due).getTime() - before) / DAY);
    }
    for (let i = 1; i < intervals.length; i++) expect(intervals[i]!).toBeGreaterThan(intervals[i - 1]!);
  });

  it('gives Hard a shorter interval than Good, and Good shorter than Easy', () => {
    const reviewed = reviewCard(newCard('p1', t0), 3, t0);
    const at = new Date(reviewed.due);
    const hard = reviewCard(reviewed, 2, at);
    const good = reviewCard(reviewed, 3, at);
    const easy = reviewCard(reviewed, 4, at);
    expect(hard.due < good.due).toBe(true);
    expect(good.due < easy.due).toBe(true);
  });

  it('lapses reduce stability and count lapses', () => {
    const reviewed = reviewCard(newCard('p1', t0), 3, t0);
    const at = new Date(reviewed.due);
    const lapsed = reviewCard(reviewed, 1, at);
    expect(lapsed.state).toBe(CardStateKind.Relearning);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.stability).toBeLessThan(reviewed.stability);
    const relearned = reviewCard(lapsed, 3, new Date(lapsed.due));
    expect(relearned.state).toBe(CardStateKind.Review);
  });

  it('reports due status, retrievability and previews', () => {
    const reviewed = reviewCard(newCard('p1', t0), 3, t0);
    expect(isDue(reviewed, t0)).toBe(false);
    expect(isDue(reviewed, new Date(reviewed.due))).toBe(true);
    expect(currentRetrievability(reviewed, new Date(reviewed.due))).toBeCloseTo(0.9, 1);
    const preview = previewIntervals(reviewed, new Date(reviewed.due));
    expect(preview[1]).toBe('10m');
    expect(formatDelay(3 * DAY)).toBe('3d');
  });
});
