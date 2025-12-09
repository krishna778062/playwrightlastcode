import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

import baseConfig from '../../../playwright.base.config';

import { getTenantConfigByTenant } from './config/integration.config';
import { Options } from './fixtures/integrationsFixture';

/**
 * Integrations Batch2 Suite Configuration
 * This config runs tests tagged with @integrations-batch2.
 * Add the BATCH2 tag to new tests to run them in this suite.
 */

function createProjectConfig(video: 'on-first-retry' | 'off' = 'on-first-retry') {
  return {
    name: 'integrations-batch2',
    use: {
      headless: process.env.CI ? true : false,
      video,
      ...devices['Desktop Chrome'],
      permissions: ['camera', 'microphone'],
      get baseURL() {
        return getTenantConfigByTenant('primary').frontendBaseUrl;
      },
      launchOptions: {
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
        ],
      },
      get tenantConfig() {
        return getTenantConfigByTenant('primary');
      },
    },
  };
}

export default defineConfig<Options>({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'integrations', 'tests'),
  // Only run tests tagged with @integrations-batch2
  grep: /@integrations-batch2/,
  workers: process.env.CI ? 2 : 4,
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  projects: [createProjectConfig()],
});
