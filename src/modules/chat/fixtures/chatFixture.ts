import { BrowserContext, Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { NewUxHomePage } from '@/src/core/ui/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/ui/pages/homePage/oldUxHomePage';
import { FeedManagementHelper } from '@/src/modules/content/apis/helpers/feedManagementHelper';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';

export type UserType = 'appManager' | 'endUser';

export const users = {
  appManager: {
    email: process.env.APP_MANAGER_USERNAME || '',
    password: process.env.APP_MANAGER_PASSWORD || '',
  },
  endUser: {
    email: process.env.END_USER_USERNAME || '',
    password: process.env.END_USER_PASSWORD || '',
  },
};

export const chatTestFixture = test.extend<
  {
    appManagerContext: BrowserContext;
    endUserContext: BrowserContext;
    appManagerHomePage: NewUxHomePage | OldUxHomePage;
    endUserHomePage: NewUxHomePage | OldUxHomePage;
    appManagersPage: Page;
    endUsersPage: Page;
    siteManagementHelper: SiteManagementHelper;
    feedManagementHelper: FeedManagementHelper;
    loginAs: (userType: UserType) => Promise<void>;
  },
  {
    appManagerApiClient: AppManagerApiClient;
  }
>({
  appManagerApiClient: [
    async ({}, use, workerInfo) => {
      console.log(`INFO: Setting up app manager client for worker => `, workerInfo.workerIndex);
      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: {
          username: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        },
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(appManagerApiClient);
    },
    { scope: 'worker' },
  ],
  appManagerContext: [
    async ({ browser }, use, workerInfo) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],
  appManagerHomePage: [
    async ({ appManagerContext }, use, workerInfo) => {
      const page = await appManagerContext.newPage();
      const appManagerHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await appManagerHomePage.verifyThePageIsLoaded();
      await use(appManagerHomePage);
      await page.close();
    },
    { scope: 'test' },
  ],
  appManagersPage: [
    async ({ appManagerHomePage }, use, workerInfo) => {
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],
  endUserContext: [
    async ({ browser }, use, workerInfo) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],
  endUserHomePage: [
    async ({ endUserContext }, use, workerInfo) => {
      const page = await endUserContext.newPage();
      const endUserHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().endUserEmail!,
        password: getEnvConfig().endUserPassword,
      });
      await endUserHomePage.verifyThePageIsLoaded();
      await use(endUserHomePage);
      await page.close();
    },
    { scope: 'test' },
  ],
  endUsersPage: [
    async ({ endUserHomePage }, use, workerInfo) => {
      await use(endUserHomePage.page);
    },
    { scope: 'test' },
  ],

  feedManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const feedManagementHelper = new FeedManagementHelper(appManagerApiClient);
      await use(feedManagementHelper);
      // Ensure cleanup happens even if test fails
      try {
        await feedManagementHelper.cleanup();
      } catch (error) {
        console.warn('Feed management helper cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  siteManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      await use(siteManagementHelper);
      await siteManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],

  loginAs: async ({ page }, use) => {
    await use(async (userType: UserType) => {
      await LoginHelper.loginWithPassword(page, users[userType]);
    });
  },
});
export { test };
