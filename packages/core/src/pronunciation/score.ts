/**
 * Intelligibility-based pronunciation feedback: align what the learner meant to say
 * (target) with what a speech recogniser heard, word by word, and attribute problems to
 * the difficult Dutch sounds those words contain. See docs/02-learning-science.md
 * ("Intelligibility over accent").
 */

import { foldText, similarity } from '../language/normalize.js';

export const SOUND_IDS = ['g', 'sch', 'ui', 'eu', 'ij', 'ou', 'oe', 'uu', 'r', 'vowel-length', 'w'] as const;
export type SoundId = (typeof SOUND_IDS)[number];

/** Which difficult sounds does a (folded) word contain? */
export function soundsInWord(word: string): SoundId[] {
  const w = foldText(word);
  const sounds = new Set<SoundId>();
  if (/sch/.test(w)) sounds.add('sch');
  const withoutNg = w.replace(/ng/g, ''); // 'ng' is a different sound (as in English "sing")
  if (/g/.test(withoutNg) || /(^|[^s])ch/.test(withoutNg)) sounds.add('g');
  if (/ui/.test(w)) sounds.add('ui');
  if (/eu/.test(w)) sounds.add('eu');
  if (/ij|ei/.test(w)) sounds.add('ij');
  if (/ou|au/.test(w)) sounds.add('ou');
  if (/oe/.test(w)) sounds.add('oe');
  if (/uu|u(?=[^aeiouy][aeiou])|u$/.test(w.replace(/ui|eu|ou|au|oe/g, '__'))) sounds.add('uu');
  if (/r/.test(w)) sounds.add('r');
  if (/aa|ee|oo/.test(w)) sounds.add('vowel-length');
  if (/(^|[^u])w/.test(w)) sounds.add('w');
  return [...sounds];
}

export type WordStatus = 'ok' | 'close' | 'missed';

export interface WordResult {
  word: string;
  status: WordStatus;
  heard: string | null;
}

export interface PronunciationResult {
  score: number;
  words: WordResult[];
  sounds: { sound: SoundId; ok: boolean; word: string }[];
  /** Sounds to practise, most problematic first. */
  focus: SoundId[];
  transcript: string;
}

/** Word-level alignment (Needleman–Wunsch style with fuzzy word similarity). */
function align(target: string[], heard: string[]): (string | null)[] {
  const n = target.length;
  const m = heard.length;
  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 0; i <= n; i++) cost[i]![0] = i;
  for (let j = 0; j <= m; j++) cost[0]![j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sub = 1 - similarity(target[i - 1]!, heard[j - 1]!);
      cost[i]![j] = Math.min(cost[i - 1]![j]! + 1, cost[i]![j - 1]! + 1, cost[i - 1]![j - 1]! + sub);
    }
  }
  const matched: (string | null)[] = new Array(n).fill(null);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const sub = 1 - similarity(target[i - 1]!, heard[j - 1]!);
    if (Math.abs(cost[i]![j]! - (cost[i - 1]![j - 1]! + sub)) < 1e-9) {
      matched[i - 1] = heard[j - 1]!;
      i--;
      j--;
    } else if (Math.abs(cost[i]![j]! - (cost[i - 1]![j]! + 1)) < 1e-9) {
      i--;
    } else {
      j--;
    }
  }
  return matched;
}

function scoreOne(targetText: string, transcript: string): PronunciationResult {
  const target = foldText(targetText).split(' ').filter(Boolean);
  const heard = foldText(transcript).split(' ').filter(Boolean);
  const matched = align(target, heard);
  const words: WordResult[] = target.map((word, index) => {
    const h = matched[index] ?? null;
    if (h === null) return { word, status: 'missed', heard: null };
    const sim = similarity(word, h);
    if (sim === 1) return { word, status: 'ok', heard: h };
    if (sim >= 0.6) return { word, status: 'close', heard: h };
    return { word, status: 'missed', heard: h };
  });
  const points = words.reduce((sum, w) => sum + (w.status === 'ok' ? 1 : w.status === 'close' ? 0.5 : 0), 0);
  const score = target.length ? Math.round((points / target.length) * 100) / 100 : 0;

  const sounds: PronunciationResult['sounds'] = [];
  const problems = new Map<SoundId, number>();
  for (const w of words) {
    for (const sound of soundsInWord(w.word)) {
      const ok = w.status === 'ok';
      sounds.push({ sound, ok, word: w.word });
      if (!ok) problems.set(sound, (problems.get(sound) ?? 0) + 1);
    }
  }
  // A sound is only a focus if it failed and is not merely present in every word.
  const focus = [...problems.entries()].sort((a, b) => b[1] - a[1]).map(([sound]) => sound);
  return { score, words, sounds, focus, transcript };
}

/**
 * Score a pronunciation attempt against the target text. Accepts several recogniser
 * alternatives and keeps the best-scoring one.
 */
export function scorePronunciation(target: string, heard: string | string[]): PronunciationResult {
  const alternatives = (Array.isArray(heard) ? heard : [heard]).filter((h) => h.trim().length > 0);
  if (alternatives.length === 0) return scoreOne(target, '');
  return alternatives.map((alt) => scoreOne(target, alt)).sort((a, b) => b.score - a.score)[0]!;
}

/** Per-sound summary for the `speech.attempted` event: one entry per sound present. */
export function soundOutcomes(result: PronunciationResult): { sound: string; ok: boolean }[] {
  const bySound = new Map<string, boolean>();
  for (const s of result.sounds) {
    bySound.set(s.sound, (bySound.get(s.sound) ?? true) && s.ok);
  }
  return [...bySound.entries()].map(([sound, ok]) => ({ sound, ok }));
}
