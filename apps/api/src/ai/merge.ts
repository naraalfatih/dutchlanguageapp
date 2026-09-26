import { foldText, getPattern, type Correction } from '@praat/core';

const SEVERITY_ORDER: Record<Correction['severity'], number> = { meaning: 0, grammar: 1, register: 2, naturalness: 3 };

/** Most important first; gentle mode shows at most three corrections. */
export function limitCorrections(corrections: Correction[], style: 'gentle' | 'thorough'): Correction[] {
  const sorted = [...corrections].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  return sorted.slice(0, style === 'gentle' ? 3 : 6);
}

/** Unknown pattern ids from the model are mapped to 'other' so the diary stays consistent. */
export function normalizePatternId(correction: Correction): Correction {
  return getPattern(correction.patternId) ? correction : { ...correction, patternId: 'other' };
}

/**
 * Merge rule-based corrections (high precision, stable pattern ids) with the model's.
 * A model correction is dropped when the detector already reported the same pattern or the
 * same corrected sentence.
 */
export function mergeCorrections(detector: Correction[], model: Correction[]): Correction[] {
  const merged = [...detector];
  const seen = new Set(detector.map((c) => `${c.patternId}|${foldText(c.original)}`));
  const seenCorrected = new Set(detector.map((c) => foldText(c.corrected)));
  for (const raw of model) {
    const c = normalizePatternId(raw);
    if (foldText(c.original) === foldText(c.corrected)) continue; // not actually a correction
    const key = `${c.patternId}|${foldText(c.original)}`;
    // The model often quotes a fragment of the sentence the detector already corrected.
    const sameSpot = detector.some(
      (d) => d.patternId === c.patternId && foldText(d.original).includes(foldText(c.original)),
    );
    if (seen.has(key) || seenCorrected.has(foldText(c.corrected)) || sameSpot) continue;
    seen.add(key);
    merged.push(c);
  }
  return merged;
}
