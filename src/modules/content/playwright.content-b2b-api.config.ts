import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT } from '@/src/core/constants/paths';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import baseConfig from '@/src/modules/content/config/baseConfig';
import { initializeContentConfig } from '@/src/modules/content/config/contentConfig';

// Initialize config for primary tenant at config load time
initializeContentConfig('primary');

export default defineConfig({
  ...baseConfig,
  timeout: TIMEOUTS.VERY_LONG,
  name: 'Content B2B API Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'content', 'tests', 'content-common', 'b2b'),
  testMatch: '**/*.spec.ts',
  use: {
    ...baseConfig.use,
    baseURL: process.env.API_BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 10_000,
  },
  projects: [
    {
      name: 'content-b2b-api',
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
