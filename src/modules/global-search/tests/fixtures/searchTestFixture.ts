import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { AppsManagementService } from '@/src/core/api/services/AppsManagementService';
import { LinkManagementService } from '@/src/core/api/services/LinkManagementService';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';
import { FeedManagementHelper } from '@/src/modules/content/apis/helpers/feedManagementHelper';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { TileManagementHelper } from '@/src/modules/content/apis/helpers/tileManagementHelper';
import { EnterpriseSearchService } from '@/src/modules/global-search/apis/services/EnterpriseSearchService';
import { ExternalSearchManagementService } from '@/src/modules/global-search/apis/services/ExternalSearchManagementService';
import { IntranetFileHelper } from '@/src/modules/global-search/ui/helpers/intranetFileHelper';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';
import { AppConfigurationService } from '@/src/modules/platforms/apis/services/AppConfigurationService';
import { ExpertiseManagementService } from '@/src/modules/platforms/apis/services/ExpertiseManagementService';

// API-only fixture type for API helpers and services
export interface SearchApiFixture {
  apiContext: APIRequestContext;
  contentManagementHelper: ContentManagementHelper;
  feedManagementHelper: FeedManagementHelper;
  siteManagementHelper: SiteManagementHelper;
  tileManagementHelper: TileManagementHelper;
  appManagementService: AppsManagementService;
  linkManagementService: LinkManagementService;
  externalSearchManagementService: ExternalSearchManagementService;
  enterpriseSearchService: EnterpriseSearchService;
  expertiseManagementService: ExpertiseManagementService;
  identityManagementHelper: IdentityManagementHelper;
  appConfigurationService: AppConfigurationService;
}

// UI-only fixture type for browser and page components
export interface SearchUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
  intranetFileHelper: IntranetFileHelper;
}

// Combined user fixture type that extends both API and UI fixtures
export interface SearchUserFixture extends SearchApiFixture, SearchUiFixture {}

// Helper function to create API-only fixtures using existing API contexts
async function createSearchApiFixture(apiContext: APIRequestContext): Promise<SearchApiFixture> {
  const contentManagementHelper = new ContentManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const feedManagementHelper = new FeedManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const siteManagementHelper = new SiteManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const tileManagementHelper = new TileManagementHelper(
    apiContext,
    getEnvConfig().apiBaseUrl,
    getEnvConfig().frontendBaseUrl
  );
  const appManagementService = new AppsManagementService(apiContext, getEnvConfig().apiBaseUrl);
  const linkManagementService = new LinkManagementService(apiContext, getEnvConfig().apiBaseUrl);
  const externalSearchManagementService = new ExternalSearchManagementService(apiContext, getEnvConfig().apiBaseUrl);
  const enterpriseSearchService = new EnterpriseSearchService(apiContext, getEnvConfig().apiBaseUrl);
  const expertiseManagementService = new ExpertiseManagementService(apiContext, getEnvConfig().apiBaseUrl);
  const identityManagementHelper = new IdentityManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const appConfigurationService = new AppConfigurationService(apiContext, getEnvConfig().apiBaseUrl);

  return {
    apiContext,
    contentManagementHelper,
    feedManagementHelper,
    siteManagementHelper,
    tileManagementHelper,
    appManagementService,
    linkManagementService,
    externalSearchManagementService,
    enterpriseSearchService,
    expertiseManagementService,
    identityManagementHelper,
    appConfigurationService,
  };
}

// Helper function to create UI-only fixtures
async function createSearchUiFixture(browser: any, apiContext: APIRequestContext): Promise<SearchUiFixture> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: getEnvConfig().appManagerEmail,
    password: getEnvConfig().appManagerPassword,
  });

  const homePage = new NewHomePage(page);

  const navigationHelper = new NavigationHelper(page);
  const intranetFileHelper = new IntranetFileHelper(apiContext, getEnvConfig().apiBaseUrl, page);

  return {
    browserContext: context,
    page,
    homePage,
    navigationHelper,
    intranetFileHelper,
  };
}

export const searchTestFixtures = test.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: SearchApiFixture;
    standardUserApiFixture: SearchApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: SearchUiFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: SearchUserFixture;

    // Special fixtures for search tests
    tileCleanupTracker: { tiles: Array<{ tileId: string; siteId: string }> };
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    standardUserApiContext: APIRequestContext;
    siteManagementHelper: SiteManagementHelper;
    publicSite: { siteName: string; siteId: string };
    privateSite: { siteName: string; siteId: string };
    unlistedSite: { siteName: string; siteId: string };
  }
