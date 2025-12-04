import { defineConfig, devices } from '@playwright/test';
import { getRewardTenantConfigFromCache, initializeRewardConfig } from '@rewards/config/rewardConfig';
import path from 'path';

import baseConfig from '@content/config/baseConfig';
import { PROJECT_ROOT } from '@core/constants/paths';

initializeRewardConfig('rewardSettings');
const { deviceScaleFactor, ...desktopChromeNoScale } = devices['Desktop Chrome'];

const isCI_RS = !!process.env.CI;
const headless_RS = isCI_RS;
const screenWidth_RS = process.env.SCREEN_WIDTH ? parseInt(process.env.SCREEN_WIDTH, 10) : 1920;
const screenHeight_RS = process.env.SCREEN_HEIGHT ? parseInt(process.env.SCREEN_HEIGHT, 10) : 1080;
const projectViewport_RS = isCI_RS ? { width: screenWidth_RS, height: screenHeight_RS } : null;

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
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'reward', 'tests', 'ui-tests', 'reward-settings'),
  testIgnore: '**/api-tests/**',
  // keep workers consistent for CI/local as you previously had
  workers: process.env.CI ? 1 : 1,
  timeout: 90_000,
  projects: [
    {
      name: 'Reward Setting Cases',
      use: {
        ...desktopChromeNoScale,
        headless: headless_RS,
        viewport: projectViewport_RS,
        launchOptions: {
          args: commonLaunchArgs_RS,
        },
        baseURL: getRewardTenantConfigFromCache().frontendBaseUrl,
      },
    },
  ],
});
