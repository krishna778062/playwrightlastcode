import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'employee-listening', 'tests'),
  timeout: 200_000,
  use: {
    ...baseConfig.use,
    baseURL: process.env.FRONTEND_BASE_URL,
    actionTimeout: 15_000, // 15 seconds auto-wait for actions
    navigationTimeout: 15_000, // 15 seconds auto-wait for navigation
  },
  // Add em
  //
  // ployee-listening-specific overrides here

  projects: [
    {
      name: 'employee-listening',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
