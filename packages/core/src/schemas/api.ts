import { z } from 'zod';
import { LevelSchema, RegisterSchema } from './common.js';
import { IntentSchema } from './content.js';
import { ConversationModeSchema, InputModeSchema, LearningEventSchema } from './events.js';
import { ProfileSchema } from './profile.js';

export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(254));

export const PasswordSchema = z
  .string()
  .min(10, 'Use at least 10 characters.')
  .max(200, 'Use at most 200 characters.');

export const RegisterInputSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  displayName: z.string().trim().min(1).max(60),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const PublicUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  createdAt: z.string(),
});
export type PublicUser = z.infer<typeof PublicUserSchema>;

export const AuthResponseSchema = z.object({
  user: PublicUserSchema,
  accessToken: z.string(),
  expiresIn: z.number().int(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const MeResponseSchema = z.object({
  user: PublicUserSchema,
  profile: ProfileSchema,
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

export const SYNC_BATCH_LIMIT = 200;

export const SyncRequestSchema = z.object({
  deviceId: z.string().max(100).optional(),
  events: z.array(LearningEventSchema).min(1).max(SYNC_BATCH_LIMIT),
});
export type SyncRequest = z.infer<typeof SyncRequestSchema>;

export const CreateConversationInputSchema = z.object({
  mode: ConversationModeSchema,
  level: LevelSchema,
  personaId: z.string().max(100).optional(),
  scenarioId: z.string().max(100).optional(),
  topic: z.string().max(200).optional(),
});
export type CreateConversationInput = z.infer<typeof CreateConversationInputSchema>;

export const TurnInputSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  inputMode: InputModeSchema.default('text'),
  latencyMs: z.number().int().min(0).max(600_000).optional(),
});
export type TurnInput = z.infer<typeof TurnInputSchema>;

export const EvaluateSentenceInputSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  level: LevelSchema,
  task: z
    .object({
      prompt: z.string().max(500),
      mustInclude: z.array(IntentSchema).max(10).optional(),
      modelAnswers: z.array(z.string().max(500)).max(10).optional(),
      register: RegisterSchema.optional(),
    })
    .optional(),
});
export type EvaluateSentenceInput = z.infer<typeof EvaluateSentenceInputSchema>;

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
