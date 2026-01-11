import { NewsletterHomePageAdapter } from '@newsletter/pages/newsletterHomeAdapters';
import { Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { NewHomePage } from '@core/ui/pages/newHomePage';
import { getEnvConfig } from '@core/utils/getEnvConfig';

/**
 * Adapts a NewHomePage instance to NewsletterHomePageAdapter.
 * Since LoginHelper always returns NewHomePage, this is a straightforward conversion.
 */
const adaptHomePage = (homePage: NewHomePage): NewsletterHomePageAdapter => {
  return new NewsletterHomePageAdapter(homePage.page);
};

export const newsletterFixture = test.extend<{
  appManagerHomePage: NewsletterHomePageAdapter;
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
