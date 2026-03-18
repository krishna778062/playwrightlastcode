import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { AnalyticsApiService } from '@/src/modules/data-engineering/api/services/AnalyticsApiService';
import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import { ContentModerationQueryHelper, SnowflakeHelper } from '@/src/modules/data-engineering/helpers';
import { ContentModerationAnalyticsDashboard } from '@/src/modules/data-engineering/ui/dashboards/content-moderation';

// API-only fixture type for API contexts and services
export interface ContentModerationAnalyticsApiFixture {
  apiContext: APIRequestContext;
  analyticsApiService: AnalyticsApiService;
  snowflakeHelper: SnowflakeHelper;
  contentModerationQueryHelper: ContentModerationQueryHelper;
}

// UI-only fixture type for browser and page components
export interface ContentModerationAnalyticsUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
  contentModerationAnalyticsDashboard: ContentModerationAnalyticsDashboard;
}

// Combined user fixture type that extends both API and UI fixtures
export interface ContentModerationAnalyticsUserFixture
  extends ContentModerationAnalyticsApiFixture,
    ContentModerationAnalyticsUiFixture {}

export type UserType = 'appManager' | 'standardUser';

// User credentials getter function
export function getUsers() {
  const config = getDataEngineeringConfigFromCache();
  return {
    appManager: {
      email: config.appManagerEmail,
      password: config.appManagerPassword,
    },
    standardUser: {
      email: config.standardUserEmail,
      password: config.standardUserPassword,
    },
  };
}

// Helper function to create API-only fixtures
async function createContentModerationAnalyticsApiFixture(
  apiContext: APIRequestContext,
  snowflakeHelper: SnowflakeHelper
): Promise<ContentModerationAnalyticsApiFixture> {
  const config = getDataEngineeringConfigFromCache();
  const orgId = config.orgId;
  const apiBaseUrl = config.apiBaseUrl;

  return {
    apiContext,
    analyticsApiService: new AnalyticsApiService(apiContext, apiBaseUrl),
    snowflakeHelper,
    contentModerationQueryHelper: new ContentModerationQueryHelper(snowflakeHelper, orgId),
  };
}

// Helper function to create UI-only fixtures for a specific user type
async function createContentModerationAnalyticsUiFixture(
  browser: any,
  userType: UserType
): Promise<ContentModerationAnalyticsUiFixture> {
  const users = getUsers();
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

  // Create content moderation analytics dashboard
  const contentModerationAnalyticsDashboard = new ContentModerationAnalyticsDashboard(page);

  return {
    browserContext: context,
    page,
    homePage,
    navigationHelper,
    contentModerationAnalyticsDashboard,
  };
}

export const contentModerationAnalyticsTestFixture = test.extend<
  {},
  {
    snowflakeHelper: SnowflakeHelper;

    // Worker-scoped API contexts
    appManagerApiContext: APIRequestContext;
    standardUserApiContext: APIRequestContext;

    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: ContentModerationAnalyticsApiFixture;
    standardUserApiFixture: ContentModerationAnalyticsApiFixture;

    // UI-only fixtures - browser and page components for each user
    appManagerUiFixture: ContentModerationAnalyticsUiFixture;
    standardUserUiFixture: ContentModerationAnalyticsUiFixture;

    // Combined user fixtures - complete entry points
    appManagerFixture: ContentModerationAnalyticsUserFixture;
    standardUserFixture: ContentModerationAnalyticsUserFixture;
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
        console.warn('Snowflake helper cleanup failed:', error);
      }
    },
    { scope: 'worker' },
  ],

  // Worker-scoped API contexts - shared across all tests in worker
  appManagerApiContext: [
    async ({}, use) => {
      const config = getDataEngineeringConfigFromCache();
      const context = await RequestContextFactory.createAuthenticatedContext(config.apiBaseUrl, {
        email: config.appManagerEmail,
        password: config.appManagerPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  standardUserApiContext: [
    async ({}, use) => {
      const config = getDataEngineeringConfigFromCache();
      const context = await RequestContextFactory.createAuthenticatedContext(config.apiBaseUrl, {
        email: config.standardUserEmail,
        password: config.standardUserPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead
  appManagerApiFixture: [
    async ({ appManagerApiContext, snowflakeHelper }, use) => {
      const fixture = await createContentModerationAnalyticsApiFixture(appManagerApiContext, snowflakeHelper);
      await use(fixture);
    },
    { scope: 'worker' },
  ],

  standardUserApiFixture: [
    async ({ standardUserApiContext, snowflakeHelper }, use) => {
      const fixture = await createContentModerationAnalyticsApiFixture(standardUserApiContext, snowflakeHelper);
      await use(fixture);
    },
    { scope: 'worker' },
  ],

  // UI-only fixtures - browser and page components for each user
  appManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createContentModerationAnalyticsUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'worker' },
  ],

  standardUserUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createContentModerationAnalyticsUiFixture(browser, 'standardUser');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'worker' },
  ],

  // Combined user fixtures - complete entry points
  appManagerFixture: [
    async ({ appManagerUiFixture, appManagerApiFixture }, use) => {
      await use({ ...appManagerUiFixture, ...appManagerApiFixture });
    },
    { scope: 'worker' },
  ],

  standardUserFixture: [
    async ({ standardUserUiFixture, standardUserApiFixture }, use) => {
      await use({ ...standardUserUiFixture, ...standardUserApiFixture });
    },
    { scope: 'worker' },
  ],
});

// Export commonly used types for better type safety
export type ContentModerationAnalyticsTestFixture = typeof contentModerationAnalyticsTestFixture;

/**
 * Usage Examples:
 *
 * // In your test files:
 *
 * import { contentModerationAnalyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/contentModerationAnalyticsFixture';
 *
 * test('verify content moderation analytics default load', async ({ appManagerFixture }) => {
 *   // Navigate to Content Moderation Analytics via Manage → Content Moderation → Analytics
 *   await appManagerFixture.navigationHelper.navigateToContentModerationAnalytics();
 *
 *   // Use the dashboard from fixture
 *   const { contentModerationAnalyticsDashboard, contentModerationQueryHelper } = appManagerFixture;
 *
 *   // Get expected value from DB
 *   const expectedValue = await contentModerationQueryHelper.getTotalSourcesDataFromDBWithFilters({
 *     filterBy: { tenantCode: 'xxx', timePeriod: 'Last 30 days' }
 *   });
 *
 *   // Verify UI matches DB
 *   await contentModerationAnalyticsDashboard.totalSources.verifyMetricValue(expectedValue);
 * });
 */
