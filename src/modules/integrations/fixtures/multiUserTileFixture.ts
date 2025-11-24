import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { SiteManagementHelper } from '@content/apis/helpers/siteManagementHelper';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { IntegrationTileHelper } from '@/src/modules/integrations/apis/helpers/integrationTileHelper';

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
    appManagerUINavigationHelper: NavigationHelper;
    tileManagementHelper: IntegrationTileHelper;
    siteManagementHelper: SiteManagementHelper;
    // End user browser context, Request Context + page
    endUserBrowserContext: BrowserContext;
    endUserPage: Page;
    endUserUINavigationHelper: NavigationHelper;
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
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  adminPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  appManagerUINavigationHelper: [
    async ({ adminPage }, use, _workerInfo) => {
      const appManagerUINavigationHelper = new NavigationHelper(adminPage);
      await use(appManagerUINavigationHelper);
    },
    { scope: 'test' },
  ],

  endUserBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  endUserPage: [
    async ({ endUserBrowserContext }, use) => {
      const page = await endUserBrowserContext.newPage();
      await LoginHelper.loginWithPassword(page, users.endUser);
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  endUserUINavigationHelper: [
    async ({ endUserPage }, use, _workerInfo) => {
      const endUserUINavigationHelper = new NavigationHelper(endUserPage);
      await use(endUserUINavigationHelper);
    },
    { scope: 'test' },
  ],

  tileManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const tileManagementHelper = new IntegrationTileHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
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

/**
 * Generic multi-user fixture that allows custom admin and end user credentials
 * @param adminCredentials - Custom credentials for the admin user
 * @param endUserCredentials - Custom credentials for the end user
 * @returns Extended fixture with custom admin and end user login
 */
export function createCustomMultiUserFixture(adminCredentials: UserCredentials, endUserCredentials: UserCredentials) {
  return multiUserTileFixture.extend({
    adminPage: [
      async ({ browser }, use) => {
        const adminContext = await browser.newContext({ recordVideo: { dir: 'test-results/videos/' } });
        const adminPage = await adminContext.newPage();

        await test.step(`Logging in Custom Admin User`, async () => {
          await LoginHelper.loginWithPassword(adminPage, adminCredentials);
        });

        await use(adminPage);
        await adminContext.close();
      },
      { scope: 'test' },
    ],
    endUserPage: [
      async ({ browser }, use) => {
        const endUserContext = await browser.newContext({ recordVideo: { dir: 'test-results/videos/' } });
        const endUserPage = await endUserContext.newPage();

        await test.step(`Logging in Custom End User`, async () => {
          await LoginHelper.loginWithPassword(endUserPage, endUserCredentials);
        });

        await use(endUserPage);
        await endUserContext.close();
      },
      { scope: 'test' },
    ],
  });
}
