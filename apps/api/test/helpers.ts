import type { BetaMessage, MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { FastifyInstance, InjectOptions, LightMyRequestResponse } from 'fastify';
import type { MessagesClient } from '../src/ai/anthropic.js';
import { loadConfig, type Config } from '../src/config.js';
import { connectDatabase, type DatabaseHandle } from '../src/db/client.js';
import { buildServer } from '../src/server.js';

export interface TestApp {
  app: FastifyInstance;
  database: DatabaseHandle;
  config: Config;
  close(): Promise<void>;
}

export async function createTestApp(
  overrides: Partial<Config> = {},
  anthropicClient?: MessagesClient,
): Promise<TestApp> {
  const base = loadConfig({ NODE_ENV: 'test' });
  const config: Config = { ...base, ...overrides, ai: { ...base.ai, ...overrides.ai } };
  const database = await connectDatabase({});
  await database.migrate();
  const app = await buildServer({ config, database, ...(anthropicClient ? { anthropicClient } : {}) });
  await app.ready();
  return {
    app,
    database,
    config,
    close: async () => {
      await app.close();
      await database.close();
    },
  };
}

let ipCounter = 1;
/** A distinct client IP per call site, so per-IP rate limits don't couple unrelated tests. */
export function freshIp(): string {
  ipCounter += 1;
  return `10.0.${Math.floor(ipCounter / 250)}.${ipCounter % 250}`;
}

export interface Session {
  userId: string;
  accessToken: string;
  refreshCookie: string;
  ip: string;
  inject(options: InjectOptions): Promise<LightMyRequestResponse>;
}

let userCounter = 0;
export async function signUp(app: FastifyInstance, email?: string): Promise<Session> {
  userCounter += 1;
  const ip = freshIp();
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    remoteAddress: ip,
    payload: { email: email ?? `learner${userCounter}@example.com`, password: 'correct horse battery', displayName: 'Amira' },
  });
  if (res.statusCode !== 201) throw new Error(`register failed: ${res.statusCode} ${res.body}`);
  const body = res.json();
  const cookie = res.cookies.find((c) => c.name === 'praat_rt');
  return {
    userId: body.user.id,
    accessToken: body.accessToken,
    refreshCookie: cookie!.value,
    ip,
    inject: (options) =>
      app.inject({
        remoteAddress: ip,
        ...options,
        headers: { authorization: `Bearer ${body.accessToken}`, ...options.headers },
      }),
  };
}

export interface FakeReply {
  content?: BetaMessage['content'];
  stop_reason?: BetaMessage['stop_reason'];
  json?: unknown;
  error?: Error;
}

/** A stand-in for `client.beta.messages` that records requests and returns scripted replies. */
export function fakeAnthropic(respond: (params: MessageCreateParamsNonStreaming, call: number) => FakeReply) {
  const calls: MessageCreateParamsNonStreaming[] = [];
  const client: MessagesClient = {
    beta: {
      messages: {
        async create(params) {
          calls.push(params);
          const reply = respond(params, calls.length);
          if (reply.error) throw reply.error;
          return {
            id: `msg_${calls.length}`,
            type: 'message',
            role: 'assistant',
            model: params.model,
            content: reply.content ?? [{ type: 'text', text: JSON.stringify(reply.json), citations: null }],
            stop_reason: reply.stop_reason ?? 'end_turn',
            stop_sequence: null,
            usage: {
              input_tokens: 120,
              output_tokens: 80,
              cache_creation_input_tokens: 0,
              cache_read_input_tokens: 3000,
            },
          } as unknown as BetaMessage;
        },
      },
    },
  };
  return { client, calls };
}

export function aiTurn(overrides: Record<string, unknown> = {}) {
  return {
    reply: { nl: 'Leuk! Waar woon je?', en: 'Nice! Where do you live?' },
    understood: true,
    corrections: [],
    natural: null,
    praise: 'Nice, clear sentence!',
    glossary: [],
    taskAchieved: null,
    ...overrides,
  };
}
