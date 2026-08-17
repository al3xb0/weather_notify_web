import { defineConfig, devices } from '@playwright/test';

const PORT = 3001;

/**
 * Separate from `playwright.config.ts` on purpose: this captures the README
 * images and is run by hand (`npm run screenshots`), not in CI. Keeping it out
 * of the test project means a change to the UI copy cannot fail the build
 * merely because a screenshot is now stale.
 */
export default defineConfig({
  testDir: './screenshots',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Tall enough for the content, short enough that a README image is not
    // mostly empty background.
    viewport: { width: 1440, height: 820 },
    // The UI is pinned to dark and rendered at 2x so the images stay sharp on
    // a HiDPI display, which is where a README is usually read.
    colorScheme: 'dark',
    deviceScaleFactor: 2,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run start',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
    env: { NEXT_PUBLIC_API_URL: 'http://localhost:3000' },
  },
});
