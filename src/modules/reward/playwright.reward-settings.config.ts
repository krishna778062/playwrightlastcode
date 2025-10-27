import { defineConfig, devices } from '@playwright/test';
import { getRewardTenantConfigFromCache, initializeRewardConfig } from '@rewards/config/rewardConfig';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

import baseConfig from '../../../playwright.base.config';

initializeRewardConfig('rewardSettings');
const { deviceScaleFactor, ...desktopChromeNoScale } = devices['Desktop Chrome'];

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'reward', 'tests', 'ui-tests', 'reward-settings'),
  testIgnore: '**/api-tests/**',
  workers: 1,
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'Reward Setting Cases',
      use: {
        ...desktopChromeNoScale,
        headless: !!process.env.CI,
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
        baseURL: getRewardTenantConfigFromCache().frontendBaseUrl,
      },
    },
  ],
});
