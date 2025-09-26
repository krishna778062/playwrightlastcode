import { BrowserContext, Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@/src/core/api/factories/apiClientFactory';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NewUxHomePage } from '@/src/core/ui/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/ui/pages/homePage/oldUxHomePage';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { FeedManagementHelper } from '@/src/modules/content/apis/helpers/feedManagementHelper';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';

export const contentAbacTestFixture = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerPage: Page;
  appManagerApiClient: AppManagerApiClient;
  endUserContext: BrowserContext;
  endUserHomePage: NewUxHomePage | OldUxHomePage;
  endUserPage: Page;
  feedManagementHelper: FeedManagementHelper;
  siteManagementService: SiteManagementService;
}>({
  appManagerHomePage: [
    async ({ page }, use) => {
      const adminHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await adminHomePage.verifyThePageIsLoaded();
      await use(adminHomePage);
    },
    { scope: 'test' },
  ],

  appManagerPage: [
    async ({ appManagerHomePage }, use) => {
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],

  appManagerApiClient: [
    async ({ appManagerPage }, use) => {
      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'cookies',
        page: appManagerPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(appManagerApiClient);
    },
    { scope: 'test' },
  ],

  siteManagementService: [
    async ({ appManagerApiClient }, use) => {
      const siteManagementService = new SiteManagementService(appManagerApiClient.context);
      await use(siteManagementService);
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

  endUserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],

  endUserHomePage: [
    async ({ endUserContext }, use) => {
      const page = await endUserContext.newPage();
      const { endUserEmail, endUserPassword } = getEnvConfig();
      if (!endUserEmail || !endUserPassword) throw new Error('Missing END_USER creds in env');
      const endUserHomePage = await LoginHelper.loginWithPassword(page, {
        email: endUserEmail,
        password: endUserPassword,
      });
      await endUserHomePage.verifyThePageIsLoaded();
      await use(endUserHomePage);
    },
    { scope: 'test' },
  ],

  endUserPage: [
    async ({ endUserHomePage }, use) => {
      await use(endUserHomePage.page);
    },
    { scope: 'test' },
  ],
});
