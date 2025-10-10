import { Page, test as base } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { NavigationHelper } from '@/src/core/helpers/navigationHelper';

export const appManagerFixture = base.extend<{
  appManager: Page;
  appManagerNavigationHelper: NavigationHelper;
}>({
  appManager: [
    async ({ page }, use) => {
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(page);
    },
    { scope: 'test' },
  ],

  appManagerNavigationHelper: [
    async ({ appManager }, use) => {
      const appManagerNavigationHelper = new NavigationHelper(appManager);
      await use(appManagerNavigationHelper);
    },
    { scope: 'test' },
  ],
});
