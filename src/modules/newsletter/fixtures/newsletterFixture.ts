import { NewsletterNewUxHomePage, NewsletterOldUxHomePage } from '@newsletter/pages/newsletterHomeAdapters';
import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

const adaptHomePage = (homePage: NewUxHomePage | OldUxHomePage) => {
  if (homePage instanceof NewUxHomePage) {
    return new NewsletterNewUxHomePage(homePage.page);
  }
  return new NewsletterOldUxHomePage(homePage.page);
};

export const newsletterFixture = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerPage: Page;
  appManagerApiClient: AppManagerApiClient;
  enlManagerHomePage: NewUxHomePage | OldUxHomePage;
  enlManagerPage: Page;
  standardUserHomePage: NewUxHomePage | OldUxHomePage;
  standardUserPage: Page;
}>({
  appManagerHomePage: [
    async ({ page }, use) => {
      const adminHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      const newsletterHomePage = adaptHomePage(adminHomePage);
      await newsletterHomePage.verifyThePageIsLoaded();
      await use(newsletterHomePage);
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
  enlManagerHomePage: [
    async ({ page }, use) => {
      const recognitionHomePage = await LoginHelper.loginWithPassword(page, {
        email: String(process.env['ENL_MANAGER_USERNAME']),
        password: String(process.env['ENL_MANAGER_PASSWORD']),
      });
      const newsletterHomePage = adaptHomePage(recognitionHomePage);
      await newsletterHomePage.verifyThePageIsLoaded();
      await use(newsletterHomePage);
    },
    { scope: 'test' },
  ],
  enlManagerPage: [
    async ({ enlManagerHomePage }, use) => {
      await use(enlManagerHomePage.page);
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
      const newsletterHomePage = adaptHomePage(recognitionHomePage);
      await newsletterHomePage.verifyThePageIsLoaded();
      await use(newsletterHomePage);
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
