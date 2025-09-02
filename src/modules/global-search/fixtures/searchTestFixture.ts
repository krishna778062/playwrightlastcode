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
  },
  {
    appManagerApiClient: AppManagerApiClient;
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
      await contentManagementHelper.cleanup();
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
  publicSite: [
    async ({ appManagerApiClient }, use, workerInfo) => {
      console.log(`🔧 Creating publicSite fixture for worker ${workerInfo.workerIndex}`);

      const randomNum = Math.floor(Math.random() * 1000000 + 1);
      const siteName = `Public_${randomNum}`;
      /** Get the default category for the public site */
      const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');

      // Create site directly via API without using siteManagementHelper to avoid tracking
      const publicSite = await appManagerApiClient.getSiteManagementService().addNewSite({
        access: 'public',
        name: siteName,
        category: {
          categoryId: category.categoryId,
          name: category.name,
        },
      });

      console.log(
        `✅ Created publicSite: ${siteName} with ID: ${publicSite.siteId} for worker ${workerInfo.workerIndex}`
      );

      await use({ siteName, siteId: publicSite.siteId });

      // Cleanup: Deactivate the shared site when worker finishes
      try {
        await appManagerApiClient.getSiteManagementService().deactivateSite(publicSite.siteId);
        console.log(
          `🧹 Cleaned up publicSite: ${siteName} with ID: ${publicSite.siteId} for worker ${workerInfo.workerIndex}`
        );
      } catch (error) {
        console.warn(`Failed to deactivate publicSite ${siteName} (${publicSite.siteId}):`, error);
      }
    },
    { scope: 'worker' },
  ],
});
