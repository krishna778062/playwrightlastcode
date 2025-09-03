import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { TileManagementHelper } from '@core/helpers/tileManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

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
    adminPage: Page;
    endUserPage: Page;
    tileManagementHelper: TileManagementHelper;
    siteManagementHelper: SiteManagementHelper;
  },
  {
    appManagerApiClient: AppManagerApiClient;
  }
>({
  appManagerApiClient: [
    async ({}, use, workerInfo) => {
      console.log(`INFO: Setting up app manager API client for worker => `, workerInfo.workerIndex);
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

  adminPage: [
    async ({ browser }, use) => {
      const adminContext = await browser.newContext({ recordVideo: { dir: 'test-results/videos/' } });
      const adminPage = await adminContext.newPage();

      await test.step(`Logging in Admin User`, async () => {
        await LoginHelper.loginWithPassword(adminPage, users.appManager);
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

      await test.step(`Logging in End User`, async () => {
        await LoginHelper.loginWithPassword(endUserPage, users.endUser);
      });

      await use(endUserPage);
      await endUserContext.close();
    },
    { scope: 'test' },
  ],

  tileManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const tileManagementHelper = new TileManagementHelper(appManagerApiClient);
      try {
        await use(tileManagementHelper);
      } finally {
        await tileManagementHelper.cleanup();
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
});
