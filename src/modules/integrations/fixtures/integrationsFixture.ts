import { BrowserContext, Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { TileManagementHelper } from '@core/helpers/tileManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { HomeDashboard } from '@/src/modules/integrations/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/pages/siteDashboard';

export const integrationsFixture = test.extend<
  {
    homeDashboard: HomeDashboard;
    appManagerBrowserContext: BrowserContext;
    appManagerPage: Page;
    siteDashboard: SiteDashboard;
    siteManagementHelper: SiteManagementHelper;
    tileManagementHelper: TileManagementHelper;
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

  appManagerBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],

  homeDashboard: [
    async ({ appManagerBrowserContext, tileManagementHelper }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      const homeDashboard = new HomeDashboard(page, tileManagementHelper);
      await use(homeDashboard);
    },
    { scope: 'test' },
  ],

  appManagerPage: [
    async ({ homeDashboard }, use) => {
      await use(homeDashboard.page);
    },
    { scope: 'test' },
  ],

  siteDashboard: [
    async ({ appManagerPage }, use) => {
      const siteDashboard = new SiteDashboard(appManagerPage);
      await use(siteDashboard);
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
});
