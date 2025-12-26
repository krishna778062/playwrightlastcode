import { defineConfig, devices } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT, TEST_RESULTS_DIR } from '@/src/core/constants/paths';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { getTenantConfig, initializeIntegrationConfig } from '@/src/modules/integrations/config/integration.config';

// Initialize config for primary tenant at config load time
initializeIntegrationConfig('primary');

export default defineConfig({
  name: 'Integrations API Automation',
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'integrations', 'tests', 'api'),
  testMatch: '**/*.spec.ts',
  timeout: TIMEOUTS.VERY_LONG,
  expect: {
    timeout: TIMEOUTS.SHORT,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: `${TEST_RESULTS_DIR}/test-results.json` }],
  ],
  use: {
    get baseURL() {
      return getTenantConfig().apiBaseUrl;
    },
    actionTimeout: 10_000,
    trace: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'integrations-api',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: null,
        get tenantConfig() {
          return getTenantConfig();
        },
      },
    },
  ],
});
