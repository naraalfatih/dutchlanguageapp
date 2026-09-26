import { describe, expect, it } from 'vitest';
import {
  CanDoSchema,
  CultureArticleSchema,
  detectMistakes,
  evaluateFreeResponse,
  ExpressionSchema,
  ListeningItemSchema,
  PersonaSchema,
  ScenarioSchema,
  SoundModuleSchema,
  LEVELS,
  scenarioAchieved,
  scenarioTurn,
  startScenario,
} from '@praat/core';
import {
  canDos,
  cultureArticles,
  expressions,
  getLesson,
  listeningItems,
  personas,
  planCatalog,
  scenarios,
  sounds,
} from '../src/index.js';

function noMistakes(texts: string[], register?: 'formal' | 'neutral' | 'informal') {
  return texts
    .map((text) => ({ text, c: detectMistakes(text, register ? { register } : {}).corrections }))
    .filter((r) => r.c.length > 0)
    .map((r) => `${r.text} → ${r.c.map((c) => c.patternId).join(', ')}`);
}

describe('Life Simulator scenarios', () => {
  it('has unique ids and covers living, social, daily and work', () => {
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length);
    for (const category of ['living', 'social', 'daily', 'work']) {
      expect(scenarios.filter((s) => s.category === category).length, category).toBeGreaterThanOrEqual(3);
    }
  });

  describe.each(scenarios.map((s) => [s.id, s] as const))('%s', (_id, scenario) => {
    it('validates against the schema', () => {
      expect(() => ScenarioSchema.parse(scenario)).not.toThrow();
    });

    it('links to an existing can-do statement', () => {
      if (scenario.canDoId) expect(canDos.some((c) => c.id === scenario.canDoId)).toBe(true);
    });

    it('has model answers that achieve every beat, in the right register, without mistakes', () => {
      for (const beat of scenario.beats) {
        for (const answer of beat.modelAnswers) {
          const result = evaluateFreeResponse(answer, { intents: beat.intents, register: scenario.register });
          expect(result.missing.map((m) => m.id), `${beat.id}: ${answer}`).toEqual([]);
          expect(result.corrections.map((c) => c.patternId), `${beat.id}: ${answer}`).toEqual([]);
        }
      }
    });

    it('has natural NPC lines', () => {
      expect(noMistakes(scenario.beats.flatMap((b) => [b.npc.nl, b.onSuccess?.nl ?? '', b.onMiss?.nl ?? ''].filter(Boolean)))).toEqual([]);
    });

    it('can be played to completion with the model answers', () => {
      let { state } = startScenario(scenario);
      for (const beat of scenario.beats) {
        state = scenarioTurn(scenario, state, beat.modelAnswers[0]!, scenario.level).state;
      }
      expect(state.completed).toBe(true);
      expect(scenarioAchieved(scenario, state)).toBe(true);
    });
  });
});

describe('Listening Trainer', () => {
  it('has items from A1 to C1 across several kinds', () => {
    expect(new Set(listeningItems.map((i) => i.kind)).size).toBeGreaterThanOrEqual(5);
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      expect(listeningItems.some((i) => i.level === level), level).toBe(true);
    }
  });

  it.each(listeningItems.map((i) => [i.id, i] as const))('%s is valid and natural', (_id, item) => {
    expect(() => ListeningItemSchema.parse(item)).not.toThrow();
    for (const q of item.questions) if (q.type === 'choice') expect(q.answer).toBeLessThan(q.options.length);
    expect(noMistakes(item.lines.map((l) => l.nl))).toEqual([]);
    const speakerNames = new Set(item.speakers.map((s) => s.name));
    expect(speakerNames.size).toBeGreaterThan(0);
  });
});

describe('Speak Like a Dutch Person', () => {
  it('has unique ids and validates', () => {
    expect(new Set(expressions.map((e) => e.id)).size).toBe(expressions.length);
    for (const expression of expressions) expect(() => ExpressionSchema.parse(expression)).not.toThrow();
  });

  it('covers the brief: gezellig, lekker, gewoon, eigenlijk, toch, hoor', () => {
    const naturals = expressions.map((e) => e.natural.toLowerCase());
    for (const word of ['gezellig', 'lekker', 'gewoon', 'eigenlijk', 'toch', 'hoor']) {
      expect(naturals.some((n) => n.includes(word)), word).toBe(true);
    }
  });

  it('teaches "Hoe gaat-ie?" and "Dat is echt leuk" as natural alternatives', () => {
    expect(expressions.find((e) => e.natural === 'Hoe gaat-ie?')?.textbook).toBe('Hoe gaat het met jou?');
    expect(expressions.find((e) => e.natural === 'Dat is echt leuk')?.textbook).toBe('Dat is very nice');
  });

  it('has natural example sentences', () => {
    expect(noMistakes(expressions.flatMap((e) => e.examples.map((x) => x.nl)))).toEqual([]);
  });
});

describe('Culture', () => {
  it('covers the required topics', () => {
    const topics = new Set(cultureArticles.map((a) => a.topic));
    for (const topic of ['communication', 'cycling', 'social', 'humor', 'regions', 'traditions', 'food', 'history']) {
      expect(topics.has(topic as never), topic).toBe(true);
    }
  });

  it.each(cultureArticles.map((a) => [a.id, a] as const))('%s is valid', (_id, article) => {
    expect(() => CultureArticleSchema.parse(article)).not.toThrow();
    if (article.tryScenarioId) expect(scenarios.some((s) => s.id === article.tryScenarioId)).toBe(true);
    expect(noMistakes(article.keyPhrases.map((p) => p.nl))).toEqual([]);
  });
});

describe('Personas, can-dos, sounds and catalog', () => {
  it('validates personas with an opening for every level', () => {
    for (const persona of personas) {
      expect(() => PersonaSchema.parse(persona)).not.toThrow();
      for (const level of LEVELS) expect(persona.opening[level], `${persona.id} ${level}`).toBeDefined();
    }
    expect(personas.some((p) => p.kind === 'tutor')).toBe(true);
    expect(personas.some((p) => p.region === 'be')).toBe(true);
  });

  it('validates can-dos and their references', () => {
    expect(new Set(canDos.map((c) => c.id)).size).toBe(canDos.length);
    for (const canDo of canDos) {
      expect(() => CanDoSchema.parse(canDo)).not.toThrow();
      for (const id of canDo.lessonIds) expect(getLesson(id), id).toBeDefined();
      for (const id of canDo.scenarioIds) expect(scenarios.some((s) => s.id === id), id).toBe(true);
    }
  });

  it('validates sound modules', () => {
    for (const sound of sounds) expect(() => SoundModuleSchema.parse(sound)).not.toThrow();
  });

  it('builds a planner catalogue', () => {
    const catalog = planCatalog();
    expect(catalog.lessons.length).toBeGreaterThanOrEqual(30);
    expect(catalog.scenarios.length).toBe(scenarios.length);
    expect(catalog.sounds.length).toBe(sounds.length);
  });
});
