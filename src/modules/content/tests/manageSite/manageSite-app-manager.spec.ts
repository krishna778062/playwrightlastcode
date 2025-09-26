import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/pages/manageFeaturesPage';
import { ManageSitePage } from '@/src/modules/content/pages/manageSitePage';
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
    let manageFeaturesPage: ApplicationScreenPage;
    let siteCategoriesPage: SiteCategoriesPage;
    let siteDashboardPage: SiteDashboardPage;
    test.beforeEach(async ({ appManagerApiClient, appManagerHomePage }) => {
      await appManagerHomePage.verifyThePageIsLoaded();
      siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      const siteInfo = await siteManagementHelper.getSiteWithCoverImageAndAuthorNameAndStartDate();
      manageSitePage = new ManageSitePage(appManagerHomePage.page, siteInfo.siteId);
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
        // await manageFeaturesPage.actions.clickOnSitesCard();
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
      async ({ appManagerHomePage, contentManagementHelper: _contentManagementHelper }) => {
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

    test(
      'To verify the favourite people from manage site people',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-24178',
          storyId: 'CONT-24178',
        });

        const siteInfo = await siteManagementHelper.getSiteWithCoverImageAndAuthorNameAndStartDate();
        const creatingSite = await siteManagementHelper.getSiteWithMembers(siteInfo.siteId);
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(creatingSite.site.siteId);
        await manageSitePage.actions.clickOnAboutTab();
        await manageSitePage.actions.clickOnTheMembersTab();
        const membersName = await siteManagementHelper.getMembersNameFromList(creatingSite.site.siteId);
        await manageSitePage.actions.hoverOnMembersName(membersName.membersName[0]);
        await manageSitePage.assertions.checkIsUserMarkedAsFavorite();
        await manageSitePage.assertions.markAsFavoriteAndCheckRGBColor(membersName.membersName[0]);
        await manageSitePage.actions.clickOnTheFavouriteTabs();
        await manageSitePage.assertions.clickOnPeppleTab();
        await manageSitePage.assertions.checkMarkedAsFavoriteInPeopleList(membersName.membersName[0]);
        await manageSitePage.actions.hoverOnMembersName(membersName.membersName[0]);
        await manageSitePage.actions.markAsUnfavorite(membersName.membersName[0]);
        await siteDashboardPage.assertions.verifySiteDashboardLoadedWithSiteID(creatingSite.site.siteId);
        await manageSitePage.actions.clickOnTheAboutTab();
        await manageSitePage.actions.clickOnTheMemberButtonInAboutTab();
        await manageSitePage.assertions.checkMarkedAsFavoriteInPeopleListShouldNotBeVisible(membersName.membersName[0]);
      }
    );
  }
);
