import { defineConfig } from '@playwright/test';

import { TEST_RESULTS_DIR } from '@core/constants/paths';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 150000,
  use: {
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'on',
    headless: !!process.env.CI,
    viewport: null,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  reporter: [
    ['html', { open: process.env.CI ? 'never' : 'on-failure' }],
    ['json', { outputFile: `${TEST_RESULTS_DIR}/test-results.json` }],
  ],
});
