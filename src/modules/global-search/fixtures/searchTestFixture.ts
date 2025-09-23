import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { ContentManagementHelper } from '@core/helpers/contentManagementHelper';
import { FeedManagementHelper } from '@core/helpers/feedManagementHelper';
import { IntranetFileHelper } from '@core/helpers/intranetFileHelper';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { LoginHelper } from '../../../core/helpers/loginHelper';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

export const searchTestFixtures = test.extend<
  {
    appManagerHomePage: NewUxHomePage | OldUxHomePage;
    appManagerUserPage: Page;
    contentManagementHelper: ContentManagementHelper;
    feedManagementHelper: FeedManagementHelper;
    intranetFileHelper: IntranetFileHelper;
    tileCleanupTracker: { tiles: Array<{ tileId: string; siteId: string }> };
  },
  {
    appManagerApiClient: AppManagerApiClient;
    siteManagementHelper: SiteManagementHelper;
    publicSite: { siteName: string; siteId: string };
  }
>({
  appManagerHomePage: [
    async ({ page }, use, _workerInfo) => {
      const appManagerHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await appManagerHomePage.verifyThePageIsLoaded();
      await use(appManagerHomePage);
    },
    { scope: 'test' },
  ],
  appManagerUserPage: [
    async ({ appManagerHomePage }, use, _workerInfo) => {
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],
  appManagerApiClient: [
    async ({}, use, workerInfo) => {
      console.log(`INFO: Setting up app manager client for worker => `, workerInfo.workerIndex);
      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: {
          username: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        },
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(appManagerApiClient);
    },
    { scope: 'worker' },
  ],
  contentManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const contentManagementHelper = new ContentManagementHelper(appManagerApiClient);
      await use(contentManagementHelper);
      // Note: Cleanup is handled manually in test afterAll hooks
    },
    { scope: 'test' },
  ],
  feedManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const feedManagementHelper = new FeedManagementHelper(appManagerApiClient);
      await use(feedManagementHelper);
      await feedManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],
  intranetFileHelper: [
    async ({ appManagerApiClient, appManagerUserPage }, use) => {
      const intranetFileHelper = new IntranetFileHelper(appManagerApiClient, appManagerUserPage);
      await use(intranetFileHelper);
      await intranetFileHelper.cleanup();
    },
    { scope: 'test' },
  ],
  tileCleanupTracker: [
    async ({ appManagerApiClient }, use) => {
      const tileCleanupTracker = { tiles: [] as Array<{ tileId: string; siteId: string }> };

      await use(tileCleanupTracker);

      // Cleanup all tracked tiles
      for (const { tileId, siteId } of tileCleanupTracker.tiles) {
        try {
          await appManagerApiClient.getTileManagementService().deleteTile(siteId, tileId);
          console.log(`Successfully deleted tile: ${tileId}`);
        } catch (error) {
          console.warn(`Failed to delete tile ${tileId}:`, error);
        }
      }
    },
    { scope: 'test' },
  ],
  publicSite: [
    async ({ appManagerApiClient, siteManagementHelper }, use, workerInfo) => {
      console.log(`🔧 Creating publicSite fixture for worker ${workerInfo.workerIndex}`);
      const randomNum = Math.floor(Math.random() * 1000000 + 1);
      const siteName = `Public_${randomNum}`;
      const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');

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
  siteManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      await use(siteManagementHelper);
      await siteManagementHelper.cleanup();
    },
    { scope: 'worker' },
  ],
});
