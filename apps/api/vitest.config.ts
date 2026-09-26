import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Each file boots Fastify with an in-memory PGlite database and hashes passwords with scrypt.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
