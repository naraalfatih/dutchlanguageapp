import { LEVEL_VALUE, type Lesson } from '@praat/core';
import { a0Lessons } from './lessons/a0.js';
import { a1Lessons } from './lessons/a1.js';
import { a2Lessons } from './lessons/a2.js';
import { b1Lessons } from './lessons/b1.js';
import { b2Lessons } from './lessons/b2.js';
import { c1Lessons } from './lessons/c1.js';

export { sounds, getSound } from './pronunciation.js';

export const lessons: Lesson[] = [...a0Lessons, ...a1Lessons, ...a2Lessons, ...b1Lessons, ...b2Lessons, ...c1Lessons].sort(
  (a, b) => LEVEL_VALUE[a.level] - LEVEL_VALUE[b.level] || a.order - b.order,
);

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}
