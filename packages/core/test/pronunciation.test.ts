import { describe, expect, it } from 'vitest';
import { scorePronunciation, soundOutcomes, soundsInWord } from '../src/pronunciation/score.js';

describe('soundsInWord', () => {
  it('finds the difficult Dutch sounds', () => {
    expect(soundsInWord('huis')).toContain('ui');
    expect(soundsInWord('deur')).toEqual(expect.arrayContaining(['eu', 'r']));
    expect(soundsInWord('goed')).toEqual(expect.arrayContaining(['g', 'oe']));
    expect(soundsInWord('school')).toEqual(expect.arrayContaining(['sch', 'vowel-length']));
    expect(soundsInWord('lachen')).toContain('g');
    expect(soundsInWord('zingen')).not.toContain('g');
    expect(soundsInWord('buur')).toContain('uu');
    expect(soundsInWord('wijn')).toEqual(expect.arrayContaining(['w', 'ij']));
  });
});

describe('scorePronunciation', () => {
  it('scores a perfect transcript as 1', () => {
    const result = scorePronunciation('Ik woon in een huis', 'ik woon in een huis');
    expect(result.score).toBe(1);
    expect(result.focus).toEqual([]);
  });

  it('attributes a misrecognised word to its sounds', () => {
    const result = scorePronunciation('Ik woon in een huis', 'ik woon in een hoes');
    expect(result.score).toBeLessThan(1);
    const huis = result.words.find((w) => w.word === 'huis')!;
    expect(huis.status).not.toBe('ok');
    expect(result.focus).toContain('ui');
  });

  it('handles missing words and picks the best alternative', () => {
    const result = scorePronunciation('Goedemorgen, hoe gaat het?', ['hoe gaat het', 'goedemorgen hoe gaat het']);
    expect(result.score).toBe(1);
    const partial = scorePronunciation('Goedemorgen, hoe gaat het?', 'hoe gaat het');
    expect(partial.words[0]!.status).toBe('missed');
    expect(partial.focus).toContain('g');
  });

  it('summarises sound outcomes for events', () => {
    const result = scorePronunciation('deur', 'door');
    expect(soundOutcomes(result)).toEqual(expect.arrayContaining([{ sound: 'eu', ok: false }]));
  });

  it('copes with empty input', () => {
    expect(scorePronunciation('huis', '').score).toBe(0);
  });
});
