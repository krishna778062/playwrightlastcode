import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import baseConfig from '@/playwright.base.config';
import { PROJECT_ROOT } from '@/src/core/constants/paths';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export default defineConfig({
  ...baseConfig,
  timeout: TIMEOUTS.VERY_LONG,
  name: 'Global Search API Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'global-search', 'tests', 'api-tests'),
  testMatch: '**/*.spec.ts',
  use: {
    ...baseConfig.use,
    baseURL: process.env.API_BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 10_000,
  },
  projects: [
    {
      name: 'global-search-api',
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
