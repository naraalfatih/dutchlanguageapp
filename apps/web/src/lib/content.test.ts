import { lessons } from '@praat/content';
import { describe, expect, it } from 'vitest';
import { cardInfo, expressionOfTheDay, greeting } from './content';

describe('content lookups', () => {
  it('resolves lesson phrases and expressions as review cards', () => {
    const phrase = lessons[0]!.vocabulary[0]!;
    expect(cardInfo(phrase.id)).toMatchObject({ nl: phrase.nl, en: phrase.en, origin: lessons[0]!.title });
    expect(cardInfo('expr.hoe-gaat-ie')).toMatchObject({ nl: 'Hoe gaat-ie?' });
    expect(cardInfo('nope')).toBeNull();
  });

  it('picks a stable expression per day that fits the region', () => {
    const day = new Date('2026-09-26T08:00:00Z');
    const a = expressionOfTheDay(day, 'A1', 'nl');
    expect(expressionOfTheDay(new Date('2026-09-26T20:00:00Z'), 'A1', 'nl').id).toBe(a.id);
    for (let i = 0; i < 60; i++) {
      const e = expressionOfTheDay(new Date(day.getTime() + i * 86_400_000), 'A1', 'be');
      expect(e.region === 'both' || e.region === 'be').toBe(true);
    }
  });

  it('greets by time of day', () => {
    expect(greeting(new Date(2026, 0, 1, 9))).toBe('Goedemorgen');
    expect(greeting(new Date(2026, 0, 1, 14))).toBe('Goedemiddag');
    expect(greeting(new Date(2026, 0, 1, 20))).toBe('Goedenavond');
  });
});
