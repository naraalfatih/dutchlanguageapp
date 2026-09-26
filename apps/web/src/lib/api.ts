import type {
  AuthResponse,
  ConversationMode,
  CreateConversationInput,
  DailyPlan,
  EvaluateSentenceInput,
  GlossaryItem,
  LearnerState,
  LearningEvent,
  Level,
  MeResponse,
  Profile,
  ProfileInput,
  TurnFeedback,
  TurnInput,
  TurnResponse,
} from '@praat/core';

const BASE = `${import.meta.env.VITE_API_BASE ?? ''}/api/v1`;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

/** Access tokens live only in memory; the refresh token is an httpOnly cookie. */
let accessToken: string | null = null;
let onSignedOut: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function hasAccessToken() {
  return accessToken !== null;
}
export function onSessionEnded(handler: () => void) {
  onSignedOut = handler;
}

let refreshing: Promise<AuthResponse | null> | null = null;

/** Single-flight refresh: concurrent 401s share one rotation (reuse would revoke the family). */
export function refreshSession(): Promise<AuthResponse | null> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'same-origin' });
      if (!res.ok) return null;
      const body = (await res.json()) as AuthResponse;
      accessToken = body.accessToken;
      return body;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

interface RequestOptions {
  auth?: boolean;
  signal?: AbortSignal;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
  retried = false,
): Promise<T> {
  const auth = options.auth ?? true;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (auth && accessToken) headers.authorization = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? null : JSON.stringify(body),
      credentials: 'same-origin',
      ...(options.signal ? { signal: options.signal } : {}),
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(0, 'network_error', 'No connection to the Praat server.');
  }

  if (res.status === 401 && auth && !retried) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(method, path, body, options, true);
    accessToken = null;
    onSignedOut?.();
  }
  if (!res.ok) {
    let payload: { error?: { code?: string; message?: string; details?: unknown } } = {};
    try {
      payload = await res.json();
    } catch {
      // Non-JSON error (proxy, offline page): fall through with a generic message.
    }
    throw new ApiError(
      res.status,
      payload.error?.code ?? 'http_error',
      payload.error?.message ?? `Request failed (${res.status}).`,
      payload.error?.details,
    );
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
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
  events: LearningEvent[];
}

export interface EvaluationResponse {
  achieved: boolean;
  feedback: TurnFeedback;
  score: number;
  source: 'ai' | 'offline';
  quotaExceeded?: boolean;
}

export interface Health {
  status: string;
  db: string;
  ai: 'anthropic' | 'offline';
  version: string;
  contentVersion: string;
}

export const api = {
  health: () => request<Health>('GET', '/health', undefined, { auth: false }),
  register: (input: { email: string; password: string; displayName: string }) =>
    request<AuthResponse>('POST', '/auth/register', input, { auth: false }),
  login: (input: { email: string; password: string }) => request<AuthResponse>('POST', '/auth/login', input, { auth: false }),
  logout: () => request<void>('POST', '/auth/logout', undefined, { auth: false }),
  me: () => request<MeResponse>('GET', '/me'),
  updateProfile: (input: ProfileInput) => request<{ profile: Profile }>('PATCH', '/me/profile', input),
  exportData: () => request<unknown>('GET', '/me/export'),
  deleteAccount: () => request<void>('DELETE', '/me'),
  pushEvents: (events: LearningEvent[], deviceId: string) =>
    request<{ accepted: number; duplicates: number; state: LearnerState }>('POST', '/sync/events', { deviceId, events }),
  state: () => request<LearnerState>('GET', '/progress/state'),
  plan: () => request<DailyPlan>('GET', '/progress/plan'),
  createConversation: (input: CreateConversationInput) =>
    request<{ conversation: ConversationSummary; opening: TurnResponse }>('POST', '/conversations', input),
  conversations: () => request<{ conversations: ConversationSummary[] }>('GET', '/conversations'),
  conversation: (id: string) =>
    request<{ conversation: ConversationSummary; messages: ConversationMessage[] }>('GET', `/conversations/${id}`),
  turn: (id: string, input: TurnInput, signal?: AbortSignal) =>
    request<TurnEnvelope>('POST', `/conversations/${id}/turns`, input, signal ? { signal } : {}),
  evaluate: (input: EvaluateSentenceInput) => request<EvaluationResponse>('POST', '/evaluate/sentence', input),
};
