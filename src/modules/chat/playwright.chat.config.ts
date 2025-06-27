import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';
import path from 'path';

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'chat', 'tests'),
  testIgnore: '**/api-tests/**',
  workers: process.env.CI ? 2 : 1,
  timeout: 180_000,
  expect: {
    timeout: 8_000, //this is default timeout will be used for all expect statements
  },
  projects: [
    {
      name: 'chat-chromium',
      use: {
        headless: true,
        video: 'off',
        ...devices['Desktop Chrome'],
        permissions: ['camera', 'microphone'],
        baseURL: process.env.FRONTEND_BASE_URL,
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
