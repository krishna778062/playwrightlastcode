import { APIRequestContext, BrowserContext, Page, test as base } from '@playwright/test';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { AppsManagementService } from '@/src/core/api/services/AppsManagementService';
import { LinkManagementService } from '@/src/core/api/services/LinkManagementService';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';

export type UserType = 'appManager' | 'standardUser';

// Cache environment configuration to avoid repeated calls
const envConfig = getEnvConfig();

export const users = {
  appManager: {
    email: envConfig.appManagerEmail,
    password: envConfig.appManagerPassword,
  },
  standardUser: {
    email: envConfig.endUserEmail || '',
    password: envConfig.endUserPassword || '',
  },
};

// API-only fixture type for API helpers and services
export interface CommsPlannerApiFixture {
  apiContext: APIRequestContext;
  appManagementService: AppsManagementService;
  linkManagementService: LinkManagementService;
  contentManagementHelper: ContentManagementHelper;
}

// UI-only fixture type for browser and page components
export interface CommsPlannerUIFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
}

// Combined user fixture type that extends both API and UI fixtures
export interface CommsPlannerUserFixture extends CommsPlannerApiFixture, CommsPlannerUIFixture {}

// Helper function to create API-only fixtures using existing API contexts
async function createCommsPlannerApiFixture(apiContext: APIRequestContext): Promise<CommsPlannerApiFixture> {
  const appManagementService = new AppsManagementService(apiContext, getEnvConfig().apiBaseUrl);
  const linkManagementService = new LinkManagementService(apiContext, getEnvConfig().apiBaseUrl);
  const contentManagementHelper = new ContentManagementHelper(apiContext, getEnvConfig().apiBaseUrl);

  return {
    apiContext,
    appManagementService,
    linkManagementService,
    contentManagementHelper,
  };
}

// Helper function to create UI-only fixtures
async function createCommsPlannerUiFixture(
  browser: any,
  _apiContext: APIRequestContext
): Promise<CommsPlannerUIFixture> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: getEnvConfig().appManagerEmail,
    password: getEnvConfig().appManagerPassword,
  });

  const homePage = new NewHomePage(page);
  await homePage.verifyThePageIsLoaded();

  const navigationHelper = new NavigationHelper(page);

  return {
    browserContext: context,
    page,
    homePage,
    navigationHelper,
  };
}

export const commsPlannerTestFixtures = base.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: CommsPlannerApiFixture;
    standardUserApiFixture: CommsPlannerApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: CommsPlannerUIFixture;
    standardUserUiFixture: CommsPlannerUIFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: CommsPlannerUserFixture;
    standardUserFixture: CommsPlannerUserFixture;

    // Legacy compatibility aliases
    appManagerPage: Page;
    appManagersPage: Page; // Alias for compatibility
    appManagerContext: BrowserContext;
    standardUserPage: Page;
    standardUserContext: BrowserContext;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    standardUserApiContext: APIRequestContext;
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

  standardUserApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().endUserEmail || '',
        password: getEnvConfig().endUserPassword || '',
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead, using worker-scoped contexts
  appManagerApiFixture: [
    async ({ appManagerApiContext }, use) => {
      const fixture = await createCommsPlannerApiFixture(appManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.contentManagementHelper.cleanup();
      } catch (error) {
        console.warn('App manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  standardUserApiFixture: [
    async ({ standardUserApiContext }, use) => {
      const fixture = await createCommsPlannerApiFixture(standardUserApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.contentManagementHelper.cleanup();
      } catch (error) {
        console.warn('Standard user API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components
  appManagerUiFixture: [
    async ({ browser, appManagerApiContext }, use) => {
      const fixture = await createCommsPlannerUiFixture(browser, appManagerApiContext);
      await use(fixture);

      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  standardUserUiFixture: [
    async ({ browser, standardUserApiContext: _standardUserApiContext }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await LoginHelper.loginWithPassword(page, users.standardUser);

      const homePage = new NewHomePage(page);
      await homePage.verifyThePageIsLoaded();

      const navigationHelper = new NavigationHelper(page);

      const fixture: CommsPlannerUIFixture = {
        browserContext: context,
        page,
        homePage,
        navigationHelper,
      };

      await use(fixture);
      await context.close();
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

  standardUserFixture: [
    async ({ standardUserUiFixture, standardUserApiFixture }, use) => {
      await use({ ...standardUserUiFixture, ...standardUserApiFixture });
    },
    { scope: 'test' },
  ],

  // Legacy compatibility fixtures
  appManagerContext: [
    async ({ appManagerUiFixture }, use) => {
      await use(appManagerUiFixture.browserContext);
    },
    { scope: 'test' },
  ],

  appManagerPage: [
    async ({ appManagerUiFixture }, use) => {
      await use(appManagerUiFixture.page);
    },
    { scope: 'test' },
  ],

  // Alias for compatibility with existing tests
  appManagersPage: [
    async ({ appManagerPage }, use) => {
      await use(appManagerPage);
    },
    { scope: 'test' },
  ],

  standardUserContext: [
    async ({ standardUserUiFixture }, use) => {
      await use(standardUserUiFixture.browserContext);
    },
    { scope: 'test' },
  ],

  standardUserPage: [
    async ({ standardUserUiFixture }, use) => {
      await use(standardUserUiFixture.page);
    },
    { scope: 'test' },
  ],
});

// Export alias for backward compatibility
export const test = commsPlannerTestFixtures;
