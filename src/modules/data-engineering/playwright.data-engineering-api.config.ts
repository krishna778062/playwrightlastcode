import dotenv from 'dotenv';
import path from 'path';

// Load data-engineering env FIRST with override to prevent base config from using wrong values
const envName = process.env.TEST_ENV || 'qa';
dotenv.config({
  path: path.resolve(__dirname, `env/${envName}.env`),
  override: true,
});

import { defineConfig, devices } from '@playwright/test';

import baseConfig from './playwright.data-engineering.base.config';

import { PROJECT_ROOT } from '@/src/core/constants/paths';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

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
