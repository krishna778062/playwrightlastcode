import { BrowserContext, Page, test, WorkerInfo } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { FeedManagerService } from '@core/api/services/FeedManagerService';
import { ContentManagementHelper } from '@core/helpers/contentManagementHelper';
import { LoginHelper } from '@core/helpers/loginHelper';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

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

export const contentTestFixture = test.extend<
  {
    appManagerContext: BrowserContext;
    appManagerHomePage: NewUxHomePage | OldUxHomePage;
    appManagersPage: Page;
    endUserContext: BrowserContext;
    endUserHomePage: NewUxHomePage | OldUxHomePage;
    endUsersPage: Page;
    siteManagementHelper: SiteManagementHelper;
    feedManagerService: FeedManagerService;
    manageContentHelper: ContentManagementHelper;
    manageContentEndUserHelper: ContentManagementHelper;
    loginAs: (userType: UserType) => Promise<void>;
  },
  {
    appManagerApiClient: AppManagerApiClient;
    endUserApiClient: AppManagerApiClient;
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
  endUserApiClient: [
    async ({}, use, workerInfo: WorkerInfo) => {
      console.log(`INFO: Setting up end user client for worker => `, workerInfo.workerIndex);
      const endUserApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: {
          username: getEnvConfig().endUserEmail!,
          password: getEnvConfig().endUserPassword!,
        },
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(endUserApiClient);
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
        password: getEnvConfig().endUserPassword!,
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

  feedManagerService: [
    async ({ appManagerApiClient }, use) => {
      const feedManagerService = new FeedManagerService(appManagerApiClient.context);
      await use(feedManagerService);
    },
    { scope: 'test' },
  ],

  manageContentHelper: [
    async ({ appManagerApiClient }, use) => {
      const manageContentHelper = new ContentManagementHelper(appManagerApiClient);
      await use(manageContentHelper);
    },
    { scope: 'test' },
  ],
  manageContentEndUserHelper: [
    async ({ endUserApiClient }, use) => {
      const manageContentEndUserHelper = new ContentManagementHelper(endUserApiClient);
      await use(manageContentEndUserHelper);
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
