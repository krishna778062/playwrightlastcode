import { defineConfig, devices } from '@playwright/test';
import { getRewardTenantConfigFromCache, initializeRewardConfig } from '@rewards/config/rewardConfig';
import baseConfig from '@rewards/playwright.base.config';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

initializeRewardConfig('rewardSettings');
const { deviceScaleFactor, ...desktopChromeNoScale } = devices['Desktop Chrome'];

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'reward', 'tests', 'ui-tests', 'reward-settings'),
  testIgnore: '**/api-tests/**',
  // keep workers consistent for CI/local as you previously had
  workers: process.env.CI ? 1 : 1,
  timeout: 120_000,
  projects: [
    {
      name: 'Reward Setting Cases',
      use: {
        ...desktopChromeNoScale,
        headless: !!process.env.CI,
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--start-maximized',
            '--window-size=1920,1080',
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
