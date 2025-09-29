import { faker } from '@faker-js/faker';
import { APIRequestContext, BrowserContext, Page, test as base } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { UserManagementService } from '@/src/modules/platforms/apis/services/UserManagementService';

export type IntegrationsEventFixtures = {
  appManagerBrowserContext: BrowserContext;
  appManagerPage: Page;
  appManagerHomePage: NewHomePage;
  appManagerUINavigationHelper: NavigationHelper;
  siteManagementHelper: SiteManagementHelper;
  contentManagementHelper: ContentManagementHelper;
  userManagementService: UserManagementService;
  testSiteName: string;
};

export type IntegrationsEventWorkerFixtures = {
  appManagerApiContext: APIRequestContext;
};

export const integrationsEventFixture = base.extend<IntegrationsEventFixtures, IntegrationsEventWorkerFixtures>({
  appManagerApiContext: [
    async ({}, use) => {
      const appManagerApiContext = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(appManagerApiContext);
      await appManagerApiContext.dispose();
    },
    { scope: 'worker' },
  ],

  siteManagementHelper: [
    async ({ appManagerApiContext }, use) => {
      const siteManagementHelper = new SiteManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(siteManagementHelper);
      await siteManagementHelper.cleanup();
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
  appManagerBrowserContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  appManagerPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  appManagerUINavigationHelper: [
    async ({ appManagerPage }, use, _workerInfo) => {
      const appManagerUINavigationHelper = new NavigationHelper(appManagerPage);
      await use(appManagerUINavigationHelper);
    },
    { scope: 'test' },
  ],

  appManagerHomePage: [
    async ({ appManagerPage }, use) => {
      // Login and get HomePage instance for event creation
      const appManagerHomePage = new NewHomePage(appManagerPage);
      await appManagerHomePage.loadPage();
      await appManagerHomePage.verifyThePageIsLoaded();
      await use(appManagerHomePage);
    },
    { scope: 'test' },
  ],

  testSiteName: [
    async ({ siteManagementHelper }, use) => {
      let createdSiteName = '';
      try {
        console.log('Creating dedicated test site for event creation...');
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
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
    async ({ appManagerApiContext }, use) => {
      const contentManagementHelper = new ContentManagementHelper(appManagerApiContext, getEnvConfig().apiBaseUrl);
      await use(contentManagementHelper);
      await contentManagementHelper.cleanup();
    },
    { scope: 'test' },
  ],
});
