import { BrowserContext, Page, test as base } from '@playwright/test';

import { LoginHelper } from '@/src/core/helpers/loginHelper';

export type UserType = 'appManager' | 'standardUser';

export const users = {
  appManager: {
    email: process.env.APP_MANAGER_USERNAME || '',
    password: process.env.APP_MANAGER_PASSWORD || '',
  },
  standardUser: {
    email: process.env.STANDARD_USER_USERNAME || '',
    password: process.env.STANDARD_USER_PASSWORD || '',
  },
};

export const test = base.extend<{
  appManagerPage: Page;
  appManagerContext: BrowserContext;
  standardUserPage: Page;
  standardUserContext: BrowserContext;
}>({
  appManagerContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],
  appManagerPage: [
    async ({ appManagerContext }, use) => {
      const page = await appManagerContext.newPage();
      const appManagerHomePage = await LoginHelper.loginWithPassword(page, users.appManager);
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],
  standardUserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context?.close();
    },
    { scope: 'test' },
  ],
  standardUserPage: [
    async ({ standardUserContext }, use) => {
      const page = await standardUserContext.newPage();
      const standardUserHomePage = await LoginHelper.loginWithPassword(page, users.standardUser);
      await use(standardUserHomePage.page);
    },
    { scope: 'test' },
  ],
});
