import { BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { NewHomePage } from '@core/pages/newHomePage';
import { getEnvConfig } from '@core/utils/getEnvConfig';

// UI-only fixture type for browser and page components
export interface RewardUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
}

export type RewardUserType = 'appManager' | 'recoManager' | 'standardUser';

export const rewardUsers = {
  appManager: {
    email: getEnvConfig().appManagerEmail,
    password: getEnvConfig().appManagerPassword,
  },
  recoManager: {
    email: process.env['RECOGNITION_USER_USERNAME'] || '',
    password: process.env['RECOGNITION_USER_PASSWORD'] || '',
  },
  standardUser: {
    email: process.env['STANDARD_USER_USERNAME'] || '',
    password: process.env['STANDARD_USER_PASSWORD'] || '',
  },
} as const;

// Helper function to create UI-only fixtures
async function createRewardUiFixture(browser: any, userType: RewardUserType): Promise<RewardUiFixture> {
  const user = rewardUsers[userType];
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: user.email,
    password: user.password,
  });

  const homePage = new NewHomePage(page);
  await homePage.verifyThePageIsLoaded();

  return {
    browserContext: context,
    page,
    homePage,
  };
}

export const rewardTestFixture = test.extend<{
  // UI-only fixtures - browser and page components
  appManagerFixture: RewardUiFixture;
  recoManagerFixture: RewardUiFixture;
  standardUserFixture: RewardUiFixture;
}>({
  // UI-only fixtures - browser and page components
  appManagerFixture: [
    async ({ browser }, use) => {
      const fixture = await createRewardUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  recoManagerFixture: [
    async ({ browser }, use) => {
      const fixture = await createRewardUiFixture(browser, 'recoManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  standardUserFixture: [
    async ({ browser }, use) => {
      const fixture = await createRewardUiFixture(browser, 'standardUser');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type RewardTestFixture = typeof rewardTestFixture;
