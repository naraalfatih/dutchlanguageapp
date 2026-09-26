import { LEVEL_VALUE, type Lesson, type Level, type PlanCatalog } from '@praat/core';
import { a0Lessons } from './lessons/a0.js';
import { a1Lessons } from './lessons/a1.js';
import { a2Lessons } from './lessons/a2.js';
import { b1Lessons } from './lessons/b1.js';
import { b2Lessons } from './lessons/b2.js';
import { c1Lessons } from './lessons/c1.js';
import { scenarios } from './scenarios.js';
import { listeningItems } from './listening.js';
import { sounds } from './pronunciation.js';

export { sounds, getSound } from './pronunciation.js';
export { scenarios, getScenario } from './scenarios.js';
export { listeningItems, getListeningItem } from './listening.js';
export { expressions } from './expressions.js';
export { cultureArticles, getCultureArticle } from './culture.js';
export { personas, getPersona } from './personas.js';
export { canDos } from './can-do.js';

/** Content version — bump when content changes so clients can refresh caches. */
export const CONTENT_VERSION = '2026.09.1';

export const lessons: Lesson[] = [
  ...a0Lessons,
  ...a1Lessons,
  ...a2Lessons,
  ...b1Lessons,
  ...b2Lessons,
  ...c1Lessons,
].sort((a, b) => LEVEL_VALUE[a.level] - LEVEL_VALUE[b.level] || a.order - b.order);

const lessonById = new Map(lessons.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return lessonById.get(id);
}

export function lessonsByLevel(level: Level): Lesson[] {
  return lessons.filter((l) => l.level === level);
}

/** Find the lesson a vocabulary phrase belongs to (phrase ids are prefixed with the lesson id). */
export function findPhrase(itemId: string) {
  for (const lesson of lessons) {
    const phrase = lesson.vocabulary.find((v) => v.id === itemId);
    if (phrase) return { lesson, phrase };
  }
  return undefined;
}

/** The compact catalogue the daily planner needs. */
export function planCatalog(): PlanCatalog {
  return {
    lessons: lessons.map((l) => ({ id: l.id, level: l.level, order: l.order, title: l.title, minutes: l.minutes })),
    scenarios: scenarios.map((s) => ({
      id: s.id,
      level: s.level,
      title: s.title,
      category: s.category,
      goals: s.goals,
      ...(s.canDoId ? { canDoId: s.canDoId } : {}),
    })),
    listening: listeningItems.map((item) => ({ id: item.id, level: item.level, title: item.title })),
    sounds: sounds.map((s) => ({ id: s.id, title: `Pronunciation: ${s.title}`, priority: s.priority })),
  };
}
