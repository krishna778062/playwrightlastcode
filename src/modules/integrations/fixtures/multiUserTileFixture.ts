import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { TileManagementHelper } from '@/src/modules/integrations/apis/helpers/tileManagementHelper';

export type UserType = 'appManager' | 'endUser';

export const users = {
  appManager: {
    email: getEnvConfig().appManagerEmail,
    password: getEnvConfig().appManagerPassword,
  },
  endUser: {
    email: getEnvConfig().endUserEmail!,
    password: getEnvConfig().endUserPassword!,
  },
};

/**
 * Multi-user fixture for tile management tests
 * - Admin user: Creates and manages tiles
 * - End user: Verifies tile visibility
 */
export const multiUserTileFixture = test.extend<
  {
    // App manager browser context, Request Context + page
    appManagerBrowserContext: BrowserContext;
    adminPage: Page;
    tileManagementHelper: TileManagementHelper;
    siteManagementHelper: SiteManagementHelper;
    // End user browser context, Request Context + page
    endUserBrowserContext: BrowserContext;
    endUserPage: Page;
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

  adminPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  endUserBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, users.endUser);
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  endUserPage: [
    async ({ endUserBrowserContext }, use) => {
      const page = await endUserBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  tileManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const tileManagementHelper = new TileManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      try {
        await use(tileManagementHelper);
      } finally {
        await tileManagementHelper.cleanup();
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
});
