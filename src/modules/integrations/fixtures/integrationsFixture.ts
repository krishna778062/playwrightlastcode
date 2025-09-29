import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { TileManagementHelper } from '@/src/modules/content/apis/helpers/tileManagementHelper';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/ui/pages/siteDashboard';

export const integrationsFixture = test.extend<
  {
    appManagerBrowserContext: BrowserContext;
    appManagerPage: Page;
    appManagerUINavigationHelper: NavigationHelper;
    homeDashboard: HomeDashboard;
    siteDashboard: SiteDashboard;
    siteManagementHelper: SiteManagementHelper;
    tileManagementHelper: TileManagementHelper;
  },
  {
    appManagerApiContext: APIRequestContext; //worker scoped api context  }
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

  homeDashboard: [
    async ({ appManagerPage, tileManagementHelper }, use) => {
      const homeDashboard = new HomeDashboard(appManagerPage, tileManagementHelper);
      await homeDashboard.loadPage();
      await homeDashboard.verifyThePageIsLoaded();
      await use(homeDashboard);
    },
    { scope: 'test' },
  ],
  appManagerUINavigationHelper: [
    async ({ appManagerPage }, use, _workerInfo) => {
      const appManagerUINavigationHelper = new NavigationHelper(appManagerPage);
      await use(appManagerUINavigationHelper);
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
    async ({ appManagerApiContext }, use) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(siteManagementHelper);
      await siteManagementHelper.cleanup();
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
});
