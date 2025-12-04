import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SitePermission } from '@/src/core/types/siteManagement.types';
import { formatCreatedAtDateForManageContent, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import {
  BulkActionOptions,
  ContentSortBy,
  CONTENT_VALIDATION_PERIOD_TIME,
  ContentStatus,
  ManageContentOptions,
  ManageContentTags,
  SortOptionLabels,
  TagOption,
} from '@/src/modules/content/constants';
import { MustReadAudienceType, MustReadDuration } from '@/src/modules/content/constants/enums/mustRead';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_CONTENT_TEST_DATA } from '@/src/modules/content/test-data/manage-content.test-data';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { PROFILE_TEST_DATA } from '@/src/modules/content/test-data/profile.test.data';
import { ManageSitesComponent, OnboardingComponent } from '@/src/modules/content/ui/components';
import { AddToCampaignComponent } from '@/src/modules/content/ui/components/addToCampaignComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { EditSitePage } from '@/src/modules/content/ui/pages/editSitePage';
import { FavoritesPage } from '@/src/modules/content/ui/pages/favoritesPage';
import { GovernanceScreenPage } from '@/src/modules/content/ui/pages/governanceScreenPage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { ORGChartPage } from '@/src/modules/content/ui/pages/ORGChatPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
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
        await manageContentPage.assertions.verifyTagVisibleInManageContent(ManageContentTags.SCHEDULED);
        await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.assertions.verifyOptionVisibleInManageContent(ManageContentOptions.EDIT);
        await manageContentPage.assertions.verifyOptionVisibleInManageContent(ManageContentOptions.DELETE);
        await manageContentPage.assertions.verifyOptionVisibleInManageContent(ManageContentOptions.PUBLISH);
        await manageContentPage.assertions.verifyOptionVisibleInManageContent(ManageContentOptions.MOVE);
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

        // Get appManager info to filter out from members list
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );
        const appManagerName = appManagerInfo.fullName;
        const appManagerUserId = appManagerInfo.userId;

        // Filter out appManager from members list
        const filteredMembers = members.filter((member: any) => {
          const memberName = member.name || member.displayName || '';
          const memberEmail = member.email || '';
          const memberPeopleId = member.peopleId || member.userId || '';

          // Exclude if name, email, or userId matches appManager
          return (
            memberName !== appManagerName &&
            memberEmail !== users.appManager.email &&
            memberPeopleId !== appManagerUserId
          );
        });

        console.log(
          `Filtered members: ${members.length} -> ${filteredMembers.length} (excluded appManager: ${appManagerName})`
        );

        const membersName = { membersName: filteredMembers.map((m: any) => m.name || m.displayName || m.email) };
        console.log('membersName', membersName);

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
      'to verify the site view option in manage site user drop down sites',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26044'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the site view option in manage site user drop down sites',
          zephyrTestId: 'CONT-26044',
          storyId: 'CONT-26044',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        const getListOfSitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
        });
        const siteNames = getListOfSitesResponse.result.listOfItems.map((item: any) => item.name);

        // Initialize ManageSitePage with first siteId for verification
        const firstSiteId = getListOfSitesResponse.result.listOfItems[0]?.siteId;
        if (!firstSiteId) {
          throw new Error('No sites found in the response');
        }
        const manageSiteAppManagerPage = new ManageSiteSetUpPage(appManagerFixture.page, firstSiteId);
        await manageSiteAppManagerPage.assertions.searchSiteNameInSearchBar(siteNames[0]);
        const siteDashBoardPage = new SiteDashboardPage(appManagerFixture.page, firstSiteId);
        await siteDashBoardPage.assertions.verifySiteNameIsDisplayed(siteNames[0]);
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
        await manageContentPage.assertions.verifyTagShouldNotBeVisibleOnContent(TagOption.SITE_ONBOARDING_TAG);
      }
    );

    test(
      'verify user able to apply publish unpublish delete actions on selected contents under Content tab in Manage Site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20538'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'verify user able to apply publish unpublish delete actions on selected contents under Content tab in Manage Site',
          zephyrTestId: 'CONT-20538',
          storyId: 'CONT-20538',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList();
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }

        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.verifyTagVisibleInManageContent(ManageContentTags.UNPUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.UNPUBLISHED);
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnPublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.verifyTagVisibleInManageContent(ManageContentTags.PUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        await manageContentPage.actions.clickSortByButton();
        const contentNames = await manageContentPage.actions.getAllContentNames();
        console.log('contentNames', contentNames);
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnDeleteButton();
        await manageContentPage.actions.selectDeleteApplyButton();
        await manageContentPage.actions.verifyAllContentsAreDeleted(contentNames);
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
      'to verify the site edit option in manage site user drop down sites',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26503'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the site author name and event start date',
          zephyrTestId: 'CONT-26503',
          storyId: 'CONT-26503',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        const editSitePage = new EditSitePage(appManagerFixture.page);
        await manageSitesComponent.hoverOnFirstSiteNameAction();
        await editSitePage.actions.clickOnEditOption();
        await editSitePage.actions.editSiteNameInput(MANAGE_SITE_TEST_DATA.UPDATED_SITE_NAME);
        await editSitePage.actions.clickOnUpdateButton();
        await editSitePage.assertions.verifySiteNameIsUpdated(MANAGE_SITE_TEST_DATA.UPDATED_SITE_NAME);
      }
    );
    test(
      'to verify the bulk action activate in manage site user drop down',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26576'],
      },
      async ({ appManagerApiFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the bulk action activate in manage site user drop down',
          zephyrTestId: 'CONT-26576',
          storyId: 'CONT-26576',
        });

        // Navigate to manage sites page first
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        const manageSitePage = new ManageSitePage(appManagerFixture.page);
        await manageSitePage.loadPage();

        await manageSitesComponent.selectSiteFilterByText(BulkActionOptions.ACTIVE);
        await manageSitesComponent.selectFilterByText(BulkActionOptions.DEACTIVATE);
        const getListOfSitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'deactivated',
        });
        const deactivatedSites = getListOfSitesResponse.result.listOfItems.filter(
          (site: any) => site.isActive === false
        );

        console.log(`Found ${deactivatedSites.length} deactivated sites to check`);

        // Limit to first 20 sites to avoid pagination issues
        const deactivatedSiteNames = getListOfSitesResponse.result.listOfItems
          .slice(0, 20)
          .map((item: any) => item.name);

        if (deactivatedSiteNames.length === 0) {
          throw new Error('No deactivated sites found in the response');
        }

        // Retry logic: Click "Show More" button if site is not found
        let selectedSiteName: string | null = null;
        const maxRetriesForShowMoreButton = 10;
        for (let attempt = 0; attempt < maxRetriesForShowMoreButton; attempt++) {
          selectedSiteName = await manageSitesComponent.selectFirstEnabledSiteCheckbox(deactivatedSiteNames);
          if (selectedSiteName) {
            break;
          }

          if (attempt < maxRetriesForShowMoreButton - 1) {
            console.log(
              `No enabled checkbox found, clicking "Show More" button (attempt ${attempt + 1}/${maxRetriesForShowMoreButton})`
            );
            try {
              await manageSitePage.actions.clickOnShowMoreButtonAction();
            } catch {
              console.log('Show More button not available or clickable');
              // Continue to next attempt
            }
          }
        }

        if (!selectedSiteName) {
          throw new Error(
            'No deactivated site with enabled checkbox found. All sites may be disabled due to permissions or state.'
          );
        }
        // Use the selected site name from the checkbox selection
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
        const firstSiteIdFromList = getSiteListResponse.result.listOfItems[1]?.siteId;
        if (firstSiteIdFromList) {
          manageSiteAppManagerPage = new ManageSiteSetUpPage(appManagerFixture.page, firstSiteIdFromList);
          await manageSiteAppManagerPage.loadPage();
        }
        const manageDeactivatedSitePage = new ManageSitePage(appManagerFixture.page);
        await manageDeactivatedSitePage.loadPage();
        const firstActiveSiteId = getSiteListResponse.result.listOfItems[1]?.siteId;
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

        const firstSiteId = getListOfSitesResponse.result.listOfItems[1]?.siteId;
        if (!firstSiteId) {
          throw new Error('No sites found in the response');
        }
        await manageSitesComponent.selectSiteCheckboxByExactName(getListOfSitesResponse.result.listOfItems[1].name);
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
          description: '',
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
          isKnownFailure: true,
        });

        const siteTypes = [SITE_TYPES.PUBLIC, SITE_TYPES.PRIVATE, SITE_TYPES.UNLISTED];
        const manageSitePage = new ManageSitePage(appManagerFixture.page);
        await manageSitePage.loadPage();
        await manageSitePage.actions.clickOnFilterOptionsDropdownButton();
        await manageSitePage.actions.selectFilterOption('All');

        for (const siteType of siteTypes) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getDeactivatedSite(siteType, {
            size: 1000,
            sortBy: 'alphabetical',
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
          const updateUserSiteMembershipWithRole =
            await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
              siteId: firstSite.siteId,
              userId: nonAppManagerMember.peopleId,
              role: SitePermission.OWNER,
            });
          console.log('updateUserSiteMembershipWithRole', updateUserSiteMembershipWithRole);
        } catch {
          console.log(`User ${nonAppManagerMember.peopleId} is already an owner, skipping role update`);
        }
        const manageSiteAppManagerPage = new ManageSiteSetUpPage(appManagerFixture.page, firstSite.siteId);
        await manageSiteAppManagerPage.loadPage();
        await manageSiteAppManagerPage.actions.clickOnThePeopleTab();
        await manageSiteAppManagerPage.assertions.verifyMemberNameAndSiteOwnerStatus(nonAppManagerMember.name);
      }
    );
    test(
      'to verify the favourite content filters',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26264'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the favourite content filters',
          zephyrTestId: 'CONT-26264',
          storyId: 'CONT-26264',
        });
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const createPageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        const createAlbumInfo = await appManagerApiFixture.contentManagementHelper.createAlbum({
          siteId: siteInfo.siteId,
          imageName: 'beach.jpg',
        });
        const createEventInfo = await appManagerApiFixture.contentManagementHelper.createEvent({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'event' },
        });
        const contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          createPageInfo.contentId,
          'page'
        );
        await contentPreviewPage.loadPage();
        await contentPreviewPage.clickOnFavouriteContentButton();
        const contentPreviewPageAlbum = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          createAlbumInfo.contentId,
          'album'
        );
        await contentPreviewPageAlbum.loadPage();
        await contentPreviewPageAlbum.clickOnFavouriteContentButton();
        const contentPreviewPageEvent = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          createEventInfo.contentId,
          'event'
        );
        await contentPreviewPageEvent.loadPage();
        await contentPreviewPageEvent.clickOnFavouriteContentButton();
        await manageSitesComponent.clickOnTheFavouriteTabsAction();
        await favoritesPage.actions.clickOnContentButton();
        await favoritesPage.assertions.verifyContentNamesAreDisplayed([
          createPageInfo.pageName,
          createAlbumInfo.albumName,
          createEventInfo.eventName,
        ]);
      }
    );
    test(
      'to verify the UI of favourite content',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26267'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the favourite content filters',
          zephyrTestId: 'CONT-26267',
          storyId: 'CONT-26267',
        });
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const createPageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        const makeContentMustReadResponse = await appManagerApiFixture.contentManagementHelper.makeContentMustRead(
          createPageInfo.contentId,
          {
            audienceType: MustReadAudienceType.SITE_MEMBERS_AND_FOLLOWERS,
            duration: MustReadDuration.NINETY_DAYS,
          }
        );
        console.log('makeContentMustReadResponse', makeContentMustReadResponse);
        const createAlbumInfo = await appManagerApiFixture.contentManagementHelper.createAlbum({
          siteId: siteInfo.siteId,
          imageName: 'beach.jpg',
        });
        const makeContentMustReadResponseAlbum = await appManagerApiFixture.contentManagementHelper.makeContentMustRead(
          createAlbumInfo.contentId
        );
        console.log('makeContentMustReadResponseAlbum', makeContentMustReadResponseAlbum);
        const createEventInfo = await appManagerApiFixture.contentManagementHelper.createEvent({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'event' },
        });
        console.log('createEventInfo', createEventInfo);
        const makeContentMustReadResponseEvent = await appManagerApiFixture.contentManagementHelper.makeContentMustRead(
          createEventInfo.contentId
        );
        console.log('makeContentMustReadResponseEvent', makeContentMustReadResponseEvent);
        const contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          createPageInfo.contentId,
          'page'
        );
        await contentPreviewPage.loadPage();
        await contentPreviewPage.clickOnFavouriteContentButton();
        const contentPreviewPageAlbum = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          createAlbumInfo.contentId,
          'album'
        );
        await contentPreviewPageAlbum.loadPage();
        await contentPreviewPageAlbum.clickOnFavouriteContentButton();
        const contentPreviewPageEvent = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          createEventInfo.contentId,
          'event'
        );
        await contentPreviewPageEvent.loadPage();
        await contentPreviewPageEvent.clickOnFavouriteContentButton();
        await manageSitesComponent.clickOnTheFavouriteTabsAction();
        await favoritesPage.actions.clickOnContentButton();
        await favoritesPage.assertions.verifyContentNamesAreDisplayed([
          createPageInfo.pageName,
          createAlbumInfo.albumName,
          createEventInfo.eventName,
        ]);

        const manageAppManagerUserPage = new ManageSiteSetUpPage(appManagerFixture.page, siteInfo.siteId);
        await favoritesPage.assertions.verifyEventsTabImageIsDisplayed();
        await favoritesPage.assertions.verifyAlbumTabImageIsDisplayed();
        await manageAppManagerUserPage.assertions.verifyPageTabImageIsDisplayed();
        await favoritesPage.assertions.verifyEventsTabMatchesApiDate(createEventInfo.startsAt);
        await onboardingComponent.verifyTagIsVisibleOnContentUnderFavoritesTab(TagOption.MUST_READ_TAG);
        await favoritesPage.assertions.markAsFavoriteAndCheckRGBColor();
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
    test(
      'to verify the created and published dates of content in  Manage site content',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23980'],
      },
      async ({ appManagerApiFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the created and published dates of content in  Manage site content',
          zephyrTestId: 'CONT-23980',
          storyId: 'CONT-23980',
        });

        const getSiteListResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
          size: 1000,
        });
        const siteId = getSiteListResponse.result.listOfItems[0].siteId;
        // Create page, event, and album in parallel since they are independent API calls
        const [createPageInfo, createEventInfo, createAlbumInfo] = await Promise.all([
          appManagerApiFixture.contentManagementHelper.createPage({
            siteId: siteId,
            contentInfo: { contentType: 'page', contentSubType: 'news' },
          }),
          appManagerApiFixture.contentManagementHelper.createEvent({
            siteId: siteId,
            contentInfo: { contentType: 'event' },
          }),
          appManagerApiFixture.contentManagementHelper.createAlbum({
            siteId: siteId,
            imageName: 'beach.jpg',
          }),
        ]);

        // Get content list to retrieve createdAt dates for the created content
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            sortBy: ContentSortBy.CREATED_NEWEST,
            size: 1000,
            filter: 'owned',
            status: 'published',
          });

        // Find created content items and get their formatted createdAt dates
        const pageItem = contentListResponse.result.listOfItems.find(
          (item: any) => item.id === createPageInfo.contentId
        );
        const eventItem = contentListResponse.result.listOfItems.find(
          (item: any) => item.id === createEventInfo.contentId
        );
        const albumItem = contentListResponse.result.listOfItems.find(
          (item: any) => item.id === createAlbumInfo.contentId
        );

        if (!pageItem || !eventItem || !albumItem) {
          throw new Error('Could not find created content items in content list');
        }

        const pageCreatedAtDate = formatCreatedAtDateForManageContent(pageItem.createdAt);
        const eventCreatedAtDate = formatCreatedAtDateForManageContent(eventItem.createdAt);
        const albumCreatedAtDate = formatCreatedAtDateForManageContent(albumItem.createdAt);

        const manageSitePageAppManagerSite = new ManageSiteSetUpPage(appManagerFixture.page, siteId);
        await manageSitePageAppManagerSite.loadPage();
        await manageSitePageAppManagerSite.actions.clickOnInsideContentButton();
        const manageContentPage = new ManageContentPage(appManagerFixture.page);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.actions.clickSortByButton();
        // Verify all three dates in parallel since they're already rendered on the page
        await Promise.all([
          manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(pageCreatedAtDate),
          manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(eventCreatedAtDate),
          manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(albumCreatedAtDate),
        ]);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_OLDEST);
        await manageContentPage.actions.clickSortByButton();
        const getContentListResponseOldest =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            sortBy: ContentSortBy.CREATED_OLDEST,
            size: 1000,
            siteId: siteId,
            filter: 'managing',
            status: 'published',
          });
        console.log('getContentListResponseOldest', getContentListResponseOldest.result.listOfItems);
        if (getContentListResponseOldest.result.listOfItems.length === 0) {
          throw new Error('No content items found in oldest content list');
        }
        const oldestContentItem = getContentListResponseOldest.result.listOfItems[0];
        const oldestContentCreatedAtDate = formatCreatedAtDateForManageContent(oldestContentItem.createdAt);
        await manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(oldestContentCreatedAtDate);
        // Get current user's peopleId - try from API first, fallback to page object
        const currentUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );
        const peopleId = currentUserInfo.user.peopleId || currentUserInfo.userId;
        if (!peopleId) {
          throw new Error('Could not get peopleId for current user');
        }

        console.log('Using peopleId:', peopleId);
        const profileScreenPage = new ProfileScreenPage(appManagerFixture.page, peopleId);
        await profileScreenPage.loadPage();
        await profileScreenPage.actions.openEditTimezone();
        // Generate random timezone value between 1 and 300 (inclusive)
        await profileScreenPage.actions.selectTimezone(PROFILE_TEST_DATA.TIMEZONE.RANDOM_NUMBER.toString());
        await profileScreenPage.actions.clickOnSaveTimezoneButton();

        const getSiteListResponseAfterUpdate = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
          size: 1000,
        });
        const siteIdAfterUpdate = getSiteListResponseAfterUpdate.result.listOfItems[0].siteId;
        // Create page, event, and album in parallel since they are independent API calls
        const [createPageInfoAfterUpdate, createEventInfoAfterUpdate, createAlbumInfoAfterUpdate] = await Promise.all([
          appManagerApiFixture.contentManagementHelper.createPage({
            siteId: siteIdAfterUpdate,
            contentInfo: { contentType: 'page', contentSubType: 'news' },
          }),
          appManagerApiFixture.contentManagementHelper.createEvent({
            siteId: siteIdAfterUpdate,
            contentInfo: { contentType: 'event' },
          }),
          appManagerApiFixture.contentManagementHelper.createAlbum({
            siteId: siteIdAfterUpdate,
            imageName: 'beach.jpg',
          }),
        ]);

        // Get content list to retrieve createdAt dates for the created content
        const contentListResponseAfterUpdate =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            sortBy: ContentSortBy.CREATED_NEWEST,
            size: 1000,
            filter: 'owned',
            status: 'published',
          });

        // Find created content items and get their formatted createdAt dates
        const pageItemAfterUpdate = contentListResponseAfterUpdate.result.listOfItems.find(
          (item: any) => item.id === createPageInfoAfterUpdate.contentId
        );
        const eventItemAfterUpdate = contentListResponseAfterUpdate.result.listOfItems.find(
          (item: any) => item.id === createEventInfoAfterUpdate.contentId
        );
        const albumItemAfterUpdate = contentListResponseAfterUpdate.result.listOfItems.find(
          (item: any) => item.id === createAlbumInfoAfterUpdate.contentId
        );

        if (!pageItemAfterUpdate || !eventItemAfterUpdate || !albumItemAfterUpdate) {
          throw new Error('Could not find created content items in content list');
        }

        const pageCreatedAtDateAfterUpdate = formatCreatedAtDateForManageContent(pageItemAfterUpdate.createdAt);
        const eventCreatedAtDateAfterUpdate = formatCreatedAtDateForManageContent(eventItemAfterUpdate.createdAt);
        const albumCreatedAtDateAfterUpdate = formatCreatedAtDateForManageContent(albumItemAfterUpdate.createdAt);

        const manageSitePageAppManagerSiteAfterUpdate = new ManageSiteSetUpPage(
          appManagerFixture.page,
          siteIdAfterUpdate
        );
        await manageSitePageAppManagerSite.loadPage();
        await manageSitePageAppManagerSiteAfterUpdate.actions.clickOnInsideContentButton();
        const manageContentPageAfterUpdate = new ManageContentPage(appManagerFixture.page);
        await manageContentPageAfterUpdate.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.actions.clickSortByButton();
        // Verify all three dates in parallel since they're already rendered on the page
        await Promise.all([
          manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(pageCreatedAtDateAfterUpdate),
          manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(eventCreatedAtDateAfterUpdate),
          manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(albumCreatedAtDateAfterUpdate),
        ]);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_OLDEST);
        await manageContentPage.actions.clickSortByButton();
        const getContentListResponseOldestAfterUpdate =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            sortBy: ContentSortBy.CREATED_OLDEST,
            size: 1000,
            siteId: siteId,
            filter: 'managing',
            status: 'published',
          });
        console.log('getContentListResponseOldest', getContentListResponseOldest.result.listOfItems);
        if (getContentListResponseOldest.result.listOfItems.length === 0) {
          throw new Error('No content items found in oldest content list');
        }
        const oldestContentItemAfterUpdate = getContentListResponseOldestAfterUpdate.result.listOfItems[0];
        const oldestContentCreatedAtDateAfterUpdate = formatCreatedAtDateForManageContent(
          oldestContentItemAfterUpdate.createdAt
        );
        await manageContentPageAfterUpdate.assertions.verifyCreatedAtDateVisibleInManageContent(
          oldestContentCreatedAtDateAfterUpdate
        );
        await profileScreenPage.loadPage();
        await profileScreenPage.actions.openEditTimezone();
        // select default timezone
        await profileScreenPage.actions.selectTimezone('328');
        await profileScreenPage.actions.clickOnSaveTimezoneButton();

    test(
      'verify user able to apply validate action on selected content under Content tab in Manage Site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.MANAGE_CONTENT, '@CONT-20539'],
      },
      async ({ appManagerFixture, standardUserApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'verify user able to apply validate action on selected content under Content tab in Manage Site',
          customTags: [ContentSuiteTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20539',
          storyId: 'CONT-20539',
        });
        const governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.selectContentValidationPeriodTime(
          CONTENT_VALIDATION_PERIOD_TIME.TWELVE_MONTHS
        );
        const sitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
        });

        // Find a site where the standard user is owner and can manage
        // The list response includes isOwner and canManage properties directly
        const site = sitesResponse.result.listOfItems.find(
          (site: any) => site.isActive === true && site.isOwner === true && site.canManage === true
        );

        if (!site) {
          throw new Error('No site found where isOwner is true and canManage is true');
        }

        const siteId = site.siteId;
        console.log(`Found site ${site.name} (${siteId}) where standard user is owner and can manage`);
        const pageInfo = await standardUserApiFixture.contentManagementHelper.createPage({
          siteId: siteId,
          contentInfo: { contentType: 'page', contentSubType: 'knowledge' },
        });
        console.log('pageInfo', pageInfo);
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        const manageFeaturesPageForStandardUser = new ManageFeaturesPage(standardUserFixture.page);
        await manageFeaturesPageForStandardUser.actions.clickOnContentCard();
        const manageContentPageForStandardUser = new ManageContentPage(standardUserFixture.page);
        await manageContentPageForStandardUser.actions.clickSortByButton();
        await manageContentPageForStandardUser.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPageForStandardUser.actions.clickSortByButton();
        await standardUserApiFixture.contentManagementHelper.updateContentPublishDate(
          siteId,
          pageInfo.contentId,
          MANAGE_CONTENT_TEST_DATA.PAST_YEAR_DATE
        );
        await manageContentPageForStandardUser.assertions.verifyValidationRequiredIsVisible();
        await manageContentPageForStandardUser.actions.clickOnValidationViewAllButton();
        await manageContentPageForStandardUser.actions.verifyTagVisibleInManageContent(
          ManageContentTags.VALIDATION_REQUIRED
        );
        await manageContentPageForStandardUser.actions.hoverOnFirstDropDownOption();
        await manageContentPageForStandardUser.actions.clickOnValidateButton();
        await manageContentPageForStandardUser.actions.clickFilterButton();
        await manageContentPageForStandardUser.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPageForStandardUser.actions.clickFilterButton();
        await manageContentPageForStandardUser.actions.clickSortByButton();
        await manageContentPageForStandardUser.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPageForStandardUser.assertions.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPageForStandardUser.actions.hoverOnFirstDropDownOption();
        await manageContentPageForStandardUser.actions.verifyOptionVisibleInManageContent(ManageContentOptions.EDIT);
        await manageContentPageForStandardUser.actions.verifyOptionVisibleInManageContent(ManageContentOptions.DELETE);
        await manageContentPageForStandardUser.actions.verifyOptionVisibleInManageContent(
          ManageContentOptions.UNPUBLISH
        );
        await manageContentPageForStandardUser.actions.verifyOptionVisibleInManageContent(ManageContentOptions.MOVE);
        await manageContentPageForStandardUser.actions.verifyTagVisibleInManageContent(ManageContentTags.PUBLISHED);
      }
    );
  }
);
