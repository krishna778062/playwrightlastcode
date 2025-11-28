import { BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';

export const multiUserServiceDeskFixture = test.extend<{
  // Admin browser context + page
  adminBrowserContext: BrowserContext;
  adminServiceDeskPage: Page;
  // Support team member browser context + page
  supportTeamBrowserContext: BrowserContext;
  supportTeamPage: Page;
  // End user browser context + page
  endUserBrowserContext: BrowserContext;
  endUserPage: Page;
}>({
  // Admin context
  adminBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  adminServiceDeskPage: [
    async ({ adminBrowserContext }, use) => {
      const page = await adminBrowserContext.newPage();
      const serviceDeskUrl = process.env.SERVICE_DESK_URL;
      if (!serviceDeskUrl) {
        throw new Error('SERVICE_DESK_URL not configured in environment variables');
      }

      console.log(`Logging in admin user: ${process.env.SERVICE_DESK_USERNAME}`);
      await LoginHelper.loginWithPassword(page, {
        email: process.env.SERVICE_DESK_USERNAME!,
        password: process.env.SERVICE_DESK_PASSWORD!,
      });
      console.log('Admin user logged in successfully');

      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  supportTeamBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  // Support team page (logged in as SUPPORT_TEAM_MEMBER)
  supportTeamPage: [
    async ({ supportTeamBrowserContext }, use) => {
      const page = await supportTeamBrowserContext.newPage();
      const serviceDeskUrl = process.env.SERVICE_DESK_URL;
      if (!serviceDeskUrl) {
        throw new Error('SERVICE_DESK_URL not configured in environment variables');
      }

      console.log(`Logging in support team member: ${process.env.SUPPORT_TEAM_MEMBER}`);
      await LoginHelper.loginWithPassword(page, {
        email: process.env.SUPPORT_TEAM_MEMBER!,
        password: process.env.SERVICE_DESK_PASSWORD!,
      });
      console.log('Support team member logged in successfully');

      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  // End user
  endUserBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  // End user page (logged in as END_USER)
  endUserPage: [
    async ({ endUserBrowserContext }, use) => {
      const page = await endUserBrowserContext.newPage();
      const serviceDeskUrl = process.env.SERVICE_DESK_URL;
      if (!serviceDeskUrl) {
        throw new Error('SERVICE_DESK_URL not configured in environment variables');
      }

      console.log(`Logging in end user: ${process.env.END_USER}`);
      await LoginHelper.loginWithPassword(page, {
        email: process.env.END_USER!,
        password: process.env.SERVICE_DESK_PASSWORD!,
      });
      console.log('End user logged in successfully');

      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
});
