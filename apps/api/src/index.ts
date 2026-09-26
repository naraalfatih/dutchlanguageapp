import { loadConfig } from './config.js';
import { connectDatabase } from './db/client.js';
import { buildServer } from './server.js';

const config = loadConfig();
const database = await connectDatabase({ databaseUrl: config.databaseUrl, pgliteDir: config.pgliteDir });
// Embedded databases are migrated on start; PostgreSQL is migrated by `npm run db:migrate`
// (or MIGRATE_ON_START=true for single-container deployments).
if (database.kind === 'pglite' || process.env.MIGRATE_ON_START === 'true') await database.migrate();

const app = await buildServer({ config, database });
app.log.info({ db: database.kind, ai: config.ai.apiKey ? `anthropic (${config.ai.model})` : 'offline' }, 'Starting Praat API');

const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'Shutting down');
  try {
    await app.close();
    await database.close();
  } finally {
    process.exit(0);
  }
};
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

await app.listen({ host: config.host, port: config.port });
