import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@core/api/factories/requestContextFactory';
import { TIMEOUTS } from '@core/constants/timeouts';
import { LoginHelper } from '@core/helpers/loginHelper';
import { LoginPage } from '@core/ui/pages/loginPage';
import { NewHomePage } from '@core/ui/pages/newHomePage';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { AudienceCategoryManagementHelper, IdentityManagementHelper } from '../apis/helpers';
import { AudienceTestDataHelper } from '../apis/helpers/audienceTestDataHelper';
import { QuickTaskTestHelper } from '../apis/helpers/quickTaskTestHelper';
import { QuickTaskService } from '../apis/services/QuickTaskService';
import { UserManagementService } from '../apis/services/UserManagementService';

import { NavigationHelper } from '@/src/core/helpers/navigationHelper';

// Local service desk login function - keeps service desk functionality within platform module
async function loginToServiceDesk(page: Page, user: { email: string; password: string }): Promise<NewHomePage> {
  const serviceDeskUrl = process.env.SERVICE_DESK_URL;
  if (!serviceDeskUrl) {
    throw new Error('Service Desk URL not configured in environment variables');
  }

  // Navigate to Service Desk login page
  await page.goto(`${serviceDeskUrl}/login`);

  // Use the existing LoginPage but with Service Desk URL
  const loginPage = new LoginPage(page);

  // Manually perform login steps without using loadPage (which uses standard URL)
  await test.step(`Logging in to Service Desk with user ${user.email}`, async () => {
    await loginPage.usernameInput.fill(user.email);
    await loginPage.continueButton.click();
    await page.waitForURL(/authenticate/, { timeout: TIMEOUTS.MEDIUM });
    await loginPage.passwordInput.fill(user.password);
    await loginPage.signInButton.click();
  });

  // Wait for successful login
  await page.waitForURL(url => !url.pathname.includes('authenticate'), { timeout: TIMEOUTS.MEDIUM });

  // Return a home page instance
  return new NewHomePage(page);
}

// Local Zulu tenant login function - for Company Values tests
async function loginToZulu(page: Page, user: { email: string; password: string }): Promise<NewHomePage> {
  const zuluUrl = process.env.ZULU_URL;
  if (!zuluUrl) {
    throw new Error('Zulu URL not configured in environment variables');
  }

  // Navigate to Zulu login page
  await page.goto(`${zuluUrl}/login`);

  // Use the existing LoginPage but with Zulu URL
  const loginPage = new LoginPage(page);

  // Manually perform login steps without using loadPage (which uses standard URL)
  await test.step(`Logging in to Zulu tenant with user ${user.email}`, async () => {
    await loginPage.usernameInput.fill(user.email);
    await loginPage.continueButton.click();
    await page.waitForURL(/authenticate/, { timeout: TIMEOUTS.MEDIUM });
    await loginPage.passwordInput.fill(user.password);
    await loginPage.signInButton.click();
  });

  // Wait for successful login
  await page.waitForURL(url => !url.pathname.includes('authenticate'), { timeout: TIMEOUTS.MEDIUM });

  // Return a home page instance
  return new NewHomePage(page);
}

// Local Quick Task login function - for Quick Task tests
async function loginToQuickTask(page: Page, user: { email: string; password: string }): Promise<NewHomePage> {
  const quickTaskUrl = process.env.QUICK_TASK_BASE_URL;
  if (!quickTaskUrl) {
    throw new Error('Quick Task URL not configured in environment variables');
  }

  // Navigate to Quick Task login page
  await page.goto(`${quickTaskUrl}/login`);

  // Use the existing LoginPage but with Quick Task URL
  const loginPage = new LoginPage(page);

  // Manually perform login steps without using loadPage (which uses standard URL)
  await test.step(`Logging in to Quick Task with user ${user.email}`, async () => {
    await loginPage.usernameInput.fill(user.email);
    await loginPage.continueButton.click();
    await page.waitForURL(/authenticate/, { timeout: TIMEOUTS.MEDIUM });
    await loginPage.passwordInput.fill(user.password);
    await loginPage.signInButton.click();
  });

  // Wait for successful login
  await page.waitForURL(url => !url.pathname.includes('authenticate'), { timeout: TIMEOUTS.MEDIUM });

  // Return a home page instance
  return new NewHomePage(page);
}

