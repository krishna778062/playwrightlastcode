import { BrowserContext, Page, test } from '@playwright/test';

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
    standardUserContext: BrowserContext;
    standardUserHomePage: NewUxHomePage | OldUxHomePage;
    standardUserPage: Page;
    siteManagementHelper: SiteManagementHelper;
    contentManagementHelper: ContentManagementHelper;
    feedManagerService: FeedManagerService;
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
      // Logout after each test case using this fixture
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],
  appManagersPage: [
    async ({ appManagerHomePage }, use, workerInfo) => {
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],

  standardUserContext: [
    async ({ browser }, use, workerInfo) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],

  standardUserHomePage: [
    async ({ standardUserContext }, use, workerInfo) => {
      const page = await standardUserContext.newPage();
      const standardUserHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().endUserEmail || '',
        password: getEnvConfig().endUserPassword || '',
      });
      await standardUserHomePage.verifyThePageIsLoaded();
      await use(standardUserHomePage);

      // Logout after each test case using this fixture
      await LoginHelper.logoutByNavigatingToLogoutPage(standardUserHomePage.page);
    },
    { scope: 'test' },
  ],

  standardUserPage: [
    async ({ standardUserHomePage }, use, workerInfo) => {
      await use(standardUserHomePage.page);
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

  siteManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      await use(siteManagementHelper);
      await siteManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],

  contentManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const contentManagementHelper = new ContentManagementHelper(appManagerApiClient);
      await use(contentManagementHelper);
      await contentManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],

  loginAs: async ({ page }, use) => {
    await use(async (userType: UserType) => {
      await LoginHelper.loginWithPassword(page, users[userType]);
    });
  },
});
