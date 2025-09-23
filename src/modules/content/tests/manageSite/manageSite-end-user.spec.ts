import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { tagTest } from '@core/utils/testDecorator';

import { ManageSitePage } from '../../pages/manageSitePage';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FeaturedSitePage } from '@/src/modules/content/pages/featuredSitePage';
import { ApplicationScreenPage } from '@/src/modules/content/pages/manageFeaturesPage';
import { SiteCategoriesPage } from '@/src/modules/content/pages/siteCategoriesPage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    let manageSitePage: ManageSitePage;
    let siteManagementHelper: SiteManagementHelper;
    let featuredSitePage: FeaturedSitePage;
    let manageFeaturesPage: ApplicationScreenPage;
    let siteCategoriesPage: SiteCategoriesPage;
    let siteDashboardPage: SiteDashboardPage;
    test.beforeEach(async ({ appManagerApiClient, appManagerHomePage }) => {
      await appManagerHomePage.verifyThePageIsLoaded();
      siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      const siteInfo = await siteManagementHelper.getSiteWithCoverImageAndAuthorNameAndStartDate();
      manageSitePage = new ManageSitePage(appManagerHomePage.page, siteInfo.siteId);
      featuredSitePage = new FeaturedSitePage(appManagerHomePage.page);
      manageFeaturesPage = new ApplicationScreenPage(appManagerHomePage.page);
      siteCategoriesPage = new SiteCategoriesPage(appManagerHomePage.page);
      siteDashboardPage = new SiteDashboardPage(appManagerHomePage.page, siteInfo.siteId);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });

    test(
      'To verify the UI of Manage site content - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'To verify the UI of Manage site content - End User',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-23740',
          storyId: 'CONT-23740',
        });
        await manageFeaturesPage.actions.clickOnSitesCard();
        const siteInfo = await siteManagementHelper.getSiteWithCoverImageAndAuthorNameAndStartDate();
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(siteInfo.siteId);
        await manageSitePage.assertions.verifyCoverImageIsVisible();
        await manageSitePage.actions.clickOnContentButton();
        await manageSitePage.actions.searchEventInSearchBar(siteInfo.eventName!);
        await manageSitePage.assertions.verifyEventsTabMatchesApiDate(siteInfo.startsAt!);
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(siteInfo.siteId);
        await manageSitePage.actions.clickOnContentButton();
        await manageSitePage.assertions.checkAlbumCoverImageIsVisible();
        await manageSitePage.assertions.checkAuthorNameIsDisplayed(siteInfo.authorName!);
      }
    );

    test(
      'Verify different sites can share same page category name',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({ appManagerHomePage, contentManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Verify different sites can share same page category name d',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-24601',
          storyId: 'CONT-24601',
        });
        await manageFeaturesPage.actions.clickOnSitesCard();
        // Create first site and add category
        const siteName1 = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const creatingSite1 = await siteManagementHelper.createSiteByAccessType(SITE_TYPES.PUBLIC, siteName1);
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(creatingSite1.siteId);
        const manageSitePage1 = new ManageSitePage(appManagerHomePage.page, creatingSite1.siteId);
        await manageSitePage1.actions.clickOnTheManageSiteButton();
        await manageSitePage1.actions.clickOnThePageCategoryButton();
        const categoryName = await TestDataGenerator.generateCategoryName();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);

        // Create second site and add same category name
        const siteName2 = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const creatingSite2 = await siteManagementHelper.createSiteByAccessType(SITE_TYPES.PUBLIC, siteName2);
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(creatingSite2.siteId);
        const manageSitePage2 = new ManageSitePage(appManagerHomePage.page, creatingSite2.siteId);
        await manageSitePage2.actions.clickOnTheManageSiteButton();
        await manageSitePage2.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);
        const siteName3 = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const creatingSite3 = await siteManagementHelper.createSiteByAccessType(SITE_TYPES.PUBLIC, siteName3);
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(creatingSite3.siteId);
        const manageSitePage3 = new ManageSitePage(appManagerHomePage.page, creatingSite3.siteId);
        await manageSitePage3.actions.clickOnTheManageSiteButton();
        await manageSitePage3.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);
        await manageSitePage3.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);
        await manageSitePage.assertions.checkTheError();
      }
    );
  }
);
