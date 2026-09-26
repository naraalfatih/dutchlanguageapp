import type { Exercise, Intent, Lesson, Phrase } from '@praat/core';

/** Distributive Omit so discriminated unions keep their members. */
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;

export type ExerciseInput = DistributiveOmit<Exercise, 'id'>;

export interface PhraseOptions {
  article?: Phrase['article'];
  register?: Phrase['register'];
  band?: Phrase['band'];
  note?: string;
  emoji?: string;
}

/** Vocabulary chunk: key, Dutch, English, example sentence (nl, en), options. */
export type PhraseInput = [key: string, nl: string, en: string, exNl: string, exEn: string, options?: PhraseOptions];

/** Intent shorthand: each alternative is one group; a string is a single-term group. */
export function i(id: string, description: string, ...alternatives: (string | string[])[]): Intent {
  return { id, description, anyOf: alternatives.map((a) => (Array.isArray(a) ? a : [a])) };
}

export interface LessonInput extends Omit<Lesson, 'vocabulary' | 'review'> {
  vocabulary: PhraseInput[];
  review: ExerciseInput[];
}

export function defineLesson(input: LessonInput): Lesson {
  return {
    ...input,
    vocabulary: input.vocabulary.map(([key, nl, en, exNl, exEn, options = {}]) => ({
      id: `${input.id}.${key}`,
      nl,
      en,
      example: { nl: exNl, en: exEn },
      band: options.band ?? 1,
      ...(options.article ? { article: options.article } : {}),
      ...(options.register ? { register: options.register } : {}),
      ...(options.note ? { note: options.note } : {}),
      ...(options.emoji ? { emoji: options.emoji } : {}),
    })),
    review: input.review.map((exercise, index) => ({ ...exercise, id: `${input.id}.r${index + 1}` }) as Exercise),
  };
}

/** Dialogue line shorthand. */
export function line(speaker: string, nl: string, en: string) {
  return { speaker, nl, en };
}
