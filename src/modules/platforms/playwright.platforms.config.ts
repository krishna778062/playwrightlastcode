import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';

export default defineConfig({
  ...baseConfig,
  name: 'Platforms UI Automation',
  timeout: 180_000,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'platforms', 'tests'),
  testIgnore: '**/api-tests/**',
  // Optimize for parallel execution
  workers: process.env.CI ? 3 : 6, // Increase workers for better parallel execution
  use: {
    ...baseConfig.use,
    actionTimeout: 30_000, // Increase action timeout for parallel execution
    navigationTimeout: 45_000, // Increase navigation timeout
  },
  projects: [
    {
      name: 'platforms-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.FRONTEND_BASE_URL,
        headless: process.env.CI ? true : true,
        permissions: ['camera', 'microphone'],
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