// API-only fixture type for API helpers and services
export interface PlatformApiFixture {
  apiContext: APIRequestContext;
  audienceCategoryManagementHelper: AudienceCategoryManagementHelper;
  audienceTestDataHelper: AudienceTestDataHelper;
  identityManagementHelper: IdentityManagementHelper;
  userManagementService: UserManagementService;
}

// UI-only fixture type for browser and page components
export interface PlatformUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
}

// Combined user fixture type that extends both API and UI fixtures
export interface PlatformUserFixture extends PlatformApiFixture, PlatformUiFixture {}

// Quick Task API fixture type
export interface QuickTaskApiFixture {
  apiContext: APIRequestContext;
  quickTaskService: QuickTaskService;
  quickTaskTestHelper: QuickTaskTestHelper;
}

export type PlatformUserType = 'appManager' | 'userManager';

export const platformUsers = {
  appManager: {
    email: getEnvConfig().appManagerEmail,
    password: getEnvConfig().appManagerPassword,
  },
  userManager: {
    email: getEnvConfig().userManagerEmail!,
    password: getEnvConfig().appManagerPassword,
  },
};

// Helper function to create API-only fixtures using existing API contexts
async function createPlatformApiFixture(apiContext: APIRequestContext): Promise<PlatformApiFixture> {
  const audienceCategoryManagementHelper = new AudienceCategoryManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const audienceTestDataHelper = new AudienceTestDataHelper(apiContext, getEnvConfig().apiBaseUrl);
  const identityManagementHelper = new IdentityManagementHelper(apiContext, getEnvConfig().apiBaseUrl);
  const userManagementService = new UserManagementService(apiContext, getEnvConfig().apiBaseUrl);

  return {
    apiContext,
    audienceCategoryManagementHelper,
    audienceTestDataHelper,
    identityManagementHelper,
    userManagementService,
  };
}

// Helper function to create UI-only fixtures
async function createPlatformUiFixture(browser: any, userType: PlatformUserType): Promise<PlatformUiFixture> {
  const user = platformUsers[userType];
  const context = await browser.newContext();
  const page = await context.newPage();

  await LoginHelper.loginWithPassword(page, {
    email: user.email,
    password: user.password,
  });

  const homePage = new NewHomePage(page);
  await homePage.verifyThePageIsLoaded();

  const navigationHelper = new NavigationHelper(page);

  return {
    browserContext: context,
    page,
    homePage,
    navigationHelper,
  };
}

export const platformTestFixture = test.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: PlatformApiFixture;
    userManagerApiFixture: PlatformApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: PlatformUiFixture;
    userManagerUiFixture: PlatformUiFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: PlatformUserFixture;
    userManagerFixture: PlatformUserFixture;
    serviceDeskPage: Page;
    zuluAppManagerPage: Page;
    zuluEndUserPage: Page;
    zuluBrandingManagerPage: Page;
    quickTaskPage: Page;
    quickTaskApiFixture: QuickTaskApiFixture;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    userManagerApiContext: APIRequestContext;
    quickTaskApiContext: APIRequestContext;
  }
