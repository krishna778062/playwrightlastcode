import { BrowserContext, Page, test, WorkerInfo } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { FeedManagementService } from '@core/api/services/FeedManagementService';
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
    email: envConfig.siteManagerEmail || '',
    password: envConfig.siteManagerPassword || '',
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
    siteManagerContext: BrowserContext;

    // Authenticated pages
    appManagerHomePage: HomePageType;
    appManagersPage: Page;
    endUserContext: BrowserContext;
    endUserHomePage: NewUxHomePage | OldUxHomePage;
    endUsersPage: Page;
    siteManagerHomePage: HomePageType;
    siteManagerPage: Page;
    feedManagerService: FeedManagementService;
    manageContentHelper: ContentManagementHelper;
    manageContentEndUserHelper: ContentManagementHelper;

    standardUserHomePage: HomePageType;
    standardUserPage: Page;

    // Helpers and services
    siteManagementHelper: SiteManagementHelper;
    contentManagementHelper: ContentManagementHelper;
    feedManagementHelper: FeedManagementHelper;

    // Utility functions
    loginAs: (userType: UserType) => Promise<void>;
    switchUser: (fromPage: Page, toUserType: UserType) => Promise<HomePageType>;
  },
  {
    // Worker-scoped fixtures
    appManagerApiClient: AppManagerApiClient;
    endUserApiClient: AppManagerApiClient;
  }
>({
  // Worker-scoped API client - shared across all tests in worker
  appManagerApiClient: [
    async (_fixtures, use, _workerInfo) => {
      console.log(`Setting up app manager API client for worker ${_workerInfo.workerIndex}`);

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
      console.log(`Cleaning up app manager API client for worker ${_workerInfo.workerIndex}`);
    },
    { scope: 'worker' },
  ],
  endUserApiClient: [
    async (_fixtures, use, _workerInfo: WorkerInfo) => {
      console.log(`INFO: Setting up end user client for worker => `, _workerInfo.workerIndex);
      const endUserApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: {
          username: getEnvConfig().endUserEmail!,
          password: getEnvConfig().endUserPassword!,
        },
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(endUserApiClient);
    },
    { scope: 'worker' },
  ],
  // Browser contexts - isolated per test
  appManagerContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext({
        // Optimize context creation
        ignoreHTTPSErrors: true,
        viewport: { width: 1920, height: 1080 },
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
        // Optimize context creation
        ignoreHTTPSErrors: true,
        viewport: { width: 1920, height: 1080 },
      });

      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  siteManagerContext: [
    async ({ browser }, use, workerInfo) => {
      const context = await browser.newContext();
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

  standardUserHomePage: [
    async ({ standardUserContext }, use) => {
      const homePage = await createAuthenticatedHomePage(standardUserContext, users.endUser);

      await use(homePage);
      await performLogout(homePage);
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

  endUserContext: [
    async ({ browser }, use, _workerInfo) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],
  endUserHomePage: [
    async ({ endUserContext }, use, _workerInfo) => {
      const page = await endUserContext.newPage();
      const endUserHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().endUserEmail!,
        password: getEnvConfig().endUserPassword!,
      });
      await endUserHomePage.verifyThePageIsLoaded();
      await use(endUserHomePage);
      await page.close();
    },
    { scope: 'test' },
  ],
  endUsersPage: [
    async ({ endUserHomePage }, use, _workerInfo) => {
      await use(endUserHomePage.page);
    },
    { scope: 'test' },
  ],
  standardUserPage: [
    async ({ standardUserHomePage }, use) => {
      await use(standardUserHomePage.page);
    },
    { scope: 'test' },
  ],

  feedManagerService: [
    async (
      { appManagerApiClient }: { appManagerApiClient: AppManagerApiClient },
      use: (r: FeedManagementService) => Promise<void>
    ) => {
      const feedManagerService = new FeedManagementService(appManagerApiClient.context);
      await use(feedManagerService);
    },
    { scope: 'test' },
  ],

  // Services and helpers - with proper cleanup
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

  manageContentHelper: [
    async ({ appManagerApiClient }, use) => {
      const manageContentHelper = new ContentManagementHelper(appManagerApiClient);
      await use(manageContentHelper);
    },
    { scope: 'test' },
  ],
  manageContentEndUserHelper: [
    async ({ endUserApiClient }, use) => {
      const manageContentEndUserHelper = new ContentManagementHelper(endUserApiClient);
      await use(manageContentEndUserHelper);
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

  switchUser: [
    async (_fixtures, use) => {
      await use(async (fromPage: Page, toUserType: UserType) => {
        // Logout current user
        await LoginHelper.logoutByNavigatingToLogoutPage(fromPage);

        // Login as new user
        const credentials = users[toUserType];
        if (!credentials.email || !credentials.password) {
          throw new Error(`Missing credentials for user type: ${toUserType}`);
        }

        const homePage = await LoginHelper.loginWithPassword(fromPage, credentials);
        await homePage.verifyThePageIsLoaded();
        return homePage;
      });
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type ContentTestFixture = typeof contentTestFixture;
