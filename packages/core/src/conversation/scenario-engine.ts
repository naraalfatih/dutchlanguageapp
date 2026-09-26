/**
 * Offline Life Simulator engine: walks through a scenario's beats, evaluates each learner
 * turn against the beat's intents, and gives feedback. The AI provider improvises around the
 * same beats; this engine is the deterministic fallback (offline, guests, tests).
 */

import type { Level } from '../schemas/common.js';
import type { Scenario } from '../schemas/content.js';
import type { TurnResponse } from '../schemas/conversation.js';
import { evaluateFreeResponse, type FreeResponseResult } from '../language/evaluate.js';

export interface ScenarioEngineState {
  beatIndex: number;
  attempts: number;
  achieved: string[];
  missed: string[];
  completed: boolean;
}

export const MAX_ATTEMPTS_PER_BEAT = 2;

export function initialScenarioState(): ScenarioEngineState {
  return { beatIndex: 0, attempts: 0, achieved: [], missed: [], completed: false };
}

function progress(scenario: Scenario, state: ScenarioEngineState): number {
  return Math.min(1, (state.achieved.length + state.missed.length) / scenario.beats.length);
}

export function scenarioScore(scenario: Scenario, state: ScenarioEngineState): number {
  return scenario.beats.length ? state.achieved.length / scenario.beats.length : 0;
}

/** A scenario counts as achieved when most beats were achieved (the task got done). */
export function scenarioAchieved(scenario: Scenario, state: ScenarioEngineState): boolean {
  return state.completed && scenarioScore(scenario, state) >= 0.6;
}

export function startScenario(scenario: Scenario): { state: ScenarioEngineState; response: TurnResponse } {
  const state = initialScenarioState();
  const beat = scenario.beats[0]!;
  return {
    state,
    response: {
      reply: beat.npc,
      feedback: null,
      glossary: [],
      task: { beatId: beat.id, achieved: false, completed: false, progress: 0, nextTask: beat.task },
      source: 'offline',
      debrief: null,
    },
  };
}

function clarification(scenario: Scenario) {
  return scenario.register === 'formal'
    ? { nl: 'Sorry, ik begrijp u niet helemaal. Wat bedoelt u precies?', en: "Sorry, I don't quite understand. What exactly do you mean?" }
    : { nl: 'Sorry, hoe bedoel je?', en: 'Sorry, what do you mean?' };
}

/**
 * State transition after a learner turn. `moveOn` is true when the beat was achieved or the
 * learner used their last attempt. Shared by the offline engine and the AI provider so both
 * advance scenarios identically.
 */
export function nextScenarioState(
  scenario: Scenario,
  current: ScenarioEngineState,
  achieved: boolean,
  moveOn: boolean,
): ScenarioEngineState {
  if (!moveOn) return { ...current, attempts: current.attempts + 1 };
  const beat = scenario.beats[current.beatIndex]!;
  const nextIndex = current.beatIndex + 1;
  const done = nextIndex >= scenario.beats.length;
  return {
    beatIndex: done ? current.beatIndex : nextIndex,
    attempts: 0,
    achieved: achieved ? [...current.achieved, beat.id] : current.achieved,
    missed: achieved ? current.missed : [...current.missed, beat.id],
    completed: done,
  };
}

export function scenarioProgress(scenario: Scenario, state: ScenarioEngineState): number {
  return progress(scenario, state);
}

export interface ScenarioTurnResult {
  state: ScenarioEngineState;
  response: TurnResponse;
  evaluation: FreeResponseResult;
}

export function scenarioTurn(
  scenario: Scenario,
  current: ScenarioEngineState,
  text: string,
  _level: Level,
): ScenarioTurnResult {
  if (current.completed) {
    const evaluation = evaluateFreeResponse(text, { register: scenario.register });
    return {
      state: current,
      evaluation,
      response: {
        reply: { nl: 'Fijne dag nog!', en: 'Have a nice day!' },
        feedback: evaluation.feedback,
        glossary: [],
        task: { beatId: null, achieved: true, completed: true, progress: 1, nextTask: null },
        source: 'offline',
        debrief: scenario.debrief,
      },
    };
  }

  const beat = scenario.beats[current.beatIndex]!;
  const evaluation = evaluateFreeResponse(text, {
    intents: beat.intents,
    register: scenario.register,
    modelAnswers: beat.modelAnswers,
  });

  const moveOn = evaluation.achieved || current.attempts + 1 >= MAX_ATTEMPTS_PER_BEAT;
  if (!moveOn) {
    const state = nextScenarioState(scenario, current, false, false);
    const missing = evaluation.missing.map((i) => i.description.toLowerCase()).join(', ');
    return {
      state,
      evaluation,
      response: {
        reply: beat.onMiss ?? clarification(scenario),
        feedback: {
          ...evaluation.feedback,
          natural: { nl: `${beat.hint} …`, en: 'You could start like this.', note: missing ? `Still needed: ${missing}.` : null },
        },
        glossary: [],
        task: { beatId: beat.id, achieved: false, completed: false, progress: progress(scenario, state), nextTask: beat.task },
        source: 'offline',
        debrief: null,
      },
    };
  }

  const achieved = evaluation.achieved;
  const state = nextScenarioState(scenario, current, achieved, true);
  const done = state.completed;
  const next = done ? undefined : scenario.beats[state.beatIndex]!;
  const lead = achieved ? beat.onSuccess : { nl: 'Geen probleem.', en: 'No problem.' };
  const reply = {
    nl: [lead?.nl, next?.npc.nl].filter(Boolean).join(' ') || 'Dank u wel!',
    en: [lead?.en, next?.npc.en].filter(Boolean).join(' ') || 'Thank you!',
  };
  const feedback = achieved
    ? evaluation.feedback
    : {
        ...evaluation.feedback,
        natural: { nl: beat.modelAnswers[0]!, en: 'Here is one way to say it.', note: beat.culturalNote ?? null },
      };

  return {
    state,
    evaluation,
    response: {
      reply,
      feedback,
      glossary: [],
      task: {
        beatId: beat.id,
        achieved,
        completed: done,
        progress: progress(scenario, state),
        nextTask: next?.task ?? null,
      },
      source: 'offline',
      debrief: done ? scenario.debrief : null,
    },
  };
}