>({
  // Worker-scoped API context - shared across all tests in worker
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

  // Worker-scoped standard user API context - shared across all tests in worker
  standardUserApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().endUserEmail || '',
        password: getEnvConfig().endUserPassword || '',
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // Worker-scoped site management helper - shared across all tests in worker
  siteManagementHelper: [
    async ({ appManagerApiContext }, use, workerInfo) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      console.log(`🔧 Initializing siteManagementHelper for worker ${workerInfo.workerIndex}`);
      await use(siteManagementHelper);
      console.log(`🧹 Worker ${workerInfo.workerIndex} shutting down - calling siteManagementHelper.cleanup()`);
      await siteManagementHelper.cleanup();
      console.log(`✅ Worker ${workerInfo.workerIndex} cleanup completed`);
    },
    { scope: 'worker' },
  ],

  // Worker-scoped public site - one site per worker to reduce unnecessary site creation
  publicSite: [
    async ({ siteManagementHelper }, use, workerInfo) => {
      console.log(`🔧 Creating publicSite fixture for worker ${workerInfo.workerIndex}`);
      const randomNum = Math.floor(Math.random() * 1000000 + 1);
      const siteName = `Public_${randomNum}`;
      const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');

      // Create site using existing SiteManagementHelper
      const publicSite = await siteManagementHelper.createPublicSite({
        siteName: siteName,
        category: {
          categoryId: category.categoryId,
          name: category.name,
        },
        waitForSearchIndex: true,
      });

      console.log(
        `✅ Created publicSite: ${publicSite.siteName} with ID: ${publicSite.siteId} for worker ${workerInfo.workerIndex} using existing SiteManagementHelper`
      );

      await use({ siteName: publicSite.siteName, siteId: publicSite.siteId });

      // Note: Cleanup is handled by the siteManagementHelper fixture
      console.log(
        `🧹 Public site cleanup will be handled by siteManagementHelper fixture for site: ${publicSite.siteName} with ID: ${publicSite.siteId}`
      );
    },
    { scope: 'worker' },
  ],

  // Worker-scoped private site - one site per worker to reduce unnecessary site creation
  privateSite: [
    async ({ siteManagementHelper }, use, workerInfo) => {
      console.log(`🔧 Creating privateSite fixture for worker ${workerInfo.workerIndex}`);
      const randomNum = Math.floor(Math.random() * 1000000 + 1);
      const siteName = `Private_${randomNum}`;
      const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');

      // Create site using existing SiteManagementHelper
      const privateSite = await siteManagementHelper.createPrivateSite({
        siteName: siteName,
        category: {
          categoryId: category.categoryId,
          name: category.name,
        },
        waitForSearchIndex: true,
      });

      console.log(
        `✅ Created privateSite: ${privateSite.siteName} with ID: ${privateSite.siteId} for worker ${workerInfo.workerIndex} using existing SiteManagementHelper`
      );

      await use({ siteName: privateSite.siteName, siteId: privateSite.siteId });

      // Note: Cleanup is handled by the siteManagementHelper fixture
      console.log(
        `🧹 Private site cleanup will be handled by siteManagementHelper fixture for site: ${privateSite.siteName} with ID: ${privateSite.siteId}`
      );
    },
    { scope: 'worker' },
  ],

  // Worker-scoped unlisted site - one site per worker to reduce unnecessary site creation
  unlistedSite: [
    async ({ siteManagementHelper }, use, workerInfo) => {
      console.log(`🔧 Creating unlistedSite fixture for worker ${workerInfo.workerIndex}`);
      const randomNum = Math.floor(Math.random() * 1000000 + 1);
      const siteName = `Unlisted_${randomNum}`;
      const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');

      // Create site using existing SiteManagementHelper
      const unlistedSite = await siteManagementHelper.createUnlistedSite({
        siteName: siteName,
        category: {
          categoryId: category.categoryId,
          name: category.name,
        },
        waitForSearchIndex: true,
      });

      console.log(
        `✅ Created unlistedSite: ${unlistedSite.siteName} with ID: ${unlistedSite.siteId} for worker ${workerInfo.workerIndex} using existing SiteManagementHelper`
      );

      await use({ siteName: unlistedSite.siteName, siteId: unlistedSite.siteId });

      // Note: Cleanup is handled by the siteManagementHelper fixture
      console.log(
        `🧹 Unlisted site cleanup will be handled by siteManagementHelper fixture for site: ${unlistedSite.siteName} with ID: ${unlistedSite.siteId}`
      );
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead, using worker-scoped contexts
  appManagerApiFixture: [
    async ({ appManagerApiContext, siteManagementHelper }, use) => {
      const fixture = await createSearchApiFixture(appManagerApiContext);
      // Use the worker-scoped siteManagementHelper so sites created by fixtures are tracked
      fixture.siteManagementHelper = siteManagementHelper;
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        // Note: siteManagementHelper cleanup is handled by worker-scoped fixture at worker shutdown
        // Sites are shared across tests, so we don't clean them up after each test
        await fixture.feedManagementHelper.cleanup();
        await fixture.tileManagementHelper.cleanup();
      } catch (error) {
        console.warn('App manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  standardUserApiFixture: [
    async ({ standardUserApiContext, siteManagementHelper }, use) => {
      const fixture = await createSearchApiFixture(standardUserApiContext);
      // Use the worker-scoped siteManagementHelper so sites created by fixtures are tracked
      fixture.siteManagementHelper = siteManagementHelper;
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        // Note: siteManagementHelper cleanup is handled by worker-scoped fixture at worker shutdown
        // Sites are shared across tests, so we don't clean them up after each test
        await fixture.feedManagementHelper.cleanup();
        await fixture.tileManagementHelper.cleanup();
      } catch (error) {
        console.warn('Standard user API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components
  appManagerUiFixture: [
    async ({ browser, appManagerApiContext }, use) => {
      const fixture = await createSearchUiFixture(browser, appManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.intranetFileHelper.cleanup();
      } catch (error) {
        console.warn('App manager UI fixture cleanup failed:', error);
      }

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

  // Special fixture for tile cleanup tracking
  tileCleanupTracker: [
    async ({ appManagerApiFixture }, use) => {
      const tileCleanupTracker = { tiles: [] as Array<{ tileId: string; siteId: string }> };

      await use(tileCleanupTracker);

      // Cleanup all tracked tiles
      for (const { tileId, siteId } of tileCleanupTracker.tiles) {
        try {
          await appManagerApiFixture.tileManagementHelper.tileManagementService.deleteTile(siteId, tileId);
          console.log(`Successfully deleted tile: ${tileId}`);
        } catch (error) {
          console.warn(`Failed to delete tile ${tileId}:`, error);
        }
      }
    },
    { scope: 'test' },
  ],
});
