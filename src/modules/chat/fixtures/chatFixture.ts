import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { FeedManagementHelper } from '@/src/modules/content/apis/helpers/feedManagementHelper';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';

// API-only fixture type for API helpers and services
export interface ChatApiFixture {
  apiContext: APIRequestContext;
  siteManagementHelper: SiteManagementHelper;
  feedManagementHelper: FeedManagementHelper;
}

// UI-only fixture type for browser and page components
export interface ChatUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
}

// Combined user fixture type that extends both API and UI fixtures
export interface ChatUserFixture extends ChatApiFixture, ChatUiFixture {}

export type UserType = 'appManager' | 'endUser';

export const users = {
  appManager: {
    email: process.env.APP_MANAGER_USERNAME || '',
    password: process.env.APP_MANAGER_PASSWORD || '',
  },
  endUser: {
    email: process.env.END_USER_USERNAME || '',
    password: process.env.END_USER_PASSWORD || '',
  },
};

// Helper function to create API-only fixtures using existing API contexts
async function createChatApiFixture(apiContext: APIRequestContext): Promise<ChatApiFixture> {
  const siteManagementHelper = new SiteManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const feedManagementHelper = new FeedManagementHelper(apiContext, getEnvConfig().apiBaseUrl);

  return {
    apiContext,
    siteManagementHelper,
    feedManagementHelper,
  };
}

// Helper function to create UI-only fixtures
async function createChatUiFixture(browser: any, userType: UserType): Promise<ChatUiFixture> {
  const user = users[userType];
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

export const chatTestFixture = test.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: ChatApiFixture;
    endUserApiFixture: ChatApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: ChatUiFixture;
    endUserUiFixture: ChatUiFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: ChatUserFixture;
    endUserFixture: ChatUserFixture;

    // Utility function for dynamic login
    loginAs: (userType: UserType) => Promise<void>;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    endUserApiContext: APIRequestContext;
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

  endUserApiContext: [
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
      const fixture = await createChatApiFixture(appManagerApiContext);
      await use(fixture);
      // Cleanup helpers that have cleanup methods
      try {
        await fixture.siteManagementHelper.cleanup();
        await fixture.feedManagementHelper.cleanup();
      } catch (error) {
        console.warn('App manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  endUserApiFixture: [
    async ({ endUserApiContext }, use) => {
      const fixture = await createChatApiFixture(endUserApiContext);
      await use(fixture);
      // Cleanup helpers that have cleanup methods
      try {
        await fixture.siteManagementHelper.cleanup();
        await fixture.feedManagementHelper.cleanup();
      } catch (error) {
        console.warn('End user API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components
  appManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createChatUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  endUserUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createChatUiFixture(browser, 'endUser');
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

  endUserFixture: [
    async ({ endUserUiFixture, endUserApiFixture }, use) => {
      await use({ ...endUserUiFixture, ...endUserApiFixture });
    },
    { scope: 'test' },
  ],

  // Utility function for dynamic login
  loginAs: async ({ page }, use) => {
    await use(async (userType: UserType) => {
      await LoginHelper.loginWithPassword(page, users[userType]);
    });
  },
});

export { test };
