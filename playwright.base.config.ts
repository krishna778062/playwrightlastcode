import { defineConfig, devices } from '@playwright/test';
import { Environments } from '@/src/core/constants/environments';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { loadEnvVariables } from './src/core/utils/envLoader';
import { TEST_RESULTS_DIR } from './src/core/constants/paths';

//load all env variables from .env file
loadEnvVariables((process.env.TEST_ENV as Environments) || Environments.QA);

export default defineConfig({
  forbidOnly: !!process.env.CI,
  timeout: TIMEOUTS.VERY_LONG,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: `${TEST_RESULTS_DIR}/test-results.json` }],
  ],
});
