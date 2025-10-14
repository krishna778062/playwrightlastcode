import { BrowserContext, Page, test as base } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { StandardUserApiClient } from '@core/api/clients/standardUserApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { ContentManagementHelper } from '@core/helpers/contentManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { LoginHelper } from '@/src/core/helpers/loginHelper';

export type UserType = 'appManager' | 'standardUser';

// Cache environment configuration to avoid repeated calls
const envConfig = getEnvConfig();

export const users = {
  appManager: {
    email: envConfig.appManagerEmail,
    password: envConfig.appManagerPassword,
  },
  standardUser: {
    email: envConfig.endUserEmail || '',
    password: envConfig.endUserPassword || '',
  },
};

export const test = base.extend<
  {
    appManagerPage: Page;
    appManagersPage: Page; // Alias for compatibility
    appManagerContext: BrowserContext;
    standardUserPage: Page;
    standardUserContext: BrowserContext;
    contentManagementHelper: ContentManagementHelper;
  },
  {
    // Worker-scoped fixtures
    appManagerApiClient: AppManagerApiClient;
    standardUserApiClient: StandardUserApiClient;
  }
>({
  // Worker-scoped API client - shared across all tests in worker
  appManagerApiClient: [
    async ({}, use, workerInfo) => {
      console.log(`Setting up app manager API client for worker ${workerInfo.workerIndex}`);

      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: {
          username: envConfig.appManagerEmail,
          password: envConfig.appManagerPassword,
        },
        baseUrl: envConfig.apiBaseUrl,
      });

      await use(appManagerApiClient);

      // Cleanup worker-scoped resources
      console.log(`Cleaning up app manager API client for worker ${workerInfo.workerIndex}`);
    },
    { scope: 'worker' },
  ],
  standardUserApiClient: [
    async ({}, use, workerInfo) => {
      const standardUserApiClient = await ApiClientFactory.createClient(StandardUserApiClient, {
        type: 'credentials',
        credentials: {
          username: envConfig.endUserEmail || '',
          password: envConfig.endUserPassword || '',
        },
        baseUrl: envConfig.apiBaseUrl,
      });

      await use(standardUserApiClient);

      console.log(`Cleaning up standard user API client for worker ${workerInfo.workerIndex}`);
    },
    { scope: 'worker' },
  ],
  appManagerContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],
  appManagerPage: [
    async ({ appManagerContext }, use) => {
      const page = await appManagerContext.newPage();
      const appManagerHomePage = await LoginHelper.loginWithPassword(page, users.appManager);
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],
  // Alias for compatibility with existing tests
  appManagersPage: [
    async ({ appManagerPage }, use) => {
      await use(appManagerPage);
    },
    { scope: 'test' },
  ],
  standardUserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],
  standardUserPage: [
    async ({ standardUserContext }, use) => {
      const page = await standardUserContext.newPage();
      const standardUserHomePage = await LoginHelper.loginWithPassword(page, users.standardUser);
      await use(standardUserHomePage.page);
    },
    { scope: 'test' },
  ],
  contentManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const contentManagementHelper = new ContentManagementHelper(appManagerApiClient);
      await use(contentManagementHelper);
      // Note: Cleanup is handled manually in test afterAll hooks
    },
    { scope: 'test' },
  ],
});
