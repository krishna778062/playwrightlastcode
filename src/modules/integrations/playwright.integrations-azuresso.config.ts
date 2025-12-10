import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

import baseConfig from '../../../playwright.base.config';

import {
  getIntegrationConfig,
  getTenantConfigByTenant,
  initializeIntegrationConfig,
} from './config/integration.config';
import { Options } from './fixtures/integrationsFixture';

initializeIntegrationConfig('azuresso'); //integration config is initialized for azuresso tenant

export default defineConfig<Options>({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'integrations', 'tests', 'gamma'),
  testMatch: '**/azureSync.spec.ts',
  testIgnore: '**/api-tests/**',
  workers: process.env.CI ? 2 : 4,
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    ...baseConfig.use,
    headless: process.env.CI ? true : false,
  },
  projects: [
    {
      name: 'integrations-azuresso-chromium',
      use: {
        headless: process.env.CI ? true : false,
        video: 'on-first-retry',
        ...devices['Desktop Chrome'],
        permissions: ['camera', 'microphone'],
        baseURL: getIntegrationConfig().tenant.frontendBaseUrl,
        get tenantConfig() {
          return getTenantConfigByTenant('azuresso');
        },
        launchOptions: {
          args: [
            '--disable-gpu', // Disable GPU acceleration
            '--no-sandbox', // Disable sandbox
            '--disable-dev-shm-usage', // Disable /dev/shm usage
            '--use-fake-ui-for-media-stream', // Use fake UI for media stream
            '--use-fake-device-for-media-stream', // Use fake device for media stream
            //Bypass bot detection
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
          ],
        },
      },
    },
  ],
});
