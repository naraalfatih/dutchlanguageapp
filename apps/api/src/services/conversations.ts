import { and, asc, desc, eq, sql } from 'drizzle-orm';
import {
  turnEvents,
  type ConversationMode,
  type CreateConversationInput,
  type GlossaryItem,
  type LearningEvent,
  type Level,
  type Persona,
  type Scenario,
  type ScenarioEngineState,
  type TurnFeedback,
  type TurnInput,
  type TurnResponse,
} from '@praat/core';
import { getPersona, getScenario, personas } from '@praat/content';
import type { AiProvider, AiProviders } from '../ai/index.js';
import type { HistoryMessage, TurnContext } from '../ai/types.js';
import type { Db } from '../db/client.js';
import { conversationMessages, conversations } from '../db/schema.js';
import { badRequest, conflict, notFound } from '../errors.js';
import { aiRequestsToday, recordAiUsage } from './ai-usage.js';
import { getProfile } from './profile.js';
import { ingestEvents } from './progress.js';

export interface ConversationDeps {
  db: Db;
  ai: AiProviders;
  /** AI turns per user per day before falling back to the offline partner. */
  dailyTurnLimit: number;
}

/** Stored in conversations.engine_state. */
interface EngineState {
  turns: number;
  topic?: string | undefined;
  scenario?: ScenarioEngineState | undefined;
}

export interface ConversationSummary {
  id: string;
  mode: ConversationMode;
  level: Level;
  title: string;
  personaId: string | null;
  scenarioId: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  role: 'learner' | 'character';
  text: string;
  translation: string | null;
  feedback: TurnFeedback | null;
  glossary: GlossaryItem[];
  inputMode: 'text' | 'voice' | null;
  createdAt: string;
}

export interface TurnEnvelope {
  conversationId: string;
  turn: TurnResponse;
  /**
   * Learning events the server derived from this turn and already stored. Clients apply them
   * to their local learner state without queueing them for sync.
   */
  events: LearningEvent[];
}

type ConversationRow = typeof conversations.$inferSelect;
type MessageRow = typeof conversationMessages.$inferSelect;

const HISTORY_LOAD_LIMIT = 40;

function summary(row: ConversationRow): ConversationSummary {
  return {
    id: row.id,
    mode: row.mode as ConversationMode,
    level: row.level as Level,
    title: row.title,
    personaId: row.personaId,
    scenarioId: row.scenarioId,
    completed: row.completedAt !== null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function message(row: MessageRow): ConversationMessage {
  return {
    id: row.id,
    role: row.role === 'learner' ? 'learner' : 'character',
    text: row.text,
    translation: row.translation,
    feedback: (row.feedback as TurnFeedback | null) ?? null,
    glossary: (row.glossary as GlossaryItem[] | null) ?? [],
    inputMode: row.inputMode === 'voice' || row.inputMode === 'text' ? row.inputMode : null,
    createdAt: row.createdAt.toISOString(),
  };
}

function resolveSetup(input: CreateConversationInput, region: 'nl' | 'be') {
  if (input.mode === 'scenario') {
    const scenario = input.scenarioId ? getScenario(input.scenarioId) : undefined;
    if (!scenario) throw badRequest('Choose a scenario to practise.');
    return { scenario, persona: undefined, title: scenario.title };
  }
  if (input.mode === 'friend') {
    const persona = input.personaId
      ? getPersona(input.personaId)
      : personas.find((p) => p.kind === 'friend' && p.region === region);
    if (!persona || persona.kind !== 'friend') throw badRequest('Choose a friend to chat with.');
    return { scenario: undefined, persona, title: `Chat with ${persona.name}` };
  }
  const persona = input.personaId ? getPersona(input.personaId) : personas.find((p) => p.kind === 'tutor');
  if (input.personaId && persona?.kind !== 'tutor') throw badRequest('Unknown tutor.');
  return { scenario: undefined, persona, title: input.topic ? `Tutor: ${input.topic}` : 'Conversation with your tutor' };
}

interface LoadedContext {
  row: ConversationRow;
  engine: EngineState;
  scenario: Scenario | undefined;
  persona: Persona | undefined;
}

async function loadOwned(db: Db, userId: string, id: string): Promise<LoadedContext> {
  const [row] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  if (!row) throw notFound('Conversation not found.');
  const engine = { turns: 0, ...(row.engineState as Partial<EngineState>) };
  return {
    row,
    engine,
    scenario: row.scenarioId ? getScenario(row.scenarioId) : undefined,
    persona: row.personaId ? getPersona(row.personaId) : undefined,
  };
}

export async function createConversation(
  deps: ConversationDeps,
  userId: string,
  input: CreateConversationInput,
): Promise<{ conversation: ConversationSummary; turn: TurnResponse }> {
  const profile = await getProfile(deps.db, userId);
  const { scenario, persona, title } = resolveSetup(input, profile.region);
  const ctx: TurnContext = {
    mode: input.mode,
    level: input.level,
    region: profile.region,
    correctionStyle: profile.correctionStyle,
    persona,
    scenario,
    topic: input.topic,
    history: [],
    turnIndex: 0,
  };
  // Openings are authored content, so they never count against the AI quota.
  const opening = await deps.ai.primary.opening(ctx);
  const engine: EngineState = { turns: 0, topic: input.topic, scenario: opening.scenarioState };

  return deps.db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    const [row] = await t
      .insert(conversations)
      .values({
        userId,
        mode: input.mode,
        level: input.level,
        personaId: persona?.id ?? null,
        scenarioId: scenario?.id ?? null,
        title,
        engineState: engine,
      })
      .returning();
    await t.insert(conversationMessages).values({
      conversationId: row!.id,
      role: 'character',
      text: opening.response.reply.nl,
      translation: opening.response.reply.en,
      glossary: opening.response.glossary,
      source: opening.response.source,
    });
    return { conversation: summary(row!), turn: opening.response };
  });
}

