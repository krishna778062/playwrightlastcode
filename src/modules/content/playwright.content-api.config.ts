import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';

import { initializeContentConfig } from './config/contentConfig';

import { Environments } from '@/src/core/constants/environments';
import { Modules } from '@/src/core/constants/modules';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { loadEnvVariablesForGivenModule } from '@/src/core/utils/envLoader';

loadEnvVariablesForGivenModule(
  (process.env.TEST_ENV as Environments) || Environments.TEST,
  process.env.MODULE_NAME || Modules.CONTENT
);

// Initialize config for primary tenant at config load time
initializeContentConfig('primary');

export default defineConfig({
  ...baseConfig,
  timeout: TIMEOUTS.VERY_LONG,
  name: 'Content API Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'content', 'tests', 'api-tests'),
  testMatch: '**/*.spec.ts',
  use: {
    ...baseConfig.use,
    baseURL: process.env.API_BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 10_000,
  },
  projects: [
    {
      name: 'content-api',
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
