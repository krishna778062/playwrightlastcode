import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { FeedManagerService } from '@core/api/services/FeedManagerService';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

export const contentTestFixture = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerPage: Page;
  appManagerApiClient: AppManagerApiClient;
  endUserHomePage: NewUxHomePage | OldUxHomePage;
  endUserPage: Page;
  feedManagerService: FeedManagerService;
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
      const endUserHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().endUserEmail!,
        password: getEnvConfig().endUserPassword!,
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
});
