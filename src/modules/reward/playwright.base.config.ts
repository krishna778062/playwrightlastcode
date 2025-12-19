import { defineConfig } from '@playwright/test';

import { TEST_RESULTS_DIR } from '@core/constants/paths';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 3 * 60 * 1000, // 3 minutes per test
  expect: {
    timeout: 15000, // 15 seconds for ALL expect() assertions
  },
  use: {
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'on',
    headless: !!process.env.CI,
    viewport: null,
    actionTimeout: 15 * 1000, // 15 seconds
    navigationTimeout: 30_000,
  },
  reporter: [
    ['html', { open: process.env.CI ? 'never' : 'on-failure' }],
    ['json', { outputFile: `${TEST_RESULTS_DIR}/test-results.json` }],
  ],
});
