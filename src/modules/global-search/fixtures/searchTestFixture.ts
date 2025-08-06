import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { ContentManagementHelper } from '@core/helpers/contentManagementHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { LoginHelper } from '../../../core/helpers/loginHelper';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';
import { IntranetFileHelper } from '@core/helpers/intranetFileHelper';

export const searchTestFixtures = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerUserPage: Page;
  appManagerApiClient: AppManagerApiClient;
  contentManagementHelper: ContentManagementHelper;
  intranetFileHelper: IntranetFileHelper;
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
  intranetFileHelper: [
    async ({ appManagerApiClient }, use) => {
      const intranetFileHelper = new IntranetFileHelper(appManagerApiClient);
      try {
        await use(intranetFileHelper);
      } finally {
        await intranetFileHelper.cleanup();
      }
    },
    { scope: 'test' },
  ],
});
