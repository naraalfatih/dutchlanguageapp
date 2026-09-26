/**
 * The learner-state reducer. Pure and deterministic: the device and the server apply the
 * same events with this function, so progress computed offline matches the server exactly.
 */

import { LEVEL_VALUE, type Level, type MistakeCategory, type Skill } from '../schemas/common.js';
import type { LearningEvent } from '../schemas/events.js';
import type { LearnerState, LessonProgress, PatternStats } from '../schemas/state.js';
import { newCard, reviewCard, type Rating } from '../srs/fsrs.js';
import { getPattern } from '../language/patterns.js';
import { dayKey, pruneDays } from './dates.js';
import { initialSkills, updateSkill, type Evidence } from './skills.js';

export const RECENT_MISTAKES_LIMIT = 200;
const DAY_HISTORY = 120;
const ACTIVE_DAYS_LIMIT = 400;

/** Words expected per turn for a "full" answer at each level (for speaking evidence). */
const EXPECTED_WORDS: Record<Level, number> = { A0: 3, A1: 5, A2: 7, B1: 10, B2: 13, C1: 16 };

export function initialLearnerState(level: Level = 'A0'): LearnerState {
  return {
    version: 1,
    lessons: {},
    cards: {},
    patterns: {},
    recentMistakes: [],
    skills: initialSkills(level),
    canDo: {},
    stats: {
      sentencesProduced: 0,
      wordsProduced: 0,
      speakingTurns: 0,
      voiceTurns: 0,
      reviewsDone: 0,
      listeningCompleted: 0,
      sentencesByDay: {},
      activeDays: [],
    },
    lastEventAt: null,
  };
}

/** Re-seed skills from a (new) self-reported level, only while there is no evidence yet. */
export function reseedSkills(state: LearnerState, level: Level): LearnerState {
  const fresh = initialSkills(level);
  const skills = { ...state.skills };
  for (const skill of Object.keys(fresh) as Skill[]) {
    if (skills[skill].evidence === 0) skills[skill] = fresh[skill];
  }
  return { ...state, skills };
}

function withEvidence(state: LearnerState, skill: Skill, evidence: Evidence): LearnerState {
  return { ...state, skills: { ...state.skills, [skill]: updateSkill(state.skills[skill], evidence) } };
}

function emptyPattern(patternId: string, category: MistakeCategory, at: string): PatternStats {
  return {
    patternId,
    category,
    occurrences: 0,
    drillAttempts: 0,
    drillCorrect: 0,
    errorsByDay: {},
    drillsByDay: {},
    firstSeenAt: at,
    lastSeenAt: at,
  };
}

function recordPatternError(state: LearnerState, patternId: string, category: MistakeCategory, at: string): LearnerState {
  const day = dayKey(at);
  const current = state.patterns[patternId] ?? emptyPattern(patternId, category, at);
  const errorsByDay = pruneDays({ ...current.errorsByDay, [day]: (current.errorsByDay[day] ?? 0) + 1 }, at, DAY_HISTORY);
  const next: PatternStats = {
    ...current,
    occurrences: current.occurrences + 1,
    errorsByDay,
    lastSeenAt: at > current.lastSeenAt ? at : current.lastSeenAt,
  };
  return { ...state, patterns: { ...state.patterns, [patternId]: next } };
}

function recordPatternDrill(
  state: LearnerState,
  patternId: string,
  category: MistakeCategory,
  correct: boolean,
  at: string,
): LearnerState {
  const day = dayKey(at);
  const current = state.patterns[patternId] ?? emptyPattern(patternId, category, at);
  const [attempts, right] = current.drillsByDay[day] ?? [0, 0];
  const drillsByDay = pruneDays(
    { ...current.drillsByDay, [day]: [attempts + 1, right + (correct ? 1 : 0)] as [number, number] },
    at,
    DAY_HISTORY,
  );
  const next: PatternStats = {
    ...current,
    drillAttempts: current.drillAttempts + 1,
    drillCorrect: current.drillCorrect + (correct ? 1 : 0),
    drillsByDay,
  };
  return { ...state, patterns: { ...state.patterns, [patternId]: next } };
}

function touch(state: LearnerState, at: string): LearnerState {
  const day = dayKey(at);
  const activeDays = state.stats.activeDays.includes(day)
    ? state.stats.activeDays
    : [...state.stats.activeDays, day].sort().slice(-ACTIVE_DAYS_LIMIT);
  const lastEventAt = !state.lastEventAt || at > state.lastEventAt ? at : state.lastEventAt;
  if (activeDays === state.stats.activeDays && lastEventAt === state.lastEventAt) return state;
  return { ...state, stats: { ...state.stats, activeDays }, lastEventAt };
}

function lessonEntry(state: LearnerState, lessonId: string, at: string): LessonProgress {
  return (
    state.lessons[lessonId] ?? {
      status: 'started',
      stepsCompleted: [],
      bestScore: null,
      startedAt: at,
      completedAt: null,
    }
  );
}

const REVIEW_SCORE: Record<Rating, number> = { 1: 0, 2: 0.5, 3: 0.85, 4: 1 };

