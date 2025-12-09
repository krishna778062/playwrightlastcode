import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';

import { Environments } from '@/src/core/constants/environments';
import { Modules } from '@/src/core/constants/modules';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { loadEnvVariablesForGivenModule } from '@/src/core/utils/envLoader';

loadEnvVariablesForGivenModule(
  (process.env.TEST_ENV as Environments) || Environments.TEST,
  process.env.MODULE_NAME || Modules.DATA_ENGINEERING
);

export default defineConfig({
  ...baseConfig,
  timeout: TIMEOUTS.VERY_LONG,
  name: 'Data Engineering API Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'data-engineering', 'tests', 'api-tests'),
  testMatch: '**/*.spec.ts',
  use: {
    ...baseConfig.use,
    baseURL: process.env.API_BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 10_000,
  },
  projects: [
    {
      name: 'data-engineering-api',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: null,
      },
    },
  ],
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
});
