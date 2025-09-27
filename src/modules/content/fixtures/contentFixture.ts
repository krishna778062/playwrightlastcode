import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { AuthHelper } from '@/src/core/api/helpers/authHelper';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NewUxHomePage } from '@/src/core/ui/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/ui/pages/homePage/oldUxHomePage';
import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';
import { FeedManagementHelper } from '@/src/modules/content/apis/helpers/feedManagementHelper';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { FeedManagementService } from '@/src/modules/content/apis/services/FeedManagementService';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';
import { getContentTenantConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

export type UserType = 'appManager' | 'endUser';
export type HomePageType = NewUxHomePage | OldUxHomePage;

export const users = {
  appManager: {
    email: getContentTenantConfigFromCache().appManagerEmail,
    password: getContentTenantConfigFromCache().appManagerPassword,
  },

  endUser: {
    email: getContentTenantConfigFromCache().endUserEmail || '',
    password: getContentTenantConfigFromCache().endUserPassword || '',
  },

  siteManager: {
    email: getContentTenantConfigFromCache().siteManagerEmail || '',
    password: getContentTenantConfigFromCache().siteManagerPassword || '',
  },
} as const;

export const contentTestFixture = test.extend<
  {
    // App manager browser context, Request Context + page
    appManagerBrowserContext: BrowserContext;
    appManagersPage: Page;
    // Helpers and services
    siteManagementHelper: SiteManagementHelper;
    contentManagementHelper: ContentManagementHelper;
    feedManagementHelper: FeedManagementHelper;
    standardUserFeedManagementHelper: FeedManagementHelper;
    identityManagementHelper: IdentityManagementHelper;
    siteManagementService: SiteManagementService;

    // End user browser context, Request Context + page
    standardUserBrowserContext: BrowserContext;
    standardUserPage: Page;
    standardUserHomePage: HomePageType;

    // Site manager browser context, Request Context + page
    siteManagerBrowserContext: BrowserContext;
    siteManagerPage: Page;

    // Authenticated pages
    appManagerHomePage: HomePageType;
    endUserHomePage: NewUxHomePage | OldUxHomePage;
    endUsersPage: Page;
    siteManagerHomePage: HomePageType;
    feedManagerService: FeedManagementService;
    manageContentEndUserHelper: ContentManagementHelper;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    standardUserApiContext: APIRequestContext;
  }
>({
  // Worker-scoped API client - shared across all tests in worker
  appManagerApiContext: [
    async ({}, use) => {
      const appManagerApiContext = await RequestContextFactory.createAuthenticatedContext(
        getContentTenantConfigFromCache().apiBaseUrl,
        {
          email: getContentTenantConfigFromCache().appManagerEmail,
          password: getContentTenantConfigFromCache().appManagerPassword,
        }
      );

      await use(appManagerApiContext);
      await appManagerApiContext.dispose();
    },
    { scope: 'worker' },
  ],
  standardUserApiContext: [
    async ({}, use) => {
      const standardUserApiContext = await RequestContextFactory.createAuthenticatedContext(
        getContentTenantConfigFromCache().apiBaseUrl,
        {
          email: getContentTenantConfigFromCache().endUserEmail || '',
          password: getContentTenantConfigFromCache().endUserPassword || '',
        }
      );
      await use(standardUserApiContext);
      await standardUserApiContext.dispose();
    },
    { scope: 'worker' },
  ],
  // Browser contexts - isolated per test
  appManagerBrowserContext: [
    async ({ browser }, use) => {
      // const page = await context.newPage();
      // await LoginHelper.loginWithPassword(page, {
      //   email: getEnvConfig().appManagerEmail,
      //   password: getEnvConfig().appManagerPassword,
      // });
      // const appManagerHomePage = getEnvConfig().newUxEnabled ? new NewUxHomePage(page) : new OldUxHomePage(page);
      // // await appManagerHomePage.verifyThePageIsLoaded();
      // await use(context);
      // await page.close();
      // await context.close();
      // const context = await AuthHelper.getLoggedInBrowserContext(
      //   browser,
      //   getContentTenantConfigFromCache().apiBaseUrl,
      //   users.appManager
      // );
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getContentTenantConfigFromCache().appManagerEmail,
        password: getContentTenantConfigFromCache().appManagerPassword,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  // Authenticated home pages
  appManagersPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  appManagerHomePage: [
    async ({ appManagersPage }, use) => {
      const homePage = new NewUxHomePage(appManagersPage);
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
      await use(homePage);
    },
    { scope: 'test' },
  ],
  standardUserBrowserContext: [
    async ({ browser }, use) => {
      // const context = await browser.newContext({
      //   permissions: ['camera', 'microphone', 'notifications'],
      //   // Optimize context creation
      //   ignoreHTTPSErrors: true,
      //   // viewport: { width: 1920, height: 1080 },
      // });
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: users.endUser.email,
        password: users.endUser.password,
      });

      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  standardUserPage: [
    async ({ standardUserBrowserContext }, use) => {
      const page = await standardUserBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  siteManagerBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: users.siteManager.email,
        password: users.siteManager.password,
      });
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],
  siteManagerPage: [
    async ({ siteManagerBrowserContext }, use) => {
      const page = await siteManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  siteManagerHomePage: [
    async ({ siteManagerPage }, use) => {
      const homePage = new NewUxHomePage(siteManagerPage);
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
      await use(homePage);
    },
    { scope: 'test' },
  ],

  siteManagementService: [
    async ({ appManagerApiContext }, use) => {
      const siteManagementService = new SiteManagementService(
        appManagerApiContext,
        getContentTenantConfigFromCache().apiBaseUrl
      );
      await use(siteManagementService);
    },
    { scope: 'test' },
  ],
  standardUserHomePage: [
    async ({ standardUserPage }, use) => {
      const homePage = new NewUxHomePage(standardUserPage);
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
      await use(homePage);
    },
    { scope: 'test' },
  ],

  feedManagerService: [
    async ({ appManagerApiContext }, use) => {
      const feedManagerService = new FeedManagementService(
        appManagerApiContext,
        getContentTenantConfigFromCache().apiBaseUrl
      );
      await use(feedManagerService);
    },
    { scope: 'test' },
  ],

  // Services and helpers - with proper cleanup
  feedManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const feedManagementHelper = new FeedManagementHelper(
        appManagerApiContext,
        getContentTenantConfigFromCache().apiBaseUrl
      );
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
    async ({ appManagerApiContext }, use) => {
      const helper = new SiteManagementHelper(appManagerApiContext, getContentTenantConfigFromCache().apiBaseUrl);

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
    async ({ appManagerApiContext }, use) => {
      const helper = new ContentManagementHelper(appManagerApiContext, getContentTenantConfigFromCache().apiBaseUrl);

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

  identityManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const helper = new IdentityManagementHelper(appManagerApiContext, getContentTenantConfigFromCache().apiBaseUrl);

      await use(helper);
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type ContentTestFixture = typeof contentTestFixture;
