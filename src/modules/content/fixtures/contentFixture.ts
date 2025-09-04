import { BrowserContext, Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { ContentManagementHelper } from '@core/helpers/contentManagementHelper';
import { FeedManagementHelper } from '@core/helpers/feedManagementHelper';
import { LoginHelper } from '@core/helpers/loginHelper';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { FilesPreviewModalComponent } from '../components/filesPreviewModalComponent';
import { SiteAboutPage } from '../pages/sitePages/siteAboutPage';
import { SiteContentPage } from '../pages/sitePages/siteContentPage';
import { SiteFeedPage } from '../pages/sitePages/siteFeedPage';
import { SiteFilesPage } from '../pages/sitePages/siteFilesPage';
import { SiteMainPage } from '../pages/sitePages/siteMainPage';
import { SiteManageSitePage } from '../pages/sitePages/siteManageSitePage';
import { SiteQuestionsPage } from '../pages/sitePages/siteQuestionsPage';

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
    contentManagementHelper: ContentManagementHelper;
    feedManagementHelper: FeedManagementHelper;

    // Utility functions
    loginAs: (userType: UserType) => Promise<void>;
    switchUser: (fromPage: Page, toUserType: UserType) => Promise<HomePageType>;

    // Site pages
    siteMainPage: SiteMainPage;
    siteFeedPage: SiteFeedPage;
    siteContentPage: SiteContentPage;
    siteQuestionsPage: SiteQuestionsPage;
    siteFilesPage: SiteFilesPage;
    siteAboutPage: SiteAboutPage;
    siteManageSitePage: SiteManageSitePage;

    // Components
    filesPreviewModalComponent: FilesPreviewModalComponent;
  },
  {
    // Worker-scoped fixtures
    appManagerApiClient: AppManagerApiClient;
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

  standardUserPage: [
    async ({ standardUserHomePage }, use) => {
      await use(standardUserHomePage.page);
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
    async ({}, use) => {
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

  siteMainPage: [
    async ({ page }, use) => {
      const siteMainPage = new SiteMainPage(page);
      await use(siteMainPage);
    },
    { scope: 'test' },
  ],

  siteFeedPage: [
    async ({ page }, use) => {
      const siteFeedPage = new SiteFeedPage(page);
      await use(siteFeedPage);
    },
    { scope: 'test' },
  ],
  siteContentPage: [
    async ({ page }, use) => {
      const siteContentPage = new SiteContentPage(page);
      await use(siteContentPage);
    },
    { scope: 'test' },
  ],
  siteQuestionsPage: [
    async ({ page }, use) => {
      const siteQuestionsPage = new SiteQuestionsPage(page);
      await use(siteQuestionsPage);
    },
    { scope: 'test' },
  ],
  siteFilesPage: [
    async ({ page }, use) => {
      const siteFilesPage = new SiteFilesPage(page);
      await use(siteFilesPage);
    },
    { scope: 'test' },
  ],
  siteAboutPage: [
    async ({ page }, use) => {
      const siteAboutPage = new SiteAboutPage(page);
      await use(siteAboutPage);
    },
    { scope: 'test' },
  ],
  siteManageSitePage: [
    async ({ page }, use) => {
      const siteManageSitePage = new SiteManageSitePage(page);
      await use(siteManageSitePage);
    },
    { scope: 'test' },
  ],

  filesPreviewModalComponent: [
    async ({ page }, use) => {
      const filesPreviewModalComponent = new FilesPreviewModalComponent(page);
      await use(filesPreviewModalComponent);
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type ContentTestFixture = typeof contentTestFixture;
