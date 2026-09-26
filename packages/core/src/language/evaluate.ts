import type { Register } from '../schemas/common.js';
import type { Intent } from '../schemas/content.js';
import type { Correction, TurnFeedback } from '../schemas/conversation.js';
import { detectMistakes } from './detector.js';
import { matchIntents } from './intents.js';
import { countWords, foldText, levenshtein, normalizeText, splitSentences } from './normalize.js';

export type Verdict = 'correct' | 'almost' | 'incorrect';

export interface AnswerResult {
  verdict: Verdict;
  /** The accepted answer closest to the learner's input. */
  closest: string;
  /** A short note for "almost" answers (typo, accent, capital). */
  note: string | null;
  score: number;
}

function typoTolerance(length: number): number {
  if (length <= 4) return 0;
  if (length <= 12) return 1;
  return Math.floor(length / 12) + 1;
}

/**
 * Compare a typed answer with the accepted answers. Punctuation and case never count;
 * missing accents and small typos are "almost" (accepted, with a note).
 */
export function evaluateAnswer(input: string, accepted: string[]): AnswerResult {
  const normalizedInput = normalizeText(input);
  const foldedInput = foldText(input);
  let best = { answer: accepted[0] ?? '', distance: Number.POSITIVE_INFINITY };

  for (const answer of accepted) {
    const normalized = normalizeText(answer);
    if (normalized === normalizedInput) {
      return { verdict: 'correct', closest: answer, note: null, score: 1 };
    }
    const distance = levenshtein(foldText(answer), foldedInput);
    if (distance < best.distance) best = { answer, distance };
  }

  if (best.distance === 0) {
    return {
      verdict: 'almost',
      closest: best.answer,
      note: `Watch the accents: ${best.answer}`,
      score: 0.9,
    };
  }
  const tolerance = typoTolerance(foldText(best.answer).length);
  if (best.distance <= tolerance) {
    return { verdict: 'almost', closest: best.answer, note: `Almost — check the spelling: ${best.answer}`, score: 0.8 };
  }
  return { verdict: 'incorrect', closest: best.answer, note: null, score: 0 };
}

/** Order exercise: the built sentence must match the word order (or an accepted variant). */
export function evaluateOrder(built: string[], words: string[], accept: string[] = []): AnswerResult {
  return evaluateAnswer(built.join(' '), [words.join(' '), ...accept]);
}

export interface FreeResponseTask {
  intents?: Intent[];
  register?: Register;
  modelAnswers?: string[];
}

export interface FreeResponseResult {
  /** All required intents present (the communicative goal was reached). */
  achieved: boolean;
  missing: Intent[];
  corrections: Correction[];
  correctedText: string;
  feedback: TurnFeedback;
  /** 0–1 combining task completion and accuracy. */
  score: number;
  words: number;
  sentences: number;
}

/**
 * Evaluate a spoken/typed answer to a situation. Communication first: the task counts as
 * achieved when the intents are present, even with grammar mistakes (which are still fed back).
 */
export function evaluateFreeResponse(text: string, task: FreeResponseTask = {}): FreeResponseResult {
  const intents = task.intents ?? [];
  const { satisfied, missing, coverage } = matchIntents(text, intents);
  const detection = detectMistakes(text, task.register ? { register: task.register } : {});
  const words = countWords(text);
  const sentences = Math.max(1, splitSentences(text).length);
  const grammarErrors = detection.corrections.filter((c) => c.severity !== 'register').length;
  const accuracy = Math.max(0, 1 - grammarErrors / (sentences + 1));
  const achieved = missing.length === 0 && words > 0;
  const score = Math.round((0.65 * coverage + 0.35 * accuracy) * 100) / 100;

  let natural: TurnFeedback['natural'] = null;
  const model = task.modelAnswers?.[task.modelAnswers.length > 1 ? 1 : 0];
  if (model && achieved && foldText(model) !== foldText(detection.correctedText)) {
    natural = { nl: model, en: 'Another natural way to say it.', note: null };
  }

  let praise: string | null = null;
  if (achieved && detection.corrections.length === 0) {
    praise = words >= 8 ? 'Clear and natural — well done.' : 'Clear and correct.';
  } else if (achieved) {
    praise = 'You got your message across.';
  } else if (satisfied.length > 0) {
    praise = 'Good start.';
  }

  return {
    achieved,
    missing,
    corrections: detection.corrections,
    correctedText: detection.correctedText,
    feedback: {
      understood: achieved || coverage >= 0.5 || (intents.length === 0 && words > 0),
      corrections: detection.corrections,
      natural,
      praise,
    },
    score,
    words,
    sentences,
  };
}
