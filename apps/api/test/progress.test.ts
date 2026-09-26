import { createEvent } from '@praat/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp, signUp, type TestApp } from './helpers.js';

let t: TestApp;
beforeAll(async () => {
  t = await createTestApp();
});
afterAll(async () => {
  await t.close();
});

const at = (iso: string) => new Date(iso);

describe('event sync', () => {
  it('ingests events idempotently and projects the learner state', async () => {
    const s = await signUp(t.app);
    const events = [
      createEvent('card.added', { itemId: 'a0.greetings.hallo', source: 'lesson' }, at('2026-09-20T10:00:00Z')),
      createEvent(
        'mistake.recorded',
        {
          patternId: 'heten',
          category: 'vocabulary',
          original: 'Ik ben heet Amira.',
          correction: 'Ik heet Amira.',
          explanation: "People understand you, but 'Ik ben heet' means 'I am hot'.",
          source: 'tutor',
        },
        at('2026-09-20T10:01:00Z'),
      ),
      createEvent(
        'utterance.produced',
        { mode: 'tutor', level: 'A1', words: 3, sentences: 1, errors: 1, inputMode: 'voice' },
        at('2026-09-20T10:01:00Z'),
      ),
    ];

    const first = await s.inject({ method: 'POST', url: '/api/v1/sync/events', payload: { deviceId: 'phone', events } });
    expect(first.statusCode).toBe(200);
    expect(first.json()).toMatchObject({ accepted: 3, duplicates: 0 });
    expect(first.json().state.cards['a0.greetings.hallo']).toBeDefined();

    // Retrying the same batch (flaky network) changes nothing.
    const retry = await s.inject({ method: 'POST', url: '/api/v1/sync/events', payload: { events } });
    expect(retry.json()).toMatchObject({ accepted: 0, duplicates: 3 });

    const state = (await s.inject({ method: 'GET', url: '/api/v1/progress/state' })).json();
    expect(state.patterns.heten.occurrences).toBe(1);
    expect(state.recentMistakes[0].correction).toBe('Ik heet Amira.');
    expect(state.stats.voiceTurns).toBe(1);
    expect(state.cards['a0.greetings.hallo'].state).toBeDefined();

    const pulled = (await s.inject({ method: 'GET', url: '/api/v1/sync/events?after=0&limit=2' })).json();
    expect(pulled.events).toHaveLength(2);
    const rest = (await s.inject({ method: 'GET', url: `/api/v1/sync/events?after=${pulled.nextCursor}` })).json();
    expect(rest.events).toHaveLength(1);
  });

  it('keeps each learner’s data separate', async () => {
    const a = await signUp(t.app);
    const b = await signUp(t.app);
    const event = createEvent('card.added', { itemId: 'a0.numbers.een', source: 'lesson' });
    await a.inject({ method: 'POST', url: '/api/v1/sync/events', payload: { events: [event] } });
    // The same event id from another account is not attributed to it.
    const other = await b.inject({ method: 'POST', url: '/api/v1/sync/events', payload: { events: [event] } });
    expect(other.json()).toMatchObject({ accepted: 0, duplicates: 1 });
    const bState = (await b.inject({ method: 'GET', url: '/api/v1/progress/state' })).json();
    expect(bState.cards['a0.numbers.een']).toBeUndefined();
  });

  it('validates event payloads', async () => {
    const s = await signUp(t.app);
    const res = await s.inject({
      method: 'POST',
      url: '/api/v1/sync/events',
      payload: { events: [{ id: 'not-a-uuid', type: 'card.added', occurredAt: 'yesterday', payload: {} }] },
    });
    expect(res.statusCode).toBe(400);
  });

  it('builds a daily plan', async () => {
    const s = await signUp(t.app);
    const plan = (await s.inject({ method: 'GET', url: '/api/v1/progress/plan' })).json();
    expect(plan.items.length).toBeGreaterThan(0);
    expect(typeof plan.headline).toBe('string');
  });
});
