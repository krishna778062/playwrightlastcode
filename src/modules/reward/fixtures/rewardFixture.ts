import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '../../../core/api/factories/requestContextFactory';
import { LoginHelper } from '../../../core/helpers/loginHelper';
import { NavigationHelper } from '../../../core/helpers/navigationHelper';
import { getEnvConfig } from '../../../core/utils/getEnvConfig';
import { ManageRewardsOverviewPage } from '../pages/manage-rewards/manage-rewards-overview-page';

// API-only fixture type for API helpers and services
export interface RewardApiFixture {
  apiContext: APIRequestContext;
}

// UI-only fixture type for browser and page components
export interface RewardUiFixture {
  browserContext: BrowserContext;
  page: Page;
  manageRewards: ManageRewardsOverviewPage;
  navigationHelper: NavigationHelper;
}

// Combined user fixture type that extends both API and UI fixtures
export interface RewardUserFixture extends RewardApiFixture, RewardUiFixture {}

export type RewardUserType = 'appManager' | 'recoManager' | 'standardUser';

export const rewardUsers = {
  appManager: {
    email: getEnvConfig().appManagerEmail,
    password: getEnvConfig().appManagerPassword,
  },
  recoManager: {
    email: process.env['RECOGNITION_USER_USERNAME']!,
    password: process.env['RECOGNITION_USER_PASSWORD']!,
  },
  standardUser: {
    email: process.env['STANDARD_USER_USERNAME']!,
    password: process.env['STANDARD_USER_PASSWORD']!,
  },
} as const;

// Helper function to create API-only fixtures using existing API contexts
async function createRewardApiFixture(apiContext: APIRequestContext): Promise<RewardApiFixture> {
  return {
    apiContext,
  };
}

// Helper function to create UI-only fixtures
async function createRewardUiFixture(browser: any, userType: RewardUserType): Promise<RewardUiFixture> {
  const user = rewardUsers[userType];
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: user.email,
    password: user.password,
  });

  const manageRewards = new ManageRewardsOverviewPage(page);
  await manageRewards.loadPage();
  await manageRewards.verifyThePageIsLoaded();

  const navigationHelper = new NavigationHelper(page);

  return {
    browserContext: context,
    page,
    manageRewards,
    navigationHelper,
  };
}

export const rewardTestFixture = test.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: RewardApiFixture;
    recoManagerApiFixture: RewardApiFixture;
    standardUserApiFixture: RewardApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: RewardUiFixture;
    recoManagerUiFixture: RewardUiFixture;
    standardUserUiFixture: RewardUiFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: RewardUserFixture;
    recoManagerFixture: RewardUserFixture;
    standardUserFixture: RewardUserFixture;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    recoManagerApiContext: APIRequestContext;
    standardUserApiContext: APIRequestContext;
  }
>({
  // Worker-scoped API contexts - shared across all tests in worker
  appManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  recoManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: process.env['RECOGNITION_USER_USERNAME']!,
        password: process.env['RECOGNITION_USER_PASSWORD']!,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  standardUserApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: process.env['STANDARD_USER_USERNAME']!,
        password: process.env['STANDARD_USER_PASSWORD']!,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead, using worker-scoped contexts
  appManagerApiFixture: [
    async ({ appManagerApiContext }, use) => {
      const fixture = await createRewardApiFixture(appManagerApiContext);
      await use(fixture);
    },
    { scope: 'test' },
  ],

  recoManagerApiFixture: [
    async ({ recoManagerApiContext }, use) => {
      const fixture = await createRewardApiFixture(recoManagerApiContext);
      await use(fixture);
    },
    { scope: 'test' },
  ],

  standardUserApiFixture: [
    async ({ standardUserApiContext }, use) => {
      const fixture = await createRewardApiFixture(standardUserApiContext);
      await use(fixture);
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components
  appManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createRewardUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  recoManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createRewardUiFixture(browser, 'recoManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  standardUserUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createRewardUiFixture(browser, 'standardUser');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  // Combined user fixtures - complete entry points
  appManagerFixture: [
    async ({ appManagerUiFixture, appManagerApiFixture }, use) => {
      await use({ ...appManagerUiFixture, ...appManagerApiFixture });
    },
    { scope: 'test' },
  ],

  recoManagerFixture: [
    async ({ recoManagerUiFixture, recoManagerApiFixture }, use) => {
      await use({ ...recoManagerUiFixture, ...recoManagerApiFixture });
    },
    { scope: 'test' },
  ],

  standardUserFixture: [
    async ({ standardUserUiFixture, standardUserApiFixture }, use) => {
      await use({ ...standardUserUiFixture, ...standardUserApiFixture });
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type RewardTestFixture = typeof rewardTestFixture;
