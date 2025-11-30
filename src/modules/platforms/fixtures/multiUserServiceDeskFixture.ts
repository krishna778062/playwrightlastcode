import { BrowserContext, Page, test } from '@playwright/test';

import { LoginPage } from '@core/ui/pages/loginPage';

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
      // Navigate to Service Desk login page and perform login without using LoginHelper
      await page.goto(`${serviceDeskUrl}/login`, { waitUntil: 'domcontentloaded' });
      const loginPage = new LoginPage(page);
      await loginPage.performLoginWithPassword(process.env.SERVICE_DESK_USERNAME!, process.env.SERVICE_DESK_PASSWORD!);
      await page.waitForURL(/\/home/, { waitUntil: 'domcontentloaded' });
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
      // Navigate to Service Desk login page and perform login without using LoginHelper
      await page.goto(`${serviceDeskUrl}/login`, { waitUntil: 'domcontentloaded' });
      const loginPage = new LoginPage(page);
      await loginPage.performLoginWithPassword(process.env.SUPPORT_TEAM_MEMBER!, process.env.SERVICE_DESK_PASSWORD!);
      await page.waitForURL(/\/home/, { waitUntil: 'domcontentloaded' });
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
      // Navigate to Service Desk login page and perform login without using LoginHelper
      await page.goto(`${serviceDeskUrl}/login`, { waitUntil: 'domcontentloaded' });
      const loginPage = new LoginPage(page);
      await loginPage.performLoginWithPassword(process.env.END_USER!, process.env.SERVICE_DESK_PASSWORD!);
      await page.waitForURL(/\/home/, { waitUntil: 'domcontentloaded' });
      console.log('End user logged in successfully');

      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
});
