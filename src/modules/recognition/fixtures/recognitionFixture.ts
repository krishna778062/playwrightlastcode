import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { RequestContextFactory } from '@/src/core/api';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';

// API-only fixture type for API contexts
export interface RecognitionApiFixture {
  apiContext: APIRequestContext;
}

// UI-only fixture type for browser and page components
export interface RecognitionUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
}

// Combined user fixture type that extends both API and UI fixtures
export interface RecognitionUserFixture extends RecognitionApiFixture, RecognitionUiFixture {}

// Helper function to create API-only fixtures using existing API contexts
async function createRecognitionApiFixture(apiContext: APIRequestContext): Promise<RecognitionApiFixture> {
  return {
    apiContext,
  };
}

// Helper function to create UI-only fixtures for a specific user type
async function createRecognitionUiFixture(
  browser: any,
  userType: 'appManager' | 'recognitionManager' | 'standardUser'
): Promise<RecognitionUiFixture> {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login based on user type
  if (userType === 'appManager') {
    await LoginHelper.loginWithPassword(page, {
      email: getEnvConfig().appManagerEmail,
      password: getEnvConfig().appManagerPassword,
    });
  } else if (userType === 'recognitionManager') {
    await LoginHelper.loginWithPassword(page, {
      email: String(process.env['RECOGNITION_USER_USERNAME']),
      password: String(process.env['RECOGNITION_USER_PASSWORD']),
    });
  } else {
    // standardUser with fallback logic
    await LoginHelper.loginWithPassword(page, {
      email: process.env['STANDARD_USER_USERNAME'] || getEnvConfig().appManagerEmail,
      password: process.env['STANDARD_USER_PASSWORD'] || getEnvConfig().appManagerPassword,
    });
  }

  const homePage = new NewHomePage(page);
  await homePage.loadPage();
  await homePage.verifyThePageIsLoaded();

  const navigationHelper = new NavigationHelper(page);

  return {
    browserContext: context,
    page,
    homePage,
    navigationHelper,
  };
}

export const recognitionTestFixture = test.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: RecognitionApiFixture;
    recognitionManagerApiFixture: RecognitionApiFixture;
    standardUserApiFixture: RecognitionApiFixture;

    // UI-only fixtures - browser and page components for each user
    appManagerUiFixture: RecognitionUiFixture;
    recognitionManagerUiFixture: RecognitionUiFixture;
    standardUserUiFixture: RecognitionUiFixture;

    // Combined user fixtures - complete entry points
    appManagerFixture: RecognitionUserFixture;
    recognitionManagerFixture: RecognitionUserFixture;
    standardUserFixture: RecognitionUserFixture;
  },
  {
    appManagerApiContext: APIRequestContext;
    recognitionManagerApiContext: APIRequestContext;
    standardUserApiContext: APIRequestContext;
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

  recognitionManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: String(process.env['RECOGNITION_USER_USERNAME']),
        password: String(process.env['RECOGNITION_USER_PASSWORD']),
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  standardUserApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(getEnvConfig().apiBaseUrl, {
        email: process.env['STANDARD_USER_USERNAME'] || getEnvConfig().appManagerEmail,
        password: process.env['STANDARD_USER_PASSWORD'] || getEnvConfig().appManagerPassword,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead, using worker-scoped contexts
  appManagerApiFixture: [
    async ({ appManagerApiContext }, use) => {
      const fixture = await createRecognitionApiFixture(appManagerApiContext);
      await use(fixture);
    },
    { scope: 'test' },
  ],

  recognitionManagerApiFixture: [
    async ({ recognitionManagerApiContext }, use) => {
      const fixture = await createRecognitionApiFixture(recognitionManagerApiContext);
      await use(fixture);
    },
    { scope: 'test' },
  ],

  standardUserApiFixture: [
    async ({ standardUserApiContext }, use) => {
      const fixture = await createRecognitionApiFixture(standardUserApiContext);
      await use(fixture);
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components for each user
  appManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createRecognitionUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  recognitionManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createRecognitionUiFixture(browser, 'recognitionManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  standardUserUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createRecognitionUiFixture(browser, 'standardUser');
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

  recognitionManagerFixture: [
    async ({ recognitionManagerUiFixture, recognitionManagerApiFixture }, use) => {
      await use({ ...recognitionManagerUiFixture, ...recognitionManagerApiFixture });
    },
    { scope: 'test' },
  ],

  standardUserFixture: [
    async ({ standardUserUiFixture, standardUserApiFixture }, use) => {
      await use({ ...standardUserUiFixture, ...standardUserApiFixture });
    },
    { scope: 'test' },
  ],
});
