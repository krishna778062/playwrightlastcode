import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
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
    let siteManagementHelper: SiteManagementHelper;
    let manageSitePageAppManagerSite: ManageSitePage;
    let siteCategoriesPage: SiteCategoriesPage;
    let siteDashboardPage: SiteDashboardPage;
    test.beforeEach(async ({ appManagerApiClient, appManagerHomePage }) => {
      await appManagerHomePage.verifyThePageIsLoaded();
      siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      const siteInfo = await siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
      manageSitePageAppManagerSite = new ManageSitePage(appManagerHomePage.page, siteInfo.siteId);
      siteCategoriesPage = new SiteCategoriesPage(appManagerHomePage.page);
      siteDashboardPage = new SiteDashboardPage(appManagerHomePage.page, siteInfo.siteId);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });
    test(
      'Verify different sites can share same page category name',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, '@CONT-29063'],
      },
      async ({ appManagerHomePage, contentManagementHelper: _contentManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Verify different sites can share same page category name',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-24601',
          storyId: 'CONT-24601',
        });
        const siteNameFirstPublicSite = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const creatingSiteFirstPublicSite = await siteManagementHelper.createSiteByAccessType(
          SITE_TYPES.PUBLIC,
          siteNameFirstPublicSite
        );
        const newSiteDashboard = new SiteDashboardPage(appManagerHomePage.page, creatingSiteFirstPublicSite.siteId);
        await newSiteDashboard.loadPage();
        const manageSitePageFirstPublicSite = new ManageSitePage(
          appManagerHomePage.page,
          creatingSiteFirstPublicSite.siteId
        );
        await manageSitePageFirstPublicSite.actions.clickOnTheManageSiteButton();
        await manageSitePageFirstPublicSite.actions.clickOnThePageCategoryButton();
        const categoryName = await TestDataGenerator.generateCategoryName();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);
        const siteNameSecondPublicSite = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const creatingSiteSecondPublicSite = await siteManagementHelper.createSiteByAccessType(
          SITE_TYPES.PUBLIC,
          siteNameSecondPublicSite
        );
        const newSecondDashboard = new SiteDashboardPage(appManagerHomePage.page, creatingSiteSecondPublicSite.siteId);
        await newSecondDashboard.loadPage();
        const manageSitePageSecondPublicSite = new ManageSitePage(
          appManagerHomePage.page,
          creatingSiteSecondPublicSite.siteId
        );
        await manageSitePageSecondPublicSite.actions.clickOnTheManageSiteButton();
        await manageSitePageSecondPublicSite.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);
        const siteNameThirdPublicSite = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const creatingSiteThirdPublicSite = await siteManagementHelper.createSiteByAccessType(
          SITE_TYPES.PUBLIC,
          siteNameThirdPublicSite
        );
        const newThirdDashboard = new SiteDashboardPage(appManagerHomePage.page, creatingSiteThirdPublicSite.siteId);
        await newThirdDashboard.loadPage();
        const manageSitePageThirdPublicSite = new ManageSitePage(
          appManagerHomePage.page,
          creatingSiteThirdPublicSite.siteId
        );
        await manageSitePageThirdPublicSite.actions.clickOnTheManageSiteButton();
        await manageSitePageThirdPublicSite.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);
        await manageSitePageThirdPublicSite.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);
        await manageSitePageAppManagerSite.assertions.checkTheError();
      }
    );

    test(
      'To verify the favourite people from manage site people',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentFeatureTags.MANAGE_SITE,
          ContentFeatureTags.MANAGE_SITE,
          '@CONT-29063',
        ],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-24178',
          storyId: 'CONT-24178',
        });

        const siteInfo = await siteManagementHelper.getSiteAuthorNameAndEventStartDate();
        const getMembershipList = await siteManagementHelper.getSiteWithMembers(siteInfo.siteId);
        const newSiteDashboard = new SiteDashboardPage(appManagerHomePage.page, getMembershipList.site.siteId);
        await newSiteDashboard.loadPage();
        await manageSitePageAppManagerSite.actions.clickOnAboutTab();
        await manageSitePageAppManagerSite.actions.clickOnTheMembersTab();
        const membersName = await siteManagementHelper.getMembersNameFromList(getMembershipList.site.siteId);
        await manageSitePageAppManagerSite.actions.hoverOnMembersName(membersName.membersName[0]);
        await manageSitePageAppManagerSite.assertions.checkIsUserMarkedAsFavorite();
        await manageSitePageAppManagerSite.assertions.markAsFavoriteAndCheckRGBColor(membersName.membersName[0]);
        await manageSitePageAppManagerSite.actions.clickOnTheFavouriteTabs();
        await manageSitePageAppManagerSite.assertions.clickOnPeppleTab();
        await manageSitePageAppManagerSite.assertions.checkMarkedAsFavoriteInPeopleList(membersName.membersName[0]);
        await manageSitePageAppManagerSite.actions.hoverOnMembersName(membersName.membersName[0]);
        await manageSitePageAppManagerSite.actions.markAsUnfavorite(membersName.membersName[0]);
        const newSecondSiteDashboard = new SiteDashboardPage(appManagerHomePage.page, getMembershipList.site.siteId);
        await newSecondSiteDashboard.loadPage();
        await manageSitePageAppManagerSite.actions.clickOnTheAboutTab();
        await manageSitePageAppManagerSite.actions.clickOnTheMemberButtonInAboutTab();
        await manageSitePageAppManagerSite.assertions.checkMarkedAsFavoriteInPeopleListShouldNotBeVisible(
          membersName.membersName[0]
        );
      }
    );
  }
);
