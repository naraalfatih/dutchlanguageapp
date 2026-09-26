import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema.js';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface DatabaseHandle {
  db: Db;
  kind: 'postgres' | 'pglite';
  migrate(): Promise<void>;
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

export function migrationsFolder(): string {
  const candidates = [
    process.env.MIGRATIONS_DIR,
    resolve(process.cwd(), 'drizzle'),
    resolve(process.cwd(), 'apps/api/drizzle'),
    fileURLToPath(new URL('../../drizzle', import.meta.url)),
    fileURLToPath(new URL('../drizzle', import.meta.url)),
  ].filter((p): p is string => !!p);
  const found = candidates.find((p) => existsSync(resolve(p, 'meta/_journal.json')));
  if (!found) throw new Error(`Could not find the migrations folder (tried: ${candidates.join(', ')})`);
  return found;
}

/**
 * Connect to PostgreSQL when a URL is given, otherwise to an embedded PGlite database
 * (in-memory, or persisted in `pgliteDir`). Both speak the same SQL dialect.
 */
export async function connectDatabase(options: {
  databaseUrl?: string | undefined;
  pgliteDir?: string | undefined;
}): Promise<DatabaseHandle> {
  if (options.databaseUrl) {
    const { default: postgres } = await import('postgres');
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
    const client = postgres(options.databaseUrl, { max: 10, onnotice: () => {} });
    const db = drizzle(client, { schema });
    return {
      db: db as unknown as Db,
      kind: 'postgres',
      migrate: () => migrate(db, { migrationsFolder: migrationsFolder() }),
      ping: async () => {
        await client`select 1`;
        return true;
      },
      close: () => client.end({ timeout: 5 }),
    };
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const client = options.pgliteDir ? new PGlite(options.pgliteDir) : new PGlite();
  const db = drizzle(client, { schema });
  return {
    db: db as unknown as Db,
    kind: 'pglite',
    migrate: () => migrate(db, { migrationsFolder: migrationsFolder() }),
    ping: async () => {
      await client.query('select 1');
      return true;
    },
    close: () => client.close(),
  };
}
