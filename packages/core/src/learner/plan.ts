/**
 * Daily plan generator: turns the learner model into a short, explained plan.
 * Principles: reviews first (retention), then the biggest communicative gap, then one
 * personal mistake pattern, then the next curriculum step — within the daily time budget.
 */

import { LEVEL_VALUE, type Goal, type Level, type Skill } from '../schemas/common.js';
import type { ScenarioCategory } from '../schemas/content.js';
import type { Profile } from '../schemas/profile.js';
import type { LearnerState } from '../schemas/state.js';
import { isDue } from '../srs/fsrs.js';
import { analyzePatterns } from './diary.js';
import { overallRating } from './skills.js';

export interface PlanCatalog {
  lessons: { id: string; level: Level; order: number; title: string; minutes: number }[];
  scenarios: { id: string; level: Level; title: string; category: ScenarioCategory; goals: Goal[]; canDoId?: string }[];
  listening: { id: string; level: Level; title: string }[];
  sounds: { id: string; title: string; priority: number }[];
}

export type PlanItemKind = 'review' | 'lesson' | 'scenario' | 'friend' | 'drill' | 'pronunciation' | 'listening';

export interface PlanItem {
  kind: PlanItemKind;
  refId: string | null;
  title: string;
  minutes: number;
  reason: string;
}

export interface DailyPlan {
  headline: string;
  rationale: string;
  focus: Skill | 'getting-started';
  items: PlanItem[];
  totalMinutes: number;
  dueReviews: number;
}

const GOAL_CATEGORIES: Record<Goal, ScenarioCategory[]> = {
  moving: ['living', 'daily'],
  work: ['work', 'social'],
  study: ['social', 'daily'],
  travel: ['daily'],
  partner: ['social', 'daily'],
  culture: ['social', 'daily'],
};

function totalEvidence(state: LearnerState): number {
  return Object.values(state.skills).reduce((sum, s) => sum + s.evidence, 0);
}

export function dueCardCount(state: LearnerState, now: Date): number {
  return Object.values(state.cards).filter((card) => isDue(card, now)).length;
}

function nextLesson(state: LearnerState, catalog: PlanCatalog, targetLevel: number) {
  const ordered = [...catalog.lessons].sort(
    (a, b) => LEVEL_VALUE[a.level] - LEVEL_VALUE[b.level] || a.order - b.order,
  );
  const open = ordered.filter((l) => state.lessons[l.id]?.status !== 'completed');
  const started = open.find((l) => state.lessons[l.id]?.status === 'started');
  return started ?? open.find((l) => LEVEL_VALUE[l.level] >= Math.floor(targetLevel)) ?? open[0];
}

function pickScenario(state: LearnerState, catalog: PlanCatalog, profile: Profile, speakingLevel: number) {
  const categories = new Set(
    (profile.goals.length ? profile.goals : (['moving'] as Goal[])).flatMap((g) => GOAL_CATEGORIES[g]),
  );
  const candidates = catalog.scenarios
    .filter((s) => LEVEL_VALUE[s.level] <= Math.floor(speakingLevel) + 1)
    .map((s) => ({
      scenario: s,
      score:
        (categories.has(s.category) ? 2 : 0) +
        (s.goals.some((g) => profile.goals.includes(g)) ? 1 : 0) +
        (s.canDoId && state.canDo[s.canDoId] ? -3 : 0) -
        Math.abs(LEVEL_VALUE[s.level] - speakingLevel) * 0.5,
    }))
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.scenario;
}

function weakestSound(state: LearnerState, catalog: PlanCatalog): { id: string; title: string } | undefined {
  const stats = Object.values(state.patterns)
    .filter((p) => p.category === 'pronunciation' && p.drillAttempts >= 3)
    .map((p) => ({ id: p.patternId.replace(/^pron-/, ''), accuracy: p.drillCorrect / p.drillAttempts }))
    .sort((a, b) => a.accuracy - b.accuracy);
  const weakest = stats.find((s) => s.accuracy < 0.8);
  const sound = weakest
    ? catalog.sounds.find((s) => s.id === weakest.id)
    : [...catalog.sounds].sort((a, b) => a.priority - b.priority)[0];
  return sound;
}

