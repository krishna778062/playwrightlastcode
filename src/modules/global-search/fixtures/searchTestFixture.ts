import { Page, test } from '@playwright/test';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { LoginHelper } from '../../../core/helpers/loginHelper';

export const searchTestFixtures = test.extend<{
  appManagerUserPage: Page;
  appManagerApiClient: AppManagerApiClient;
}>({
  appManagerUserPage: [
    async ({ page }, use, workerInfo) => {
      const appManagerUserPage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(appManagerUserPage.page as Page);
    },
    { scope: 'test' },
  ],
  appManagerApiClient: [
    async ({ appManagerUserPage }, use, workerInfo) => {
      console.log(`INFO: Setting up app manager client for worker => `, workerInfo.workerIndex);
      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'cookies',
        page: appManagerUserPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(appManagerApiClient);
    },
    { scope: 'test' },
  ],
});
