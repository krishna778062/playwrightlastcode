import { defineConfig, devices } from '@playwright/test';
import { getRewardTenantConfigFromCache, initializeRewardConfig } from '@rewards/config/rewardConfig';
import baseConfig from '@rewards/playwright.base.config';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

initializeRewardConfig('primary');

const { deviceScaleFactor, ...desktopChromeNoScale } = devices['Desktop Chrome'];

const isCI = !!process.env.CI;
const headless = isCI; // true in CI, false locally
const screenWidth = process.env.SCREEN_WIDTH ? parseInt(process.env.SCREEN_WIDTH, 10) : 1920;
const screenHeight = process.env.SCREEN_HEIGHT ? parseInt(process.env.SCREEN_HEIGHT, 10) : 1080;
const projectViewport = isCI ? { width: screenWidth, height: screenHeight } : null;

const commonLaunchArgs = [
  '--start-maximized',
  `--window-size=${screenWidth},${screenHeight}`,
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
];

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'reward', 'tests', 'ui-tests'),
  testIgnore: '**/reward-settings/**',
  workers: process.env.CI ? 3 : 5,
  projects: [
    {
      name: 'Reward',
      use: {
        ...desktopChromeNoScale,
        headless,
        viewport: projectViewport,
        launchOptions: {
          args: commonLaunchArgs,
        },
        baseURL: getRewardTenantConfigFromCache().frontendBaseUrl,
      },
    },
  ],
});
