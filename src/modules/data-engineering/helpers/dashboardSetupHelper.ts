import { Browser, Page, test } from '@playwright/test';

import { ContentDashboard } from '../ui/dashboards/content-dashboard/contentDashboard';

import { AppAdoptionDashboardQueryHelper } from './appAdaptionQueryHelper';
import { MobileDashboardQueryHelper } from './mobileDashboardQueryHelper';
import { MonthlyReportsQueryHelper } from './monthlyReportsQueryHelper';
import { PeopleDashboardQueryHelper } from './peopleDashboardQueryHelper';
import { SitesDashboardQueryHelper } from './sitesDashboardQueryHelper';

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import { ContentDashboardQueryHelper, SnowflakeHelper } from '@/src/modules/data-engineering/helpers';
import { SearchDashboardQueryHelper } from '@/src/modules/data-engineering/helpers';
import { SocialInteractionDashboardQueryHelper } from '@/src/modules/data-engineering/helpers';
import { AppAdoptionDashboard } from '@/src/modules/data-engineering/ui/dashboards/app-adoption/appAdoptionDashboard';
import { MobileDashboard } from '@/src/modules/data-engineering/ui/dashboards/mobile-dashboard/mobileDashboard';
import { MonthlyReportsDashboard } from '@/src/modules/data-engineering/ui/dashboards/monthly-reports/monthlyReportsDashboard';
import { OverviewDashboard } from '@/src/modules/data-engineering/ui/dashboards/overview/overviewDashboard';
import { PeopleDashboard } from '@/src/modules/data-engineering/ui/dashboards/people/peopleDashboard';
import { SearchDashboard } from '@/src/modules/data-engineering/ui/dashboards/search/searchDashboard';
import { SitesDashboard } from '@/src/modules/data-engineering/ui/dashboards/sites/sitesDashboard';
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

  // User credentials from config
  const config = getDataEngineeringConfigFromCache();
  const users = {
    appManager: {
      email: config.appManagerEmail,
      password: config.appManagerPassword,
    },
    standardUser: {
      email: config.standardUserEmail,
      password: config.standardUserPassword,
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
    const orgId = getDataEngineeringConfigFromCache().orgId;
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
  const orgId = getDataEngineeringConfigFromCache().orgId;
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
 * Sets up People Dashboard for testing
 */
export async function setupPeopleDashboardForTest(
  browser: Browser,
  userRole: UserRole = UserRole.APP_MANAGER
): Promise<{
  page: Page;
  peopleDashboard: PeopleDashboard;
  peopleQueryHelper: PeopleDashboardQueryHelper;
  snowflakeHelper: SnowflakeHelper;
}> {
  return await test.step('Setup People Dashboard', async () => {
    //login user
    const page = await createAuthenticatedSession(browser, userRole);
    //create snowflake connection
    const snowflakeHelper = await createSnowflakeConnection();

    //create people query helper
    const orgId = getDataEngineeringConfigFromCache().orgId;
    const peopleQueryHelper = new PeopleDashboardQueryHelper(snowflakeHelper, orgId);

    //create people dashboard
    const peopleDashboard = new PeopleDashboard(page);
    //load people dashboard
    await peopleDashboard.loadPage();

    return {
      page,
      peopleDashboard,
      peopleQueryHelper,
      snowflakeHelper,
    };
  });
}

/**
 * Sets up Search Dashboard for testing
 */
export async function setupSearchDashboardForTest(
  browser: Browser,
  userRole: UserRole = UserRole.APP_MANAGER
): Promise<{
  page: Page;
  searchDashboard: SearchDashboard;
  snowflakeHelper: SnowflakeHelper;
  searchDashboardQueryHelper: SearchDashboardQueryHelper;
}> {
  return await test.step('Setup Search Dashboard', async () => {
    //login user
    const page = await createAuthenticatedSession(browser, userRole);
    //create snowflake connection
    const snowflakeHelper = await createSnowflakeConnection();

    //create search dashboard query helper
    const orgId = getDataEngineeringConfigFromCache().orgId;
    const searchDashboardQueryHelper = new SearchDashboardQueryHelper(snowflakeHelper, orgId);

    //create search dashboard
    const searchDashboard = new SearchDashboard(page);
    //load search dashboard
    await searchDashboard.loadPage();

    console.log('Search Dashboard loaded successfully');

    return {
      page,
      searchDashboard,
      snowflakeHelper,
      searchDashboardQueryHelper,
    };
  });
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
    const orgId = getDataEngineeringConfigFromCache().orgId;
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
 * Sets up Monthly Reports Dashboard for testing
 */
export async function setupMonthlyReportsDashboardForTest(
  browser: Browser,
  userRole: UserRole = UserRole.APP_MANAGER
): Promise<{
  page: Page;
  monthlyReportsDashboard: MonthlyReportsDashboard;
  monthlyReportsQueryHelper: MonthlyReportsQueryHelper;
  snowflakeHelper: SnowflakeHelper;
}> {
  return await test.step('Setup Monthly Reports Dashboard', async () => {
    //login user
    const page = await createAuthenticatedSession(browser, userRole);
    //create snowflake connection
    const snowflakeHelper = await createSnowflakeConnection();

    //create monthly reports query helper
    const orgId = getDataEngineeringConfigFromCache().orgId;
    const monthlyReportsQueryHelper = new MonthlyReportsQueryHelper(snowflakeHelper, orgId);

    //create monthly reports dashboard
    const monthlyReportsDashboard = new MonthlyReportsDashboard(page);
    //load monthly reports dashboard
    await monthlyReportsDashboard.loadPage();

    console.log('Monthly Reports Dashboard loaded successfully');

    return {
      page,
      monthlyReportsDashboard,
      monthlyReportsQueryHelper,
      snowflakeHelper,
    };
  });
}

/**
 * Sets up Sites Dashboard for testing
 */
export async function setupSitesDashboardForTest(
  browser: Browser,
  userRole: UserRole = UserRole.APP_MANAGER
): Promise<{
  page: Page;
  sitesDashboard: SitesDashboard;
  snowflakeHelper: SnowflakeHelper;
  sitesDashboardQueryHelper: SitesDashboardQueryHelper;
}> {
  return await test.step('Setup Sites Dashboard', async () => {
    //login user
    const page = await createAuthenticatedSession(browser, userRole);
    //create snowflake connection
    const snowflakeHelper = await createSnowflakeConnection();

    //create sites dashboard query helper
    const orgId = getDataEngineeringConfigFromCache().orgId;
    const sitesDashboardQueryHelper = new SitesDashboardQueryHelper(snowflakeHelper, orgId);

    //create sites dashboard
    const sitesDashboard = new SitesDashboard(page);
    await sitesDashboard.loadPage();

    console.log('Sites Dashboard loaded successfully');

    return {
      page,
      sitesDashboard,
      snowflakeHelper,
      sitesDashboardQueryHelper,
    };
  });
}

/**
 * Sets up Overview Dashboard for testing
 */
export async function setupOverviewDashboardForTest(
  browser: Browser,
  userRole: UserRole = UserRole.APP_MANAGER
): Promise<{
  page: Page;
  overviewDashboard: OverviewDashboard;
  snowflakeHelper: SnowflakeHelper;
  appAdoptionQueryHelper: AppAdoptionDashboardQueryHelper;
  sitesDashboardQueryHelper: SitesDashboardQueryHelper;
  contentDashboardQueryHelper: ContentDashboardQueryHelper;
}> {
  return await test.step('Setup Overview Dashboard', async () => {
    //login user
    const page = await createAuthenticatedSession(browser, userRole);
    //create snowflake connection
    const snowflakeHelper = await createSnowflakeConnection();

    //create app adoption query helper (reused for overview dashboard)
    const orgId = getDataEngineeringConfigFromCache().orgId;
    const appAdoptionQueryHelper = new AppAdoptionDashboardQueryHelper(snowflakeHelper, orgId);

    //create sites dashboard query helper (reused for overview dashboard)
    const sitesDashboardQueryHelper = new SitesDashboardQueryHelper(snowflakeHelper, orgId);

    //create content dashboard query helper (reused for overview dashboard)
    const contentDashboardQueryHelper = new ContentDashboardQueryHelper(snowflakeHelper, orgId);

    //create overview dashboard
    const overviewDashboard = new OverviewDashboard(page);
    await overviewDashboard.loadPage();

    console.log('Overview Dashboard loaded successfully');

    return {
      page,
      overviewDashboard,
      snowflakeHelper,
      appAdoptionQueryHelper,
      sitesDashboardQueryHelper,
      contentDashboardQueryHelper,
    };
  });
}

/**
 * Sets up Content Dashboard for testing
 */
export async function setupContentDashboardForTest(
  browser: Browser,
  userRole: UserRole = UserRole.APP_MANAGER
): Promise<{
  page: Page;
  contentDashboard: ContentDashboard;
  snowflakeHelper: SnowflakeHelper;
  contentDashboardQueryHelper: ContentDashboardQueryHelper;
}> {
  return await test.step('Setup Content Dashboard', async () => {
    //login user
    const page = await createAuthenticatedSession(browser, userRole);
    //create snowflake connection
    const snowflakeHelper = await createSnowflakeConnection();

    //create content dashboard query helper
    const orgId = getDataEngineeringConfigFromCache().orgId;
    const contentDashboardQueryHelper = new ContentDashboardQueryHelper(snowflakeHelper, orgId);

    //create content dashboard
    const contentDashboard = new ContentDashboard(page);
    await contentDashboard.loadPage();

    console.log('Content Dashboard loaded successfully');

    return {
      page,
      contentDashboard,
      snowflakeHelper,
      contentDashboardQueryHelper,
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
