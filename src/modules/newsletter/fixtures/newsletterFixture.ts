import { NewsletterNewUxHomePage, NewsletterOldUxHomePage } from '@newsletter/pages/newsletterHomeAdapters';
import { Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@core/pages/homePage/oldUxHomePage';
import { getEnvConfig } from '@core/utils/getEnvConfig';

const adaptHomePage = (homePage: NewUxHomePage | OldUxHomePage) => {
  if (homePage instanceof NewUxHomePage) {
    return new NewsletterNewUxHomePage(homePage.page);
  }
  return new NewsletterOldUxHomePage(homePage.page);
};

export const newsletterFixture = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerPage: Page;
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
});
