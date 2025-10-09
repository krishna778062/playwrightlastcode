import { BrowserContext, Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { QRManagementService } from '@/src/core/api/services/QRManagementService';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

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
    appManagerContext: BrowserContext;
    endUserContext: BrowserContext;
    promotionManagerContext: BrowserContext;
    appManagerHomePage: NewUxHomePage | OldUxHomePage;
    endUserHomePage: NewUxHomePage | OldUxHomePage;
    promotionManagerHomePage: NewUxHomePage | OldUxHomePage;
    appManagersPage: Page;
    endUsersPage: Page;
    promotionManagersPage: Page;
    loginAs: (userType: UserType) => Promise<void>;
  },
  {
    appManagerApiClient: AppManagerApiClient;
    qrManagementService: QRManagementService;
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
  qrManagementService: [
    async ({ appManagerApiClient }, use) => {
      const qrManagementService = new QRManagementService(appManagerApiClient.context);
      await use(qrManagementService);
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
  promotionManagerContext: [
    async ({ browser }, use, workerInfo) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],
  promotionManagerHomePage: [
    async ({ promotionManagerContext }, use, workerInfo) => {
      const page = await promotionManagerContext.newPage();
      const promotionManagerHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().promotionManagerEmail!,
        password: getEnvConfig().promotionManagerPassword!,
      });
      await promotionManagerHomePage.verifyThePageIsLoaded();
      await use(promotionManagerHomePage);
      await page.close();
    },
    { scope: 'test' },
  ],
  promotionManagersPage: [
    async ({ promotionManagerHomePage }, use, workerInfo) => {
      await use(promotionManagerHomePage.page);
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
