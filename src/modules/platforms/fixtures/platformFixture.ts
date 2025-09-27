import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@core/api/factories/requestContextFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { NewUxHomePage } from '@core/ui/pages/homePage/newUxHomePage';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { AudienceCategoryManagementHelper, IdentityManagementHelper } from '../apis/helpers';
import { UserManagementService } from '../apis/services/UserManagementService';

export const platformTestFixture = test.extend<
  {
    appManagerBrowserContext: BrowserContext;
    appManagerHomePage: NewUxHomePage;
    userManagerHomePage: NewUxHomePage;
    appManagerPage: Page;
    userManagerPage: Page;
    userManagerBrowserContext: BrowserContext;
    audienceCategoryManagementHelper: AudienceCategoryManagementHelper;
    identityManagementHelper: IdentityManagementHelper;
    userManagementService: UserManagementService;
  },
  {
    appManagerApiContext: APIRequestContext;
    userManagerApiContext: APIRequestContext;
  }
>({
  appManagerApiContext: [
    async ({}, use) => {
      const appManagerApiClient = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(appManagerApiClient);
      await appManagerApiClient.dispose();
    },
    { scope: 'worker' },
  ],
  userManagerApiContext: [
    async ({}, use) => {
      const userManagerApiClient = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().userManagerEmail!,
        password: getEnvConfig().appManagerPassword,
      });
      await use(userManagerApiClient);
      await userManagerApiClient.dispose();
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
      // Logout after each test case using this fixture
      await context.close();
    },
    { scope: 'test' },
  ],

  appManagerPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await LoginHelper.logoutByNavigatingToLogoutPage(page);
      await page.close();
    },
    { scope: 'test' },
  ],
  appManagerHomePage: [
    async ({ appManagerPage }, use) => {
      const adminHomePage = new NewUxHomePage(appManagerPage);
      await adminHomePage.loadPage();
      await adminHomePage.verifyThePageIsLoaded();
      await use(adminHomePage);
    },
    { scope: 'test' },
  ],
  userManagerBrowserContext: [
    async ({ browser }, use) => {
      const userManagerContext = await browser.newContext();
      const page = await userManagerContext.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().userManagerEmail!,
        password: getEnvConfig().appManagerPassword,
      });
      await use(userManagerContext);
      await userManagerContext?.close();
    },
    { scope: 'test' },
  ],
  userManagerPage: [
    async ({ userManagerBrowserContext: userManagerContext }, use) => {
      const page = await userManagerContext.newPage();
      await use(page);
      // Logout after each test case using this fixture
      await LoginHelper.logoutByNavigatingToLogoutPage(page);
    },
    { scope: 'test' },
  ],

  userManagementService: [
    async ({ appManagerApiContext }, use) => {
      const userManagementService = new UserManagementService(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(userManagementService);
    },
    { scope: 'test' },
  ],

  audienceCategoryManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const audienceCategoryManagementHelper = new AudienceCategoryManagementHelper(
        appManagerApiContext,
        getEnvConfig().apiBaseUrl
      );
      await use(audienceCategoryManagementHelper);
      await audienceCategoryManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],

  identityManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const identityManagementHelper = new IdentityManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(identityManagementHelper);
    },
    { scope: 'test' },
  ],
});
