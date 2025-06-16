import { defineConfig, devices } from '@playwright/test';
import { Environments } from '@/src/core/constants/environments';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { loadEnvVariables } from './src/core/utils/envLoader';
import { TEST_RESULTS_DIR } from './src/core/constants/paths';

//load all env variables from .env file
loadEnvVariables((process.env.TEST_ENV as Environments) || Environments.QA);

export default defineConfig({
  testDir: './src',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  timeout: TIMEOUTS.VERY_LONG,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html'], ['json', { outputFile: 'test-results/test-results.json' }]],
  outputDir: TEST_RESULTS_DIR,
  use: {
    trace: 'on-first-retry',
    baseURL: process.env.TEST_ENV === 'qa' ? 'https://qa-url' : 'https://uat-url',
    actionTimeout: TIMEOUTS.MEDIUM,
    navigationTimeout: TIMEOUTS.MEDIUM,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.CI ? true : false,
        permissions: ['camera', 'microphone'],
        launchOptions: {
          args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
        },
      },
      testMatch: ['**/feature1.spec.ts', '**/feature2.spec.ts'],
    },
  ],
});
