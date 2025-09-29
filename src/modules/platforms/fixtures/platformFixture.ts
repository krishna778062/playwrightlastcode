import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@core/api/factories/requestContextFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { AudienceCategoryManagementHelper, IdentityManagementHelper } from '../apis/helpers';
import { UserManagementService } from '../apis/services/UserManagementService';

import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';

export const platformTestFixture = test.extend<
  {
    appManagerBrowserContext: BrowserContext;
    appManagerPage: Page;
    appManagerHomePage: NewHomePage;
    appManagerUINavigationHelper: NavigationHelper;

    //user manager
    userManagerBrowserContext: BrowserContext;
    userManagerPage: Page;
    userManagerHomePage: NewHomePage;
    userManagerUINavigationHelper: NavigationHelper;

    //services and helpers for app manager
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
      const adminHomePage = new NewHomePage(appManagerPage);
      await adminHomePage.loadPage();
      await adminHomePage.verifyThePageIsLoaded();
      await use(adminHomePage);
    },
    { scope: 'test' },
  ],
  appManagerUINavigationHelper: [
    async ({ appManagerHomePage }, use, _workerInfo) => {
      const appManagerUINavigationHelper = new NavigationHelper(appManagerHomePage.page);
      await use(appManagerUINavigationHelper);
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
  userManagerHomePage: [
    async ({ userManagerPage }, use) => {
      const userManagerHomePage = new NewHomePage(userManagerPage);
      await userManagerHomePage.loadPage();
      await userManagerHomePage.verifyThePageIsLoaded();
      await use(userManagerHomePage);
    },
    { scope: 'test' },
  ],
  userManagerUINavigationHelper: [
    async ({ userManagerHomePage }, use, _workerInfo) => {
      const userManagerUINavigationHelper = new NavigationHelper(userManagerHomePage.page);
      await use(userManagerUINavigationHelper);
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
