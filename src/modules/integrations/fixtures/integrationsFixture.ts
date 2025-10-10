import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { TileManagementHelper } from '@/src/modules/content/apis/helpers/tileManagementHelper';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/ui/pages/siteDashboard';

// API-only fixture type for API helpers and services
export interface IntegrationsApiFixture {
  apiContext: APIRequestContext;
  siteManagementHelper: SiteManagementHelper;
  tileManagementHelper: TileManagementHelper;
}

// UI-only fixture type for browser and page components
export interface IntegrationsUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
  homeDashboard: HomeDashboard;
  siteDashboard: SiteDashboard;
}

// Combined user fixture type that extends both API and UI fixtures
export interface IntegrationsUserFixture extends IntegrationsApiFixture, IntegrationsUiFixture {}

// Helper function to create API-only fixtures using existing API contexts
async function createIntegrationsApiFixture(apiContext: APIRequestContext): Promise<IntegrationsApiFixture> {
  const siteManagementHelper = new SiteManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const tileManagementHelper = new TileManagementHelper(apiContext, getEnvConfig().apiBaseUrl);

  return {
    apiContext,
    siteManagementHelper,
    tileManagementHelper,
  };
}

// Helper function to create UI-only fixtures
async function createIntegrationsUiFixture(
  browser: any,
  tileManagementHelper: TileManagementHelper
): Promise<IntegrationsUiFixture> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: getEnvConfig().appManagerEmail,
    password: getEnvConfig().appManagerPassword,
  });

  const homePage = new NewHomePage(page);
  await homePage.loadPage();
  await homePage.verifyThePageIsLoaded();

  const navigationHelper = new NavigationHelper(page);

  // Create integrations-specific page objects
  const homeDashboard = new HomeDashboard(page, tileManagementHelper);
  await homeDashboard.loadPage();
  await homeDashboard.verifyThePageIsLoaded();

  const siteDashboard = new SiteDashboard(page);

  return {
    browserContext: context,
    page,
    homePage,
    navigationHelper,
    homeDashboard,
    siteDashboard,
  };
}

export const integrationsFixture = test.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: IntegrationsApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: IntegrationsUiFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: IntegrationsUserFixture;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
  }
>({
  // Worker-scoped API context - shared across all tests in worker
  appManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead, using worker-scoped contexts
  appManagerApiFixture: [
    async ({ appManagerApiContext }, use) => {
      const fixture = await createIntegrationsApiFixture(appManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.siteManagementHelper.cleanup();
        await fixture.tileManagementHelper.cleanup();
      } catch (error) {
        console.warn('App manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components
  // Note: HomeDashboard requires tileManagementHelper, so we pass it from API fixture
  appManagerUiFixture: [
    async ({ browser, appManagerApiFixture }, use) => {
      const fixture = await createIntegrationsUiFixture(browser, appManagerApiFixture.tileManagementHelper);
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  // Combined user fixtures - complete entry points
  appManagerFixture: [
    async ({ appManagerUiFixture, appManagerApiFixture }, use) => {
      await use({ ...appManagerUiFixture, ...appManagerApiFixture });
    },
    { scope: 'test' },
  ],
});
