import { faker } from '@faker-js/faker';
import { test as base } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { ContentManagementHelper } from '@core/helpers/contentManagementHelper';
import { LoginHelper } from '@core/helpers/loginHelper';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@core/pages/homePage/oldUxHomePage';
import { getEnvConfig } from '@core/utils/getEnvConfig';

export type IntegrationsEventFixtures = {
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  siteManagementHelper: SiteManagementHelper;
  contentManagementHelper: ContentManagementHelper;
  testSiteName: string;
};

export type IntegrationsEventWorkerFixtures = {
  appManagerApiClient: AppManagerApiClient;
};

export const integrationsEventFixture = base.extend<IntegrationsEventFixtures, IntegrationsEventWorkerFixtures>({
  appManagerApiClient: [
    async ({}, use, workerInfo) => {
      console.log(`Setting up app manager API client for worker ${workerInfo.workerIndex}`);
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

  siteManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      await use(siteManagementHelper);
      await siteManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],

  testSiteName: [
    async ({ siteManagementHelper, appManagerApiClient }, use) => {
      let createdSiteName = '';

      try {
        console.log('Creating dedicated test site for event creation...');
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const testSite = await siteManagementHelper.createPublicSite({
          category,
          siteName: `Event Test Site ${faker.string.alphanumeric({ length: 6 })}`,
        });
        createdSiteName = testSite.siteName;
        console.log(`✅ Created dedicated test site: ${createdSiteName} (ID: ${testSite.siteId})`);

        await use(createdSiteName);
      } catch (error) {
        console.error('Failed to create test site:', error);
        await use(createdSiteName);
      }
    },
    { scope: 'test' },
  ],

  contentManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const contentManagementHelper = new ContentManagementHelper(appManagerApiClient);
      await use(contentManagementHelper);
      await contentManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],

  appManagerHomePage: [
    async ({ page, siteManagementHelper }, use) => {
      // Login and get HomePage instance for event creation
      const homePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });

      await homePage.verifyThePageIsLoaded();
      console.log('App Manager logged in and ready for event creation');
      await use(homePage);
    },
    { scope: 'test' },
  ],
});
