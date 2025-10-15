import { BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { SnowflakeHelper } from '@/src/modules/data-engineering/helpers';
import { SocialInteractionDashboardQueryHelper } from '@/src/modules/data-engineering/helpers';
import { AnalyticsOverviewDashboard } from '@/src/modules/data-engineering/ui/dashboards';
import { AppAdoptionDashboard } from '@/src/modules/data-engineering/ui/dashboards/app-adoption/appAdoptionDashboard';
import { SocialInteractionDashboard } from '@/src/modules/data-engineering/ui/dashboards/social-interaction/socialInteractionDashboard';
import { AnalyticsLandingPage } from '@/src/modules/data-engineering/ui/pages/analyticsLandingPage';

// API-only fixture type for API contexts and services
export interface AnalyticsApiFixture {
  snowflakeHelper: SnowflakeHelper;
  socialInteractionQueryHelper: SocialInteractionDashboardQueryHelper;
  // Future: appAdoptionQueryHelper, contentEngagementQueryHelper, etc.
}

// UI-only fixture type for browser and page components
export interface AnalyticsUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
  analyticsLandingPage: AnalyticsLandingPage;
  analyticsOverviewDashboard: AnalyticsOverviewDashboard;
  socialInteractionDashboard: SocialInteractionDashboard;
  appAdoptionDashboard: AppAdoptionDashboard;
}

// Combined user fixture type that extends both API and UI fixtures
export interface AnalyticsUserFixture extends AnalyticsApiFixture, AnalyticsUiFixture {}

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
} as const;

// Helper function to create API-only fixtures
async function createAnalyticsApiFixture(snowflakeHelper: SnowflakeHelper): Promise<AnalyticsApiFixture> {
  const orgId = process.env.ORG_ID || '';
  if (!orgId) {
    throw new Error('ORG_ID is not set , please set the ORG_ID environment variable');
  }

  return {
    snowflakeHelper,
    socialInteractionQueryHelper: new SocialInteractionDashboardQueryHelper(snowflakeHelper, orgId),
    // Future: appAdoptionQueryHelper: new AppAdoptionDashboardQueryHelper(snowflakeHelper, orgId),
    // Future: contentEngagementQueryHelper: new ContentEngagementDashboardQueryHelper(snowflakeHelper, orgId),
  };
}

// Helper function to create UI-only fixtures for a specific user type
async function createAnalyticsUiFixture(browser: any, userType: UserType): Promise<AnalyticsUiFixture> {
  const user = users[userType];
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: user.email,
    password: user.password,
  });

  const homePage = new NewHomePage(page);
  await homePage.loadPage();
  await homePage.verifyThePageIsLoaded();

  const navigationHelper = new NavigationHelper(page);

  // Create analytics-specific page objects
  const analyticsLandingPage = new AnalyticsLandingPage(page);
  const analyticsOverviewDashboard = new AnalyticsOverviewDashboard(page);
  const socialInteractionDashboard = new SocialInteractionDashboard(page);
  const appAdoptionDashboard = new AppAdoptionDashboard(page);

  return {
    browserContext: context,
    page,
    homePage,
    navigationHelper,
    analyticsLandingPage,
    analyticsOverviewDashboard,
    socialInteractionDashboard,
    appAdoptionDashboard,
  };
}

export const analyticsTestFixture = test.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: AnalyticsApiFixture;
    standardUserApiFixture: AnalyticsApiFixture;

    // UI-only fixtures - browser and page components for each user
    appManagerUiFixture: AnalyticsUiFixture;
    standardUserUiFixture: AnalyticsUiFixture;

    // Combined user fixtures - complete entry points
    appManagerFixture: AnalyticsUserFixture;
    standardUserFixture: AnalyticsUserFixture;
  },
  {
    snowflakeHelper: SnowflakeHelper;
  }
>({
  snowflakeHelper: [
    async ({}, use) => {
      const snowflakeHelper = new SnowflakeHelper();
      await snowflakeHelper.connect();
      await use(snowflakeHelper);
      // Cleanup Snowflake connection
      try {
        console.log('Destroying snowflake helper at worker level');
        await snowflakeHelper.destroy();
      } catch (error) {
        console.warn('App manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'worker' },
  ],
  // API-only fixtures - fast, no browser overhead
  appManagerApiFixture: [
    async ({ snowflakeHelper }, use) => {
      const fixture = await createAnalyticsApiFixture(snowflakeHelper);
      await use(fixture);
    },
    { scope: 'test' },
  ],

  standardUserApiFixture: [
    async ({ snowflakeHelper }, use) => {
      const fixture = await createAnalyticsApiFixture(snowflakeHelper);
      await use(fixture);
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components for each user
  appManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createAnalyticsUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  standardUserUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createAnalyticsUiFixture(browser, 'standardUser');
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

  standardUserFixture: [
    async ({ standardUserUiFixture, standardUserApiFixture }, use) => {
      await use({ ...standardUserUiFixture, ...standardUserApiFixture });
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type AnalyticsTestFixture = typeof analyticsTestFixture;

/**
 * Usage Examples:
 *
 * // In your test files:
 *
 * // 1. Simple destructuring for page objects:
 * const { socialInteractionDashboard, socialInteractionQueryHelper } = appManagerFixture;
 * await socialInteractionDashboard.loadPage();
 *
 * const { appAdoptionDashboard } = appManagerFixture;
 * await appAdoptionDashboard.verifyThePageIsLoaded();
 *
 * // 2. Using query helpers:
 * const comparison = await socialInteractionQueryHelper.compareHeroMetricWithDB({
 *   uiValue: metricValue,
 *   query: metricData.query,
 *   orgId: orgId,
 *   timePeriod: PeriodFilterTimeRange.LAST_36_MONTHS,
 * });
 *
 * // 3. Benefits:
 * // - Simple, clean destructuring syntax
 * // - Query helpers use worker-level Snowflake connection (efficient)
 * // - Predictable, easy to understand
 * // - Consistent with content module pattern
 */
