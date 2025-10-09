import { Page, test as base } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

export const appManagerFixture = base.extend<{
  appManager: Page;
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
});
