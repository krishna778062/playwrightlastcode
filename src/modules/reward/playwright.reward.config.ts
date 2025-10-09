import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import baseConfig from '../../../playwright.base.config';

const { deviceScaleFactor, ...desktopChromeNoScale } = devices['Desktop Chrome'];

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'reward', 'tests'),
  testIgnore: '**/api-tests/**',
  workers: process.env.CI ? 1 : 1,
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'Reward',
      use: {
        ...desktopChromeNoScale,
        headless: false,
        viewport: null,
        launchOptions: {
          args: [
            '--start-maximized',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
        baseURL: getEnvConfig().frontendBaseUrl,
      },
    },
  ],
});
