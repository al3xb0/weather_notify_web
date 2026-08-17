import { defineConfig, devices } from '@playwright/test';

const PORT = 3001;

/**
 * Browser-level tests. The Vitest suites render components in jsdom, which
 * cannot show whether the app actually boots: routing, hydration, the session
 * bootstrap that runs before the first paint, and the redirect a guarded route
 * performs are all things only a real browser executes.
 *
 * The API is stubbed per test with `page.route` rather than run for real. The
 * backend proves its own behaviour against a live Postgres in its repository;
 * what is unproven — and what these cover — is that this app drives it
 * correctly and renders what comes back.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The production build, not `dev`: it is what ships, and a route that only
    // works under the dev server's looser bundling is exactly the failure worth
    // catching here.
    //
    // `next start` warns because the build targets `output: standalone` for the
    // Docker image. Serving the standalone bundle instead would mean copying
    // .next/static and public into it first, which is a shell command that does
    // not run on Windows — and `next start` serves the same build correctly.
    // CI builds in its own step, so rebuilding here would pay for it twice.
    command: process.env.CI
      ? 'npm run start'
      : 'npm run build && npm run start',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { NEXT_PUBLIC_API_URL: 'http://localhost:3000' },
  },
});
