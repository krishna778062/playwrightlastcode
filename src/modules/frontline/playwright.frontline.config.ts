import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';

import { getFrontlineTenantConfigFor, initializeFrontlineConfig } from './config/frontlineConfig';

// Initialize frontline config with default 'primary' tenant
// This will be loaded at config evaluation time
initializeFrontlineConfig('primary');

// Get config from cache for baseURL
const config = getFrontlineTenantConfigFor('primary');

export default defineConfig({
  ...baseConfig,
  name: 'Frontline UI Automation',
  timeout: 200_000,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'frontline', 'tests'),
  testIgnore: '**/api-tests/**',
  projects: [
    {
      name: 'frontline-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: config.frontendBaseUrl,
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
