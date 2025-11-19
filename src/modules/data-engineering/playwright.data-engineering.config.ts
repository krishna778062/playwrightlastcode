import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';

import { TIMEOUTS } from '@/src/core/constants/timeouts';

export default defineConfig({
  ...baseConfig,
  timeout: TIMEOUTS.VERY_VERY_LONG,
  name: 'Data Engineering UI Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'data-engineering', 'tests'),
  testIgnore: '**/api-tests/**',
  use: {
    ...baseConfig.use,
    baseURL: process.env.FRONTEND_BASE_URL,
    actionTimeout: 15_000, // 15 seconds auto-wait for actions
    navigationTimeout: 15_000, // 15 seconds auto-wait for navigation
  },
  projects: [
    {
      name: 'data-engineering-chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.CI ? true : false,
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
