import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

import baseConfig from './config/baseConfig';
import { getContentTenantConfigFromCache, initializeContentConfig } from './config/contentConfig';

// Initialize config for primary tenant at config load time
initializeContentConfig('primary');

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'content', 'tests', 'content-common', 'ui'),
  testIgnore: '**/api-tests/**',
  workers: process.env.CI ? 2 : 4,
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'content-common-chromium',
      use: {
        headless: process.env.CI ? true : false,
        video: 'off',
        ...devices['Desktop Chrome'],
        baseURL: getContentTenantConfigFromCache().frontendBaseUrl,
        permissions: ['camera', 'microphone', 'notifications'],
        launchOptions: {
          args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--enable-notifications'],
        },
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
      },
    },
  ],
});
