import { devices, defineConfig } from '@playwright/test';
import baseConfig from '../../../playwright.base.config';
import { PROJECT_ROOT } from '../../core/constants/paths';
import path from 'path';

export default defineConfig({
  ...baseConfig,
  name: 'Data Engineering UI Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'data-engineering', 'tests'),
  testIgnore: '**/api-tests/**',
  use: {
    ...baseConfig.use,
    baseURL: process.env.FRONTEND_BASE_URL,
    actionTimeout: 15_000, // 15 seconds auto-wait for actions
    navigationTimeout: 15_000 // 15 seconds auto-wait for navigation
  },
  projects: [
    {
      name: 'data-engineering-chromium',
      use: {
        ...devices['Desktop Chrome']
      },
    },
  ],
}); 