>({
  // Worker-scoped API contexts - shared across all tests in worker
  appManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  userManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: getEnvConfig().userManagerEmail!,
        password: getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  quickTaskApiContext: [
    async ({}, use) => {
      const quickTaskApiUrl = process.env.QUICK_TASK_API_URL;
      if (!quickTaskApiUrl) {
        throw new Error('QUICK_TASK_API_URL not configured in environment variables');
      }
      const context = await RequestContextFactory.createAuthenticatedContext(quickTaskApiUrl, {
        email: process.env.QUICK_TASK_APP_MANAGER_USERNAME!,
        password: process.env.QUICK_TASK_APP_MANAGER_PASSWORD!,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead, using worker-scoped contexts
  appManagerApiFixture: [
    async ({ appManagerApiContext }, use) => {
      const fixture = await createPlatformApiFixture(appManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.audienceCategoryManagementHelper.cleanup();
      } catch (error) {
        console.warn('App manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  userManagerApiFixture: [
    async ({ userManagerApiContext }, use) => {
      const fixture = await createPlatformApiFixture(userManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.audienceCategoryManagementHelper.cleanup();
      } catch (error) {
        console.warn('User manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components
  appManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createPlatformUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  userManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createPlatformUiFixture(browser, 'userManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  // Combined user fixtures - complete entry points
  appManagerFixture: [
    async ({ appManagerUiFixture, appManagerApiFixture }, use) => {
      await use({ ...appManagerUiFixture, ...appManagerApiFixture });
    },
    { scope: 'test' },
  ],

  userManagerFixture: [
    async ({ userManagerUiFixture, userManagerApiFixture }, use) => {
      await use({ ...userManagerUiFixture, ...userManagerApiFixture });
    },
    { scope: 'test' },
  ],

  serviceDeskPage: [
    async ({ page }, use) => {
      const _serviceDeskHomePage = await loginToServiceDesk(page, {
        email: process.env.SERVICE_DESK_USERNAME!,
        password: process.env.SERVICE_DESK_PASSWORD!,
      });
      await use(page);

      // Logout after each test case
      const serviceDeskUrl = process.env.SERVICE_DESK_URL;
      if (serviceDeskUrl) {
        await page.goto(`${serviceDeskUrl}/logout`);
      }
    },
    { scope: 'test' },
  ],

  zuluAppManagerPage: [
    async ({ page }, use) => {
      const _zuluHomePage = await loginToZulu(page, {
        email: process.env.ZULU_APPLICATION_MANAGER!,
        password: process.env.ZULU_PASSWORD!,
      });
      await use(page);

      // Logout after each test case
      const zuluUrl = process.env.ZULU_URL;
      if (zuluUrl) {
        await page.goto(`${zuluUrl}/logout`);
      }
    },
    { scope: 'test' },
  ],

  zuluEndUserPage: [
    async ({ page }, use) => {
      const _zuluHomePage = await loginToZulu(page, {
        email: process.env.ZULU_END_USER!,
        password: process.env.ZULU_PASSWORD!,
      });
      await use(page);

      // Logout after each test case
      const zuluUrl = process.env.ZULU_URL;
      if (zuluUrl) {
        await page.goto(`${zuluUrl}/logout`);
      }
    },
    { scope: 'test' },
  ],

  zuluBrandingManagerPage: [
    async ({ page }, use) => {
      const _zuluHomePage = await loginToZulu(page, {
        email: process.env.ZULU_BRANDING_MANAGER!,
        password: process.env.ZULU_PASSWORD!,
      });
      await use(page);

      // Logout after each test case
      const zuluUrl = process.env.ZULU_URL;
      if (zuluUrl) {
        await page.goto(`${zuluUrl}/logout`);
      }
    },
    { scope: 'test' },
  ],

  quickTaskPage: [
    async ({ page }, use) => {
      const _quickTaskHomePage = await loginToQuickTask(page, {
        email: process.env.QUICK_TASK_APP_MANAGER_USERNAME!,
        password: process.env.QUICK_TASK_APP_MANAGER_PASSWORD!,
      });
      await use(page);

      // Logout after each test case
      const quickTaskUrl = process.env.QUICK_TASK_BASE_URL;
      if (quickTaskUrl) {
        await page.goto(`${quickTaskUrl}/logout`);
      }
    },
    { scope: 'test' },
  ],

  quickTaskApiFixture: [
    async ({ quickTaskApiContext }, use) => {
      const quickTaskApiUrl = process.env.QUICK_TASK_API_URL;
      if (!quickTaskApiUrl) {
        throw new Error('QUICK_TASK_API_URL not configured in environment variables');
      }
      const quickTaskService = new QuickTaskService(quickTaskApiContext, quickTaskApiUrl);
      const quickTaskTestHelper = new QuickTaskTestHelper(quickTaskService);
      await use({
        apiContext: quickTaskApiContext,
        quickTaskService,
        quickTaskTestHelper,
      });

      // Cleanup: Delete all tracked tasks
      try {
        await quickTaskTestHelper.cleanup();
      } catch (error) {
        console.warn('Quick Task API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],
});