export function applyEvent(input: LearnerState, event: LearningEvent): LearnerState {
  const at = event.occurredAt;
  let state = touch(input, at);

  switch (event.type) {
    case 'lesson.step_completed': {
      const entry = lessonEntry(state, event.payload.lessonId, at);
      if (entry.stepsCompleted.includes(event.payload.step)) return state;
      const next = { ...entry, stepsCompleted: [...entry.stepsCompleted, event.payload.step] };
      return { ...state, lessons: { ...state.lessons, [event.payload.lessonId]: next } };
    }

    case 'lesson.completed': {
      const { lessonId, level, score } = event.payload;
      const entry = lessonEntry(state, lessonId, at);
      const next: LessonProgress = {
        ...entry,
        status: 'completed',
        bestScore: Math.max(entry.bestScore ?? 0, score),
        completedAt: entry.completedAt ?? at,
      };
      state = { ...state, lessons: { ...state.lessons, [lessonId]: next } };
      const difficulty = LEVEL_VALUE[level];
      state = withEvidence(state, 'vocabulary', { difficulty, score, at });
      return withEvidence(state, 'grammar', { difficulty, score, at });
    }

    case 'card.added': {
      if (state.cards[event.payload.itemId]) return state;
      const card = newCard(event.payload.itemId, new Date(at), event.payload.source);
      return { ...state, cards: { ...state.cards, [card.itemId]: card } };
    }

    case 'card.reviewed': {
      const { itemId, rating, level } = event.payload;
      const existing = state.cards[itemId] ?? newCard(itemId, new Date(at), 'lesson');
      const card = reviewCard(existing, rating as Rating, new Date(at));
      state = {
        ...state,
        cards: { ...state.cards, [itemId]: card },
        stats: { ...state.stats, reviewsDone: state.stats.reviewsDone + 1 },
      };
      const difficulty = level ? LEVEL_VALUE[level] : state.skills.vocabulary.rating;
      return withEvidence(state, 'vocabulary', { difficulty, score: REVIEW_SCORE[rating as Rating], at });
    }

    case 'exercise.attempted': {
      const { skill, level, score, patternId } = event.payload;
      state = withEvidence(state, skill, { difficulty: LEVEL_VALUE[level], score, at });
      if (patternId && (state.patterns[patternId] || score < 0.8)) {
        const category = getPattern(patternId)?.category ?? 'grammar';
        state = recordPatternDrill(state, patternId, category, score >= 0.8, at);
      }
      return state;
    }

    case 'mistake.recorded': {
      const { patternId, category } = event.payload;
      state = recordPatternError(state, patternId, category, at);
      const entry = { id: event.id, ...event.payload, occurredAt: at };
      const recentMistakes = [entry, ...state.recentMistakes.filter((m) => m.id !== event.id)]
        .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
        .slice(0, RECENT_MISTAKES_LIMIT);
      return { ...state, recentMistakes };
    }

    case 'speech.attempted': {
      const { score, level, sounds } = event.payload;
      state = withEvidence(state, 'pronunciation', { difficulty: LEVEL_VALUE[level], score, at });
      for (const { sound, ok } of sounds) {
        const patternId = `pron-${sound}`;
        if (!ok) state = recordPatternError(state, patternId, 'pronunciation', at);
        if (!ok || state.patterns[patternId]) {
          state = recordPatternDrill(state, patternId, 'pronunciation', ok, at);
        }
      }
      return state;
    }

    case 'utterance.produced': {
      const { level, words, sentences, errors, inputMode, latencyMs, mode } = event.payload;
      const day = dayKey(at);
      state = {
        ...state,
        stats: {
          ...state.stats,
          sentencesProduced: state.stats.sentencesProduced + sentences,
          wordsProduced: state.stats.wordsProduced + words,
          speakingTurns: state.stats.speakingTurns + 1,
          voiceTurns: state.stats.voiceTurns + (inputMode === 'voice' ? 1 : 0),
          sentencesByDay: pruneDays(
            { ...state.stats.sentencesByDay, [day]: (state.stats.sentencesByDay[day] ?? 0) + sentences },
            at,
            DAY_HISTORY,
          ),
        },
      };
      if (words === 0) return state;
      const difficulty = LEVEL_VALUE[level];
      const lengthFactor = Math.min(1, words / EXPECTED_WORDS[level]);
      const accuracy = Math.max(0, 1 - errors / (Math.max(1, sentences) + 1));
      // Typing gives time to think: count it as slightly easier speaking evidence.
      const speakingDifficulty = inputMode === 'voice' ? difficulty : difficulty - 0.3;
      state = withEvidence(state, 'speaking', {
        difficulty: speakingDifficulty,
        score: 0.5 * lengthFactor + 0.5 * accuracy,
        at,
      });
      if (mode !== 'lesson') state = withEvidence(state, 'grammar', { difficulty, score: accuracy, at });
      if (inputMode === 'voice') {
        const speed =
          latencyMs === undefined ? 0.7 : latencyMs < 2500 ? 1 : latencyMs < 5000 ? 0.75 : latencyMs < 9000 ? 0.45 : 0.2;
        state = withEvidence(state, 'fluency', { difficulty, score: 0.6 * speed + 0.4 * lengthFactor, at });
      }
      return state;
    }

    case 'scenario.completed': {
      const { scenarioId, level, achieved, score, canDoId } = event.payload;
      state = withEvidence(state, 'speaking', { difficulty: LEVEL_VALUE[level], score, at });
      if (achieved && canDoId && !state.canDo[canDoId]) {
        state = {
          ...state,
          canDo: { ...state.canDo, [canDoId]: { demonstratedAt: at, evidence: `scenario:${scenarioId}` } },
        };
      }
      return state;
    }

    case 'listening.completed': {
      const { level, speed, score } = event.payload;
      state = {
        ...state,
        stats: { ...state.stats, listeningCompleted: state.stats.listeningCompleted + 1 },
      };
      const difficulty = LEVEL_VALUE[level] - (speed === 'slow' ? 0.5 : 0);
      return withEvidence(state, 'listening', { difficulty, score, at });
    }
  }
}

export function applyEvents(state: LearnerState, events: LearningEvent[]): LearnerState {
  return events.reduce(applyEvent, state);
}
