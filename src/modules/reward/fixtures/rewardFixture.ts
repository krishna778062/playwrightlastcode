import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers';
import { getEnvConfig } from '@core/utils';

import { RequestContextFactory } from '@/src/core/api';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { ManageRewardsPage } from '@/src/modules/reward/ui/pages/manage-rewards/manage-rewards-page';
import { RewardOptionsPage } from '@/src/modules/reward/ui/pages/manage-rewards/reward-options-page';

export const rewardTestFixture = test.extend<
  {
    //app manager browser context, request context, page
    appManagerBrowserContext: BrowserContext;
    appManagerHomePage: NewHomePage;
    appManagerPage: Page;

    //recognition manager browser context, request context, page
    recoManagerBrowserContext: BrowserContext;
    recoManagerHomePage: NewHomePage;
    recoManagerPage: Page;

    //standard user browser context, request context, page
    standardUserBrowserContext: BrowserContext;
    standardUserPage: Page;
    standardUserHomePage: NewHomePage;
    manageRewardsPage: ManageRewardsPage;
    rewardOptionsPage: RewardOptionsPage;
  },
  {
    appManagerApiContext: APIRequestContext; //worker scoped api context
  }
>({
  appManagerApiContext: [
    async ({}, use) => {
      const appManagerApiContext = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(appManagerApiContext);
      await appManagerApiContext.dispose();
    },
    { scope: 'worker' },
  ],
  appManagerBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  appManagerPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  appManagerHomePage: [
    async ({ appManagerPage }, use) => {
      const appManagerHomePage = new NewHomePage(appManagerPage);
      await appManagerHomePage.loadPage();
      await appManagerHomePage.verifyThePageIsLoaded();
      await use(appManagerHomePage);
    },
    { scope: 'test' },
  ],

  //recognition manager
  recoManagerBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: process.env['RECOGNITION_USER_USERNAME']!,
        password: process.env['RECOGNITION_USER_PASSWORD']!,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  recoManagerPage: [
    async ({ recoManagerBrowserContext }, use) => {
      const page = await recoManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  recoManagerHomePage: [
    async ({ recoManagerPage }, use) => {
      const recognitionHomePage = new NewHomePage(recoManagerPage);
      await recognitionHomePage.loadPage();
      await recognitionHomePage.verifyThePageIsLoaded();
      await use(recognitionHomePage);
    },
    { scope: 'test' },
  ],

  //standard user
  standardUserBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: process.env['STANDARD_USER_USERNAME']!,
        password: process.env['STANDARD_USER_PASSWORD']!,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  standardUserPage: [
    async ({ standardUserBrowserContext }, use) => {
      const page = await standardUserBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  standardUserHomePage: [
    async ({ standardUserPage }, use) => {
      const recognitionHomePage = new NewHomePage(standardUserPage);
      await recognitionHomePage.loadPage();
      await recognitionHomePage.verifyThePageIsLoaded();
      await use(recognitionHomePage);
    },
    { scope: 'test' },
  ],
});
