import { Page, test } from '@playwright/test';

import { LoginPage } from '@core/pages/loginPage';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

export const frontlineTestFixture = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerUserPage: Page;
}>({
  appManagerHomePage: [
    async ({ page }, use) => {
      await page.goto(getEnvConfig().frontendBaseUrl);
      const loginPage = new LoginPage(page);

      try {
        const appManagerHomePage = await loginPage.actions.performLogin(
          getEnvConfig().appManagerEmail,
          getEnvConfig().appManagerPassword
        );

        await appManagerHomePage.verifyThePageIsLoaded();
        await use(appManagerHomePage);
      } catch (error) {
        throw new Error(`Login failed: ${error}`);
      }
    },
    { scope: 'test' },
  ],
  appManagerUserPage: [
    async ({ appManagerHomePage }, use) => {
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],
});
