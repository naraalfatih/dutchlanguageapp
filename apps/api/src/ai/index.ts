import Anthropic from '@anthropic-ai/sdk';
import type { Config } from '../config.js';
import { AnthropicProvider, type Log, type MessagesClient } from './anthropic.js';
import { OfflineProvider } from './offline.js';
import type { AiProvider } from './types.js';

export interface AiProviders {
  /** Claude when an API key is configured, otherwise the offline engine. */
  primary: AiProvider;
  /** Always available: guests, quota exhausted, and fallback on errors. */
  offline: OfflineProvider;
}

export function createAiProviders(config: Config['ai'], log?: Log, client?: MessagesClient): AiProviders {
  const offline = new OfflineProvider();
  if (!client && !config.apiKey) return { primary: offline, offline };
  const messages = client ?? new Anthropic({ apiKey: config.apiKey, maxRetries: 1, timeout: 45_000 });
  const primary = new AnthropicProvider(
    messages,
    { model: config.model, effort: config.effort, maxTokens: config.maxTokens, fallbacks: config.fallbacks },
    offline,
    log,
  );
  return { primary, offline };
}

export type { AiProvider, EvaluationRequest, EvaluationResult, TurnContext, TurnResult } from './types.js';
