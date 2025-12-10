import { BrowserContext, Page, test } from '@playwright/test';

import { LoginPage } from '@core/ui/pages/loginPage';

/**
 * Helper function to get environment variable with error handling
 */
function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} not set in environment variables`);
  return value;
}

/**
 * Helper function to create a logged-in page for a given user
 */
async function createLoggedInPage(ctx: BrowserContext, usernameEnv: string): Promise<Page> {
  const serviceDeskUrl = getEnv('SERVICE_DESK_URL');
  const username = getEnv(usernameEnv);
  const password = getEnv('SERVICE_DESK_PASSWORD');

  const page = await ctx.newPage();
  await page.goto(`${serviceDeskUrl}/login`, { waitUntil: 'domcontentloaded' });

  const loginPage = new LoginPage(page);
  await loginPage.performLoginWithPassword(username, password);
  await page.waitForURL(/\/home/, { waitUntil: 'domcontentloaded' });

  console.log(`Logged in: ${username}`);
  return page;
}

export const multiUserServiceDeskFixture = test.extend<{
  adminBrowserContext: BrowserContext;
  adminServiceDeskPage: Page;

  supportTeamBrowserContext: BrowserContext;
  supportTeamPage: Page;

  endUserBrowserContext: BrowserContext;
  endUserPage: Page;
}>({
  adminBrowserContext: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    await use(ctx);
    await ctx.close();
  },

  adminServiceDeskPage: async ({ adminBrowserContext }, use) => {
    const page = await createLoggedInPage(adminBrowserContext, 'SERVICE_DESK_USERNAME');
    await use(page);
    await page.close();
  },

  supportTeamBrowserContext: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    await use(ctx);
    await ctx.close();
  },

  supportTeamPage: async ({ supportTeamBrowserContext }, use) => {
    const page = await createLoggedInPage(supportTeamBrowserContext, 'SUPPORT_TEAM_MEMBER');
    await use(page);
    await page.close();
  },

  endUserBrowserContext: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    await use(ctx);
    await ctx.close();
  },

  endUserPage: async ({ endUserBrowserContext }, use) => {
    const page = await createLoggedInPage(endUserBrowserContext, 'END_USER');
    await use(page);
    await page.close();
  },
});
