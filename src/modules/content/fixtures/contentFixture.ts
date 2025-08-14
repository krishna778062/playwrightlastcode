import { test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { FeedManagerService } from '@core/api/services/FeedManagerService';
import { SiteManagementService } from '@core/api/services/SiteManagementService';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

export type UserType = 'appManager' | 'endUser';

export const users = {
  appManager: {
    email: process.env.APP_MANAGER_USERNAME || '',
    password: process.env.APP_MANAGER_PASSWORD || '',
  },
  endUser: {
    email: process.env.END_USER_USERNAME || '',
    password: process.env.END_USER_PASSWORD || '',
  },
};

export const contentTestFixture = test.extend<{
  appManagerApiClient: AppManagerApiClient;
  feedManagerService: FeedManagerService;
  siteManagementService: SiteManagementService;
  loginAs: (userType: UserType) => Promise<void>;
}>({
  appManagerApiClient: [
    async ({ browser }, use) => {
      // Create a separate page for API client authentication
      const apiPage = await browser.newPage();
      await LoginHelper.loginWithPassword(apiPage, users.appManager);

      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'cookies',
        page: apiPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });

      await use(appManagerApiClient);
      await apiPage.close();
    },
    { scope: 'test' },
  ],

  feedManagerService: [
    async ({ browser }, use) => {
      // Create a separate page for API client authentication
      const apiPage = await browser.newPage();
      await LoginHelper.loginWithPassword(apiPage, users.endUser);

      const feedManagerService = await ApiClientFactory.createClient(FeedManagerService, {
        type: 'cookies',
        page: apiPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });

      await use(feedManagerService);
      await apiPage.close();
    },
    { scope: 'test' },
  ],

  siteManagementService: [
    async ({ browser }, use) => {
      // Create a separate page for API client authentication
      const apiPage = await browser.newPage();
      await LoginHelper.loginWithPassword(apiPage, users.appManager);

      const siteManagementService = await ApiClientFactory.createClient(SiteManagementService, {
        type: 'cookies',
        page: apiPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });

      await use(siteManagementService);
      await apiPage.close();
    },
    { scope: 'test' },
  ],

  loginAs: async ({ page }, use) => {
    await use(async (userType: UserType) => {
      await LoginHelper.loginWithPassword(page, users[userType]);
    });
  },
});
