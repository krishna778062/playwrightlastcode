import { devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import path from 'path';

import { PROJECT_ROOT } from '@core/constants/paths';

import baseConfig from '../../../playwright.base.config';

import { getTenantConfigByTenant } from './config/integration.config';
import { Options } from './fixtures/integrationsFixture';

// Helper to create project config - only loads tenant config when accessed
function createProjectConfig(
  tenant: 'primary' | 'azuresso' | 'workday' | 'okta',
  video: 'on-first-retry' | 'off' = 'on-first-retry'
) {
  const projectNameMap: Record<string, string> = {
    azuresso: 'azure-sso',
    primary: 'primary',
    workday: 'workday',
    okta: 'okta',
  };

  return {
    name: `integrations-${projectNameMap[tenant]}`,
    use: {
      headless: process.env.CI ? true : false,
      video,
      ...devices['Desktop Chrome'],
      permissions: ['camera', 'microphone'],
      get baseURL() {
        return getTenantConfigByTenant(tenant).frontendBaseUrl;
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
      get tenantConfig() {
        return getTenantConfigByTenant(tenant);
      },
    },
  };
}

// Get requested project from command line
function getRequestedProject(): string | null {
  const args = process.argv;
  const projectIndex = args.findIndex(arg => arg === '--project');
  if (projectIndex !== -1 && args[projectIndex + 1]) {
    return args[projectIndex + 1];
  }
  return null;
}

// Build projects array conditionally - only include requested project
function buildProjects() {
  const requestedProject = getRequestedProject();

  // If no specific project requested, default to primary only (since this is the primary config file)
  if (!requestedProject) {
    return [createProjectConfig('primary')];
  }

  // Only include the requested project
  if (requestedProject.includes('primary')) {
    return [createProjectConfig('primary')];
  }
  if (requestedProject.includes('azure-sso') || requestedProject.includes('azuresso')) {
    return [createProjectConfig('azuresso')];
  }
  if (requestedProject.includes('workday')) {
    return [createProjectConfig('workday', 'off')];
  }
  if (requestedProject.includes('okta')) {
    return [createProjectConfig('okta')];
  }

  // Default to primary if project name doesn't match
  return [createProjectConfig('primary')];
}

export default defineConfig<Options>({
  ...baseConfig,
  testDir: path.join(PROJECT_ROOT, 'src', 'modules', 'integrations', 'tests'),
  testIgnore: ['**/api-tests/**', '**/azureSync.spec.ts', '**/workday_Sync.spec.ts'],
  workers: process.env.CI ? 2 : 4,
  timeout: 180_000,
  expect: {
    timeout: 10_000,
  },
  projects: buildProjects(),
});
