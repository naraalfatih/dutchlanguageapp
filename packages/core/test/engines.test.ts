import { describe, expect, it } from 'vitest';
import type { Scenario } from '../src/schemas/content.js';
import { TurnResponseSchema } from '../src/schemas/conversation.js';
import {
  scenarioAchieved,
  scenarioTurn,
  startScenario,
} from '../src/conversation/scenario-engine.js';
import { friendOpening, friendTurn } from '../src/conversation/friend-engine.js';
import { tutorOpening, tutorTurn } from '../src/conversation/tutor-engine.js';
import { glossFor } from '../src/conversation/glossary.js';

const cafe: Scenario = {
  id: 'test.cafe',
  category: 'daily',
  title: 'Ordering coffee',
  level: 'A1',
  goal: 'Order a coffee and pay',
  register: 'neutral',
  setting: 'A café in Utrecht',
  character: { name: 'Joris', role: 'barista' },
  goals: ['travel'],
  beats: [
    {
      id: 'order',
      npc: { nl: 'Hoi! Wat mag het zijn?', en: 'Hi! What will it be?' },
      task: 'Order a coffee.',
      intents: [{ id: 'coffee', description: 'Ask for coffee', anyOf: [['koffie|cappuccino|latte']] }],
      modelAnswers: ['Een koffie, alsjeblieft.', 'Mag ik een cappuccino?'],
      hint: 'Mag ik een …',
      onSuccess: { nl: 'Komt eraan!', en: 'Coming up!' },
    },
    {
      id: 'size',
      npc: { nl: 'Groot of klein?', en: 'Large or small?' },
      task: 'Choose a size.',
      intents: [{ id: 'size', description: 'Choose a size', anyOf: [['groot|klein|grote|kleine']] }],
      modelAnswers: ['Klein, graag.'],
      hint: 'Klein, …',
    },
    {
      id: 'pay',
      npc: { nl: 'Dat is dan 3 euro. Pinnen?', en: "That's 3 euros. Card?" },
      task: 'Say you want to pay by card.',
      intents: [{ id: 'pay', description: 'Pay by card', anyOf: [['ja|pinnen|pin|kaart']] }],
      modelAnswers: ['Ja, pinnen graag.'],
      hint: 'Ja, …',
      onSuccess: { nl: 'Dank je wel, fijne dag!', en: 'Thank you, have a nice day!' },
    },
  ],
  debrief: 'In Dutch cafés people usually pay by card (pinnen).',
};

describe('scenario engine', () => {
  it('opens with the first beat and advances on success', () => {
    const { state, response } = startScenario(cafe);
    expect(response.reply.nl).toBe('Hoi! Wat mag het zijn?');
    const turn = scenarioTurn(cafe, state, 'Een koffie, alsjeblieft.', 'A1');
    expect(turn.response.task!.achieved).toBe(true);
    expect(turn.response.reply.nl).toBe('Komt eraan! Groot of klein?');
    expect(turn.state.beatIndex).toBe(1);
    expect(() => TurnResponseSchema.parse(turn.response)).not.toThrow();
  });

  it('asks for clarification, then moves on with a model answer', () => {
    const { state } = startScenario(cafe);
    const miss1 = scenarioTurn(cafe, state, 'Ik wil water.', 'A1');
    expect(miss1.response.task!.achieved).toBe(false);
    expect(miss1.state.beatIndex).toBe(0);
    expect(miss1.response.feedback!.natural!.nl).toContain('Mag ik een');
    const miss2 = scenarioTurn(cafe, miss1.state, 'Water.', 'A1');
    expect(miss2.state.beatIndex).toBe(1);
    expect(miss2.state.missed).toEqual(['order']);
    expect(miss2.response.feedback!.natural!.nl).toBe('Een koffie, alsjeblieft.');
  });

  it('completes with a debrief and reports achievement', () => {
    let { state } = startScenario(cafe);
    for (const text of ['Mag ik een koffie?', 'Klein graag', 'Ja, pinnen graag']) {
      state = scenarioTurn(cafe, state, text, 'A1').state;
    }
    expect(state.completed).toBe(true);
    expect(scenarioAchieved(cafe, state)).toBe(true);
    const after = scenarioTurn(cafe, state, 'Dank je!', 'A1');
    expect(after.response.debrief).toContain('pinnen');
  });

  it('includes mistake feedback while accepting the task', () => {
    const { state } = startScenario(cafe);
    const turn = scenarioTurn(cafe, state, 'Mag ik hebben een koffie?', 'A1');
    expect(turn.response.task!.achieved).toBe(true);
    expect(turn.response.feedback!.corrections[0]!.patternId).toBe('infinitive-end');
  });
});

describe('friend engine', () => {
  const sanne = { name: 'Sanne', city: 'Utrecht', selfIntro: { nl: 'Ik woon in Utrecht.', en: 'I live in Utrecht.' } };

  it('adapts language to the level', () => {
    expect(friendTurn(sanne, 'A1', 'Hoi!', 0).reply.nl).toContain('Hoe gaat het met je');
    expect(friendTurn(sanne, 'B2', 'Hoi!', 0).reply.nl).toContain('Hoe gaat-ie');
  });

  it('glosses colloquial words in its reply', () => {
    const response = friendTurn(sanne, 'B1', 'Ik ben zo moe vandaag', 1);
    expect(response.reply.nl).toContain('balen');
    expect(response.glossary.map((g) => g.term)).toContain('balen');
  });

  it('answers questions about itself', () => {
    expect(friendTurn(sanne, 'A2', 'Waar woon jij?', 2).reply.nl).toContain('Utrecht');
  });

  it('suggests natural alternatives for textbook Dutch', () => {
    const response = friendTurn(sanne, 'B1', 'Hoe gaat het met jou?', 0);
    expect(response.feedback!.natural!.nl).toBe('Hoe gaat-ie?');
  });

  it('notes formal u among friends', () => {
    const response = friendTurn(sanne, 'A2', 'Hoe gaat het met u?', 0);
    expect(response.feedback!.corrections[0]!.patternId).toBe('register-formal');
  });

  it('opens with a greeting', () => {
    expect(friendOpening(sanne, 'A1', {}).reply.nl).toContain('Sanne');
  });
});

describe('tutor engine', () => {
  it('opens and continues with level-appropriate questions', () => {
    expect(tutorOpening('A1').reply.nl).toContain('Hoe heet je?');
    const turn = tutorTurn('A1', 'Ik heet Sam.', 0);
    expect(turn.reply.nl).toContain('Waar kom je vandaan?');
    expect(turn.feedback!.corrections).toEqual([]);
  });

  it('corrects mistakes kindly', () => {
    const turn = tutorTurn('A1', 'Ik ben heet Sam.', 0);
    expect(turn.feedback!.corrections[0]!.patternId).toBe('heten');
    expect(turn.reply.nl).toContain('Ik begrijp je');
  });
});

describe('glossary', () => {
  it('finds colloquial terms including hyphenated ones', () => {
    expect(glossFor('Hé, hoe gaat-ie? Gezellig!').map((g) => g.term)).toEqual(expect.arrayContaining(['gezellig', 'hoe gaat-ie']));
  });
});
