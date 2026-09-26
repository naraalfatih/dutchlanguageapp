import type { FastifyError, FastifyInstance } from 'fastify';
import { ZodError, type ZodType } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) => new AppError(400, 'bad_request', message, details);
export const unauthorized = (message = 'Authentication required.') => new AppError(401, 'unauthorized', message);
export const forbidden = (message = 'Not allowed.') => new AppError(403, 'forbidden', message);
export const notFound = (message = 'Not found.') => new AppError(404, 'not_found', message);
export const conflict = (message: string) => new AppError(409, 'conflict', message);

/** Validate unknown input with a zod schema; throws a 400 with field details. */
export function parse<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new AppError(400, 'validation_error', 'The request is invalid.', {
      issues: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
  }
  return result.data;
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | AppError | ZodError | Error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: { code: error.code, message: error.message, details: error.details } });
    }
    const fastifyError = error as FastifyError;
    if (fastifyError.statusCode === 429) {
      return reply.status(429).send({ error: { code: 'rate_limited', message: 'Too many requests. Please slow down.' } });
    }
    if (fastifyError.statusCode && fastifyError.statusCode < 500) {
      return reply
        .status(fastifyError.statusCode)
        .send({ error: { code: fastifyError.code ?? 'bad_request', message: fastifyError.message } });
    }
    request.log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({ error: { code: 'internal_error', message: 'Something went wrong on our side.' } });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ error: { code: 'not_found', message: `No route for ${request.method} ${request.url}` } });
  });
}
