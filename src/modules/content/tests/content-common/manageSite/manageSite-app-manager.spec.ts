import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import {
  BulkActionOptions,
  ContentStatus,
  ManageContentOptions,
  ManageContentTags,
  SortOptionLabels,
  TagOption,
} from '@/src/modules/content/constants';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_CONTENT_TEST_DATA } from '@/src/modules/content/test-data/manage-content.test-data';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { ManageSitesComponent, OnboardingComponent } from '@/src/modules/content/ui/components';
import { AddToCampaignComponent } from '@/src/modules/content/ui/components/addToCampaignComponent';
import { FavoritesPage } from '@/src/modules/content/ui/pages/favoritesPage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { ORGChartPage } from '@/src/modules/content/ui/pages/ORGChatPage';
import { SiteCategoriesPage } from '@/src/modules/content/ui/pages/siteCategoriesPage';
import { SiteDetailsPage } from '@/src/modules/content/ui/pages/siteDetailsPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { UserProfilePage } from '@/src/modules/content/ui/pages/userProfilePage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    let siteManagementHelper: SiteManagementHelper;
    let siteCategoriesPage: SiteCategoriesPage;
    let manageFeaturesPage: ManageFeaturesPage;
    let manageContentPage: ManageContentPage;
    let manageSiteAppManagerPage: ManageSiteSetUpPage;
    let manageSitesComponent: ManageSitesComponent;
    let userProfilePage: UserProfilePage;
    let orgChartPage: ORGChartPage;
    let favoritesPage: FavoritesPage;
    let onboardingComponent: OnboardingComponent;
    let addToCampaignComponent: AddToCampaignComponent;
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
      manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      manageSitesComponent = new ManageSitesComponent(appManagerFixture.page);
      onboardingComponent = new OnboardingComponent(appManagerFixture.page);
      siteManagementHelper = appManagerFixture.siteManagementHelper;
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      manageSitesComponent = new ManageSitesComponent(appManagerFixture.page);
      onboardingComponent = new OnboardingComponent(appManagerFixture.page);
      userProfilePage = new UserProfilePage(appManagerFixture.page);
      orgChartPage = new ORGChartPage(appManagerFixture.page);
      favoritesPage = new FavoritesPage(appManagerFixture.page);
      // Clear used site IDs at the start of each test for fresh tracking

      siteManagementHelper = appManagerFixture.siteManagementHelper;
      addToCampaignComponent = new AddToCampaignComponent(appManagerFixture.page);
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23966'],
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
        await manageContentPage.assertions.scheduledTagVisibleInManageContent();
        await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.pageName);
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
          filter: 'active',
        });
        if (campaigns.result.listOfItems.length === 0) {
          throw new Error('No active campaigns found. Please create at least one campaign before running this test.');
        }
        // Use title if available, otherwise fall back to message
        const campaignName = campaigns.result.listOfItems[0].title || campaigns.result.listOfItems[0].message;
        if (!campaignName) {
          throw new Error('Campaign has neither title nor message');
        }
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');
        const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo);
        await siteDashboardPage.loadPage();
        const manageSitePageAppManagerSite = new ManageSiteSetUpPage(appManagerFixture.page, siteInfo);
        await manageSitePageAppManagerSite.actions.clickOnTheManageSiteButton();
        await manageSitePageAppManagerSite.actions.clickOnInsideContentButton();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        await manageContentPage.assertions.verifyTagVisibleInManageContent(ManageContentTags.SCHEDULED);
        await manageContentPage.assertions.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.actions.verifyTagVisibleInManageContent(ManageContentTags.SCHEDULED);
        await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.ADD_TO_CAMPAIGN);
        await manageContentPage.actions.clickOnOptionButton(ManageContentOptions.ADD_TO_CAMPAIGN);
        await addToCampaignComponent.clickOnAddToCampaignInput();
        await addToCampaignComponent.typeInAddToCampaignInput(campaignName);
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
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.ONBOARDING_OPTION);
        await manageContentPage.actions.clickOnOnboardingOption();
        await manageContentPage.assertions.verifyAlreadySelectedOnboardingOptionVisible(TagOption.NOT_ONBOARDING);
        await manageContentPage.actions.saveButtonShouldBeDisabled();
        await manageContentPage.actions.selectOnboardingOption(TagOption.SITE_ONBOARDING);
        await manageContentPage.actions.clickOnOnboardingSaveButton();
        await manageContentPage.assertions.verifyTagIsVisibleOnContent(TagOption.SITE_ONBOARDING_TAG);
        await manageContentPage.assertions.verifyToastMessageIsVisibleWithText(
          MANAGE_CONTENT_TEST_DATA.UPDATED_ONBOARDING_STATUS
        );
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.clickOnOnboardingOption();
        await manageContentPage.actions.selectOnboardingOption(TagOption.NOT_ONBOARDING);
        await manageContentPage.actions.clickOnOnboardingSaveButton();
        await manageContentPage.assertions.verifyToastMessageIsVisibleWithText(
          MANAGE_CONTENT_TEST_DATA.UPDATED_ONBOARDING_STATUS
        );
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.clickOnOnboardingOption();
        await manageContentPage.actions.selectOnboardingOption(TagOption.NOT_ONBOARDING);
        await manageContentPage.actions.clickOnOnboardingSaveButton();
        await manageContentPage.assertions.verifyToastMessageIsVisibleWithText(
          MANAGE_CONTENT_TEST_DATA.UPDATED_ONBOARDING_STATUS
        );
        await manageContentPage.assertions.verifyTagShouldNotBeVisibleOnContent(TagOption.SITE_ONBOARDING_TAG);
      }
    );

    test(
      'verify user able to apply publish unpublish delete actions on selected contents under Content tab in Manage Site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20538'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Scheduled stamp and its options menu under-manage site content tab',
          zephyrTestId: 'CONT-20538',
          storyId: 'CONT-20538',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.verifyTagVisibleInManageContent(ManageContentTags.UNPUBLISHED);
        await appManagerFixture.page.reload();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.UNPUBLISHED);
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnPublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.verifyTagVisibleInManageContent(ManageContentTags.PUBLISHED);
        await appManagerFixture.page.reload();
        const contentNames = await manageContentPage.actions.getAllContentNames();
        console.log('contentNames', contentNames);
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnDeleteButton();
        await manageContentPage.actions.selectDeleteApplyButton();
        await manageContentPage.actions.verifyAllContentsAreDeleted(contentNames);
        await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.ONBOARDING);
        await manageContentPage.actions.verifyOnboardingOptionVisibleInManageContent();
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
      'to verify the UI of favorite people section',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26450'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the people follow in site about members and followers tab',
          zephyrTestId: 'CONT-26450',
          storyId: 'CONT-26450',
        });
        await appManagerFixture.navigationHelper.clickOnFavoritePeopleSection();
        await favoritesPage.actions.clickOnPeopleButton();
        const getPeopleList = await appManagerApiFixture.siteManagementHelper.getListOfPeople();
        const peopleNames = getPeopleList.result.listOfItems.map((item: any) =>
          `${item.firstName || ''} ${item.lastName || ''}`.trim()
        );
        await favoritesPage.assertions.verifyPeopleNamesAreDisplayed(peopleNames);
        await appManagerFixture.navigationHelper.clickOnOrgChartButton();
        await orgChartPage.actions.typeInSearchBarInput(peopleNames[0]);
        await orgChartPage.actions.clickOnViewProfileButtonInOGRChart(peopleNames[0]);
        await userProfilePage.actions.clickOnFollowersTab();
        await userProfilePage.assertions.verifyContactInformation();
      }
    );

    test(
      'to verify the bulk action activate in manage site user drop down',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26576'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the bulk action activate in manage site user drop down',
          zephyrTestId: 'CONT-26576',
          storyId: 'CONT-26576',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        await manageSitesComponent.selectSiteFilterByText(BulkActionOptions.ACTIVE);
        await manageSitesComponent.selectFilterByText(BulkActionOptions.DEACTIVATE);
        const getListOfSitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'deactivated',
        });
        const deactivatedSiteNames = getListOfSitesResponse.result.listOfItems.map((item: any) => item.name);
        const selectedSiteName = await manageSitesComponent.selectFirstEnabledSiteCheckbox(deactivatedSiteNames);
        if (!selectedSiteName) {
          throw new Error(
            'No deactivated site with enabled checkbox found. All sites may be disabled due to permissions or state.'
          );
        }
        await manageSitesComponent.selectSiteCheckboxByExactName(getListOfSitesResponse.result.listOfItems[0].name);
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnActivateButton();
        await manageContentPage.actions.clickOnActivateApplyButton();
        await manageSitesComponent.selectSiteFilterByText(BulkActionOptions.DEACTIVATE);
        await manageSitesComponent.selectFilterByText(BulkActionOptions.ACTIVE);
        const getSiteListResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
        });
        const siteNames = getSiteListResponse.result.listOfItems.map((item: any) => item.name);
        console.log('siteNames', siteNames);
        const firstSiteIdFromList = getSiteListResponse.result.listOfItems[0]?.siteId;
        if (firstSiteIdFromList) {
          manageSiteAppManagerPage = new ManageSiteSetUpPage(appManagerFixture.page, firstSiteIdFromList);
          await manageSiteAppManagerPage.loadPage();
        }
        const manageDeactivatedSitePage = new ManageSitePage(appManagerFixture.page);
        await manageDeactivatedSitePage.loadPage();
        const firstActiveSiteId = getSiteListResponse.result.listOfItems[0]?.siteId;
        if (!firstActiveSiteId) {
          throw new Error('No active sites found in the response');
        }
        manageSiteAppManagerPage = new ManageSiteSetUpPage(appManagerFixture.page, firstActiveSiteId);
        await manageSiteAppManagerPage.loadPage();
      }
    );
    test(
      'to verify the bulk action from app manager can activate the site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26574'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the bulk action from end user can activate the site',
          zephyrTestId: 'CONT-26574',
          storyId: 'CONT-26574',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        const getListOfSitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
        });
        const firstSiteId = getListOfSitesResponse.result.listOfItems[0]?.siteId;
        if (!firstSiteId) {
          throw new Error('No sites found in the response');
        }
        await manageSitesComponent.selectSiteCheckboxByExactName(getListOfSitesResponse.result.listOfItems[0].name);
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageSitesComponent.clickOnUpdateCategoryButtonAction();
        await manageContentPage.actions.clickOnApply();
        const manageSitePage = new ManageSiteSetUpPage(appManagerFixture.page, firstSiteId);
        await manageSitePage.actions.updatingCategoryToUncategorized('Uncategorized');
      }
    );

    test(
      'verify published and unpublished stamp and its options menu on content under Content tab in Manage Site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20536'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'verify published and unpublished stamp and its options menu on content under Content tab in Manage Site',
          zephyrTestId: 'CONT-20536',
          storyId: 'CONT-20536',
        });

        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const pageInfo = await appManagerFixture.contentManagementHelper.createAlbum({
          siteId: siteInfo.siteId,
          imageName: 'beach.jpg',
          options: {
            albumName: MANAGE_CONTENT_TEST_DATA.UPDATED_PAGE_NAME,
            contentDescription: MANAGE_SITE_TEST_DATA.DESCRIPTION.DESCRIPTION,
          },
        });
        console.log('pageInfo', pageInfo);
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.actions.verifyTagVisibleInManageContent(ManageContentTags.PUBLISHED);
        await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.albumName);
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.EDIT);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.DELETE);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.UNPUBLISH);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.MOVE);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.ADD_TO_CAMPAIGN);
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.verifyTagVisibleInManageContent(ManageContentTags.UNPUBLISHED);
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.clickOnDeleteOption();
        await manageContentPage.actions.clickDeleteModalConfirmButton();
      }
    );

    test(
      'verify published stamp and its options menu on approved content under Content tab in Manage Site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20534'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify published stamp and its options menu on approved content under Content tab in Manage Site',
          zephyrTestId: 'CONT-20534',
          storyId: 'CONT-20534',
        });

        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const pageInfo = await standardUserApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        console.log('pageInfo', pageInfo);
        const approveContentResponse = await appManagerApiFixture.siteManagementHelper.approveContent(
          siteInfo.siteId,
          pageInfo.contentId
        );
        console.log('approveContentResponse', approveContentResponse);
        const siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, siteInfo.siteId);
        await siteDetailsPage.loadPage();
        await manageSitesComponent.clickOnTheManageSiteButtonAction();
        await manageSitesComponent.clickOnInsideContentButtonAction();
        await siteDetailsPage.actions.clickOnContentTab();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.assertions.verifyTagIsVisibleOnContent(TagOption.PUBLISHED_TAG);
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
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getDeactivatedSite(siteType, {
            size: 1000,
          });
          const siteName = siteInfo.siteName;
          await manageSitePage.actions.searchSite(siteName);
          await manageSitePage.actions.clickOnSearchButton();
          await manageSitePage.actions.clickOnOptionsDropdown(siteName);
          await manageSitePage.assertions.verifyOptionIsVisibleInOptionsDropdown('Activate');
          await manageSitePage.assertions.verifyOptionIsNotVisibleInOptionsDropdown('Deactivate');
        }
      }
    );
    test(
      'to verify the site ownership change in manage site people tab',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23662'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the site ownership change in manage site people tab',
          zephyrTestId: 'CONT-23662',
          storyId: 'CONT-23662',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        const getListOfSitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({ size: 1000 });
        const firstSite = getListOfSitesResponse.result.listOfItems.find((item: any) => item.memberCount === 2);
        if (!firstSite) {
          throw new Error('No site found with 2 members');
        }
        console.log('firstSite', firstSite);
        const getMemberListResponse = await appManagerApiFixture.siteManagementHelper.getSiteMembershipList(
          firstSite.siteId
        );
        const nonAppManagerMembers = getMemberListResponse.result.listOfItems.filter((item: any) => !item.isAppManager);
        if (!nonAppManagerMembers || nonAppManagerMembers.length === 0) {
          throw new Error('No non-app-manager members found');
        }
        const nonAppManagerMember = nonAppManagerMembers[0];
        try {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: firstSite.siteId,
            userId: nonAppManagerMember.peopleId,
            role: SitePermission.OWNER,
          });
        } catch (error) {
          console.log(`User ${nonAppManagerMember.peopleId} is already an owner, skipping role update`);
        }
        const manageSiteAppManagerPage = new ManageSiteSetUpPage(appManagerFixture.page, firstSite.siteId);
        await manageSiteAppManagerPage.loadPage();
        await manageSiteAppManagerPage.actions.clickOnThePeopleTab();
        await manageSiteAppManagerPage.assertions.verifyMemberNameAndSiteOwnerStatus(nonAppManagerMember.name);
      }
    );

    test(
      'verify rejected content functionality under Content tab in Manage Site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20533'],
      },
      async ({ appManagerApiFixture, standardUserApiFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify rejected content functionality under Content tab in Manage Site',
          zephyrTestId: 'CONT-20533',
          storyId: 'CONT-20533',
        });

        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const siteListResponse = siteInfo.siteListResponse; // This is an array of sites
        if (!siteListResponse || siteListResponse.length === 0) {
          throw new Error('No sites found in siteListResponse');
        }
        // Loop through sites to find one where standard user is NOT a member, owner, or manager
        const newsiteInfo =
          await standardUserApiFixture.siteManagementHelper.getSitesWhereUserIsNotMemberOrOwner(siteListResponse);
        const pageInfo = await standardUserApiFixture.contentManagementHelper.createPage({
          siteId: newsiteInfo.siteId, // Use the site where standard user is not a member/owner/manager
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        console.log('pageInfo', pageInfo);
        await appManagerApiFixture.siteManagementHelper.rejectContent(
          newsiteInfo.siteId, // Use the same site where the content was created
          pageInfo.contentId,
          'This is not good'
        );
        const siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, newsiteInfo.siteId);
        await siteDetailsPage.loadPage();
        const manageSiteSetUpPage = new ManageSiteSetUpPage(appManagerFixture.page, newsiteInfo.siteId);
        await manageSiteSetUpPage.actions.clickOnTheManageSiteButton();
        await manageSiteSetUpPage.actions.clickOnInsideContentButton();
        await siteDetailsPage.actions.clickOnContentTab();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.REJECTED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.assertions.verifyTagIsVisibleOnContent(TagOption.REJECTED_TAG);
      }
    );
  }
);