export async function listConversations(db: Db, userId: string, limit = 20): Promise<ConversationSummary[]> {
  const rows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);
  return rows.map(summary);
}

export async function getConversation(db: Db, userId: string, id: string) {
  const { row } = await loadOwned(db, userId, id);
  const rows = await db
    .select()
    .from(conversationMessages)
    .where(eq(conversationMessages.conversationId, row.id))
    .orderBy(asc(conversationMessages.createdAt));
  return { conversation: summary(row), messages: rows.map(message) };
}

async function recentHistory(db: Db, conversationId: string): Promise<HistoryMessage[]> {
  const rows = await db
    .select({ role: conversationMessages.role, text: conversationMessages.text })
    .from(conversationMessages)
    .where(eq(conversationMessages.conversationId, conversationId))
    .orderBy(desc(conversationMessages.createdAt))
    .limit(HISTORY_LOAD_LIMIT);
  return rows.reverse().map((r) => ({ role: r.role === 'learner' ? 'learner' : 'character', text: r.text }));
}

export async function takeTurn(
  deps: ConversationDeps,
  userId: string,
  conversationId: string,
  input: TurnInput,
): Promise<TurnEnvelope> {
  const { db } = deps;
  const { row, engine, scenario, persona } = await loadOwned(db, userId, conversationId);
  if (row.completedAt) throw conflict('This conversation has finished. Start a new one to keep practising.');
  if (row.mode === 'scenario' && (!scenario || !engine.scenario)) throw conflict('This scenario is no longer available.');

  const profile = await getProfile(db, userId);
  const history = await recentHistory(db, row.id);
  const ctx: TurnContext = {
    mode: row.mode as ConversationMode,
    level: row.level as Level,
    region: profile.region,
    correctionStyle: profile.correctionStyle,
    persona,
    scenario,
    scenarioState: engine.scenario,
    topic: engine.topic,
    history,
    turnIndex: engine.turns,
  };

  let provider: AiProvider = deps.ai.primary;
  let quotaExceeded = false;
  if (provider.name !== 'offline' && (await aiRequestsToday(db, userId)) >= deps.dailyTurnLimit) {
    provider = deps.ai.offline;
    quotaExceeded = true;
  }

  const result = await provider.reply(ctx, input.text);
  const turn: TurnResponse = quotaExceeded ? { ...result.response, quotaExceeded: true } : result.response;
  const scenarioState = result.scenarioState ?? engine.scenario;
  const nextEngine: EngineState = { ...engine, turns: engine.turns + 1, scenario: scenarioState };
  const now = new Date();
  const finished = row.mode === 'scenario' && scenario !== undefined && scenarioState?.completed === true;
  const events = turnEvents(
    {
      mode: ctx.mode,
      level: ctx.level,
      text: input.text,
      inputMode: input.inputMode,
      latencyMs: input.latencyMs,
      corrections: turn.feedback?.corrections ?? [],
      completedScenario: finished ? { scenario, state: scenarioState } : undefined,
    },
    now,
  );

  // Tokens were spent even if the turn below loses a race, so record usage first.
  if (result.usage) await recordAiUsage(db, userId, result.usage, now);

  await db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    // Optimistic concurrency: a parallel turn on the same conversation must not double-advance it.
    const updated = await t
      .update(conversations)
      .set({ engineState: nextEngine, updatedAt: now, ...(finished ? { completedAt: now } : {}) })
      .where(and(eq(conversations.id, row.id), sql`coalesce((${conversations.engineState}->>'turns')::int, 0) = ${engine.turns}`))
      .returning({ id: conversations.id });
    if (!updated.length) throw conflict('Another reply is already being processed. Please try again.');

    await t.insert(conversationMessages).values([
      {
        conversationId: row.id,
        role: 'learner',
        text: input.text,
        feedback: turn.feedback,
        inputMode: input.inputMode,
        createdAt: now,
      },
      {
        conversationId: row.id,
        role: 'character',
        text: turn.reply.nl,
        translation: turn.reply.en,
        glossary: turn.glossary,
        source: turn.source,
        createdAt: new Date(now.getTime() + 1),
      },
    ]);
    await ingestEvents(t, userId, events);
  });

  return { conversationId: row.id, turn, events };
}
