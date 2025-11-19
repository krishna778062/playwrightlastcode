import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { LWOUserManagementService } from '../apis/services/LWOUserManagementService';
import { QRManagementService } from '../apis/services/QRManagementService';
import { getFrontlineTenantConfigFromCache, initializeFrontlineConfig } from '../config/frontlineConfig';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { OTPUtils } from '@/src/core/utils/smsUtil';

export type UserType = 'appManager' | 'endUser' | 'promotionManager';

export const getUsers = () => {
  const config = getFrontlineTenantConfigFromCache();
  return {
    appManager: {
      email: config.appManagerEmail || '',
      password: config.appManagerPassword || '',
    },
    endUser: {
      email: config.endUserEmail || '',
      password: config.endUserPassword || '',
    },
    promotionManager: {
      email: config.promotionManagerEmail || '',
      password: config.promotionManagerPassword || '',
    },
  } as const;
};

export const frontlineTestFixture = test.extend<
  {
    // App manager browser context, Request Context + page
    appManagerBrowserContext: BrowserContext;
    appManagersPage: Page;
    appManagerHomePage: NewHomePage;
    appManagerUINavigationHelper: NavigationHelper;

    // Promotion manager browser context, Request Context + page
    promotionManagerBrowserContext: BrowserContext;
    promotionManagersPage: Page;
    promotionManagerHomePage: NewHomePage;
    promotionManagerUINavigationHelper: NavigationHelper;

    // End user browser context, Request Context + page
    endUserBrowserContext: BrowserContext;
    endUsersPage: Page;
    endUserHomePage: NewHomePage;
    endUserUINavigationHelper: NavigationHelper;
    loginAs: (userType: UserType) => Promise<void>;
  },
  {
    appManagerApiContext: APIRequestContext;
    qrManagementService: QRManagementService;
    lwoUserManagementService: LWOUserManagementService;
    otpUtils: OTPUtils;
    config: ReturnType<typeof getFrontlineTenantConfigFromCache>;
    tenantInitializer: void;
  }
>({
  // Worker-scoped tenant initializer
  tenantInitializer: [
    async ({}, use) => {
      // Check which project is running based on the test info
      const testInfo = test.info();
      const projectName = testInfo.project?.name || '';

      // Initialize the correct tenant based on project
      if (projectName === 'frontline-secondary') {
        initializeFrontlineConfig('secondary');
      } else {
        initializeFrontlineConfig('primary');
      }

      await use(undefined);
    },
    { scope: 'worker' },
  ],
  // Worker-scoped API client - shared across all tests in worker
  appManagerApiContext: [
    async ({ tenantInitializer }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const appManagerApiContext = await RequestContextFactory.createAuthenticatedContext(config.apiBaseUrl, {
        email: config.appManagerEmail,
        password: config.appManagerPassword,
      });

      await use(appManagerApiContext);
      await appManagerApiContext.dispose();
    },
    { scope: 'worker' },
  ],
  qrManagementService: [
    async ({ appManagerApiContext, tenantInitializer }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const qrManagementService = new QRManagementService(appManagerApiContext, config.apiBaseUrl);
      await use(qrManagementService);
    },
    { scope: 'worker' },
  ],
  lwoUserManagementService: [
    async ({ appManagerApiContext, tenantInitializer }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const lwoUserManagementService = new LWOUserManagementService(appManagerApiContext, config.apiBaseUrl);
      await use(lwoUserManagementService);
    },
    { scope: 'worker' },
  ],

  config: [
    async ({ tenantInitializer }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      await use(config);
    },
    { scope: 'worker' },
  ],
  otpUtils: [
    async ({ tenantInitializer }, use) => {
      const config = getFrontlineTenantConfigFromCache();

      // Only initialize OTP utils if Mailosaur credentials are available
      if (config.mailosaurApiKey && config.mailosaurServerId) {
        const otpUtils = new OTPUtils(config.mailosaurApiKey, config.mailosaurServerId);
        await use(otpUtils);
      } else {
        // Provide a mock OTP utils if credentials are not available
        const mockOtpUtils = {
          getOTPFromSMS: async () => '123456',
          getOTPFromEmail: async () => '123456',
          generateTestEmail: () => 'test@example.com',
        };
        await use(mockOtpUtils as any);
      }
    },
    { scope: 'worker' },
  ],
  appManagerBrowserContext: [
    async ({ browser, tenantInitializer }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: config.appManagerEmail,
        password: config.appManagerPassword,
      });
      await page.close();
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  promotionManagerBrowserContext: [
    async ({ browser, tenantInitializer }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const context = await browser.newContext();
      const page = await context.newPage();
      const promotionManagerHomePage = await LoginHelper.loginWithPassword(page, {
        email: config.promotionManagerEmail,
        password: config.promotionManagerPassword,
      });
      await promotionManagerHomePage.verifyThePageIsLoaded();
      await page.close();
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],
  promotionManagersPage: [
    async ({ promotionManagerBrowserContext }, use) => {
      const page = await promotionManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  promotionManagerUINavigationHelper: [
    async ({ promotionManagerHomePage }, use) => {
      const promotionManagerUINavigationHelper = new NavigationHelper(promotionManagerHomePage.page);
      await use(promotionManagerUINavigationHelper);
    },
    { scope: 'test' },
  ],

  promotionManagerHomePage: [
    async ({ promotionManagersPage }, use) => {
      const homePage = new NewHomePage(promotionManagersPage);
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
      await use(homePage);
    },
    { scope: 'test' },
  ],

  appManagersPage: [
    async ({ appManagerBrowserContext }, use) => {
      const page = await appManagerBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  appManagerHomePage: [
    async ({ appManagersPage }, use) => {
      const homePage = new NewHomePage(appManagersPage);
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
      await use(homePage);
      await appManagersPage.close();
    },
    { scope: 'test' },
  ],

  appManagerUINavigationHelper: [
    async ({ appManagersPage }, use, _workerInfo) => {
      const appManagerUINavigationHelper = new NavigationHelper(appManagersPage);
      await use(appManagerUINavigationHelper);
    },
    { scope: 'test' },
  ],

  endUserBrowserContext: [
    async ({ browser, tenantInitializer }, use) => {
      const config = getFrontlineTenantConfigFromCache();
      const context = await browser.newContext();
      const page = await context.newPage();
      await LoginHelper.loginWithPassword(page, {
        email: config.endUserEmail,
        password: config.endUserPassword,
      });
      await page.close();
      await use(context);
      await context.close();
    },
    { scope: 'test' },
  ],

  endUsersPage: [
    async ({ endUserBrowserContext }, use) => {
      const page = await endUserBrowserContext.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  endUserHomePage: [
    async ({ endUsersPage }, use) => {
      const homePage = new NewHomePage(endUsersPage);
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
      await use(homePage);
      await endUsersPage.close();
    },
    { scope: 'test' },
  ],
  endUserUINavigationHelper: [
    async ({ endUsersPage }, use, _workerInfo) => {
      const endUserUINavigationHelper = new NavigationHelper(endUsersPage);
      await use(endUserUINavigationHelper);
    },
    { scope: 'test' },
  ],
  loginAs: async ({ page }, use) => {
    await use(async (userType: UserType) => {
      const users = getUsers();
      await LoginHelper.loginWithPassword(page, users[userType]);
    });
  },
});
export { test };
