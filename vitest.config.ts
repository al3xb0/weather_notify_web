import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Vitest's default glob would collect the Playwright specs too, and they
    // fail in confusing ways under jsdom — they need a browser, not a DOM
    // shim. `npm run test:e2e` is what runs those.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // Every source file, not only the ones some test happened to import. The
      // number worth knowing here is how much of the app has no test at all,
      // and a report built from the imported files alone always looks good.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        // Generated from the API's openapi.json, and types only: `gen:api:check`
        // is what keeps it honest, coverage says nothing about it.
        'src/lib/api-types.ts',
      ],
      reporter: ['text', 'json-summary'],
      // Deliberately no thresholds. This reports; it does not gate. A number
      // that fails the build turns every refactor into a coverage errand, and
      // what the report is for is deciding where a test is worth writing.
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
