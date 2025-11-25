import { BrowserContext, Page, test } from '@playwright/test';
import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

import { LoginHelper } from '@core/helpers/loginHelper';
import { NewHomePage } from '@core/pages/newHomePage';

import { NavigationHelper } from '@/src/core/helpers/navigationHelper';

// UI-only fixture type for browser and page components
export interface RecognitionUiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
}

export type RecognitionUserType = 'appManager' | 'recoManager' | 'standardUser';

export const recognitionUsers = {
  appManager: {
    email: getRecognitionTenantConfigFromCache().appManagerEmail,
    password: getRecognitionTenantConfigFromCache().appManagerPassword,
  },
  recoManager: {
    email: getRecognitionTenantConfigFromCache().recognitionManagerEmail,
    password: getRecognitionTenantConfigFromCache().recognitionManagerPassword,
  },
  standardUser: {
    email: getRecognitionTenantConfigFromCache().endUserEmail,
    password: getRecognitionTenantConfigFromCache().endUserPassword,
  },
} as const;

// Helper function to create UI-only fixtures
async function createRecognitionUiFixture(browser: any, userType: RecognitionUserType): Promise<RecognitionUiFixture> {
  const user = recognitionUsers[userType];
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

export const recognitionTestFixture = test.extend<{
  // UI-only fixtures - browser and page components
  appManagerFixture: RecognitionUiFixture;
  recoManagerFixture: RecognitionUiFixture;
  standardUserFixture: RecognitionUiFixture;
}>({
  // UI-only fixtures - browser and page components
  appManagerFixture: [
    async ({ browser }, use) => {
      const fixture = await createRecognitionUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  recoManagerFixture: [
    async ({ browser }, use) => {
      const fixture = await createRecognitionUiFixture(browser, 'recoManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  standardUserFixture: [
    async ({ browser }, use) => {
      const fixture = await createRecognitionUiFixture(browser, 'standardUser');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type RecognitionTestFixture = typeof recognitionTestFixture;
