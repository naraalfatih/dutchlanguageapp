import { getScenario } from '@praat/content';
import { afterAll, describe, expect, it } from 'vitest';
import { conversationMessages, finalText } from '../src/ai/anthropic.js';
import { aiTurn, createTestApp, fakeAnthropic, signUp, type TestApp } from './helpers.js';

const apps: TestApp[] = [];
afterAll(async () => {
  await Promise.all(apps.map((a) => a.close()));
});

async function appWith(fake: ReturnType<typeof fakeAnthropic>, limit = 200) {
  const base = await createTestApp(
    { ai: { apiKey: 'test-key', model: 'claude-opus-5', effort: 'low', maxTokens: 4000, fallbacks: true, dailyTurnLimit: limit } },
    fake.client,
  );
  apps.push(base);
  return base;
}

describe('conversation message building', () => {
  it('opens with a stage direction, alternates roles and caches the history prefix', () => {
    const messages = conversationMessages(
      [
        { role: 'character', text: 'Hoi! Hoe heet je?' },
        { role: 'learner', text: 'Ik heet Sam.' },
        { role: 'character', text: 'Leuk! Waar woon je?' },
      ],
      '<learner_message>In Delft.</learner_message>',
    );
    expect(messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant', 'user']);
    expect(messages[3]!.content).toEqual([{ type: 'text', text: 'Leuk! Waar woon je?', cache_control: { type: 'ephemeral' } }]);
    expect(messages[4]!.content).toContain('In Delft.');
  });

  it('folds a dangling learner message into the final user turn', () => {
    const messages = conversationMessages(
      [
        { role: 'character', text: 'Hoi!' },
        { role: 'learner', text: 'Hallo' },
      ],
      'final',
    );
    expect(messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(messages[2]!.content).toBe('Hallo\n\nfinal');
  });

  it('reads only the text after a server-side fallback boundary', () => {
    const text = finalText({
      content: [
        { type: 'text', text: '{"partial":' },
        { type: 'fallback', from: { model: 'a' }, to: { model: 'b' } },
        { type: 'text', text: '{"ok":true}' },
      ],
    } as never);
    expect(text).toBe('{"ok":true}');
  });
});

describe('Claude conversation partner', () => {
  it('sends a cached, structured request and merges rule-based corrections', async () => {
    const fake = fakeAnthropic(() => ({
      json: aiTurn({
        reply: { nl: 'Ah, Amira! Leuk je te ontmoeten. Waar kom je vandaan?', en: 'Ah, Amira! Nice to meet you. Where are you from?' },
        corrections: [
          {
            original: 'ik ben heet',
            corrected: 'Ik heet Amira.',
            explanation: 'Duplicate of the rule checker.',
            category: 'vocabulary',
            patternId: 'heten',
            severity: 'meaning',
          },
          {
            original: 'in de Utrecht',
            corrected: 'in Utrecht',
            explanation: 'City names take no article.',
            category: 'grammar',
            patternId: 'made-up-id',
            severity: 'grammar',
          },
        ],
        glossary: [{ term: 'leuk je te ontmoeten', meaning: 'nice to meet you', note: null }],
      }),
    }));
    const t = await appWith(fake);
    const s = await signUp(t.app);
    const { conversation, opening } = (
      await s.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'friend', level: 'A2', personaId: 'friend.sanne' } })
    ).json();
    // Openings are authored content: no model call.
    expect(fake.calls).toHaveLength(0);
    expect(opening.reply.nl.length).toBeGreaterThan(0);

    const res = await s.inject({
      method: 'POST',
      url: `/api/v1/conversations/${conversation.id}/turns`,
      payload: { text: 'Ik ben heet Amira en ik woon in de Utrecht.' },
    });
    expect(res.statusCode).toBe(200);
    const { turn } = res.json();
    expect(turn.source).toBe('ai');
    expect(turn.reply.nl).toContain('Amira');

    const patterns = turn.feedback.corrections.map((c: { patternId: string }) => c.patternId);
    expect(patterns.filter((p: string) => p === 'heten')).toHaveLength(1); // de-duplicated
    expect(patterns).toContain('other'); // unknown ids are normalised

    const request = fake.calls[0]!;
    expect(request.model).toBe('claude-opus-5');
    expect(request.fallbacks).toBe('default');
    expect(request.betas).toEqual(['server-side-fallback-2026-07-01']);
    expect(request.output_config?.effort).toBe('low');
    expect(request.output_config?.format?.type).toBe('json_schema');
    const system = request.system as { text: string; cache_control?: unknown }[];
    expect(system[0]!.cache_control).toEqual({ type: 'ephemeral' });
    expect(system[1]!.text).toContain('Sanne');
    const last = request.messages.at(-1)!;
    expect(last.role).toBe('user');
    expect(String(last.content)).toContain('<rule_checker>');
    expect(String(last.content)).toContain('heten');
  });

  it('advances a scenario when the model judges the step achieved', async () => {
    const scenario = getScenario('daily.cafe')!;
    const fake = fakeAnthropic(() => ({ json: aiTurn({ taskAchieved: true, reply: { nl: 'Komt eraan!', en: 'Coming up!' } }) }));
    const t = await appWith(fake);
    const s = await signUp(t.app);
    const { conversation } = (
      await s.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'scenario', level: 'A1', scenarioId: scenario.id } })
    ).json();
    // Paraphrase the keyword check might miss; the model's judgement wins.
    const { turn } = (
      await s.inject({ method: 'POST', url: `/api/v1/conversations/${conversation.id}/turns`, payload: { text: 'Doe mij maar zo’n bruin warm drankje.' } })
    ).json();
    expect(turn.task).toMatchObject({ beatId: scenario.beats[0]!.id, achieved: true, nextTask: scenario.beats[1]!.task });
    expect(String(fake.calls[0]!.messages.at(-1)!.content)).toContain(scenario.beats[1]!.npc.nl);
  });

  it('falls back to the offline partner on refusal or errors', async () => {
    const fake = fakeAnthropic((_, call) =>
      call === 1 ? { stop_reason: 'refusal', content: [] } : { error: new Error('connection reset') },
    );
    const t = await appWith(fake);
    const s = await signUp(t.app);
    const { conversation } = (await s.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'tutor', level: 'A1' } })).json();
    for (const text of ['Ik ben heet Amira.', 'Ik woon in Utrecht.']) {
      const res = await s.inject({ method: 'POST', url: `/api/v1/conversations/${conversation.id}/turns`, payload: { text } });
      expect(res.statusCode).toBe(200);
      expect(res.json().turn.source).toBe('offline');
    }
  });

  it('switches to the offline partner once the daily AI quota is used', async () => {
    const fake = fakeAnthropic(() => ({ json: aiTurn() }));
    const t = await appWith(fake, 1);
    const s = await signUp(t.app);
    const { conversation } = (await s.inject({ method: 'POST', url: '/api/v1/conversations', payload: { mode: 'tutor', level: 'A2' } })).json();
    const url = `/api/v1/conversations/${conversation.id}/turns`;
    const first = (await s.inject({ method: 'POST', url, payload: { text: 'Ik woon in Leiden.' } })).json();
    expect(first.turn.source).toBe('ai');
    const second = (await s.inject({ method: 'POST', url, payload: { text: 'Ik werk als verpleegkundige.' } })).json();
    expect(second.turn).toMatchObject({ source: 'offline', quotaExceeded: true });
    expect(fake.calls).toHaveLength(1);
  });

  it('evaluates sentences with the model and falls back on invalid output', async () => {
    const fake = fakeAnthropic((_, call) =>
      call === 1
        ? { json: { achieved: true, understood: true, corrections: [], natural: null, praise: 'Polite and clear!' } }
        : { content: [{ type: 'text', text: 'not json', citations: null }] },
    );
    const t = await appWith(fake);
    const s = await signUp(t.app);
    const payload = { text: 'Mag ik een koffie?', level: 'A1', task: { prompt: 'Order a coffee' } };
    const ai = (await s.inject({ method: 'POST', url: '/api/v1/evaluate/sentence', payload })).json();
    expect(ai).toMatchObject({ achieved: true, source: 'ai' });
    expect(ai.feedback.praise).toBe('Polite and clear!');
    const offline = (await s.inject({ method: 'POST', url: '/api/v1/evaluate/sentence', payload })).json();
    expect(offline.source).toBe('offline');
  });
});
