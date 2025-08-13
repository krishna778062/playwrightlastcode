import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { ContentManagementHelper } from '@core/helpers/contentManagementHelper';
import { FeedManagementHelper } from '@core/helpers/feedManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { LoginHelper } from '../../../core/helpers/loginHelper';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';
import { IntranetFileHelper } from '@core/helpers/intranetFileHelper';

export const searchTestFixtures = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerUserPage: Page;
  appManagerApiClient: AppManagerApiClient;
  contentManagementHelper: ContentManagementHelper;
  feedManagementHelper: FeedManagementHelper;
  intranetFileHelper: IntranetFileHelper;
  siteManagementHelper: SiteManagementHelper;
}>({
  appManagerHomePage: [
    async ({ page }, use, workerInfo) => {
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
    async ({ appManagerHomePage }, use, workerInfo) => {
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],
  appManagerApiClient: [
    async ({ appManagerUserPage }, use, workerInfo) => {
      console.log(`INFO: Setting up app manager client for worker => `, workerInfo.workerIndex);
      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'cookies',
        page: appManagerUserPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(appManagerApiClient);
    },
    { scope: 'test' },
  ],
  contentManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const contentManagementHelper = new ContentManagementHelper(appManagerApiClient);
      try {
        await use(contentManagementHelper);
      } finally {
        await contentManagementHelper.cleanup();
      }
    },
    { scope: 'test' },
  ],
  feedManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const feedManagementHelper = new FeedManagementHelper(appManagerApiClient);
      try {
        await use(feedManagementHelper);
      } finally {
        await feedManagementHelper.cleanup();
      }
    },
    { scope: 'test' },
  ],
  intranetFileHelper: [
    async ({ appManagerApiClient, appManagerUserPage }, use) => {
      const intranetFileHelper = new IntranetFileHelper(appManagerApiClient, appManagerUserPage);
      try {
        await use(intranetFileHelper);
      } finally {
        await intranetFileHelper.cleanup();
      }
    },
    { scope: 'test' },
  ],
  siteManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      try {
        await use(siteManagementHelper);
      } finally {
        await siteManagementHelper.cleanup();
      }
    },
    { scope: 'test' },
  ],
});
