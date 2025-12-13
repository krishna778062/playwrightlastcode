import { APIRequestContext, BrowserContext, Page, test as base } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { IntegrationTileHelper } from '@/src/modules/integrations/apis/helpers/integrationTileHelper';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/ui/pages/siteDashboard';

interface TenantConfig {
  tenantName: string;
  frontendBaseUrl: string;
  apiBaseUrl: string;
  appManagerEmail: string;
  appManagerPassword: string;
  endUserEmail?: string;
  endUserPassword?: string;
}

export type Options = { tenantConfig: TenantConfig };
// API-only fixture type for API helpers and services
export interface IntegrationsApiFixture {
  apiContext: APIRequestContext;
  siteManagementHelper: SiteManagementHelper;
  tileManagementHelper: IntegrationTileHelper;
  integrationTileHelper: IntegrationTileHelper;
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
async function createIntegrationsApiFixture(
  apiContext: APIRequestContext,
  tenantConfig?: TenantConfig
): Promise<IntegrationsApiFixture> {
  const apiBaseUrl = tenantConfig?.apiBaseUrl || getEnvConfig().apiBaseUrl;
  const siteManagementHelper = new SiteManagementHelper(apiContext, apiBaseUrl);
  const integrationTileHelper = new IntegrationTileHelper(apiContext, apiBaseUrl);

  return {
    apiContext,
    siteManagementHelper,
    tileManagementHelper: integrationTileHelper, // Use IntegrationTileHelper for integration tests
    integrationTileHelper,
  };
}

// Helper function to create UI-only fixtures
async function createIntegrationsUiFixture(
  browser: any,
  tileManagementHelper: IntegrationTileHelper,
  tenantConfig: TenantConfig
): Promise<IntegrationsUiFixture> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: tenantConfig.appManagerEmail,
    password: tenantConfig.appManagerPassword,
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

export const integrationsFixture = base.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: IntegrationsApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: IntegrationsUiFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: IntegrationsUserFixture;

    // Convenience fixture for just the page
    appManagerPage: Page;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    tenantConfig: TenantConfig;
  }
>({
  // Worker-scoped tenant config - read from project use options
  tenantConfig: [
    async ({}, use, testInfo) => {
      const tenantConfig = (testInfo.project.use as any).tenantConfig as TenantConfig;
      if (!tenantConfig) {
        throw new Error('tenantConfig is not defined in project use options');
      }
      await use(tenantConfig);
    },
    { scope: 'worker' },
  ],
  // Worker-scoped API context - shared across all tests in worker
  appManagerApiContext: [
    async ({ tenantConfig }, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(tenantConfig.apiBaseUrl, {
        email: tenantConfig.appManagerEmail,
        password: tenantConfig.appManagerPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead, using worker-scoped contexts
  appManagerApiFixture: [
    async ({ appManagerApiContext, tenantConfig }, use) => {
      const fixture = await createIntegrationsApiFixture(appManagerApiContext, tenantConfig);
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
    async ({ browser, appManagerApiFixture, tenantConfig }, use) => {
      const fixture = await createIntegrationsUiFixture(
        browser,
        appManagerApiFixture.tileManagementHelper,
        tenantConfig
      );
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

  // Convenience fixture for just the page (UI-only, no API required)
  appManagerPage: [
    async ({ browser, tenantConfig }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await LoginHelper.loginWithPassword(page, {
        email: tenantConfig.appManagerEmail,
        password: tenantConfig.appManagerPassword,
      });

      await use(page);
      await context.close();
    },
    { scope: 'test' },
  ],
});
