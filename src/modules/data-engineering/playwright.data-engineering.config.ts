import dotenv from 'dotenv';
import path from 'path';

// Load base env file for Snowflake credentials
const envName = process.env.TEST_ENV || 'qa';
dotenv.config({
  path: path.resolve(__dirname, `env/${envName}.env`),
  override: true,
});

// Initialize primary tenant config and set env vars
import { initializeDataEngineeringConfig, setEnvFromTenantConfig } from './config/dataEngineeringConfig';

initializeDataEngineeringConfig('primary');
setEnvFromTenantConfig();

import { defineConfig, devices } from '@playwright/test';

import baseConfig from '../../../playwright.base.config';

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
    baseURL: process.env.FRONTEND_BASE_URL,
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
