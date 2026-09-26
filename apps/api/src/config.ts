import { randomBytes } from 'node:crypto';
import { z } from 'zod';

const bool = z.enum(['true', 'false', '1', '0']).transform((v) => v === 'true' || v === '1');

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(8787),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  /** PostgreSQL connection string. When absent, an embedded PGlite database is used. */
  DATABASE_URL: z.string().optional(),
  /** Directory for the embedded PGlite database (dev). Absent → in-memory. */
  PGLITE_DIR: z.string().optional(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_SECURE: bool.optional(),
  TRUST_PROXY: bool.default(false),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),

  ANTHROPIC_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('claude-opus-5'),
  AI_EFFORT: z.enum(['low', 'medium', 'high']).default('low'),
  AI_MAX_TOKENS: z.coerce.number().int().positive().default(4000),
  /** Server-side refusal fallbacks (Claude API only; disable behind proxies that reject betas). */
  AI_FALLBACKS: bool.default(true),
  AI_DAILY_TURN_LIMIT: z.coerce.number().int().nonnegative().default(200),

  /** Serve the built web app from this directory (single-container deployments). */
  WEB_DIST_DIR: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export interface Config {
  env: Env['NODE_ENV'];
  host: string;
  port: number;
  logLevel: Env['LOG_LEVEL'];
  databaseUrl: string | undefined;
  pgliteDir: string | undefined;
  jwtSecret: string;
  accessTokenTtlSeconds: number;
  refreshTokenTtlDays: number;
  cookieSecure: boolean;
  trustProxy: boolean;
  corsOrigins: string[];
  ai: {
    apiKey: string | undefined;
    model: string;
    effort: Env['AI_EFFORT'];
    maxTokens: number;
    fallbacks: boolean;
    dailyTurnLimit: number;
  };
  webDistDir: string | undefined;
}

export function loadConfig(source: NodeJS.ProcessEnv = process.env, overrides: Partial<Config> = {}): Config {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid configuration: ${issues}`);
  }
  const env = parsed.data;
  if (env.NODE_ENV === 'production') {
    if (!env.JWT_SECRET) throw new Error('JWT_SECRET is required in production');
    if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required in production');
  }
  return {
    env: env.NODE_ENV,
    host: env.HOST,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    databaseUrl: env.DATABASE_URL,
    pgliteDir: env.PGLITE_DIR,
    // In development a random secret is fine: tokens simply expire on restart.
    jwtSecret: env.JWT_SECRET ?? randomBytes(48).toString('base64url'),
    accessTokenTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
    cookieSecure: env.COOKIE_SECURE ?? env.NODE_ENV === 'production',
    trustProxy: env.TRUST_PROXY,
    corsOrigins: env.CORS_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    ai: {
      apiKey: env.ANTHROPIC_API_KEY || undefined,
      model: env.AI_MODEL,
      effort: env.AI_EFFORT,
      maxTokens: env.AI_MAX_TOKENS,
      fallbacks: env.AI_FALLBACKS,
      dailyTurnLimit: env.AI_DAILY_TURN_LIMIT,
    },
    webDistDir: env.WEB_DIST_DIR,
    ...overrides,
  };
}
