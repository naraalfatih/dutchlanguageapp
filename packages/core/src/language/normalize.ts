/** Text utilities for comparing learner Dutch with expected answers. */

const APOSTROPHES = /[’‘`´]/g;
const QUOTES = /[“”„«»"]/g;

/** Lower-case, unify apostrophes, strip punctuation (keeping in-word apostrophes and hyphens). */
export function normalizeText(text: string): string {
  return text
    .normalize('NFC')
    .replace(APOSTROPHES, "'")
    .replace(QUOTES, '')
    .toLowerCase()
    .replace(/[.,!?;:()[\]{}…¿¡–—]/g, ' ')
    .replace(/(^|\s)'(?=\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove diacritics: geïnteresseerd → geinteresseerd, één → een, café → cafe. */
export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
}

/** Normalised, diacritic-free form used for lenient matching. */
export function foldText(text: string): string {
  return stripDiacritics(normalizeText(text));
}

export function tokenize(text: string): string[] {
  const normalized = foldText(text);
  return normalized ? normalized.split(' ') : [];
}

/** Split into sentences, keeping the terminal punctuation with each sentence. */
export function splitSentences(text: string): string[] {
  const parts = text
    .replace(/\s+/g, ' ')
    .trim()
    .match(/[^.!?…]+[.!?…]*|[.!?…]+/g);
  return (parts ?? []).map((s) => s.trim()).filter((s) => /[\p{L}\d]/u.test(s));
}

export function countWords(text: string): number {
  return tokenize(text).filter((t) => /[\p{L}\d]/u.test(t)).length;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1]! + 1, previous[j]! + 1, previous[j - 1]! + cost);
    }
    previous = current;
  }
  return previous[b.length]!;
}

/** 1 = identical, 0 = completely different. */
export function similarity(a: string, b: string): number {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(a, b) / longest;
}

/** Keep the capitalisation of `source` when replacing it with `replacement`. */
export function matchCase(source: string, replacement: string): string {
  if (!source || !replacement) return replacement;
  const first = source[0]!;
  if (first === first.toUpperCase() && first !== first.toLowerCase()) {
    return replacement[0]!.toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export function capitalize(text: string): string {
  return text ? text[0]!.toUpperCase() + text.slice(1) : text;
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
