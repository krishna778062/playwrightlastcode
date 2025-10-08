import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@core/api/factories/requestContextFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { AudienceCategoryManagementHelper, IdentityManagementHelper } from '../apis/helpers';
import { UserManagementService } from '../apis/services/UserManagementService';

import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';

// API-only fixture type for API helpers and services
export interface PlatformApiFixture {
  apiContext: APIRequestContext;
  audienceCategoryManagementHelper: AudienceCategoryManagementHelper;
  identityManagementHelper: IdentityManagementHelper;
  userManagementService: UserManagementService;
}

// UI-only fixture type for browser and page components
export interface PlatformUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
}

// Combined user fixture type that extends both API and UI fixtures
export interface PlatformUserFixture extends PlatformApiFixture, PlatformUiFixture {}

export type PlatformUserType = 'appManager' | 'userManager';

export const platformUsers = {
  appManager: {
    email: getEnvConfig().appManagerEmail,
    password: getEnvConfig().appManagerPassword,
  },
  userManager: {
    email: getEnvConfig().userManagerEmail!,
    password: getEnvConfig().appManagerPassword,
  },
};

// Helper function to create API-only fixtures using existing API contexts
async function createPlatformApiFixture(apiContext: APIRequestContext): Promise<PlatformApiFixture> {
  const audienceCategoryManagementHelper = new AudienceCategoryManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const identityManagementHelper = new IdentityManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const userManagementService = new UserManagementService(apiContext, getEnvConfig().apiBaseUrl);

  return {
    apiContext,
    audienceCategoryManagementHelper,
    identityManagementHelper,
    userManagementService,
  };
}

// Helper function to create UI-only fixtures
async function createPlatformUiFixture(browser: any, userType: PlatformUserType): Promise<PlatformUiFixture> {
  const user = platformUsers[userType];
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: user.email,
    password: user.password,
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

export const platformTestFixture = test.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: PlatformApiFixture;
    userManagerApiFixture: PlatformApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: PlatformUiFixture;
    userManagerUiFixture: PlatformUiFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: PlatformUserFixture;
    userManagerFixture: PlatformUserFixture;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    userManagerApiContext: APIRequestContext;
  }
>({
  // Worker-scoped API contexts - shared across all tests in worker
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

  userManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().userManagerEmail!,
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
      const fixture = await createPlatformApiFixture(appManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.audienceCategoryManagementHelper.cleanup();
      } catch (error) {
        console.warn('App manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  userManagerApiFixture: [
    async ({ userManagerApiContext }, use) => {
      const fixture = await createPlatformApiFixture(userManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.audienceCategoryManagementHelper.cleanup();
      } catch (error) {
        console.warn('User manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components
  appManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createPlatformUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  userManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createPlatformUiFixture(browser, 'userManager');
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

  userManagerFixture: [
    async ({ userManagerUiFixture, userManagerApiFixture }, use) => {
      await use({ ...userManagerUiFixture, ...userManagerApiFixture });
    },
    { scope: 'test' },
  ],
});
