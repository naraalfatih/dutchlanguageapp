import { describe, expect, it } from 'vitest';
import {
  detectMistakes,
  evaluateAnswer,
  evaluateFreeResponse,
  getPattern,
  LESSON_STEPS,
  LessonSchema,
  LEVELS,
  type Exercise,
  type Lesson,
} from '@praat/core';
import { lessons, sounds } from '../src/index.js';

const soundIds = new Set(sounds.map((s) => s.id));

function dutchLines(lesson: Lesson): string[] {
  return [
    ...lesson.situation.dialogue.map((l) => l.nl),
    ...lesson.listening.lines.map((l) => l.nl),
    ...lesson.vocabulary.map((v) => v.example.nl),
    ...lesson.speaking.modelAnswers,
    ...lesson.grammar.examples.map((e) => e.nl),
  ];
}

function exerciseAnswers(exercise: Exercise): string[] {
  switch (exercise.type) {
    case 'translate':
      return exercise.accept;
    case 'fill':
      return exercise.accept.map((a) => exercise.sentence.replace('___', a).replace(/\s*\([^)]*\)\s*$/, ''));
    case 'order':
      return [exercise.words.join(' '), ...(exercise.accept ?? [])];
    case 'respond':
      return exercise.modelAnswers;
    case 'dictation':
      return [exercise.nl];
    case 'choose':
      return [];
  }
}

describe('curriculum structure', () => {
  it('has lessons at every level from A0 to C1', () => {
    for (const level of LEVELS) {
      expect(lessons.some((l) => l.level === level), level).toBe(true);
    }
  });

  it('has unique lesson ids, phrase ids and exercise ids', () => {
    const ids = [
      ...lessons.map((l) => l.id),
      ...lessons.flatMap((l) => l.vocabulary.map((v) => v.id)),
      ...lessons.flatMap((l) => l.review.map((r) => r.id)),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique order numbers within each level', () => {
    for (const level of LEVELS) {
      const orders = lessons.filter((l) => l.level === level).map((l) => l.order);
      expect(new Set(orders).size, level).toBe(orders.length);
    }
  });

  it('includes all nine lesson components in every lesson', () => {
    expect(LESSON_STEPS).toHaveLength(8); // + the summary screen = nine parts
  });
});

describe.each(lessons.map((l) => [l.id, l] as const))('lesson %s', (_id, lesson) => {
  it('validates against the lesson schema', () => {
    expect(() => LessonSchema.parse(lesson)).not.toThrow();
  });

  it('references an existing pronunciation module', () => {
    expect(soundIds.has(lesson.pronunciation.focus), lesson.pronunciation.focus).toBe(true);
  });

  it('has model answers that achieve the speaking task', () => {
    for (const answer of lesson.speaking.modelAnswers) {
      const result = evaluateFreeResponse(answer, {
        intents: lesson.speaking.mustInclude,
        ...(lesson.speaking.register ? { register: lesson.speaking.register } : {}),
      });
      expect(result.missing.map((m) => m.id), answer).toEqual([]);
    }
  });

  it('contains Dutch that the mistake detector accepts (no false positives, no content errors)', () => {
    const flagged = dutchLines(lesson)
      .map((text) => ({ text, corrections: detectMistakes(text).corrections }))
      .filter((r) => r.corrections.length > 0)
      .map((r) => `${r.text} → ${r.corrections.map((c) => c.patternId).join(', ')}`);
    expect(flagged).toEqual([]);
  });

  it('has valid review exercises', () => {
    for (const exercise of lesson.review) {
      if (exercise.patternId) expect(getPattern(exercise.patternId), exercise.patternId).toBeDefined();
      if (exercise.type === 'choose') {
        expect(exercise.answer).toBeLessThan(exercise.options.length);
      }
      if (exercise.type === 'fill') {
        expect(exercise.sentence.split('___')).toHaveLength(2);
      }
      if (exercise.type === 'respond') {
        for (const answer of exercise.modelAnswers) {
          const result = evaluateFreeResponse(answer, { intents: exercise.intents });
          expect(result.missing.map((m) => m.id), answer).toEqual([]);
        }
      }
      if (exercise.type === 'translate') {
        for (const answer of exercise.accept) {
          expect(evaluateAnswer(answer, exercise.accept).verdict).toBe('correct');
        }
      }
      for (const answer of exerciseAnswers(exercise)) {
        expect(detectMistakes(answer).corrections.map((c) => c.patternId), answer).toEqual([]);
      }
    }
  });

  it('has listening questions with valid answers', () => {
    for (const q of lesson.listening.questions) {
      if (q.type === 'choice') expect(q.answer).toBeLessThan(q.options.length);
    }
  });
});
