import { APIRequestContext, BrowserContext, Page, test } from '@playwright/test';

import { ABACContentManagementHelper } from '../apis/helpers/ABACContentManagementHelper';
import { ABACSiteManagementHelper } from '../apis/helpers/ABACSiteManagementHelper';

import { RequestContextFactory } from '@/src/core/api/factories/requestContextFactory';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { ABACAudienceHelper } from '@/src/modules/content/apis/helpers/ABACAudienceHelper';
import { AudienceManagementHelper } from '@/src/modules/content/apis/helpers/audienceManagementHelper';
import { B2BHelper } from '@/src/modules/content/apis/helpers/b2bHelper';
import { CarouselHelper } from '@/src/modules/content/apis/helpers/carouselHelper';
import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';
import { FeedManagementHelper } from '@/src/modules/content/apis/helpers/feedManagementHelper';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { SocialCampaignHelper } from '@/src/modules/content/apis/helpers/socialCampaignHelper';
import { TileManagementHelper } from '@/src/modules/content/apis/helpers/tileManagementHelper';
import { FeedManagementService } from '@/src/modules/content/apis/services/FeedManagementService';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';
import {
  getContentEnvironmentFromCache,
  getContentTenantConfigFromCache,
} from '@/src/modules/content/config/contentConfig';
import { createAuthenticatedContextAndPageWithCache } from '@/src/modules/content/helpers/storageStateHelper';
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
  carouselHelper: CarouselHelper;
  audienceManagementHelper: AudienceManagementHelper;
  b2bHelper: B2BHelper;
  siteManagementService: SiteManagementService;
  feedManagerService: FeedManagementService;
  abacSiteManagementHelper: ABACSiteManagementHelper;
  abacContentManagementHelper: ABACContentManagementHelper;
  abacAudienceHelper: ABACAudienceHelper;
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

export type UserType = 'appManager' | 'endUser' | 'siteManager' | 'socialCampaignManager' | 'standardUser2';

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
  standardUser2: {
    email: getContentTenantConfigFromCache().standardUser2Email || '',
    password: getContentTenantConfigFromCache().standardUser2Password || '',
  },
} as const;

// Helper function to create API-only fixtures using existing API contexts
async function createApiFixture(apiContext: APIRequestContext): Promise<ApiFixture> {
  // Create all helpers and services
  const siteManagementHelper = new SiteManagementHelper(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const abacSiteManagementHelper = new ABACSiteManagementHelper(
    apiContext,
    getContentTenantConfigFromCache().apiBaseUrl
  );
  const abacContentManagementHelper = new ABACContentManagementHelper(
    apiContext,
    getContentTenantConfigFromCache().apiBaseUrl
  );
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
  const carouselHelper = new CarouselHelper(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const audienceManagementHelper = new AudienceManagementHelper(
    apiContext,
    getContentTenantConfigFromCache().apiBaseUrl
  );

  const siteManagementService = new SiteManagementService(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const feedManagerService = new FeedManagementService(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const abacAudienceHelper = new ABACAudienceHelper(apiContext, getContentTenantConfigFromCache().apiBaseUrl);
  const b2bHelper = new B2BHelper(
    apiContext,
    getContentTenantConfigFromCache().orgId,
    getContentTenantConfigFromCache().b2bBaseUrl
  );

  return {
    apiContext,
    siteManagementHelper,
    contentManagementHelper,
    feedManagementHelper,
    identityManagementHelper,
    socialCampaignHelper,
    tileManagementHelper,
    carouselHelper,
    audienceManagementHelper,
    abacAudienceHelper,
    b2bHelper,
    siteManagementService,
    feedManagerService,
    abacSiteManagementHelper,
    abacContentManagementHelper,
  };
}

// Helper function to create UI-only fixtures
async function createUiFixture(browser: any, userType: UserType): Promise<UiFixture> {
  const user = users[userType];
  const tenantConfig = getContentTenantConfigFromCache();
  const testEnv = getContentEnvironmentFromCache();

  // Use storage state caching to avoid redundant logins
  const { context, page } = await createAuthenticatedContextAndPageWithCache({
    browser,
    userEmail: user.email,
    userPassword: user.password,
    testEnv,
    tenantOrgId: tenantConfig.orgId,
  });

  // Handle browser alerts by clicking OK
  page.on('dialog', async (dialog: any) => {
    console.log(`Dialog appeared: ${dialog.message()}`);
    await dialog.accept();
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
    standardUser2ApiFixture: ApiFixture;

    // UI-only fixtures - browser and page components
    appManagerUiFixture: UiFixture;
    standardUserUiFixture: UiFixture;
    siteManagerUiFixture: UiFixture;
    socialCampaignManagerUiFixture: UiFixture;
    standardUser2UiFixture: UiFixture;

    // Combined user fixtures - complete entry points with all helpers and services
    appManagerFixture: UserFixture;
    standardUserFixture: UserFixture;
    siteManagerFixture: UserFixture;
    socialCampaignManagerFixture: UserFixture;
    standardUser2Fixture: UserFixture;
  },
  {
    // Worker-scoped fixtures
    appManagerApiContext: APIRequestContext;
    standardUserApiContext: APIRequestContext;
    siteManagerApiContext: APIRequestContext;
    socialCampaignManagerApiContext: APIRequestContext;
    standardUser2ApiContext: APIRequestContext;
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

  standardUser2ApiContext: [
    async ({}, use) => {
      const context = await RequestContextFactory.createAuthenticatedContext(
        getContentTenantConfigFromCache().apiBaseUrl,
        {
          email: users.standardUser2.email,
          password: users.standardUser2.password,
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
        await fixture.abacSiteManagementHelper.cleanup();
        await fixture.abacContentManagementHelper.cleanup();
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

  standardUser2ApiFixture: [
    async ({ standardUser2ApiContext }, use) => {
      const fixture = await createApiFixture(standardUser2ApiContext);
      await use(fixture);

      // Cleanup helpers that have cleanup methods
      try {
        await fixture.siteManagementHelper.cleanup();
        await fixture.tileManagementHelper.cleanup();
        await fixture.contentManagementHelper.cleanup();
        await fixture.feedManagementHelper.cleanup();
        await fixture.socialCampaignHelper.cleanup();
      } catch (error) {
        console.warn('Standard user 2 API fixture cleanup failed:', error);
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

  standardUser2UiFixture: [
    async ({ browser }, use) => {
      const fixture = await createUiFixture(browser, 'standardUser2');
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

  standardUser2Fixture: [
    async ({ standardUser2UiFixture, standardUser2ApiFixture }, use) => {
      await use({ ...standardUser2UiFixture, ...standardUser2ApiFixture });
    },
    { scope: 'test' },
  ],
});

// Export commonly used types for better type safety
export type ContentTestFixture = typeof contentTestFixture;
