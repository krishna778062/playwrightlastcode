import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { AudienceManagementHelper } from '../apis/helpers/audienceManagementHelper';
import { SiteAudienceHelper } from '../apis/helpers/siteAudienceHelper';
import { SocialCampaignHelper } from '../apis/helpers/socialCampaignHelper';
import { TileManagementHelper } from '../apis/helpers/tileManagementHelper';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';
import { FeedManagementHelper } from '@/src/modules/content/apis/helpers/feedManagementHelper';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { FeedManagementService } from '@/src/modules/content/apis/services/FeedManagementService';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';
import { getContentTenantConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

// API-only fixture type for API helpers and services
export interface ApiFixture {
  apiContext: APIRequestContext;
  siteManagementHelper: SiteManagementHelper;
  contentManagementHelper: ContentManagementHelper;
  feedManagementHelper: FeedManagementHelper;
  identityManagementHelper: IdentityManagementHelper;
  socialCampaignHelper: SocialCampaignHelper;
  tileManagementHelper: TileManagementHelper;
  audienceManagementHelper: AudienceManagementHelper;
  siteAudienceHelper: SiteAudienceHelper;
  siteManagementService: SiteManagementService;
  feedManagerService: FeedManagementService;
}

// UI-only fixture type for browser and page components
export interface UiFixture {
  browserContext: BrowserContext;
  page: Page;
  homePage: NewHomePage;
  navigationHelper: NavigationHelper;
}

// Combined user fixture type that extends both API and UI fixtures
export interface UserFixture extends ApiFixture, UiFixture {}

export type UserType = 'appManager' | 'endUser' | 'siteManager' | 'socialCampaignManager';

export const users = {
  appManager: {
    email: getContentTenantConfigFromCache().appManagerEmail || '',
    password: getContentTenantConfigFromCache().appManagerPassword || '',
  },
  endUser: {
    email: getContentTenantConfigFromCache().endUserEmail || '',
    password: getContentTenantConfigFromCache().endUserPassword || '',
  },
  siteManager: {
    email: getContentTenantConfigFromCache().siteManagerEmail || '',
    password: getContentTenantConfigFromCache().siteManagerPassword || '',
  },
  socialCampaignManager: {
    email: getContentTenantConfigFromCache().socialCampaignManagerEmail || '',
    password: getContentTenantConfigFromCache().socialCampaignManagerPassword || '',
  },
} as const;

// Helper function to create API-only fixtures using existing API contexts
async function createApiFixture(apiContext: APIRequestContext): Promise<ApiFixture> {
  // Create all helpers and services
  const siteManagementHelper = new SiteManagementHelper(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const tileManagementHelper = new TileManagementHelper(
    apiContext,
    getContentTenantConfigFromCache().apiBaseUrl,
    getContentTenantConfigFromCache().frontendBaseUrl
  );
  const contentManagementHelper = new ContentManagementHelper(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const feedManagementHelper = new FeedManagementHelper(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const identityManagementHelper = new IdentityManagementHelper(
    apiContext,
    getContentTenantConfigFromCache().apiBaseUrl
  );
  const socialCampaignHelper = new SocialCampaignHelper(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const audienceManagementHelper = new AudienceManagementHelper(
    apiContext,
    getContentTenantConfigFromCache().apiBaseUrl
  );

  const siteManagementService = new SiteManagementService(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const feedManagerService = new FeedManagementService(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const siteAudienceHelper = new SiteAudienceHelper(apiContext, getContentTenantConfigFromCache().apiBaseUrl);

  return {
    apiContext,
    siteManagementHelper,
    contentManagementHelper,
    feedManagementHelper,
    identityManagementHelper,
    socialCampaignHelper,
    audienceManagementHelper,
    siteAudienceHelper,
    siteManagementService,
    tileManagementHelper,
    feedManagerService,
  };
}

// Helper function to create UI-only fixtures
async function createUiFixture(browser: any, userType: UserType): Promise<UiFixture> {
  const user = users[userType];
  const context = await browser.newContext();
  const page = await context.newPage();

  // Handle browser alerts by clicking OK
  page.on('dialog', async (dialog: any) => {
    console.log(`Dialog appeared: ${dialog.message()}`);
    await dialog.accept();
  });

  await LoginHelper.loginWithPassword(page, {
    email: user.email,
    password: user.password,
  });

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

export const contentTestFixture = test.extend<
  {
    // API-only fixtures - fast, no browser overhead
    appManagerApiFixture: ApiFixture;
    standardUserApiFixture: ApiFixture;
    siteManagerApiFixture: ApiFixture;
    socialCampaignManagerApiFixture: ApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: UiFixture;
    standardUserUiFixture: UiFixture;
    siteManagerUiFixture: UiFixture;
    socialCampaignManagerUiFixture: UiFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: UserFixture;
    standardUserFixture: UserFixture;
    siteManagerFixture: UserFixture;
    socialCampaignManagerFixture: UserFixture;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    standardUserApiContext: APIRequestContext;
    siteManagerApiContext: APIRequestContext;
    socialCampaignManagerApiContext: APIRequestContext;
  }
>({
  // Worker-scoped API client - shared across all tests in worker
  appManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(
        getContentTenantConfigFromCache().apiBaseUrl,
        {
          email: users.appManager.email,
          password: users.appManager.password,
        }
      );
      await use(context);
    },
    { scope: 'worker' },
  ],

  standardUserApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(
        getContentTenantConfigFromCache().apiBaseUrl,
        {
          email: users.endUser.email,
          password: users.endUser.password,
        }
      );
      await use(context);
    },
    { scope: 'worker' },
  ],

  siteManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(
        getContentTenantConfigFromCache().apiBaseUrl,
        {
          email: users.siteManager.email,
          password: users.siteManager.password,
        }
      );
      await use(context);
    },
    { scope: 'worker' },
  ],

  socialCampaignManagerApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(
        getContentTenantConfigFromCache().apiBaseUrl,
        {
          email: users.socialCampaignManager.email,
          password: users.socialCampaignManager.password,
        }
      );
      await use(context);
    },
    { scope: 'worker' },
  ],

  // API-only fixtures - fast, no browser overhead, using worker-scoped contexts
  appManagerApiFixture: [
    async ({ appManagerApiContext }, use) => {
      const fixture = await createApiFixture(appManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.siteManagementHelper.cleanup();
        await fixture.tileManagementHelper.cleanup();
        await fixture.contentManagementHelper.cleanup();
        await fixture.feedManagementHelper.cleanup();
        await fixture.socialCampaignHelper.cleanup();
      } catch (error) {
        console.warn('App manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  standardUserApiFixture: [
    async ({ standardUserApiContext }, use) => {
      const fixture = await createApiFixture(standardUserApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.siteManagementHelper.cleanup();
        await fixture.tileManagementHelper.cleanup();
        await fixture.contentManagementHelper.cleanup();
        await fixture.feedManagementHelper.cleanup();
        await fixture.socialCampaignHelper.cleanup();
      } catch (error) {
        console.warn('Standard user API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  siteManagerApiFixture: [
    async ({ siteManagerApiContext }, use) => {
      const fixture = await createApiFixture(siteManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.siteManagementHelper.cleanup();
        await fixture.tileManagementHelper.cleanup();
        await fixture.contentManagementHelper.cleanup();
        await fixture.feedManagementHelper.cleanup();
        await fixture.socialCampaignHelper.cleanup();
      } catch (error) {
        console.warn('Site manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  socialCampaignManagerApiFixture: [
    async ({ socialCampaignManagerApiContext }, use) => {
      const fixture = await createApiFixture(socialCampaignManagerApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.siteManagementHelper.cleanup();
        await fixture.tileManagementHelper.cleanup();
        await fixture.contentManagementHelper.cleanup();
        await fixture.feedManagementHelper.cleanup();
        await fixture.socialCampaignHelper.cleanup();
      } catch (error) {
        console.warn('Social campaign manager API fixture cleanup failed:', error);
      }
    },
    { scope: 'test' },
  ],

  // UI-only fixtures - browser and page components
  appManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createUiFixture(browser, 'appManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  standardUserUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createUiFixture(browser, 'endUser');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  siteManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createUiFixture(browser, 'siteManager');
      await use(fixture);
      await fixture.browserContext.close();
    },
    { scope: 'test' },
  ],

  socialCampaignManagerUiFixture: [
    async ({ browser }, use) => {
      const fixture = await createUiFixture(browser, 'socialCampaignManager');
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

  standardUserFixture: [
    async ({ standardUserUiFixture, standardUserApiFixture }, use) => {
      await use({ ...standardUserUiFixture, ...standardUserApiFixture });
    },
    { scope: 'test' },
  ],

  siteManagerFixture: [
    async ({ siteManagerUiFixture, siteManagerApiFixture }, use) => {
      await use({ ...siteManagerUiFixture, ...siteManagerApiFixture });
    },
    { scope: 'test' },
  ],

  socialCampaignManagerFixture: [
    async ({ socialCampaignManagerUiFixture, socialCampaignManagerApiFixture }, use) => {
      await use({ ...socialCampaignManagerUiFixture, ...socialCampaignManagerApiFixture });
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type ContentTestFixture = typeof contentTestFixture;
