import { BrowserContext, Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { StandardUserApiClient } from '@core/api/clients/standardUserApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { ContentManagementHelper } from '@core/helpers/contentManagementHelper';
import { FeedManagementHelper } from '@core/helpers/feedManagementHelper';
import { LoginHelper } from '@core/helpers/loginHelper';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

export type UserType = 'appManager' | 'endUser';
export type HomePageType = NewUxHomePage | OldUxHomePage;

// Cache environment configuration to avoid repeated calls
const envConfig = getEnvConfig();

export const users = {
  appManager: {
    email: envConfig.appManagerEmail,
    password: envConfig.appManagerPassword,
  },
  endUser: {
    email: envConfig.endUserEmail || '',
    password: envConfig.endUserPassword || '',
  },
  siteManager: {
    email: process.env.SITE_MANAGER_USERNAME || '',
    password: process.env.SITE_MANAGER_PASSWORD || '',
  },
} as const;

// Shared login function to reduce code duplication
async function createAuthenticatedHomePage(
  context: BrowserContext,
  userCredentials: { email: string; password: string }
): Promise<HomePageType> {
  const page = await context.newPage();
  const homePage = await LoginHelper.loginWithPassword(page, userCredentials);
  await homePage.verifyThePageIsLoaded();
  return homePage;
}

// Shared logout function with error handling
async function performLogout(homePage: HomePageType): Promise<void> {
  try {
    await LoginHelper.logoutByNavigatingToLogoutPage(homePage.page);
  } catch (error) {
    console.warn('Logout failed, continuing with test cleanup:', error);
  }
}

export const contentTestFixture = test.extend<
  {
    // Browser contexts
    appManagerContext: BrowserContext;
    standardUserContext: BrowserContext;

    // Authenticated pages
    appManagerHomePage: HomePageType;
    appManagersPage: Page;
    standardUserHomePage: HomePageType;
    standardUserPage: Page;

    // Helpers and services
    siteManagementHelper: SiteManagementHelper;
    siteManagerContext: BrowserContext;
    siteManagerHomePage: NewUxHomePage | OldUxHomePage;
    siteManagerPage: Page;
    contentManagementHelper: ContentManagementHelper;
    feedManagementHelper: FeedManagementHelper;
    standardUserFeedManagementHelper: FeedManagementHelper;

    // Utility functions
    loginAs: (userType: UserType) => Promise<void>;
  },
  {
    // Worker-scoped fixtures
    appManagerApiClient: AppManagerApiClient;
    standardUserApiClient: StandardUserApiClient;
  }
>({
  // Worker-scoped API client - shared across all tests in worker
  appManagerApiClient: [
    async ({}, use, workerInfo) => {
      console.log(`Setting up app manager API client for worker ${workerInfo.workerIndex}`);

      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: {
          username: envConfig.appManagerEmail,
          password: envConfig.appManagerPassword,
        },
        baseUrl: envConfig.apiBaseUrl,
      });

      await use(appManagerApiClient);

      // Cleanup worker-scoped resources
      console.log(`Cleaning up app manager API client for worker ${workerInfo.workerIndex}`);
    },
    { scope: 'worker' },
  ],
  standardUserApiClient: [
    async ({}, use, workerInfo) => {
      const standardUserApiClient = await ApiClientFactory.createClient(StandardUserApiClient, {
        type: 'credentials',
        credentials: {
          username: envConfig.endUserEmail || '',
          password: envConfig.endUserPassword || '',
        },
        baseUrl: envConfig.apiBaseUrl,
      });
      await use(standardUserApiClient);
    },
    { scope: 'worker' },
  ],
  // Browser contexts - isolated per test
  appManagerContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext({
        permissions: ['camera', 'microphone', 'notifications'],
      });

      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  // Authenticated home pages
  appManagerHomePage: [
    async ({ appManagerContext }, use) => {
      const homePage = await createAuthenticatedHomePage(appManagerContext, users.appManager);

      await use(homePage);
      await performLogout(homePage);
    },
    { scope: 'test' },
  ],
  standardUserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext({
        permissions: ['camera', 'microphone', 'notifications'],
        // Optimize context creation
        ignoreHTTPSErrors: true,
        viewport: { width: 1920, height: 1080 },
      });

      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  standardUserHomePage: [
    async ({ standardUserContext }, use) => {
      const homePage = await createAuthenticatedHomePage(standardUserContext, users.endUser);
      await use(homePage);
      await performLogout(homePage);
    },
    { scope: 'test' },
  ],

  standardUserPage: [
    async ({ standardUserHomePage }, use) => {
      await use(standardUserHomePage.page);
    },
    { scope: 'test' },
  ],

  // Page references - lightweight wrappers
  appManagersPage: [
    async ({ appManagerHomePage }, use) => {
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],

  siteManagerContext: [
    async ({ browser }, use, workerInfo) => {
      const context = await browser.newContext({
        permissions: ['camera', 'microphone', 'notifications'],
      });
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],

  siteManagerHomePage: [
    async ({ siteManagerContext }, use, workerInfo) => {
      const page = await siteManagerContext.newPage();
      const siteManagerHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().siteManagerEmail || '',
        password: getEnvConfig().siteManagerPassword || '',
      });
      await siteManagerHomePage.verifyThePageIsLoaded();
      await use(siteManagerHomePage);
      await page.close();
    },
    { scope: 'test' },
  ],

  siteManagerPage: [
    async ({ siteManagerHomePage }, use, workerInfo) => {
      await use(siteManagerHomePage.page);
    },
    { scope: 'test' },
  ],

  feedManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const feedManagementHelper = new FeedManagementHelper(appManagerApiClient);
      await use(feedManagementHelper);
      // Ensure cleanup happens even if test fails
      try {
        await feedManagementHelper.cleanup();
      } catch (error) {
        console.warn('Feed management helper cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  siteManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const helper = new SiteManagementHelper(appManagerApiClient);

      await use(helper);

      // Ensure cleanup happens even if test fails
      try {
        await helper.cleanup();
      } catch (error) {
        console.warn('Site management helper cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  contentManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const helper = new ContentManagementHelper(appManagerApiClient);

      await use(helper);

      // Ensure cleanup happens even if test fails
      try {
        await helper.cleanup();
      } catch (error) {
        console.warn('Content management helper cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  // Utility functions for user switching
  loginAs: [
    async ({ page }, use) => {
      await use(async (userType: UserType) => {
        const credentials = users[userType];
        if (!credentials.email || !credentials.password) {
          throw new Error(`Missing credentials for user type: ${userType}`);
        }
        await LoginHelper.loginWithPassword(page, credentials);
      });
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type ContentTestFixture = typeof contentTestFixture;
