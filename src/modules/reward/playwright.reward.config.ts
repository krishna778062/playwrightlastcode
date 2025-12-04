import { defineConfig, devices } from '@playwright/test';
import { getRewardTenantConfigFromCache, initializeRewardConfig } from '@rewards/config/rewardConfig';
import baseConfig from '@rewards/playwright.base.config';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

const { deviceScaleFactor, ...desktopChromeNoScale } = devices['Desktop Chrome'];

initializeRewardConfig('primary');

export default defineConfig({
  // spread base config (top-level settings). Project 'use' will override nested use values.
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'reward', 'tests', 'ui-tests'),
  testIgnore: '**/reward-settings/**',
  workers: process.env.CI ? 3 : 5,
  timeout: 180_000,
  projects: [
    {
      name: 'Reward',
      use: {
        // base device settings (without deviceScaleFactor)
        ...desktopChromeNoScale,
        // explicit headless selection: true in CI, false locally
        headless: !!process.env.CI,
        // explicit viewport to guarantee consistent full-screen behavior
        viewport: { width: 1920, height: 1080 },
        // in case you also want the browser window to be the same size (important for headless)
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
