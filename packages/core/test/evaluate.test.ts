import { describe, expect, it } from 'vitest';
import { evaluateAnswer, evaluateFreeResponse, evaluateOrder } from '../src/language/evaluate.js';
import { intentSatisfied, matchIntents, termMatches } from '../src/language/intents.js';
import { normalizeText, splitSentences, stripDiacritics } from '../src/language/normalize.js';

describe('normalize', () => {
  it('ignores case and punctuation but keeps in-word apostrophes', () => {
    expect(normalizeText('  Hoe gaat HET?! ')).toBe('hoe gaat het');
    expect(normalizeText('Zo’n mooi huis.')).toBe("zo'n mooi huis");
    expect(stripDiacritics('geïnteresseerd één café')).toBe('geinteresseerd een cafe');
  });

  it('splits sentences', () => {
    expect(splitSentences('Hoi! Hoe gaat het? Goed.')).toEqual(['Hoi!', 'Hoe gaat het?', 'Goed.']);
  });
});

describe('evaluateAnswer', () => {
  it('accepts exact answers regardless of case and punctuation', () => {
    expect(evaluateAnswer('ik heet sam', ['Ik heet Sam.']).verdict).toBe('correct');
  });

  it('treats missing accents and small typos as almost', () => {
    expect(evaluateAnswer('Ik ben geinteresseerd', ['Ik ben geïnteresseerd']).verdict).toBe('almost');
    const typo = evaluateAnswer('Ik woon in Amsterdm', ['Ik woon in Amsterdam']);
    expect(typo.verdict).toBe('almost');
    expect(typo.note).toContain('Ik woon in Amsterdam');
  });

  it('rejects wrong answers and reports the closest accepted one', () => {
    const result = evaluateAnswer('Ik ben Sam jaar', ['Ik heet Sam', 'Ik ben Sam']);
    expect(result.verdict).toBe('incorrect');
    expect(result.closest).toBe('Ik ben Sam');
  });

  it('is strict for very short answers', () => {
    expect(evaluateAnswer('het', ['de']).verdict).toBe('incorrect');
  });

  it('evaluates word order exercises', () => {
    expect(evaluateOrder(['Morgen', 'ga', 'ik'], ['Morgen', 'ga', 'ik']).verdict).toBe('correct');
    expect(evaluateOrder(['Morgen', 'ik', 'ga'], ['Morgen', 'ga', 'ik']).verdict).not.toBe('correct');
  });
});

describe('intents', () => {
  const intent = { id: 'name', description: 'Say your name', anyOf: [['heet|naam is'], ['ik ben', 'uit|van']] };

  it('matches alternatives, phrases and prefixes', () => {
    expect(termMatches('Ik wil een afspraak maken', 'afspra*')).toBe(true);
    expect(termMatches('Ik heet Sam', 'heet|naam')).toBe(true);
    expect(termMatches('verheten', 'heet')).toBe(false);
    expect(intentSatisfied('Hoi, ik heet Sam', intent)).toBe(true);
    expect(intentSatisfied('Ik ben Sam uit Leeds', intent)).toBe(true);
    expect(intentSatisfied('Ik ben Sam', intent)).toBe(false);
  });

  it('matches numbers with #num', () => {
    expect(termMatches('Ik ben 25 jaar', '#num')).toBe(true);
    expect(termMatches('Ik ben vijfentwintig', '#num')).toBe(true);
    expect(termMatches('om 14:30', '#num')).toBe(true);
    expect(termMatches('Ik ben moe', '#num')).toBe(false);
  });

  it('is accent- and case-insensitive', () => {
    expect(termMatches('Ik kom uit BELGIË', 'belgie')).toBe(true);
  });

  it('reports coverage', () => {
    const result = matchIntents('Ik heet Sam', [intent, { id: 'x', description: 'X', anyOf: [['fiets']] }]);
    expect(result.coverage).toBe(0.5);
    expect(result.missing.map((i) => i.id)).toEqual(['x']);
  });
});

describe('evaluateFreeResponse', () => {
  const task = {
    intents: [
      { id: 'greet', description: 'Greet', anyOf: [['hallo|hoi|goedemorgen|goedemiddag|dag']] },
      { id: 'name', description: 'Say your name', anyOf: [['heet|ben|naam is']] },
    ],
    modelAnswers: ['Hallo, ik heet Sam.', 'Hoi! Ik ben Sam.'],
  };

  it('achieves the task even with a grammar mistake, and still reports the mistake', () => {
    const result = evaluateFreeResponse('Hallo, ik ben heet Sam.', task);
    expect(result.achieved).toBe(true);
    expect(result.corrections[0]!.patternId).toBe('heten');
    expect(result.feedback.understood).toBe(true);
    expect(result.score).toBeLessThan(1);
  });

  it('reports missing intents', () => {
    const result = evaluateFreeResponse('Ik heet Sam.', task);
    expect(result.achieved).toBe(false);
    expect(result.missing.map((i) => i.id)).toEqual(['greet']);
  });

  it('praises correct answers', () => {
    const result = evaluateFreeResponse('Hoi, ik heet Sam.', task);
    expect(result.achieved).toBe(true);
    expect(result.corrections).toEqual([]);
    expect(result.score).toBe(1);
    expect(result.feedback.praise).toBeTruthy();
  });
});
