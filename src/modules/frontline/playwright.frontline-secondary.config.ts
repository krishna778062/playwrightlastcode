import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';

import { getFrontlineTenantConfigFromCache, initializeFrontlineConfig } from './config/frontlineConfig';

// Initialize config for secondary tenant at config load time
initializeFrontlineConfig('secondary');

export default defineConfig({
  ...baseConfig,
  name: 'Frontline Secondary UI Automation',
  timeout: 200_000,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'frontline', 'tests'),
  testMatch: ['**/login-with-otp.spec.ts'], // Only OTP tests
  projects: [
    {
      name: 'frontline-secondary',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: getFrontlineTenantConfigFromCache().frontendBaseUrl,
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
