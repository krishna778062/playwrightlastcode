import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import baseConfig from '../../../playwright.base.config';

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'form-designer', 'tests'),
  testIgnore: '**/api-tests/**',
  workers: process.env.CI ? 2 : 4,
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'form-designer-chromium',
      use: {
        headless: process.env.CI ? true : false,
        video: 'off',
        ...devices['Desktop Chrome'],
        permissions: ['camera', 'microphone'],
        baseURL: getEnvConfig().frontendBaseUrl,
        launchOptions: {
          args: [
            '--disable-gpu', // Disable GPU acceleration
            '--no-sandbox', // Disable sandbox
            '--disable-dev-shm-usage', // Disable /dev/shm usage
            '--use-fake-ui-for-media-stream', // Use fake UI for media stream
            '--use-fake-device-for-media-stream', // Use fake device for media stream
            //Bypass bot detection
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
          ],
        },
      },
    },
  ],
});
