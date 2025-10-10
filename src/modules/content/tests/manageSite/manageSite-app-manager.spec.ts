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
import { MANAGE_SITE_TEST_DATA as _MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    let siteManagementHelper: SiteManagementHelper;
    let siteCategoriesPage: SiteCategoriesPage;
    let usedSiteIds: string[] = []; // Track used site IDs across tests

    // Helper function to get a unique site that hasn't been used before
    async function getUniqueSite(
      accessType: string,
      maxAttempts: number = 10
    ): Promise<{ siteId: string; name: string; authorName?: string }> {
      let attempts = 0;
      let site;

      while (attempts < maxAttempts) {
        site = await siteManagementHelper.getSiteByAccessType(accessType);

        if (!usedSiteIds.includes(site.siteId)) {
          usedSiteIds.push(site.siteId);
          console.log(`Using new unique site: ${site.name} (${site.siteId})`);
          console.log(`Current used sites: ${usedSiteIds.join(', ')}`);
          return site;
        }

        console.log(`Site ${site.siteId} already used, attempting to get another site...`);
        attempts++;

        // If we've tried many times with the same result, create a new site
        if (attempts >= maxAttempts - 2) {
          console.log(`Creating new site after ${attempts} attempts...`);
          const newSite = await siteManagementHelper.createSiteByAccessType(accessType);
          const siteWithName = { siteId: newSite.siteId, name: newSite.siteName };
          usedSiteIds.push(siteWithName.siteId);
          return siteWithName;
        }
      }

      throw new Error(`Failed to get unique site after ${maxAttempts} attempts`);
    }

    test.beforeEach(async ({ appManagerApiClient, appManagerHomePage }) => {
      await appManagerHomePage.verifyThePageIsLoaded();
      siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      siteCategoriesPage = new SiteCategoriesPage(appManagerHomePage.page);

      // Clear used site IDs at the start of each test for fresh tracking
      usedSiteIds = [];
      console.log('Cleared used site IDs for new test');
    });

    test.afterEach(async ({ page }) => {
      console.log(`Test completed. Total unique sites used: ${usedSiteIds.length}`);
      console.log(`Site IDs used in this test: ${usedSiteIds.join(', ')}`);
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

        // Get first unique site
        const creatingSiteFirstPublicSite = await getUniqueSite(SITE_TYPES.PUBLIC);
        const newSiteDashboard = new SiteDashboardPage(appManagerHomePage.page, creatingSiteFirstPublicSite.siteId);
        await newSiteDashboard.loadPage();
        const firstManageSitePageAppManagerSite = new ManageSitePage(
          appManagerHomePage.page,
          creatingSiteFirstPublicSite.siteId
        );
        await firstManageSitePageAppManagerSite.actions.clickOnTheManageSiteButton();
        await firstManageSitePageAppManagerSite.actions.clickOnThePageCategoryButton();
        const categoryName = await TestDataGenerator.generateCategoryName();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);

        // Get second unique site (different from first)
        const creatingSiteSecondPublicSite = await getUniqueSite(SITE_TYPES.PUBLIC);
        const newSecondDashboard = new SiteDashboardPage(appManagerHomePage.page, creatingSiteSecondPublicSite.siteId);
        await newSecondDashboard.loadPage();
        const manageSitePageSecondPublicSite = new ManageSitePage(
          appManagerHomePage.page,
          creatingSiteSecondPublicSite.siteId
        );
        const secondManageSitePageAppManagerSite = new ManageSitePage(
          appManagerHomePage.page,
          creatingSiteSecondPublicSite.siteId
        );
        await manageSitePageSecondPublicSite.actions.clickOnTheManageSiteButton();
        await secondManageSitePageAppManagerSite.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);

        // Get third unique site (different from first and second)
        const creatingSiteThirdPublicSite = await getUniqueSite(SITE_TYPES.PUBLIC);
        const newThirdDashboard = new SiteDashboardPage(appManagerHomePage.page, creatingSiteThirdPublicSite.siteId);
        await newThirdDashboard.loadPage();
        const thirdManageSitePageAppManagerSite = new ManageSitePage(
          appManagerHomePage.page,
          creatingSiteThirdPublicSite.siteId
        );
        const manageSitePageThirdPublicSite = new ManageSitePage(
          appManagerHomePage.page,
          creatingSiteThirdPublicSite.siteId
        );
        await manageSitePageThirdPublicSite.actions.clickOnTheManageSiteButton();
        await manageSitePageThirdPublicSite.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);
        await manageSitePageThirdPublicSite.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);
        await thirdManageSitePageAppManagerSite.assertions.checkTheError();
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
        const newSiteDashboard = new SiteDashboardPage(appManagerHomePage.page, siteInfo.siteId);
        await newSiteDashboard.loadPage();
        const manageSitePageAppManagerSite = new ManageSitePage(appManagerHomePage.page, siteInfo.siteId);
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
