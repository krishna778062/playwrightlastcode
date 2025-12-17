import { BrowserContext, Page, test } from '@playwright/test';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';

import { LoginHelper } from '@core/helpers/loginHelper';
import { NewHomePage } from '@core/pages/newHomePage';

// UI-only fixture type for browser and page components
export interface RewardUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
}

export type RewardUserType = 'appManager' | 'recoManager' | 'standardUser';

export const rewardUsers = {
  appManager: {
    email: getRewardTenantConfigFromCache().appManagerEmail,
    password: getRewardTenantConfigFromCache().appManagerPassword,
  },
  recoManager: {
    email: getRewardTenantConfigFromCache().recognitionManagerEmail,
    password: getRewardTenantConfigFromCache().recognitionManagerPassword,
  },
  standardUser: {
    email: getRewardTenantConfigFromCache().endUserEmail,
    password: getRewardTenantConfigFromCache().endUserPassword,
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
  appManagerFixture: RewardUiFixture;
  recoManagerFixture: RewardUiFixture;
  standardUserFixture: RewardUiFixture;
}>({
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

export type RewardTestFixture = typeof rewardTestFixture;
