import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import { TIMEOUTS } from '@core/constants/timeouts';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import baseConfig from '../../../playwright.base.config';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'newsletter', 'tests'),
  // Add newsletter-specific overrides here
  workers: 1,
  timeout: TIMEOUTS.VERY_VERY_LONG * 1.5, // 180 seconds (3 minutes)
  expect: {
    timeout: TIMEOUTS.SHORT, // 15 seconds
  },
  projects: [
    {
      name: 'Newsletter',
      use: {
        headless: !!process.env.CI,
        ...devices['Desktop Chrome'],
        baseURL: getEnvConfig().frontendBaseUrl,
        launchOptions: {
          args: [
            '--disable-gpu', // Disable GPU acceleration
            '--no-sandbox', // Disable sandbox
            '--disable-dev-shm-usage', // Disable /dev/shm usage
            '--use-fake-ui-for-media-stream', // Use fake UI for media stream
            '--use-fake-device-for-media-stream', // Use fake device for media stream
          ],
        },
      },
    },
  ],
});
