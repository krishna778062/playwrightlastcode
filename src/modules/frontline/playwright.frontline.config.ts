import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';

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
        baseURL: process.env.FRONTEND_BASE_URL,
        headless: process.env.CI ? true : true,
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
