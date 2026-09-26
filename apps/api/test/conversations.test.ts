import { getScenario } from '@praat/content';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp, signUp, type TestApp } from './helpers.js';

let t: TestApp;
beforeAll(async () => {
  t = await createTestApp();
});
afterAll(async () => {
  await t.close();
});

describe('offline conversation partner', () => {
  it('corrects "Ik ben heet" naturally and records the mistake', async () => {
    const s = await signUp(t.app);
    const created = await s.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'tutor', level: 'A1' } });
    expect(created.statusCode).toBe(201);
    const { conversation, opening } = created.json();
    expect(opening.reply.nl.length).toBeGreaterThan(0);

    const res = await s.inject({
      method: 'POST',
      url: `/api/v1/conversations/${conversation.id}/turns`,
      payload: { text: 'Ik ben heet Amira en ik woon in Utrecht.', inputMode: 'voice', latencyMs: 1800 },
    });
    expect(res.statusCode).toBe(200);
    const { turn, events } = res.json();
    expect(turn.source).toBe('offline');
    const correction = turn.feedback.corrections.find((c: { patternId: string }) => c.patternId === 'heten');
    expect(correction.corrected).toContain('Ik heet Amira');
    expect(correction.explanation).toMatch(/People understand you/);

    expect(events.map((e: { type: string }) => e.type)).toEqual(['utterance.produced', 'mistake.recorded']);
    const state = (await s.inject({ method: 'GET', url: '/api/v1/progress/state' })).json();
    expect(state.patterns.heten.occurrences).toBe(1);
    expect(state.stats.voiceTurns).toBe(1);

    const detail = (await s.inject({ method: 'GET', url: `/api/v1/conversations/${conversation.id}` })).json();
    expect(detail.messages.map((m: { role: string }) => m.role)).toEqual(['character', 'learner', 'character']);
    expect(detail.messages[1].feedback.corrections.length).toBeGreaterThan(0);

    const list = (await s.inject({ method: 'GET', url: '/api/v1/conversations' })).json();
    expect(list.conversations[0].id).toBe(conversation.id);
  });

  it('plays a Life Simulator scenario to the end and credits the can-do', async () => {
    const s = await signUp(t.app);
    const scenario = getScenario('daily.cafe')!;
    const created = (
      await s.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'scenario', level: 'A1', scenarioId: scenario.id } })
    ).json();
    expect(created.opening.task).toMatchObject({ beatId: scenario.beats[0]!.id, progress: 0 });

    let last;
    for (const beat of scenario.beats) {
      last = (
        await s.inject({
          method: 'POST',
          url: `/api/v1/conversations/${created.conversation.id}/turns`,
          payload: { text: beat.modelAnswers[0] },
        })
      ).json();
      expect(last.turn.task.achieved).toBe(true);
    }
    expect(last.turn.task.completed).toBe(true);
    expect(last.turn.debrief).toBe(scenario.debrief);
    expect(last.events.some((e: { type: string }) => e.type === 'scenario.completed')).toBe(true);

    const state = (await s.inject({ method: 'GET', url: '/api/v1/progress/state' })).json();
    expect(state.canDo[scenario.canDoId!]).toBeDefined();

    const after = await s.inject({
      method: 'POST',
      url: `/api/v1/conversations/${created.conversation.id}/turns`,
      payload: { text: 'Nog één ding!' },
    });
    expect(after.statusCode).toBe(409);
  });

  it('moves on after two unsuccessful attempts and shows a model answer', async () => {
    const s = await signUp(t.app);
    const scenario = getScenario('daily.cafe')!;
    const { conversation } = (
      await s.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'scenario', level: 'A1', scenarioId: scenario.id } })
    ).json();
    const url = `/api/v1/conversations/${conversation.id}/turns`;
    const first = (await s.inject({ method: 'POST', url, payload: { text: 'Eh… hallo?' } })).json();
    expect(first.turn.task).toMatchObject({ achieved: false, beatId: scenario.beats[0]!.id });
    const second = (await s.inject({ method: 'POST', url, payload: { text: 'Hmm, ik weet het niet.' } })).json();
    expect(second.turn.task.achieved).toBe(false);
    expect(second.turn.feedback.natural.nl).toBe(scenario.beats[0]!.modelAnswers[0]);
    expect(second.turn.task.nextTask).toBe(scenario.beats[1]!.task);
  });

  it('validates input and hides other learners’ conversations', async () => {
    const a = await signUp(t.app);
    const b = await signUp(t.app);
    const bad = await a.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'scenario', level: 'A1', scenarioId: 'nope' } });
    expect(bad.statusCode).toBe(400);

    const { conversation } = (await a.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'friend', level: 'B1' } })).json();
    expect((await b.inject({ method: 'GET', url: `/api/v1/conversations/${conversation.id}` })).statusCode).toBe(404);
    const turn = await b.inject({ method: 'POST', url: `/api/v1/conversations/${conversation.id}/turns`, payload: { text: 'Hoi!' } });
    expect(turn.statusCode).toBe(404);
    const empty = await a.inject({ method: 'POST', url: `/api/v1/conversations/${conversation.id}/turns`, payload: { text: '   ' } });
    expect(empty.statusCode).toBe(400);
  });
});

describe('sentence evaluation', () => {
  it('judges communication first and still gives corrections', async () => {
    const s = await signUp(t.app);
    const res = await s.inject({
      method: 'POST',
      url: '/api/v1/evaluate/sentence',
      payload: {
        text: 'Ik wil een koffie, alsjeblieft',
        level: 'A1',
        task: { prompt: 'Order a coffee', mustInclude: [{ id: 'coffee', description: 'Mention coffee', anyOf: [['koffie']] }] },
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ achieved: true, source: 'offline' });
  });
});

describe('speech', () => {
  it('reports that server speech is not configured', async () => {
    const s = await signUp(t.app);
    const res = await s.inject({ method: 'GET', url: '/api/v1/speech/tts?text=hallo' });
    expect(res.statusCode).toBe(501);
    expect(res.json().error.code).toBe('not_configured');
  });
});
