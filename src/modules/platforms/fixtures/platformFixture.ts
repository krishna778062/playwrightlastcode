import { Page, test } from '@playwright/test';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { LoginHelper } from '@core/helpers/loginHelper';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';
import { ApiClientFactory } from '@/src/core/api/factories/apiClientFactory';
import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';

export const platformTestFixture = test.extend<{
  appManagerHomePage:NewUxHomePage|OldUxHomePage;
  appManagerPage:Page;
  appManagerApiClient: AppManagerApiClient;
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
      await use(appManagerHomePage.page as Page);
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
}); 