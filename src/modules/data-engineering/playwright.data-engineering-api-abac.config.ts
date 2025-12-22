import path from 'path';

// Initialize ABAC tenant config
import { getDataEngineeringConfigFromCache, initializeDataEngineeringConfig } from './config/dataEngineeringConfig';

initializeDataEngineeringConfig('abac');

const tenantConfig = getDataEngineeringConfigFromCache();

import { defineConfig, devices } from '@playwright/test';

import baseConfig from './playwright.data-engineering.base.config';

import { PROJECT_ROOT } from '@/src/core/constants/paths';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export default defineConfig({
  ...baseConfig,
  timeout: TIMEOUTS.VERY_LONG,
  name: 'Data Engineering API ABAC Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'data-engineering', 'tests', 'api-tests'),
  testMatch: '**/*-abac.spec.ts',
  use: {
    ...baseConfig.use,
    baseURL: tenantConfig.apiBaseUrl,
    actionTimeout: 10_000,
    navigationTimeout: 10_000,
  },
  projects: [
    {
      name: 'data-engineering-api-abac',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: null,
      },
    },
  ],
  retries: process.env.CI ? 0 : 0,
  workers: process.env.CI ? 4 : undefined,
});
