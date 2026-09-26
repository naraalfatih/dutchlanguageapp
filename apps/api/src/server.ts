import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyInstance } from 'fastify';
import { createAiProviders, type AiProviders } from './ai/index.js';
import type { MessagesClient } from './ai/anthropic.js';
import { registerAuth } from './auth/plugin.js';
import type { Config } from './config.js';
import type { AppContext } from './context.js';
import type { DatabaseHandle } from './db/client.js';
import { notFoundBody, registerErrorHandler } from './errors.js';
import { authRoutes } from './routes/auth.js';
import { conversationRoutes } from './routes/conversations.js';
import { evaluateRoutes } from './routes/evaluate.js';
import { healthRoutes } from './routes/health.js';
import { meRoutes } from './routes/me.js';
import { progressRoutes } from './routes/progress.js';
import { speechRoutes } from './routes/speech.js';
import { syncRoutes } from './routes/sync.js';

export interface BuildOptions {
  config: Config;
  database: DatabaseHandle;
  /** Inject providers (tests) or an Anthropic-compatible client; defaults from config. */
  ai?: AiProviders;
  anthropicClient?: MessagesClient;
  logger?: boolean | object;
}

export async function buildServer(options: BuildOptions): Promise<FastifyInstance> {
  const { config, database } = options;
  const app = Fastify({
    logger:
      options.logger ??
      (config.env === 'test'
        ? false
        : {
            level: config.logLevel,
            redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
            ...(config.env === 'development' ? { transport: { target: 'pino-pretty' } } : {}),
          }),
    trustProxy: config.trustProxy,
    bodyLimit: 64 * 1024,
  });

  const ai = options.ai ?? createAiProviders(config.ai, app.log, options.anthropicClient);
  const ctx: AppContext = { config, database, ai };

  // With a bundled web app, unknown GETs fall back to the SPA shell (below).
  registerErrorHandler(app, { notFound: !config.webDistDir });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        mediaSrc: ["'self'", 'blob:'],
        connectSrc: ["'self'"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    // Microphone is needed for speaking practice; everything else is off.
    permittedCrossDomainPolicies: false,
  });
  app.addHook('onSend', async (_request, reply) => {
    reply.header('Permissions-Policy', 'microphone=(self), camera=(), geolocation=(), payment=()');
  });

  await app.register(cors, {
    origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  await app.register(cookie);
  await app.register(rateLimit, { global: true, max: 300, timeWindow: '1 minute' });

  const authenticate = registerAuth(app, config);

  await app.register(
    async (api) => {
      await healthRoutes(api, ctx);
      await authRoutes(api, ctx);
      await meRoutes(api, ctx, authenticate);
      await syncRoutes(api, ctx, authenticate);
      await progressRoutes(api, ctx, authenticate);
      await conversationRoutes(api, ctx, authenticate);
      await evaluateRoutes(api, ctx, authenticate);
      await speechRoutes(api, ctx, authenticate);
    },
    { prefix: '/api/v1' },
  );

  if (config.webDistDir) {
    const root = resolve(config.webDistDir);
    if (!existsSync(resolve(root, 'index.html'))) throw new Error(`WEB_DIST_DIR has no index.html: ${root}`);
    await app.register(fastifyStatic, {
      root,
      wildcard: false,
      setHeaders(reply, path) {
        // Hashed assets are immutable; the shell and service worker must revalidate.
        if (/\/assets\//.test(path)) reply.header('Cache-Control', 'public, max-age=31536000, immutable');
        else reply.header('Cache-Control', 'no-cache');
      },
    });
    // Single-page app: unknown non-API GETs serve the shell so client-side routes work.
    app.setNotFoundHandler((request, reply) => {
      if (request.method === 'GET' && !request.url.startsWith('/api/')) {
        return reply.header('Cache-Control', 'no-cache').sendFile('index.html');
      }
      return reply.status(404).send(notFoundBody(request.method, request.url));
    });
  }

  return app;
}
