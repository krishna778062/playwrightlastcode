import { defineConfig } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'employee-listening', 'tests'),
  use: {
    ...baseConfig.use,
    baseURL: process.env.FRONTEND_BASE_URL,
  },
  // Add employee-listening-specific overrides here
});
