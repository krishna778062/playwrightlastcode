import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@/src/core/api/factories/apiClientFactory';
import { FeedManagerService } from '@/src/core/api/services/FeedManagerService';
import { SiteManagementService } from '@/src/core/api/services/SiteManagementService';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';

export const contentAbacTestFixture = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerPage: Page;
  appManagerApiClient: AppManagerApiClient;
  endUserHomePage: NewUxHomePage | OldUxHomePage;
  endUserPage: Page;
  feedManagerService: FeedManagerService;
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

  endUserHomePage: [
    async ({ page }, use) => {
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

  feedManagerService: [
    async ({ endUserPage }, use) => {
      const feedManagerService = await ApiClientFactory.createClient(FeedManagerService, {
        type: 'cookies',
        page: endUserPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(feedManagerService);
    },
    { scope: 'test' },
  ],

  siteManagementService: [
    async ({ appManagerPage }, use) => {
      const siteManagementService = await ApiClientFactory.createClient(SiteManagementService, {
        type: 'cookies',
        page: appManagerPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(siteManagementService);
    },
    { scope: 'test' },
  ],
});
