import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { QRManagementService } from '../apis/services/QRManagementService';
import { getFrontlineTenantConfigFromCache } from '../config/frontlineConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';

export type UserType = 'appManager' | 'endUser' | 'promotionManager';

export const users = {
  appManager: {
    email: getFrontlineTenantConfigFromCache().appManagerEmail || '',
    password: getFrontlineTenantConfigFromCache().appManagerPassword || '',
  },
  endUser: {
    email: getFrontlineTenantConfigFromCache().endUserEmail || '',
    password: getFrontlineTenantConfigFromCache().endUserPassword || '',
  },
  promotionManager: {
    email: getFrontlineTenantConfigFromCache().promotionManagerEmail || '',
    password: getFrontlineTenantConfigFromCache().promotionManagerPassword || '',
  },
} as const;

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
      const config = getFrontlineTenantConfigFromCache();
      const appManagerApiContext = await RequestContextFactory.createAuthenticatedContext(config.apiBaseUrl, {
        email: config.appManagerEmail,
        password: config.appManagerPassword,
      });

      await use(appManagerApiContext);
      await appManagerApiContext.dispose();
    },
    { scope: 'worker' },
  ],
  qrManagementService: [
    async ({ appManagerApiContext }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const qrManagementService = new QRManagementService(appManagerApiContext, config.apiBaseUrl);
      await use(qrManagementService);
    },
    { scope: 'worker' },
  ],
  appManagerBrowserContext: [
    async ({ browser }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: config.appManagerEmail,
        password: config.appManagerPassword,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  promotionManagerContext: [
    async ({ browser }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const context = await browser.newContext();
      const page = await context.newPage();
      const promotionManagerHomePage = await LoginHelper.loginWithPassword(page, {
        email: config.promotionManagerEmail,
        password: config.promotionManagerPassword,
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
      const config = getFrontlineTenantConfigFromCache();
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: config.endUserEmail,
        password: config.endUserPassword,
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
