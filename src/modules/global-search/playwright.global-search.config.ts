import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';

export default defineConfig({
  ...baseConfig,
  name: 'Global Search UI Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'global-search', 'tests'),
  testIgnore: '**/api-tests/**',
  timeout: 300_000,
  projects: [
    {
      name: 'global-search-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.FRONTEND_BASE_URL,
        headless: process.env.CI ? true : false,
        permissions: ['camera', 'microphone', 'clipboard-read', 'clipboard-write'],
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
