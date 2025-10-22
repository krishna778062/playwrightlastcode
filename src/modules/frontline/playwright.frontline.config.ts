import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';

import { getFrontlineTenantConfigFor, initializeFrontlineConfig } from './config/frontlineConfig';

export default defineConfig({
  ...baseConfig,
  name: 'Frontline UI Automation',
  timeout: 200_000,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'frontline', 'tests'),
  testIgnore: '**/api-tests/**',
  projects: [
    {
      name: 'frontline-primary',
      testMatch: /^(?!.*login-with-otp).*\.spec\.ts$/, // All tests EXCEPT login-with-otp
      use: {
        ...devices['Desktop Chrome'],
        baseURL: (() => {
          // Initialize config fresh for each worker to avoid cache issues
          initializeFrontlineConfig('primary');
          const config = getFrontlineTenantConfigFor('primary');
          return config.frontendBaseUrl;
        })(),
        headless: process.env.CI ? true : false,
        permissions: ['camera', 'microphone', 'clipboard-read', 'clipboard-write'],
        launchOptions: {
          args: [
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
    },
    {
      name: 'frontline-secondary',
      testMatch: /login-with-otp\.spec\.ts$/, // Only login-with-otp tests
      use: {
        ...devices['Desktop Chrome'],
        baseURL: (() => {
          // Initialize config fresh for each worker to avoid cache issues
          initializeFrontlineConfig('secondary');
          const config = getFrontlineTenantConfigFor('secondary');
          return config.frontendBaseUrl;
        })(),
        headless: process.env.CI ? true : false,
        permissions: ['camera', 'microphone', 'clipboard-read', 'clipboard-write'],
        launchOptions: {
          args: [
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
    },
  ],
});
