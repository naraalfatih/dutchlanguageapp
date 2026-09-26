import { expressions, findPhrase } from '@praat/content';
import { LEVEL_VALUE, type Bilingual, type Level, type Region } from '@praat/core';

export interface CardInfo {
  itemId: string;
  nl: string;
  en: string;
  example: Bilingual | null;
  note: string | null;
  article: 'de' | 'het' | null;
  level: Level | null;
  origin: string;
}

/** Resolve a review card to its content (lesson phrase or natural-Dutch expression). */
export function cardInfo(itemId: string): CardInfo | null {
  const found = findPhrase(itemId);
  if (found) {
    const { phrase, lesson } = found;
    return {
      itemId,
      nl: phrase.nl,
      en: phrase.en,
      example: phrase.example,
      note: phrase.note ?? null,
      article: phrase.article ?? null,
      level: lesson.level,
      origin: lesson.title,
    };
  }
  const expression = expressions.find((e) => e.id === itemId);
  if (expression) {
    return {
      itemId,
      nl: expression.natural,
      en: expression.en,
      example: expression.examples[0] ?? null,
      note: expression.when,
      article: null,
      level: expression.level,
      origin: 'Speak like a Dutch person',
    };
  }
  return null;
}

/** A stable daily pick near the learner's level and region. */
export function expressionOfTheDay(date: Date, level: Level, region: Region) {
  const pool = expressions.filter(
    (e) => LEVEL_VALUE[e.level] <= Math.max(1, LEVEL_VALUE[level] + 1) && (e.region === 'both' || e.region === region),
  );
  const list = pool.length ? pool : expressions;
  const day = Math.floor(date.getTime() / 86_400_000);
  return list[day % list.length]!;
}

export const LEVEL_NAMES: Record<Level, string> = {
  A0: 'Absolute beginner',
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper intermediate',
  C1: 'Advanced',
};

export function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 6) return 'Goedenacht';
  if (h < 12) return 'Goedemorgen';
  if (h < 18) return 'Goedemiddag';
  return 'Goedenavond';
}
