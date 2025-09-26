import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { NewUxHomePage } from '@/src/core/ui/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/ui/pages/homePage/oldUxHomePage';
import { ManageRewardsPage } from '@/src/modules/reward/ui/pages/manage-rewards/manage-rewards-page';
import { RewardOptionsPage } from '@/src/modules/reward/ui/pages/manage-rewards/reward-options-page';

export const rewardTestFixture = test.extend<
  {
    //app manager browser context, request context, page
    appManagerBrowserContext: BrowserContext;
    appManagerHomePage: NewUxHomePage | OldUxHomePage;
    appManagerPage: Page;

    //recognition manager browser context, request context, page
    recoManagerBrowserContext: BrowserContext;
    recoManagerHomePage: NewUxHomePage | OldUxHomePage;
    recoManagerPage: Page;

    //standard user browser context, request context, page
    standardUserBrowserContext: BrowserContext;
    standardUserPage: Page;
    standardUserHomePage: NewUxHomePage | OldUxHomePage;
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
      const adminHomePage = new NewUxHomePage(appManagerPage);
      await adminHomePage.verifyThePageIsLoaded();
      await use(adminHomePage);
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
      const recognitionHomePage = new NewUxHomePage(recoManagerPage);
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
      const recognitionHomePage = new NewUxHomePage(standardUserPage);
      await recognitionHomePage.verifyThePageIsLoaded();
      await use(recognitionHomePage);
    },
    { scope: 'test' },
  ],
});
