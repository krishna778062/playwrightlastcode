import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

import baseConfig from '../../../playwright.base.config';

import { getTenantConfigByTenant } from './config/integration.config';
import { Options } from './fixtures/integrationsFixture';

export default defineConfig<Options>({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'integrations', 'tests'),
  testIgnore: '**/api-tests/**',
  workers: process.env.CI ? 2 : 4,
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'integrations-primary',
      use: {
        headless: process.env.CI ? true : false,
        video: 'on-first-retry',
        ...devices['Desktop Chrome'],
        permissions: ['camera', 'microphone'],
        baseURL: getTenantConfigByTenant('primary').frontendBaseUrl,
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
        tenantConfig: getTenantConfigByTenant('primary'),
      },
    },
    {
      name: 'integrations-azure-sso',
      use: {
        headless: process.env.CI ? true : false,
        video: 'on-first-retry',
        ...devices['Desktop Chrome'],
        permissions: ['camera', 'microphone'],
        baseURL: getTenantConfigByTenant('azuresso').frontendBaseUrl,
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
        tenantConfig: getTenantConfigByTenant('azuresso'),
      },
    },
    {
      name: 'integrations-workday',
      use: {
        headless: process.env.CI ? true : false,
        video: 'off',
        ...devices['Desktop Chrome'],
        permissions: ['camera', 'microphone'],
        baseURL: getTenantConfigByTenant('workday').frontendBaseUrl,
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
