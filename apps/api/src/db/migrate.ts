import { loadConfig } from '../config.js';
import { connectDatabase } from './client.js';

/** Run pending migrations (used before starting a new release). */
const config = loadConfig();
const handle = await connectDatabase(config);
await handle.migrate();
await handle.close();
console.log(`Migrations applied (${handle.kind}).`);
