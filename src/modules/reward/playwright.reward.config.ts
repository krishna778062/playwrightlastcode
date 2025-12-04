import { defineConfig, devices } from '@playwright/test';
import { getRewardTenantConfigFromCache, initializeRewardConfig } from '@rewards/config/rewardConfig';
import baseConfig from '@rewards/playwright.base.config';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

// initialize tenant-specific config
initializeRewardConfig('primary');

const { deviceScaleFactor, ...desktopChromeNoScale } = devices['Desktop Chrome'];

// Environment helpers
const isCI = !!process.env.CI;
const headless = isCI; // true in CI, false locally
// Allow overriding CI resolution with env vars (useful for different runners)
const screenWidth = process.env.SCREEN_WIDTH ? parseInt(process.env.SCREEN_WIDTH, 10) : 1920;
const screenHeight = process.env.SCREEN_HEIGHT ? parseInt(process.env.SCREEN_HEIGHT, 10) : 1080;

// For local (headed) runs we want the browser window to be maximized and use the system's screen size.
// Playwright will honor `viewport: null` and the window size when starting a headed browser.
// For CI (headless) we can't 'maximize' a headful window; instead we supply a large consistent viewport.
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
        headless,
        // When headed (local), use null viewport so Playwright uses the actual window size (maximized)
        // When headless (CI), give an explicit large viewport so screenshots / layout are consistent
        viewport: projectViewport,
        // launch options: we still pass start-maximized / window-size — headful will maximize, headless will use the window-size arg
        launchOptions: {
          args: commonLaunchArgs,
        },
        baseURL: getRewardTenantConfigFromCache().frontendBaseUrl,
      },
    },
  ],
});
