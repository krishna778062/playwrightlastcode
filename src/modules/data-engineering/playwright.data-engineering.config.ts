import path from 'path';

// Initialize tenant config
import { getDataEngineeringConfigFromCache, initializeDataEngineeringConfig } from './config/dataEngineeringConfig';

initializeDataEngineeringConfig('primary');

const tenantConfig = getDataEngineeringConfigFromCache();

import { defineConfig, devices } from '@playwright/test';

import baseConfig from './playwright.data-engineering.base.config';

import { PROJECT_ROOT } from '@/src/core/constants/paths';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export default defineConfig({
  ...baseConfig,
  timeout: TIMEOUTS.VERY_VERY_LONG,
  name: 'Data Engineering UI Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'data-engineering', 'tests'),
  testIgnore: '**/api-tests/**',
  use: {
    ...baseConfig.use,
    baseURL: tenantConfig.frontendBaseUrl,
    actionTimeout: 15_000,
    navigationTimeout: 15_000,
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
