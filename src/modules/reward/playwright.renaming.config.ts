import { defineConfig, devices } from '@playwright/test';
import baseConfig from '@recognition//playwright.base.config';
import { getRewardTenantConfigFromCache, initializeRewardConfig } from '@rewards/config/rewardConfig';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

initializeRewardConfig('renaming');
const { deviceScaleFactor, ...desktopChromeNoScale } = devices['Desktop Chrome'];

const isCI = !!process.env.CI;
const headless = isCI; // true in CI, false locally
const screenWidth_RS = process.env.SCREEN_WIDTH ? parseInt(process.env.SCREEN_WIDTH, 10) : 1920;
const screenHeight_RS = process.env.SCREEN_HEIGHT ? parseInt(process.env.SCREEN_HEIGHT, 10) : 1080;
const projectViewport = isCI ? { width: screenWidth_RS, height: screenHeight_RS } : null;

const commonLaunchArgs_RS = [
  '--start-maximized',
  `--window-size=${screenWidth_RS},${screenHeight_RS}`,
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
];

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'reward', 'tests', 'ui-test-renaming'),
  testIgnore: ['**/api-tests/**', '**/ui-setting-tests/**', '**/ui-tests/**'],
  workers: process.env.CI ? 3 : 5,
  projects: [
    {
      name: 'Recognition Renaming',
      expect: {
        timeout: 15 * 1000, // 15 seconds for ALL expect() assertions
      },
      use: {
        ...desktopChromeNoScale,
        headless,
        viewport: projectViewport,
        launchOptions: {
          args: commonLaunchArgs_RS,
        },
        baseURL: getRewardTenantConfigFromCache().frontendBaseUrl,
      },
    },
  ],
});
