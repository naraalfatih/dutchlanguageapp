import { defineConfig, devices } from '@playwright/test';

const PORT = 8790;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

/**
 * End-to-end smoke tests: the API serves the built web app (single-container mode) with
 * an in-memory database and no AI key, so conversations use the offline partner.
 * Run `npm run build -w @praat/web` first.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    ...devices['Pixel 7'],
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx tsx ../api/src/index.ts',
    url: `http://127.0.0.1:${PORT}/api/v1/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      NODE_ENV: 'development',
      HOST: '127.0.0.1',
      PORT: String(PORT),
      LOG_LEVEL: 'warn',
      WEB_DIST_DIR: 'dist',
      CORS_ORIGINS: `http://127.0.0.1:${PORT}`,
      ANTHROPIC_API_KEY: '',
      MIGRATIONS_DIR: '../api/drizzle',
    },
  },
});