export function generatePlan(
  state: LearnerState,
  profile: Profile,
  catalog: PlanCatalog,
  now: Date = new Date(),
): DailyPlan {
  const budget = profile.dailyMinutes;
  const skills = state.skills;
  const evidence = totalEvidence(state);
  const overall = overallRating(skills);
  const due = dueCardCount(state, now);
  const topPattern = analyzePatterns(state, now).find((p) => p.status === 'needs-practice' && p.category !== 'pronunciation');

  // Decide the focus from the skill profile.
  const gapListenSpeak = skills.listening.rating - skills.speaking.rating;
  let focus: DailyPlan['focus'];
  let rationale: string;
  if (evidence < 6) {
    focus = 'getting-started';
    rationale =
      "Let's get you speaking from day one: a lesson built around a real situation, then a short conversation to use it.";
  } else if (gapListenSpeak >= 0.4 || skills.fluency.rating < skills.listening.rating - 0.5) {
    focus = 'speaking';
    rationale =
      "You understand Dutch well but hesitate while speaking. Today's plan leans on conversation, so the words you know become words you use.";
  } else if (-gapListenSpeak >= 0.4) {
    focus = 'listening';
    rationale =
      "You express yourself well, but natural-speed Dutch is harder to follow. Today adds listening practice at normal speed.";
  } else if (skills.pronunciation.rating < overall - 0.5) {
    focus = 'pronunciation';
    rationale = 'Some of your sounds make it harder for people to understand you. A short pronunciation session will help most.';
  } else if (topPattern && topPattern.recentErrors >= 3) {
    focus = 'grammar';
    rationale = `You communicate well; one pattern keeps tripping you up: ${topPattern.title.toLowerCase()}. Let's fix it with your own sentences.`;
  } else {
    focus = 'speaking';
    rationale = 'Your skills are balanced. Keep building: new situations, then use them in conversation.';
  }

  const candidates: (PlanItem & { priority: number })[] = [];

  if (due > 0) {
    candidates.push({
      kind: 'review',
      refId: null,
      title: `Review ${due} phrase${due === 1 ? '' : 's'}`,
      minutes: Math.max(2, Math.min(Math.ceil(due * 0.25), Math.ceil(budget * 0.4))),
      reason: 'These are about to slip from memory — reviewing now makes them stick for weeks.',
      priority: 0,
    });
  }

  const scenario = pickScenario(state, catalog, profile, skills.speaking.rating);
  if (scenario) {
    candidates.push({
      kind: 'scenario',
      refId: scenario.id,
      title: scenario.title,
      minutes: 6,
      reason:
        focus === 'speaking'
          ? 'Practise speaking in a real situation before you meet it in real life.'
          : 'A real-life task that matches your goals.',
      priority: focus === 'speaking' ? 1 : 4,
    });
  }

  if (focus === 'speaking' || focus === 'getting-started') {
    candidates.push({
      kind: 'friend',
      refId: null,
      title: 'Chat with your Dutch friend',
      minutes: 5,
      reason: 'Relaxed conversation builds speed and confidence — mistakes here cost nothing.',
      priority: focus === 'speaking' ? 3 : 5,
    });
  }

  if (topPattern) {
    candidates.push({
      kind: 'drill',
      refId: topPattern.patternId,
      title: `Fix: ${topPattern.title}`,
      minutes: 3,
      reason: `Your most frequent mistake lately (${topPattern.recentErrors} time${topPattern.recentErrors === 1 ? '' : 's'} in two weeks).`,
      priority: focus === 'grammar' ? 1 : 2,
    });
  }

  const lesson = nextLesson(state, catalog, Math.min(skills.vocabulary.rating, skills.grammar.rating, overall));
  if (lesson) {
    candidates.push({
      kind: 'lesson',
      refId: lesson.id,
      title: lesson.title,
      minutes: lesson.minutes,
      reason:
        state.lessons[lesson.id]?.status === 'started' ? 'Pick up where you left off.' : 'Your next step in the course.',
      priority: focus === 'getting-started' ? 1 : 3,
    });
  }

  if (focus === 'listening' || budget >= 20) {
    const target = skills.listening.rating;
    const item = [...catalog.listening].sort(
      (a, b) => Math.abs(LEVEL_VALUE[a.level] - target) - Math.abs(LEVEL_VALUE[b.level] - target),
    )[0];
    if (item) {
      candidates.push({
        kind: 'listening',
        refId: item.id,
        title: item.title,
        minutes: 5,
        reason: 'Real-speed listening, with the transcript afterwards.',
        priority: focus === 'listening' ? 1 : 5,
      });
    }
  }

  if (focus === 'pronunciation' || budget >= 30) {
    const sound = weakestSound(state, catalog);
    if (sound) {
      candidates.push({
        kind: 'pronunciation',
        refId: sound.id,
        title: sound.title,
        minutes: 4,
        reason: 'Hear the difference first, then say it — clearer sounds make you easier to understand.',
        priority: focus === 'pronunciation' ? 1 : 6,
      });
    }
  }

  candidates.sort((a, b) => a.priority - b.priority);
  const items: PlanItem[] = [];
  let total = 0;
  for (const { priority: _priority, ...item } of candidates) {
    if (items.length >= 2 && total + item.minutes > budget) continue;
    items.push(item);
    total += item.minutes;
    if (total >= budget) break;
  }

  const headline =
    focus === 'getting-started'
      ? 'Welcome — let’s start talking'
      : focus === 'speaking'
        ? 'Today: speak more'
        : focus === 'listening'
          ? 'Today: tune your ear'
          : focus === 'pronunciation'
            ? 'Today: be easier to understand'
            : 'Today: fix a recurring mistake';

  return { headline, rationale, focus, items, totalMinutes: total, dueReviews: due };
}
