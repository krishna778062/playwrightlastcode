import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { tagTest } from '@core/utils/testDecorator';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/pages/manageFeaturesPage';
import { ManageSitePage } from '@/src/modules/content/pages/manageSitePage';
import { SiteCategoriesPage } from '@/src/modules/content/pages/siteCategoriesPage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    let manageSitePage: ManageSitePage;
    let siteManagementHelper: SiteManagementHelper;
    let manageFeaturesPage: ApplicationScreenPage;
    let siteCategoriesPage: SiteCategoriesPage;
    let siteDashboardPage: SiteDashboardPage;
    test.beforeEach(
      async ({ standardUserHomePage, standardUserApiClient, appManagerApiClient, appManagerHomePage }) => {
        await appManagerHomePage.verifyThePageIsLoaded();
        siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
        const siteNamePublic = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const siteNamePrivate = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const siteNameUnlisted = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const categoryID = await siteManagementHelper.getRandomCategoryId();
        const site1 = await siteManagementHelper.createSiteWithMember(
          process.env.END_USER_USERNAME!,
          siteNamePublic,
          categoryID,
          SITE_TYPES.PUBLIC
        );
        await siteManagementHelper.addPersonInSite(site1.siteId, process.env.END_USER_USERID!);
        const site2 = await siteManagementHelper.createSiteWithMember(
          process.env.END_USER_USERNAME!,
          siteNamePrivate,
          categoryID,
          SITE_TYPES.PRIVATE
        );
        await siteManagementHelper.addPersonInSite(site2.siteId, process.env.END_USER_USERID!);
        const site3 = await siteManagementHelper.createSiteWithMember(
          process.env.END_USER_USERNAME!,
          siteNameUnlisted,
          categoryID,
          SITE_TYPES.UNLISTED
        );
        await siteManagementHelper.addPersonInSite(site3.siteId, process.env.END_USER_USERID!);
        siteManagementHelper = new SiteManagementHelper(standardUserApiClient);
        const siteInfo = await siteManagementHelper.getSiteWhichUserHasAlreadyMember(SITE_TYPES.PUBLIC);
        manageSitePage = new ManageSitePage(standardUserHomePage.page, siteInfo.siteId);
        manageFeaturesPage = new ApplicationScreenPage(standardUserHomePage.page);
        siteCategoriesPage = new SiteCategoriesPage(standardUserHomePage.page);
        siteDashboardPage = new SiteDashboardPage(standardUserHomePage.page, siteInfo.siteId);
      }
    );

    test.afterEach(async ({ page }) => {
      await page.close();
    });
    test(
      'Login as Admin/Standard User where user is Site Content Manager of Public site "Site A"',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const siteInfo = await siteManagementHelper.getSiteWhichUserHasAlreadyMember(SITE_TYPES.PUBLIC);
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(siteInfo.siteId);
        await manageSitePage.actions.clickOntheMemberButton();
        await manageSitePage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'Login as Admin/Standard User where user is Site Content Manager of Private site "Site A"',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const siteInfo = await siteManagementHelper.getSiteWhichUserHasAlreadyMember(SITE_TYPES.PRIVATE);
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(siteInfo.siteId);
        await manageSitePage.actions.clickOntheMemberButton();
        await manageSitePage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'Login as Admin/Standard User where user is Site Content Manager of Unlisted site "Site A"',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const siteInfo = await siteManagementHelper.getSiteWhichUserHasAlreadyMember(SITE_TYPES.UNLISTED);
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(siteInfo.siteId);
        await manageSitePage.actions.clickOntheMemberButton();
        await manageSitePage.assertions.clickOnLeaveButton();
      }
    );
  }
);
