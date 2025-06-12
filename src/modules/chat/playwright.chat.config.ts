import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';
import path from 'path';

export default defineConfig({
  ...baseConfig,
  name: 'Chat UI Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'chat', 'tests'),
  testIgnore: '**/api-tests/**',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
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
