import { Browser, Page, test } from '@playwright/test';

import { AppAdoptionDashboardQueryHelper } from './appAdaptionQueryHelper';
import { MobileDashboardQueryHelper } from './mobileDashboardQueryHelper';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { SnowflakeHelper } from '@/src/modules/data-engineering/helpers';
import { SocialInteractionDashboardQueryHelper } from '@/src/modules/data-engineering/helpers';
import { AppAdoptionDashboard } from '@/src/modules/data-engineering/ui/dashboards/app-adoption/appAdoptionDashboard';
import { MobileDashboard } from '@/src/modules/data-engineering/ui/dashboards/mobile-dashboard/mobileDashboard';
import { SocialInteractionDashboard } from '@/src/modules/data-engineering/ui/dashboards/social-interaction/socialInteractionDashboard';

export enum UserRole {
  APP_MANAGER = 'appManager',
  STANDARD_USER = 'standardUser',
}

/**
 * Creates an authenticated session with login and home page setup
 */
async function createAuthenticatedSession(browser: Browser, userRole: UserRole): Promise<Page> {
  // Create browser context and page
  const context = await browser.newContext();
  const page = await context.newPage();

  // User credentials
  const users = {
    appManager: {
      email: process.env.APP_MANAGER_USERNAME || '',
      password: process.env.APP_MANAGER_PASSWORD || '',
    },
    standardUser: {
      email: process.env.STANDARD_USER_USERNAME || '',
      password: process.env.STANDARD_USER_PASSWORD || '',
    },
  };

  const user = users[userRole];

  // Login
  await LoginHelper.loginWithPassword(page, {
    email: user.email,
    password: user.password,
  });

  // Setup home page
  const homePage = new NewHomePage(page);
  await homePage.loadPage();
  await homePage.verifyThePageIsLoaded();

  return page;
}

/**
 * Creates Snowflake connection
 */
async function createSnowflakeConnection(): Promise<SnowflakeHelper> {
  const snowflakeHelper = new SnowflakeHelper();
  await snowflakeHelper.connect();
  return snowflakeHelper;
}

/**
 * Sets up Social Interaction Dashboard for testing
 */
export async function setupSocialInteractionDashboardForTest(
  browser: Browser,
  userRole: UserRole = UserRole.APP_MANAGER
): Promise<{
  page: Page;
  socialInteractionDashboard: SocialInteractionDashboard;
  socialInteractionQueryHelper: SocialInteractionDashboardQueryHelper;
  snowflakeHelper: SnowflakeHelper;
}> {
  return await test.step('Setup Social Interaction Dashboard', async () => {
    //login user
    const page = await createAuthenticatedSession(browser, userRole);
    //create snowflake connection
    const snowflakeHelper = await createSnowflakeConnection();

    //create social interaction query helper
    const orgId = process.env.ORG_ID || '';
    if (!orgId) {
      throw new Error('ORG_ID is not set, please set the ORG_ID environment variable');
    }
    const socialInteractionQueryHelper = new SocialInteractionDashboardQueryHelper(snowflakeHelper, orgId);

    //create social interaction dashboard
    const socialInteractionDashboard = new SocialInteractionDashboard(page);
    //load social interaction dashboard
    await socialInteractionDashboard.loadPage();

    console.log('Social Interaction Dashboard loaded successfully');

    return {
      page,
      socialInteractionDashboard,
      socialInteractionQueryHelper,
      snowflakeHelper,
    };
  });
}

/**
 * Sets up App Adoption Dashboard for testing
 */
export async function setupAppAdoptionDashboardForTest(
  browser: Browser,
  userRole: UserRole = UserRole.APP_MANAGER
): Promise<{
  page: Page;
  appAdoptionDashboard: AppAdoptionDashboard;
  snowflakeHelper: SnowflakeHelper;
  appAdoptionQueryHelper: AppAdoptionDashboardQueryHelper;
}> {
  //login user
  const page = await createAuthenticatedSession(browser, userRole);
  //create snowflake connection
  const snowflakeHelper = await createSnowflakeConnection();

  //create app adoption query helper
  const orgId = process.env.ORG_ID || '';
  if (!orgId) {
    throw new Error('ORG_ID is not set, please set the ORG_ID environment variable');
  }
  const appAdoptionQueryHelper = new AppAdoptionDashboardQueryHelper(snowflakeHelper, orgId);

  //create app adoption dashboard
  const appAdoptionDashboard = new AppAdoptionDashboard(page);
  await appAdoptionDashboard.loadPage();

  console.log('App Adoption Dashboard loaded successfully');

  return {
    page,
    appAdoptionDashboard,
    snowflakeHelper,
    appAdoptionQueryHelper,
  };
}

/**
 * Sets up Mobile Dashboard for testing
 */
export async function setupMobileDashboardForTest(
  browser: Browser,
  userRole: UserRole = UserRole.APP_MANAGER
): Promise<{
  page: Page;
  mobileDashboard: MobileDashboard;
  snowflakeHelper: SnowflakeHelper;
  mobileDashboardQueryHelper: MobileDashboardQueryHelper;
}> {
  return await test.step('Setup Mobile Dashboard', async () => {
    //login user
    const page = await createAuthenticatedSession(browser, userRole);
    //create snowflake connection
    const snowflakeHelper = await createSnowflakeConnection();

    //create mobile dashboard query helper
    const orgId = process.env.ORG_ID || '';
    if (!orgId) {
      throw new Error('ORG_ID is not set, please set the ORG_ID environment variable');
    }
    const mobileDashboardQueryHelper = new MobileDashboardQueryHelper(snowflakeHelper, orgId);

    //create mobile dashboard
    const mobileDashboard = new MobileDashboard(page);
    await mobileDashboard.loadPage();

    console.log('Mobile Dashboard loaded successfully');

    return {
      page,
      mobileDashboard,
      snowflakeHelper,
      mobileDashboardQueryHelper,
    };
  });
}

/**
 * Cleans up dashboard testing resources
 */
export async function cleanupDashboardTesting(resources: {
  snowflakeHelper: SnowflakeHelper;
  page: Page;
}): Promise<void> {
  return await test.step('Cleanup Dashboard Testing Resources', async () => {
    try {
      console.log('Destroying dashboard testing resources');
      await resources.snowflakeHelper.destroy();
      await resources.page.context().close();
    } catch (error) {
      console.warn('Dashboard cleanup failed:', error);
    }
  });
}
