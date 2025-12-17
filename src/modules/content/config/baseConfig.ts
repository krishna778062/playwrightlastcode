import { defineConfig } from '@playwright/test';

import { TEST_RESULTS_DIR } from '@core/constants/paths';
import { TIMEOUTS } from '@core/constants/timeouts';

/**
 * Base configuration for Content module
 * This config reads credentials from contentConfig.ts instead of .env files
 *
 * The content module uses a centralized config system that supports:
 * - Multi-tenant support (primary, contentSettings, contentStudio, contentAbac)
 * - Multi-environment support (qa, uat, test, prod)
 * - Configuration caching for performance
 *
 * Note: This baseConfig does NOT call loadEnvVariablesForGivenModule() since
 * the content module uses contentConfig.ts instead of .env files.
 *
 * Each playwright config file (playwright.content.config.ts, etc.) should:
 * 1. Import and initialize the appropriate tenant: initializeContentConfig('primary')
 * 2. Use getContentTenantConfigFromCache() to get credentials
 */
export default defineConfig({
  forbidOnly: !!process.env.CI,
  timeout: TIMEOUTS.VERY_LONG,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reportSlowTests: {
    max: 10,
    threshold: 180_000, // 180 seconds - tests taking longer than this will be reported
  },
  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'on',
    headless: process.env.CI ? true : true,
  },
  reporter: [
    ['html', { open: process.env.CI ? 'never' : 'on-failure' }],
    ['json', { outputFile: `${TEST_RESULTS_DIR}/test-results.json` }],
  ],
  // Run storage state cache server before starting the tests (only if caching is enabled)
  ...(process.env.ENABLE_STORAGE_STATE_CACHE !== 'false' && {
    webServer: {
      command: 'npm run start:cache-server',
      url: process.env.STORAGE_STATE_CACHE_URL || 'http://localhost:3010',
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000, // 30 seconds timeout for server startup (reduced from 2 minutes)
    },
  }),
});
