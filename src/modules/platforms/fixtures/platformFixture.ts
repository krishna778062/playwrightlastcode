import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@core/api/factories/requestContextFactory';
import { LoginHelper } from '@core/helpers/loginHelper';
import { BaseHomePage } from '@core/ui/pages/homePage/baseHomePage';
import { NewUxHomePage } from '@core/ui/pages/homePage/newUxHomePage';
import { OldUxHomePage } from '@core/ui/pages/homePage/oldUxHomePage';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { AudienceCategoryManagementHelper, IdentityManagementHelper } from '../apis/helpers';
import { UserManagementService } from '../apis/services/UserManagementService';

export const platformTestFixture = test.extend<{
  appManagerBrowserContext: BrowserContext;
  appManagerApiContext: APIRequestContext;
  userManagerApiContext: APIRequestContext;
  appManagerHomePage: BaseHomePage;
  userManagerHomePage: BaseHomePage;
  appManagerPage: Page;
  userManagerPage: Page;
  userManagerBrowserContext: BrowserContext;
  audienceCategoryManagementHelper: AudienceCategoryManagementHelper;
  identityManagementHelper: IdentityManagementHelper;
  userManagementService: UserManagementService;
}>({
  appManagerBrowserContext: [
    async ({ browser }, use) => {
      const browserContext = await browser.newContext();
      await use(browserContext);
      await browserContext?.close();
    },
    { scope: 'test' },
  ],
  appManagerApiContext: [
    async ({}, use) => {
      const appManagerApiClient = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(appManagerApiClient);
      await appManagerApiClient.dispose();
    },
    { scope: 'test' },
  ],
  appManagerPage: [
    async ({ appManagerBrowserContext: appManagerContext }, use) => {
      const page = await appManagerContext.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(page);
      await page?.close();
    },
    { scope: 'test' },
  ],
  appManagerHomePage: [
    async ({ appManagerPage }, use) => {
      const adminHomePage = getEnvConfig().newUxEnabled
        ? new NewUxHomePage(appManagerPage)
        : new OldUxHomePage(appManagerPage);
      await adminHomePage.verifyThePageIsLoaded();
      await use(adminHomePage);
      // Logout after each test case using this fixture
      await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
    },
    { scope: 'test' },
  ],
  userManagerBrowserContext: [
    async ({ browser }, use) => {
      const userManagerContext = await browser.newContext();
      await use(userManagerContext);
      await userManagerContext?.close();
    },
    { scope: 'test' },
  ],
  userManagerPage: [
    async ({ userManagerBrowserContext: userManagerContext }, use) => {
      const page = await userManagerContext.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().userManagerEmail!,
        password: getEnvConfig().appManagerPassword,
      });
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

  userManagerApiContext: [
    async ({}, use) => {
      const userManagerApiRequestContext = await RequestContextFactory.createAuthenticatedContext(
        getEnvConfig().apiBaseUrl,
        {
          email: getEnvConfig().userManagerEmail!,
          password: getEnvConfig().appManagerPassword,
        }
      );
      await use(userManagerApiRequestContext);
      await userManagerApiRequestContext.dispose();
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
