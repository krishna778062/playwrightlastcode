import { defineConfig } from '@playwright/test';
import path from 'path';

import baseConfig from '../../../playwright.base.config';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

export default defineConfig({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'comms-planner', 'tests'),
  // Add comms-planner-specific overrides here
});
