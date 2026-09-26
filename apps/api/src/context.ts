import type { AiProviders } from './ai/index.js';
import type { Config } from './config.js';
import type { DatabaseHandle } from './db/client.js';

/** Everything a route needs, created once at startup and passed to each route module. */
export interface AppContext {
  config: Config;
  database: DatabaseHandle;
  ai: AiProviders;
}
