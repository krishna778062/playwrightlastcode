import { faker } from '@faker-js/faker';
import { APIRequestContext, BrowserContext, Page, test as base } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { UserManagementService } from '@/src/modules/platforms/apis/services/UserManagementService';

// API-only fixture type for API helpers and services
export interface EventSyncApiFixture {
  apiContext: APIRequestContext;
  siteManagementHelper: SiteManagementHelper;
  contentManagementHelper: ContentManagementHelper;
  userManagementService: UserManagementService;
}

// UI-only fixture type for browser and page components
export interface EventSyncUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
}

// Combined user fixture type that extends both API and UI fixtures
export interface EventSyncUserFixture extends EventSyncApiFixture, EventSyncUiFixture {}

// Helper function to create API-only fixtures using existing API contexts
async function createEventSyncApiFixture(apiContext: APIRequestContext): Promise<EventSyncApiFixture> {
  const siteManagementHelper = new SiteManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const contentManagementHelper = new ContentManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const userManagementService = new UserManagementService(apiContext, getEnvConfig().apiBaseUrl);

  return {
    apiContext,
    siteManagementHelper,
    contentManagementHelper,
    userManagementService,
  };
}

// Helper function to create UI-only fixtures
async function createEventSyncUiFixture(browser: any): Promise<EventSyncUiFixture> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: process.env.QA_SYSTEM_ADMIN_USERNAME || getEnvConfig().appManagerEmail,
    password: process.env.QA_SYSTEM_ADMIN_PASSWORD || getEnvConfig().appManagerPassword,
  });

  const homePage = new NewHomePage(page);
  await homePage.loadPage();
  await homePage.verifyThePageIsLoaded();

  const navigationHelper = new NavigationHelper(page);

  return {
    browserContext: context,
    page,
    homePage,
    navigationHelper,
  };
}

// Legacy type definitions for backward compatibility
export type IntegrationsEventFixtures = {
  appManagerApiFixture: EventSyncApiFixture;
  appManagerUiFixture: EventSyncUiFixture;
  appManagerFixture: EventSyncUserFixture;
  testSiteName: string;
};

export type IntegrationsEventWorkerFixtures = {
  appManagerApiContext: APIRequestContext;
};

export const integrationsEventFixture = base.extend<IntegrationsEventFixtures, IntegrationsEventWorkerFixtures>({
  // Worker-scoped API context - shared across all tests in worker
  appManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: process.env.QA_SYSTEM_ADMIN_USERNAME || getEnvConfig().appManagerEmail,
        password: process.env.QA_SYSTEM_ADMIN_PASSWORD || getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead, using worker-scoped contexts
  appManagerApiFixture: [
    async ({ appManagerApiContext }, use) => {
      const fixture = await createEventSyncApiFixture(appManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.siteManagementHelper.cleanup();
        await fixture.contentManagementHelper.cleanup();
      } catch (error) {
        console.warn('App manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components
  appManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createEventSyncUiFixture(browser);
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

  // Special fixture for event testing - creates dedicated test site per test
  testSiteName: [
    async ({ appManagerApiFixture }, use) => {
      let createdSiteName = '';
      try {
        console.log('Creating dedicated test site for event creation...');
        const category =
          await appManagerApiFixture.siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const testSite = await appManagerApiFixture.siteManagementHelper.createPublicSite({
          category,
          siteName: `Event Test Site ${faker.string.alphanumeric({ length: 6 })}`,
        });
        createdSiteName = testSite.siteName;
        console.log(`✅ Created dedicated test site: ${createdSiteName} (ID: ${testSite.siteId})`);

        await use(createdSiteName);
      } catch (error) {
        console.error('Failed to create test site:', error);
        await use(createdSiteName);
      }
    },
    { scope: 'test' },
  ],
});
