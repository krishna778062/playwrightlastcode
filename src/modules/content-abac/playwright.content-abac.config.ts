import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';

import { PROJECT_ROOT } from '@/src/core/constants/paths';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'content-abac', 'tests'),
  testIgnore: '**/api-tests/**',
  workers: process.env.CI ? 2 : 4,
  timeout: 180_000,
  expect: { timeout: 10_000 },
  projects: [
    {
      name: 'content-abac-chromium',
      use: {
        headless: !!process.env.CI,
        video: 'on-first-retry',
        ...devices['Desktop Chrome'],
        baseURL: getEnvConfig().frontendBaseUrl,
        launchOptions: { args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'] },
      },
    },
  ],
});
