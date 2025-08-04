import { Page, test } from '@playwright/test';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { LoginHelper } from '@core/helpers/loginHelper';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

export const platformTestFixture = test.extend<{
  appManagerHomePage:NewUxHomePage|OldUxHomePage;
  appManagerPage:Page;
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
}); 