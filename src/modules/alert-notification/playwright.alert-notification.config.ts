import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import baseConfig from '@/playwright.base.config';

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'alert-notification', 'tests'),
  testIgnore: '**/api-tests/**',
  timeout: 90000,
  globalTimeout: 900000,
  workers: process.env.CI ? 2 : 1,
  retries: 0,
  expect: {
    timeout: 10_000,
  },
  use: {
    ...baseConfig.use,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [['html', { open: 'never' }]],
  projects: [
    {
      name: 'alert-notification-chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.CI ? true : false,
        baseURL: getEnvConfig().frontendBaseUrl,
        launchOptions: {
          args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
  ],
});
