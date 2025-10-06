import { defineConfig } from '@playwright/test';

import { Modules } from './src/core/constants/modules';
import { TEST_RESULTS_DIR } from './src/core/constants/paths';
import { loadEnvVariablesForGivenModule } from './src/core/utils/envLoader';

import { Environments } from '@/src/core/constants/environments';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

//load all env variables from .env file for given module
loadEnvVariablesForGivenModule(
  (process.env.TEST_ENV as Environments) || Environments.TEST,
  process.env.MODULE_NAME || Modules.ALERT_NOTIFICATION
);

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
