import { defineConfig } from 'vitest/config';

// Unit tests only; the Playwright end-to-end specs in e2e/ run with `npm run e2e`.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
