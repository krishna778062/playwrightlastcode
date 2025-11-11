import { defineConfig, devices } from '@playwright/test';
import { getRewardTenantConfigFromCache, initializeRewardConfig } from '@rewards/config/rewardConfig';
import baseConfig from '@rewards/playwright.base.config';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

const { deviceScaleFactor, ...desktopChromeNoScale } = devices['Desktop Chrome'];

initializeRewardConfig('primary');
export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'reward', 'tests', 'ui-tests'),
  testIgnore: '**/reward-settings/**',
  workers: process.env.CI ? 3 : 5,
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'Reward',
      use: {
        ...desktopChromeNoScale,
        headless: !!process.env.CI,
        viewport: { width: 1920, height: 1080 },
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
