import { defineConfig } from '@playwright/test';

import { TEST_RESULTS_DIR } from '@core/constants/paths';
import { TIMEOUTS } from '@core/constants/timeouts';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  timeout: TIMEOUTS.VERY_LONG,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'on',
    headless: process.env.CI ? true : true,
  },
  reporter: [
    ['html', { open: process.env.CI ? 'never' : 'on-failure' }],
    ['json', { outputFile: `${TEST_RESULTS_DIR}/test-results.json` }],
  ],
});
