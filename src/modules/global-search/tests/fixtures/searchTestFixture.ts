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
import { ExternalSearchManagementService } from '@/src/modules/global-search/apis/services/ExternalSearchManagementService';
import { IntranetFileHelper } from '@/src/modules/global-search/ui/helpers/intranetFileHelper';

export const searchTestFixtures = test.extend<
  {
    appManagerBrowserContext: BrowserContext;
    appManagerUserPage: Page;
    appManagerUINavigationHelper: NavigationHelper;
    appManagerHomePage: NewHomePage;
    contentManagementHelper: ContentManagementHelper;
    feedManagementHelper: FeedManagementHelper;
    intranetFileHelper: IntranetFileHelper;
    tileManagementHelper: TileManagementHelper;
    appManagementService: AppsManagementService;
    linkManagementService: LinkManagementService;
    externalSearchManagementService: ExternalSearchManagementService;
    tileCleanupTracker: { tiles: Array<{ tileId: string; siteId: string }> };
  },
  {
    appManagerApiContext: APIRequestContext;
    siteManagementHelper: SiteManagementHelper;
    publicSite: { siteName: string; siteId: string };
  }
>({
  appManagerApiContext: [
    async ({}, use) => {
      const appManagerApiContext = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(appManagerApiContext);
      await appManagerApiContext.dispose();
    },
    { scope: 'worker' },
  ],
  appManagerBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  appManagerUserPage: [
    async ({ appManagerBrowserContext }, use, _workerInfo) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  appManagerUINavigationHelper: [
    async ({ appManagerUserPage }, use, _workerInfo) => {
      const appManagerUINavigationHelper = new NavigationHelper(appManagerUserPage);
      await use(appManagerUINavigationHelper);
    },
    { scope: 'test' },
  ],
  appManagerHomePage: [
    async ({ appManagerUserPage }, use, _workerInfo) => {
      const appManagerHomePage = new NewHomePage(appManagerUserPage);
      await appManagerHomePage.loadPage();
      await appManagerHomePage.verifyThePageIsLoaded();
      await use(appManagerHomePage);
    },
    { scope: 'test' },
  ],

  appManagementService: [
    async ({ appManagerApiContext }, use) => {
      const appManagementService = new AppsManagementService(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(appManagementService);
    },
    { scope: 'test' },
  ],
  externalSearchManagementService: [
    async ({ appManagerApiContext }, use) => {
      const externalSearchManagementService = new ExternalSearchManagementService(
        appManagerApiContext,
        getEnvConfig().apiBaseUrl
      );
      await use(externalSearchManagementService);
    },
    { scope: 'test' },
  ],
  linkManagementService: [
    async ({ appManagerApiContext }, use) => {
      const linkManagementService = new LinkManagementService(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(linkManagementService);
    },
    { scope: 'test' },
  ],
  contentManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const contentManagementHelper = new ContentManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(contentManagementHelper);
      // Note: Cleanup is handled manually in test afterAll hooks
    },
    { scope: 'test' },
  ],
  feedManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const feedManagementHelper = new FeedManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(feedManagementHelper);
      await feedManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],
  intranetFileHelper: [
    async ({ appManagerApiContext, appManagerUserPage }, use) => {
      const intranetFileHelper = new IntranetFileHelper(
        appManagerApiContext,
        getEnvConfig().apiBaseUrl,
        appManagerUserPage
      );
      await use(intranetFileHelper);
      await intranetFileHelper.cleanup();
    },
    { scope: 'test' },
  ],

  tileManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const tileManagementHelper = new TileManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(tileManagementHelper);
      await tileManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],

  tileCleanupTracker: [
    async ({ tileManagementHelper }, use) => {
      const tileCleanupTracker = { tiles: [] as Array<{ tileId: string; siteId: string }> };

      await use(tileCleanupTracker);

      // Cleanup all tracked tiles
      for (const { tileId, siteId } of tileCleanupTracker.tiles) {
        try {
          await tileManagementHelper.tileManagementService.deleteTile(siteId, tileId);
          console.log(`Successfully deleted tile: ${tileId}`);
        } catch (error) {
          console.warn(`Failed to delete tile ${tileId}:`, error);
        }
      }
    },
    { scope: 'test' },
  ],
  siteManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(siteManagementHelper);
      await siteManagementHelper.cleanup();
    },
    { scope: 'worker' },
  ],
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
});
