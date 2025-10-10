import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { QRManagementService } from '../apis/services/QRManagementService';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';

export type UserType = 'appManager' | 'endUser' | 'promotionManager';

export const users = {
  appManager: {
    email: process.env.APP_MANAGER_USERNAME || '',
    password: process.env.APP_MANAGER_PASSWORD || '',
  },
  endUser: {
    email: process.env.END_USER_USERNAME || '',
    password: process.env.END_USER_PASSWORD || '',
  },
  promotionManager: {
    email: process.env.PROMOTION_MANAGER_USERNAME || '',
    password: process.env.PROMOTION_MANAGER_PASSWORD || '',
  },
};

export const frontlineTestFixture = test.extend<
  {
    // App manager browser context, Request Context + page
    appManagerBrowserContext: BrowserContext;
    appManagersPage: Page;
    appManagerHomePage: NewHomePage;
    appManagerUINavigationHelper: NavigationHelper;

    // Promotion manager browser context, Request Context + page
    promotionManagerContext: BrowserContext;
    promotionManagersPage: Page;
    promotionManagerHomePage: NewHomePage;
    promotionManagerUINavigationHelper: NavigationHelper;

    // End user browser context, Request Context + page
    endUserBrowserContext: BrowserContext;
    endUsersPage: Page;
    endUserHomePage: NewHomePage;
    endUserUINavigationHelper: NavigationHelper;
    loginAs: (userType: UserType) => Promise<void>;
  },
  {
    appManagerApiContext: APIRequestContext;
    qrManagementService: QRManagementService;
  }
>({
  // Worker-scoped API client - shared across all tests in worker
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
  qrManagementService: [
    async ({ appManagerApiContext }, use) => {
      const qrManagementService = new QRManagementService(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(qrManagementService);
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
  promotionManagerContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const promotionManagerHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().promotionManagerEmail!,
        password: getEnvConfig().promotionManagerPassword!,
      });
      await promotionManagerHomePage.verifyThePageIsLoaded();
      await use(context);
      await page.close();
    },
    { scope: 'test' },
  ],
  promotionManagersPage: [
    async ({ promotionManagerContext }, use) => {
      const page = await promotionManagerContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  promotionManagerUINavigationHelper: [
    async ({ promotionManagerHomePage }, use) => {
      const promotionManagerUINavigationHelper = new NavigationHelper(promotionManagerHomePage.page);
      await use(promotionManagerUINavigationHelper);
    },
    { scope: 'test' },
  ],

  promotionManagerHomePage: [
    async ({ promotionManagersPage }, use) => {
      const homePage = new NewHomePage(promotionManagersPage);
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
      await use(homePage);
    },
    { scope: 'test' },
  ],

  appManagersPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  appManagerHomePage: [
    async ({ appManagersPage }, use) => {
      const homePage = new NewHomePage(appManagersPage);
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
      await use(homePage);
      await appManagersPage.close();
    },
    { scope: 'test' },
  ],

  appManagerUINavigationHelper: [
    async ({ appManagersPage }, use, _workerInfo) => {
      const appManagerUINavigationHelper = new NavigationHelper(appManagersPage);
      await use(appManagerUINavigationHelper);
    },
    { scope: 'test' },
  ],

  endUserBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().endUserEmail!,
        password: getEnvConfig().endUserPassword!,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  endUsersPage: [
    async ({ endUserBrowserContext }, use) => {
      const page = await endUserBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  endUserHomePage: [
    async ({ endUsersPage }, use) => {
      const homePage = new NewHomePage(endUsersPage);
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
      await use(homePage);
      await endUsersPage.close();
    },
    { scope: 'test' },
  ],
  endUserUINavigationHelper: [
    async ({ endUsersPage }, use, _workerInfo) => {
      const endUserUINavigationHelper = new NavigationHelper(endUsersPage);
      await use(endUserUINavigationHelper);
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
