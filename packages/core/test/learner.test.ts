import { describe, expect, it } from 'vitest';
import { createEvent, type LearningEvent } from '../src/schemas/events.js';
import { LearnerStateSchema } from '../src/schemas/state.js';
import { DEFAULT_PROFILE } from '../src/schemas/profile.js';
import { applyEvent, applyEvents, initialLearnerState, reseedSkills } from '../src/learner/reducer.js';
import { analyzePatterns, buildDrill } from '../src/learner/diary.js';
import { generatePlan, type PlanCatalog } from '../src/learner/plan.js';
import { describeSkill, expectedScore } from '../src/learner/skills.js';

const DAY = 86_400_000;
const NOW = new Date('2026-06-30T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY);

function utterance(at: Date, sentences = 1, errors = 0, overrides: Partial<Extract<LearningEvent, { type: 'utterance.produced' }>['payload']> = {}) {
  return createEvent(
    'utterance.produced',
    { mode: 'tutor', level: 'A2', words: sentences * 6, sentences, errors, inputMode: 'text', ...overrides },
    at,
  );
}

function mistake(at: Date, patternId = 'word-order-v2', original = 'Morgen ik ga naar huis.') {
  return createEvent(
    'mistake.recorded',
    {
      patternId,
      category: 'grammar',
      original,
      correction: 'Morgen ga ik naar huis.',
      explanation: 'Verb second.',
      source: 'tutor',
    },
    at,
  );
}

describe('skill model', () => {
  it('expects 75% success at the learner’s own level', () => {
    expect(expectedScore(2, 2)).toBeCloseTo(0.75, 2);
    expect(expectedScore(2, 3)).toBeLessThan(0.5);
  });

  it('rises with success above expectation and describes the level', () => {
    let state = initialLearnerState('A1');
    for (let i = 0; i < 10; i++) {
      state = applyEvent(state, createEvent('listening.completed', { itemId: 'x', level: 'A2', speed: 'normal', score: 1 }, daysAgo(10 - i)));
    }
    expect(state.skills.listening.rating).toBeGreaterThan(1.5);
    expect(describeSkill(state.skills.listening).level).toBe('A2');
    expect(state.skills.listening.evidence).toBe(10);
    expect(state.stats.listeningCompleted).toBe(10);
  });

  it('reseeds only skills without evidence', () => {
    let state = initialLearnerState('A0');
    state = applyEvent(state, createEvent('listening.completed', { itemId: 'x', level: 'A1', speed: 'normal', score: 1 }, NOW));
    const reseeded = reseedSkills(state, 'B1');
    expect(reseeded.skills.speaking.rating).toBe(3);
    expect(reseeded.skills.listening.rating).toBe(state.skills.listening.rating);
  });
});

describe('reducer', () => {
  it('tracks lesson steps and completion', () => {
    let state = initialLearnerState();
    state = applyEvents(state, [
      createEvent('lesson.step_completed', { lessonId: 'a1.greetings', step: 'situation' }, daysAgo(1)),
      createEvent('lesson.step_completed', { lessonId: 'a1.greetings', step: 'situation' }, daysAgo(1)),
      createEvent('lesson.completed', { lessonId: 'a1.greetings', level: 'A1', score: 0.8 }, NOW),
    ]);
    expect(state.lessons['a1.greetings']).toMatchObject({ status: 'completed', stepsCompleted: ['situation'], bestScore: 0.8 });
    expect(state.skills.vocabulary.evidence).toBe(1);
  });

  it('adds and reviews cards with FSRS', () => {
    let state = initialLearnerState();
    state = applyEvent(state, createEvent('card.added', { itemId: 'p1', source: 'lesson' }, daysAgo(2)));
    state = applyEvent(state, createEvent('card.added', { itemId: 'p1', source: 'lesson' }, daysAgo(1)));
    expect(Object.keys(state.cards)).toEqual(['p1']);
    state = applyEvent(state, createEvent('card.reviewed', { itemId: 'p1', rating: 3 }, NOW));
    expect(state.cards.p1!.reps).toBe(1);
    expect(new Date(state.cards.p1!.due).getTime()).toBeGreaterThan(NOW.getTime());
    expect(state.stats.reviewsDone).toBe(1);
  });

  it('records mistakes, caps the recent list and counts sentences', () => {
    let state = initialLearnerState();
    state = applyEvents(state, [mistake(daysAgo(1)), utterance(daysAgo(1), 3, 1)]);
    expect(state.patterns['word-order-v2']!.occurrences).toBe(1);
    expect(state.recentMistakes).toHaveLength(1);
    expect(state.stats.sentencesProduced).toBe(3);
    expect(state.stats.activeDays).toHaveLength(1);
  });

  it('marks can-do statements as demonstrated only when a scenario is achieved', () => {
    let state = initialLearnerState();
    state = applyEvent(state, createEvent('scenario.completed', { scenarioId: 's1', level: 'A2', achieved: false, score: 0.3, canDoId: 'cd1' }, NOW));
    expect(state.canDo.cd1).toBeUndefined();
    state = applyEvent(state, createEvent('scenario.completed', { scenarioId: 's1', level: 'A2', achieved: true, score: 0.9, canDoId: 'cd1' }, NOW));
    expect(state.canDo.cd1!.evidence).toBe('scenario:s1');
  });

  it('tracks pronunciation sounds as patterns', () => {
    let state = initialLearnerState();
    state = applyEvent(state, createEvent('speech.attempted', { target: 'huis', transcript: 'hoes', score: 0, level: 'A1', sounds: [{ sound: 'ui', ok: false }, { sound: 'r', ok: true }] }, NOW));
    expect(state.patterns['pron-ui']).toMatchObject({ occurrences: 1, drillAttempts: 1, drillCorrect: 0 });
    expect(state.patterns['pron-r']).toBeUndefined();
  });

  it('produces a state that validates against the wire schema', () => {
    const state = applyEvents(initialLearnerState('A1'), [mistake(NOW), utterance(NOW)]);
    expect(() => LearnerStateSchema.parse(state)).not.toThrow();
  });

  it('is deterministic: same events, same state', () => {
    const events = [mistake(daysAgo(3)), utterance(daysAgo(3), 2, 1, { inputMode: 'voice', latencyMs: 1800 })];
    expect(applyEvents(initialLearnerState(), events)).toEqual(applyEvents(initialLearnerState(), events));
  });
});

describe('mistake diary', () => {
  it('reports "Improved 35%" when the error rate drops', () => {
    // Previous period: 20 errors in 100 sentences; recent: 13 errors in 100 sentences.
    const events: LearningEvent[] = [];
    for (let i = 0; i < 20; i++) events.push(mistake(daysAgo(30)));
    events.push(utterance(daysAgo(30), 50), utterance(daysAgo(29), 50));
    for (let i = 0; i < 13; i++) events.push(mistake(daysAgo(3)));
    events.push(utterance(daysAgo(3), 50), utterance(daysAgo(2), 50));
    const state = applyEvents(initialLearnerState(), events);
    const [insight] = analyzePatterns(state, NOW);
    expect(insight!.patternId).toBe('word-order-v2');
    expect(insight!.recentRate).toBe(13);
    expect(insight!.previousRate).toBe(20);
    expect(insight!.status).toBe('improving');
    expect(insight!.label).toBe('Improved 35%');
  });

  it('flags frequent recent mistakes as "Needs practice" and sorts them first', () => {
    const events: LearningEvent[] = [utterance(daysAgo(40), 20), utterance(daysAgo(2), 20)];
    for (let i = 0; i < 5; i++) events.push(mistake(daysAgo(2), 'de-het', 'De huis is groot.'));
    events.push(mistake(daysAgo(40)), mistake(daysAgo(41)));
    const state = applyEvents(initialLearnerState(), events);
    const insights = analyzePatterns(state, NOW);
    expect(insights[0]!.patternId).toBe('de-het');
    expect(insights[0]!.label).toBe('Needs practice');
    const v2 = insights.find((i) => i.patternId === 'word-order-v2')!;
    expect(v2.status).toBe('mastered');
  });

  it('shows pronunciation progress', () => {
    let state = initialLearnerState();
    const attempt = (ok: boolean, at: Date) =>
      createEvent('speech.attempted', { target: 'goed', transcript: ok ? 'goed' : 'koet', score: ok ? 1 : 0, level: 'A1', sounds: [{ sound: 'g', ok }] }, at);
    for (let i = 0; i < 5; i++) state = applyEvent(state, attempt(false, daysAgo(40)));
    for (let i = 0; i < 5; i++) state = applyEvent(state, attempt(i > 0, daysAgo(3)));
    const insight = analyzePatterns(state, NOW).find((i) => i.patternId === 'pron-g')!;
    expect(insight.title).toBe('Pronunciation: G sound');
    expect(insight.label).toBe('Improving');
  });

  it("builds drills from the learner's own sentences plus the pattern bank", () => {
    const state = applyEvents(initialLearnerState(), [mistake(NOW), mistake(daysAgo(1), 'word-order-v2', 'Vandaag ik werk.')]);
    const drill = buildDrill(state, 'word-order-v2', 6);
    expect(drill).toHaveLength(6);
    expect(drill[0]!.id.startsWith('own.')).toBe(true);
    expect(drill[1]!.id.startsWith('drill.v2')).toBe(true);
  });
});

describe('daily plan', () => {
  const catalog: PlanCatalog = {
    lessons: [
      { id: 'a1.greetings', level: 'A1', order: 1, title: 'Greetings', minutes: 8 },
      { id: 'a1.family', level: 'A1', order: 2, title: 'Family', minutes: 8 },
      { id: 'a2.work', level: 'A2', order: 1, title: 'Work', minutes: 10 },
    ],
    scenarios: [
      { id: 'gp', level: 'A2', title: 'At the GP', category: 'living', goals: ['moving'], canDoId: 'cd.gp' },
      { id: 'party', level: 'A2', title: 'Birthday party', category: 'social', goals: ['partner'] },
    ],
    listening: [{ id: 'l1', level: 'A2', title: 'At the station' }],
    sounds: [{ id: 'g', title: 'The G', priority: 1 }],
  };

  it('starts beginners with a lesson and a conversation', () => {
    const plan = generatePlan(initialLearnerState('A0'), { ...DEFAULT_PROFILE, goals: ['moving'] }, catalog, NOW);
    expect(plan.focus).toBe('getting-started');
    expect(plan.items[0]!.kind).toBe('lesson');
    expect(plan.items[0]!.refId).toBe('a1.greetings');
  });

  it('explains a listening ≫ speaking gap and prioritises conversation', () => {
    let state = initialLearnerState('A2');
    for (let i = 0; i < 8; i++) {
      state = applyEvent(state, createEvent('listening.completed', { itemId: 'l', level: 'B1', speed: 'normal', score: 1 }, daysAgo(i + 1)));
      state = applyEvent(state, utterance(daysAgo(i + 1), 1, 1, { words: 1, level: 'A2' }));
    }
    const plan = generatePlan(state, { ...DEFAULT_PROFILE, goals: ['moving'], dailyMinutes: 20 }, catalog, NOW);
    expect(plan.focus).toBe('speaking');
    expect(plan.rationale).toContain('You understand Dutch well but hesitate while speaking');
    expect(plan.items[0]!.kind).toBe('scenario');
    expect(plan.items[0]!.refId).toBe('gp');
  });

  it('puts due reviews first and respects the time budget', () => {
    let state = initialLearnerState('A1');
    for (let i = 0; i < 10; i++) state = applyEvent(state, createEvent('card.added', { itemId: `p${i}`, source: 'lesson' }, daysAgo(1)));
    const plan = generatePlan(state, { ...DEFAULT_PROFILE, dailyMinutes: 10 }, catalog, NOW);
    expect(plan.dueReviews).toBe(10);
    expect(plan.items.some((i) => i.kind === 'review')).toBe(true);
    expect(plan.items.length).toBeGreaterThanOrEqual(2);
  });
});
