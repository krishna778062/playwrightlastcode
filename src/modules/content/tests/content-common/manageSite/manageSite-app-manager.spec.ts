import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import { ManageContentOptions, SortOptionLabels, TagOption } from '@/src/modules/content/constants';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { AddToCampaignComponent } from '@/src/modules/content/ui/components/addToCampaignComponent';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
import { OnboardingComponent } from '@/src/modules/content/ui/components/onboardingComponent';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { SiteCategoriesPage } from '@/src/modules/content/ui/pages/siteCategoriesPage';
import { SiteDetailsPage } from '@/src/modules/content/ui/pages/siteDetailsPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    let siteManagementHelper: SiteManagementHelper;
    let siteCategoriesPage: SiteCategoriesPage;
    let manageContentPage: ManageContentPage;
    let manageFeaturesPage: ManageFeaturesPage;
    let manageSiteAppManagerPage: ManageSiteSetUpPage;
    let manageSitesComponent: ManageSitesComponent;
    let onboardingComponent: OnboardingComponent;
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
          const newSite = await siteManagementHelper.createSite({ accessType: accessType as SITE_TYPES });
          const siteWithName = { siteId: newSite.siteId, name: newSite.siteName };
          usedSiteIds.push(siteWithName.siteId);
          return siteWithName;
        }
      }

      throw new Error(`Failed to get unique site after ${maxAttempts} attempts`);
    }

    test.beforeEach(async ({ appManagerFixture }) => {
      await appManagerFixture.homePage.verifyThePageIsLoaded();
      siteCategoriesPage = new SiteCategoriesPage(appManagerFixture.page);
      siteManagementHelper = appManagerFixture.siteManagementHelper;
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
      addToCampaignComponent = new AddToCampaignComponent(appManagerFixture.page);

      manageSitesComponent = new ManageSitesComponent(appManagerFixture.page);
      onboardingComponent = new OnboardingComponent(appManagerFixture.page);
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
      'verify different sites can share same page category name',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29063'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify different sites can share same page category name',
          zephyrTestId: 'CONT-24601',
          storyId: 'CONT-24601',
        });

        // Get first unique site
        const creatingSiteFirstPublicSite = await getUniqueSite(SITE_TYPES.PUBLIC);
        const newSiteDashboard = new SiteDashboardPage(appManagerFixture.page, creatingSiteFirstPublicSite.siteId);
        await newSiteDashboard.loadPage();
        const firstManageSitePageAppManagerSite = new ManageSiteSetUpPage(
          appManagerFixture.page,
          creatingSiteFirstPublicSite.siteId
        );
        await firstManageSitePageAppManagerSite.actions.clickOnTheManageSiteButton();
        await firstManageSitePageAppManagerSite.actions.clickOnThePageCategoryButton();
        const categoryName = TestDataGenerator.generateCategoryName();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);

        // Get second unique site (different from first)
        const creatingSiteSecondPublicSite = await getUniqueSite(SITE_TYPES.PUBLIC);
        const newSecondDashboard = new SiteDashboardPage(appManagerFixture.page, creatingSiteSecondPublicSite.siteId);
        await newSecondDashboard.loadPage();
        const manageSitePageSecondPublicSite = new ManageSiteSetUpPage(
          appManagerFixture.page,
          creatingSiteSecondPublicSite.siteId
        );
        const secondManageSitePageAppManagerSite = new ManageSiteSetUpPage(
          appManagerFixture.page,
          creatingSiteSecondPublicSite.siteId
        );
        await manageSitePageSecondPublicSite.actions.clickOnTheManageSiteButton();
        await secondManageSitePageAppManagerSite.actions.clickOnThePageCategoryButton();
        await siteCategoriesPage.actions.createCategoryWithName(categoryName);

        // Get third unique site (different from first and second)
        const creatingSiteThirdPublicSite = await getUniqueSite(SITE_TYPES.PUBLIC);
        const newThirdDashboard = new SiteDashboardPage(appManagerFixture.page, creatingSiteThirdPublicSite.siteId);
        await newThirdDashboard.loadPage();
        const thirdManageSitePageAppManagerSite = new ManageSiteSetUpPage(
          appManagerFixture.page,
          creatingSiteThirdPublicSite.siteId
        );
        const manageSitePageThirdPublicSite = new ManageSiteSetUpPage(
          appManagerFixture.page,
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
      'verify Scheduled stamp and its options menu under-manage site content tab',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT, '@CONT-23966'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Scheduled stamp and its options menu under-manage site content tab',
          zephyrTestId: 'CONT-23966',
          storyId: 'CONT-23966',
        });
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          hasPages: true,
        });
        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: {
            publishAt: getTomorrowDateIsoString(),
          },
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.actions.scheduledTagVisibleInManageContent();
        await manageContentPage.actions.checkContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.EDIT);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.DELETE);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.PUBLISH);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.MOVE);
        await manageContentPage.actions.clickOnPublishButton();
      }
    );

    test(
      'to verify the favourite people from manage site people',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29063'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          zephyrTestId: 'CONT-24178',
          storyId: 'CONT-24178',
        });

        const getMembershipList = await appManagerApiFixture.siteManagementHelper.getSiteWithMembers(
          SITE_TYPES.PUBLIC,
          2
        );
        const siteId = getMembershipList.site.siteId;
        const members = getMembershipList.members.listOfItems || [];
        const membersName = { membersName: members.map((m: any) => m.name || m.displayName || m.email) };

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        const manageSitePageAppManagerSite = new ManageSiteSetUpPage(appManagerFixture.page, siteId);
        await manageSitePageAppManagerSite.actions.clickOnAboutTab();
        await manageSitePageAppManagerSite.actions.clickOnTheMembersTab();
        await manageSitePageAppManagerSite.actions.hoverOnMembersName(membersName.membersName[0]);
        await manageSitePageAppManagerSite.assertions.checkIsUserMarkedAsFavorite();
        await manageSitePageAppManagerSite.assertions.markAsFavoriteAndCheckRGBColor(membersName.membersName[0]);
        await manageSitePageAppManagerSite.actions.clickOnTheFavouriteTabs();
        await manageSitePageAppManagerSite.assertions.clickOnPeppleTab();
        await manageSitePageAppManagerSite.assertions.checkMarkedAsFavoriteInPeopleList(membersName.membersName[0]);
        await manageSitePageAppManagerSite.actions.hoverOnMembersName(membersName.membersName[0]);
        await manageSitePageAppManagerSite.actions.markAsUnfavorite(membersName.membersName[0]);
        const memberSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await memberSiteDashboardPage.loadPage();
        await manageSitePageAppManagerSite.actions.clickOnTheAboutTab();
        await manageSitePageAppManagerSite.actions.clickOnTheMemberButtonInAboutTab();
        await manageSitePageAppManagerSite.assertions.checkMarkedAsFavoriteInPeopleListShouldNotBeVisible(
          membersName.membersName[0]
        );
      }
    );

    test(
      'verify Add to campaign option under Content tab in Manage Site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23966'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'verify Add to campaign option under Content tab in Manage Site',
          zephyrTestId: 'CONT-20537',
          storyId: 'CONT-20537',
        });
        const campaigns = await appManagerApiFixture.socialCampaignHelper.getCampaignList({
          size: 16,
          sortBy: 'lastEditedAt',
          order: 'desc',
          includeData: 'full',
          includeCount: true,
          status: 'active',
        });
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');
        const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo);
        await siteDashboardPage.loadPage();
        const manageSitePageAppManagerSite = new ManageSitePage(appManagerFixture.page, siteInfo);
        await manageSitePageAppManagerSite.actions.clickOnTheManageSiteButton();
        await manageSitePageAppManagerSite.actions.clickOnInsideContentButton();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.ADD_TO_CAMPAIGN);
        await manageContentPage.actions.clickOnOptionButton(ManageContentOptions.ADD_TO_CAMPAIGN);
        await addToCampaignComponent.clickOnAddToCampaignInput();
        await addToCampaignComponent.typeInAddToCampaignInput(campaigns[0].title || '');
        await addToCampaignComponent.clickOnSaveButton();
        await manageContentPage.verifyToastMessageIsVisibleWithText('Added content to campaign');
      }
    );
    test(
      'to verify the site author name and event start date',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26044'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the site author name and event start date',
          zephyrTestId: 'CONT-26044',
          storyId: 'CONT-26044',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        const getListOfSitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
        });
        const siteNames = getListOfSitesResponse.result.listOfItems.map((item: any) => item.name);

        // Initialize ManageSitePage with first siteId for verification
        const firstSiteId = getListOfSitesResponse.result.listOfItems[0]?.siteId;
        if (!firstSiteId) {
          throw new Error('No sites found in the response');
        }
        manageSiteAppManagerPage = new ManageSiteSetUpPage(appManagerFixture.page, firstSiteId);

        // Verify all site names are displayed (method handles the loop internally)
        await manageSiteAppManagerPage.assertions.verifySitesNamesAreDisplayed(siteNames);
      }
    );
    test(
      'to verify the onboarding option in manage site content',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23737'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Scheduled stamp and its options menu under-manage site content tab',
          zephyrTestId: 'CONT-23737',
          storyId: 'CONT-23737',
        });
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteIdWithName('All Employees');
        console.log('siteInfo', siteInfo);
        await appManagerFixture.contentManagementHelper.createPage({
          siteId: siteInfo,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        const DashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo);
        const siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, siteInfo);
        await DashboardPage.loadPage();
        await manageSitesComponent.clickOnTheManageSiteButtonAction();
        await manageSitesComponent.clickOnInsideContentButtonAction();
        await siteDetailsPage.actions.clickOnContentTab();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.ONBOARDING);
        await manageContentPage.actions.clickOnOnboardingOption();
        await onboardingComponent.verifyAlreadySelectedOnboardingOptionVisible(TagOption.NOT_ONBOARDING);
        await onboardingComponent.saveButtonShouldBeDisabled();
        await onboardingComponent.selectOnboardingOption(TagOption.SITE_ONBOARDING);
        await onboardingComponent.clickOnSaveButton();
        await onboardingComponent.verifyTagIsVisibleOnContent(TagOption.SITE_ONBOARDING_TAG);
        await onboardingComponent.verifyToastMessageIsVisibleWithText('Updated onboarding status');
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.clickOnOnboardingOption();
        await onboardingComponent.selectOnboardingOption(TagOption.NOT_ONBOARDING);
        await onboardingComponent.clickOnSaveButton();
        await onboardingComponent.verifyToastMessageIsVisibleWithText('Updated onboarding status');
        await onboardingComponent.verifyTagShouldNotBeVisibleOnContent(TagOption.SITE_ONBOARDING_TAG);
      }
    );

    test(
      'verify the site activate option in manage site user drop down sites for all site types',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26177'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify the site activate option in manage site user drop down sites for all site types',
          zephyrTestId: 'CONT-26177',
          storyId: 'CONT-26177',
        });

        const siteTypes = [SITE_TYPES.PUBLIC, SITE_TYPES.PRIVATE, SITE_TYPES.UNLISTED];
        const manageSitePage = new ManageSitePage(appManagerFixture.page);
        await manageSitePage.loadPage();
        await manageSitePage.actions.clickOnFilterOptionsDropdownButton();
        await manageSitePage.actions.selectFilterOption('All');

        for (const siteType of siteTypes) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getDeactivatedSite(siteType, { size: 1000 });
          const siteName = siteInfo.siteName;
          await manageSitePage.actions.searchSite(siteName);
          await manageSitePage.actions.clickOnSearchButton();
          await manageSitePage.actions.clickOnOptionsDropdown(siteName);
          await manageSitePage.assertions.verifyOptionIsVisibleInOptionsDropdown('Activate');
          await manageSitePage.assertions.verifyOptionIsNotVisibleInOptionsDropdown('Deactivate');
        }
      }
    );
  }
);
