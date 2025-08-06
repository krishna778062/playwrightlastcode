import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

export const rewardTestFixture = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerPage: Page;
  appManagerApiClient: AppManagerApiClient;
  recoManagerHomePage: NewUxHomePage | OldUxHomePage;
  recoManagerPage: Page;
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
  // Reco Manager setup
  recoManagerHomePage: [
    async ({ page }, use) => {
      const recoHomePage = await LoginHelper.loginWithPassword(page, {
        email: process.env['RECOGNITION_USER_USERNAME'],
        password: process.env['RECOGNITION_USER_PASSWORD'],
      });
      await recoHomePage.verifyThePageIsLoaded();
      await use(recoHomePage);
    },
    { scope: 'test' },
  ],
  recoManagerPage: [
    async ({ recoManagerHomePage }, use) => {
      await use(recoManagerHomePage.page);
    },
    { scope: 'test' },
  ],
});
