import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
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
    // App manager browser context, Request Context + page
    appManagerBrowserContext: BrowserContext;
    appManagerPage: Page;
    appManagerHomePage: NewUxHomePage | OldUxHomePage;
    // End user browser context, Request Context + page
    endUserContext: BrowserContext;
    endUserHomePage: NewUxHomePage | OldUxHomePage;
    endUsersPage: Page;

    // Services and helpers for app manager
    siteManagementHelper: SiteManagementHelper;
    feedManagementHelper: FeedManagementHelper;
    loginAs: (userType: UserType) => Promise<void>;
  },
  {
    appManagerApiContext: APIRequestContext;
  }
>({
  appManagerApiContext: [
    async ({}, use) => {
      const appManagerApiContext = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(appManagerApiContext);
      await appManagerApiContext.dispose();
    },
    { scope: 'worker' },
  ],
  appManagerBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  appManagerPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  appManagerHomePage: [
    async ({ appManagerPage }, use) => {
      const appManagerHomePage = new NewUxHomePage(appManagerPage);
      await appManagerHomePage.loadPage();
      await appManagerHomePage.verifyThePageIsLoaded();
      await use(appManagerHomePage);
    },
    { scope: 'test' },
  ],
  endUserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().endUserEmail!,
        password: getEnvConfig().endUserPassword,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  endUsersPage: [
    async ({ endUserContext }, use) => {
      const page = await endUserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  endUserHomePage: [
    async ({ endUsersPage }, use) => {
      const recognitionHomePage = new NewUxHomePage(endUsersPage);
      await recognitionHomePage.loadPage();
      await recognitionHomePage.verifyThePageIsLoaded();
      await use(recognitionHomePage);
    },
    { scope: 'test' },
  ],

  feedManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const feedManagementHelper = new FeedManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
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
    async ({ appManagerApiContext }, use) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
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
