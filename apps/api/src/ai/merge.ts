import { foldText, getPattern, type Correction } from '@praat/core';

export { limitCorrections } from '@praat/core';

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
    const sameSpot = detector.some((d) => d.patternId === c.patternId && foldText(d.original).includes(foldText(c.original)));
    if (seen.has(key) || seenCorrected.has(foldText(c.corrected)) || sameSpot) continue;
    seen.add(key);
    merged.push(c);
  }
  return merged;
}
