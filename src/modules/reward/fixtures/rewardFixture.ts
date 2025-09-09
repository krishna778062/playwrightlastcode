import { Page, test } from '@playwright/test';
import { ManageRewardsPage } from '@rewards/pages/manage-rewards/manage-rewards-page';
import { RewardOptionsPage } from '@rewards/pages/manage-rewards/reward-options-page';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
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
  standardUserHomePage: NewUxHomePage | OldUxHomePage;
  standardUserPage: Page;
  manageRewardsPage: ManageRewardsPage;
  rewardOptionsPage: RewardOptionsPage;
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

  //recognition manager
  recoManagerHomePage: [
    async ({ page }, use) => {
      const recognitionHomePage = await LoginHelper.loginWithPassword(page, {
        email: String(process.env['RECOGNITION_USER_USERNAME']),
        password: String(process.env['RECOGNITION_USER_PASSWORD']),
      });
      await recognitionHomePage.verifyThePageIsLoaded();
      await use(recognitionHomePage);
    },
    { scope: 'test' },
  ],
  recoManagerPage: [
    async ({ recoManagerHomePage }, use) => {
      await use(recoManagerHomePage.page);
    },
    { scope: 'test' },
  ],

  //standard user
  standardUserHomePage: [
    async ({ page }, use) => {
      const recognitionHomePage = await LoginHelper.loginWithPassword(page, {
        email: process.env['STANDARD_USER_USERNAME'] || getEnvConfig().appManagerEmail,
        password: process.env['STANDARD_USER_PASSWORD'] || getEnvConfig().appManagerPassword,
      });
      await recognitionHomePage.verifyThePageIsLoaded();
      await use(recognitionHomePage);
    },
    { scope: 'test' },
  ],
  standardUserPage: [
    async ({ standardUserHomePage }, use) => {
      await use(standardUserHomePage.page);
    },
    { scope: 'test' },
  ],
});
