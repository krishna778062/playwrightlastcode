import { BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { UserManagerApiClient } from '@/src/core/api/clients/userManagerApiClient';
import { ApiClientFactory } from '@/src/core/api/factories/apiClientFactory';
import { AudienceCategoryManagementHelper } from '@/src/core/helpers/audienceCategoryManagementHelper';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';

export const platformTestFixture = test.extend<{
  appManagerHomePage: NewUxHomePage | OldUxHomePage;
  userManagerHomePage: NewUxHomePage | OldUxHomePage;
  appManagerPage: Page;
  userManagerPage: Page;
  userManagerContext: BrowserContext;
  appManagerApiClient: AppManagerApiClient;
  audienceCategoryManagementHelper: AudienceCategoryManagementHelper;
  userManagerApiClient: UserManagerApiClient;
}>({
  appManagerHomePage: [
    async ({ page }, use) => {
      const adminHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await adminHomePage.verifyThePageIsLoaded();
      await use(adminHomePage);

      // Logout after each test case using this fixture
      await LoginHelper.logoutByNavigatingToLogoutPage(adminHomePage.page);
    },
    { scope: 'test' },
  ],

  appManagerPage: [
    async ({ appManagerHomePage }, use) => {
      await use(appManagerHomePage.page);
    },
    { scope: 'test' },
  ],

  userManagerContext: [
    async ({ browser }, use) => {
      const userManagerContext = await browser.newContext();
      await use(userManagerContext);
      await userManagerContext?.close();
    },
    { scope: 'test' },
  ],

  userManagerPage: [
    async ({ userManagerContext }, use) => {
      const page = await userManagerContext.newPage();
      const uMHomePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().userManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await uMHomePage.verifyThePageIsLoaded();
      await use(page);

      // Logout after each test case using this fixture
      await LoginHelper.logoutByNavigatingToLogoutPage(uMHomePage.page);
    },
    { scope: 'test' },
  ],

  appManagerApiClient: [
    async ({ appManagerPage }, use) => {
      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'cookies',
        page: appManagerPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(appManagerApiClient);
    },
    { scope: 'test' },
  ],

  audienceCategoryManagementHelper: [
    async ({ appManagerApiClient }, use) => {
      const audienceCategoryManagementHelper = new AudienceCategoryManagementHelper(appManagerApiClient);
      await use(audienceCategoryManagementHelper);
      await audienceCategoryManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],

  userManagerApiClient: [
    async ({ userManagerPage }, use) => {
      const userManagerApiClient = await ApiClientFactory.createClient(UserManagerApiClient, {
        type: 'cookies',
        page: userManagerPage,
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(userManagerApiClient);
    },
    { scope: 'test' },
  ],
});
