import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { SiteAudienceHelper } from '@/src/core/helpers/siteAudienceHelper';
import { NewUxHomePage } from '@/src/core/ui/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/ui/pages/homePage/oldUxHomePage';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { FeedManagementHelper } from '@/src/modules/content/apis/helpers/feedManagementHelper';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';

export const contentAbacTestFixture = test.extend<
  {
    // App manager browser context, Request Context + page
    appManagerBrowserContext: BrowserContext;
    appManagerPage: Page;
    appManagerHomePage: NewUxHomePage | OldUxHomePage;

    // End user browser context, Request Context + page
    endUserContext: BrowserContext;
    endUserHomePage: NewUxHomePage | OldUxHomePage;
    endUserPage: Page;

    // Services and helpers for app manager
    feedManagementHelper: FeedManagementHelper;
    siteManagementService: SiteManagementService;
    siteAudienceHelper: SiteAudienceHelper;
  },
  {
    appManagerApiContext: APIRequestContext;
  }
>({
  appManagerApiContext: [
    async ({}, use) => {
      const appManagerApiContext = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(appManagerApiContext);
      await appManagerApiContext.dispose();
    },
    { scope: 'worker' },
  ],

  appManagerBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  appManagerPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  appManagerHomePage: [
    async ({ appManagerPage }, use) => {
      const appManagerHomePage = new NewUxHomePage(appManagerPage);
      await appManagerHomePage.loadPage();
      await appManagerHomePage.verifyThePageIsLoaded();
      await use(appManagerHomePage);
    },
    { scope: 'test' },
  ],

  siteManagementService: [
    async ({ appManagerApiContext }, use) => {
      const siteManagementService = new SiteManagementService(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(siteManagementService);
    },
    { scope: 'test' },
  ],

  siteAudienceHelper: [
    async ({ appManagerApiContext }, use) => {
      const siteAudienceHelper = new SiteAudienceHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(siteAudienceHelper);
    },
    { scope: 'test' },
  ],

  // Services and helpers - with proper cleanup
  feedManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const feedManagementHelper = new FeedManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
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

  endUserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const { endUserEmail, endUserPassword } = getEnvConfig();
      if (!endUserEmail || !endUserPassword) throw new Error('Missing END_USER creds in env');
      await LoginHelper.loginWithPassword(page, {
        email: endUserEmail,
        password: endUserPassword,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  endUserPage: [
    async ({ endUserContext }, use) => {
      const page = await endUserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  endUserHomePage: [
    async ({ endUserPage }, use) => {
      const endUserHomePage = new NewUxHomePage(endUserPage);
      await endUserHomePage.loadPage();
      await endUserHomePage.verifyThePageIsLoaded();
      await use(endUserHomePage);
    },
    { scope: 'test' },
  ],
});
