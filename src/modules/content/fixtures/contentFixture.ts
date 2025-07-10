import { Page, test } from '@playwright/test';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { LoginHelper } from '@core/helpers/loginHelper';

export const contentTestFixture = test.extend<{
  adminPage: Page;
  appManagerApiClient: AppManagerApiClient;
}>({
  adminPage: [
    async ({ page }, use) => {
      const adminHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(adminHomePage.page as Page);
    },
    { scope: 'test' },
  ],
  appManagerApiClient: [
    async ({ adminPage }, use) => {
      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'cookies',
        page: adminPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(appManagerApiClient);
    },
    { scope: 'test' },
  ],
}); 