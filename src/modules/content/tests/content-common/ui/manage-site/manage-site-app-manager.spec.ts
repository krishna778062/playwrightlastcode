import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { SitePermission } from '@/src/core/types/siteManagement.types';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { formatCreatedAtDateForManageContent, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { tagTest } from '@/src/core/utils/testDecorator';
import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';
import {
  BulkActionOptions,
  CONTENT_VALIDATION_PERIOD_TIME,
  ContentSortBy,
  ContentStatus,
  ManageContentOptions,
  ManageContentTags,
  SortOptionLabels,
  TagOption,
} from '@/src/modules/content/constants';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_CONTENT_TEST_DATA } from '@/src/modules/content/test-data/manage-content.test-data';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { PROFILE_TEST_DATA } from '@/src/modules/content/test-data/profile.test.data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { ManageSitesComponent, OnboardingComponent } from '@/src/modules/content/ui/components';
import { AddPeopleInSiteComponent } from '@/src/modules/content/ui/components/addPeopleInSiteComponent';
import { AddToCampaignComponent } from '@/src/modules/content/ui/components/addToCampaignComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { EditSitePage } from '@/src/modules/content/ui/pages/editSitePage';
import { FavoritesPage } from '@/src/modules/content/ui/pages/favoritesPage';
import { GovernanceScreenPage } from '@/src/modules/content/ui/pages/governanceScreenPage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { ManageSitePageCategoryPage } from '@/src/modules/content/ui/pages/manageSitePageCategoryPage';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { ORGChartPage } from '@/src/modules/content/ui/pages/ORGChatPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
import { SiteCategoriesPage } from '@/src/modules/content/ui/pages/siteCategoriesPage';
import { SiteDetailsPage } from '@/src/modules/content/ui/pages/siteDetailsPage';
import { SiteContentPage } from '@/src/modules/content/ui/pages/sitePages/siteContentPage';
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
      manageSitesComponent = new ManageSitesComponent(appManagerFixture.page);
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
      'verify different sites can share same page category name CONT-24601',
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
        await firstManageSitePageAppManagerSite.clickOnTheManageSiteButton();
        await firstManageSitePageAppManagerSite.clickOnThePageCategoryButton();
        const categoryName = TestDataGenerator.generateCategoryName();
        await siteCategoriesPage.createCategoryWithName(categoryName);

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
        await manageSitePageSecondPublicSite.clickOnTheManageSiteButton();
        await secondManageSitePageAppManagerSite.clickOnThePageCategoryButton();
        await siteCategoriesPage.createCategoryWithName(categoryName);

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
        await manageSitePageThirdPublicSite.clickOnTheManageSiteButton();
        await manageSitePageThirdPublicSite.clickOnThePageCategoryButton();
        await siteCategoriesPage.createCategoryWithName(categoryName);
        await manageSitePageThirdPublicSite.clickOnThePageCategoryButton();
        await siteCategoriesPage.createCategoryWithName(categoryName);
        await thirdManageSitePageAppManagerSite.checkTheError();
      }
    );

    test(
      'verify Scheduled stamp and its options menu under-manage site content tab CONT-23966',
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
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.manageContent.verifyTagVisibleInManageContent(ManageContentTags.SCHEDULED);
        await manageContentPage.manageContent.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.manageContent.hoverOnFirstDropDownOption();
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.EDIT);
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.DELETE);
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.PUBLISH);
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.MOVE);
        await manageContentPage.manageContent.selectPublishButton();
      }
    );

    test(
      'to verify the favourite people from manage site people CONT-24178',
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
        await manageSitePageAppManagerSite.clickOnAboutTab();
        await manageSitePageAppManagerSite.clickOnTheMembersTab();
        await manageSitePageAppManagerSite.hoverOnMembersName(membersName.membersName[0]);
        await manageSitePageAppManagerSite.checkIsUserMarkedAsFavorite();
        await manageSitePageAppManagerSite.markAsFavoriteAndCheckRGBColor(membersName.membersName[0]);
        await manageSitePageAppManagerSite.clickOnTheFavouriteTabs();
        await manageSitePageAppManagerSite.clickOnPeppleTab();
        await manageSitePageAppManagerSite.checkMarkedAsFavoriteInPeopleList(membersName.membersName[0]);
        await manageSitePageAppManagerSite.hoverOnMembersName(membersName.membersName[0]);
        await manageSitePageAppManagerSite.markAsUnfavorite(membersName.membersName[0]);
        const memberSiteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await memberSiteDashboardPage.loadPage();
        await manageSitePageAppManagerSite.clickOnTheAboutTab();
        await manageSitePageAppManagerSite.clickOnTheMemberButtonInAboutTab();
        await manageSitePageAppManagerSite.checkMarkedAsFavoriteInPeopleListShouldNotBeVisible(
          membersName.membersName[0]
        );
      }
    );

    test(
      'verify draft stamp and its options menu on content under Content tab in Manage Site CONT-20535',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20535'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify draft stamp and its options menu on content under Content tab in Manage Site',
          zephyrTestId: 'CONT-20535',
          storyId: 'CONT-20535',
        });
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const pageInfo = await appManagerFixture.contentManagementHelper.createDraftPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });

        const manageSiteContentPage = new ManageContentPage(appManagerFixture.page);
        await manageSiteContentPage.load();
        await manageSiteContentPage.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageSiteContentPage.manageContent.verifyTagVisibleInManageContent(ManageContentTags.DRAFT);
        await manageSiteContentPage.manageContent.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageSiteContentPage.manageContent.hoverOnFirstDropDownOption();
        await manageSiteContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.EDIT);
        await manageSiteContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.DELETE);
      }
    );

    test(
      'verify Add to campaign option under Content tab in Manage Site CONT-20537',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20537'],
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
        const siteInfo =
          await appManagerApiFixture.siteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
        const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo);
        await siteDashboardPage.loadPage();
        const manageSitePageAppManagerSite = new ManageSiteSetUpPage(appManagerFixture.page, siteInfo);
        await manageSitePageAppManagerSite.clickOnTheManageSiteButton();
        await manageSitePageAppManagerSite.clickOnInsideContentButton();
        await manageContentPage.manageContent.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.manageContent.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.manageContent.hoverOnFirstDropDownOption();
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.ADD_TO_CAMPAIGN);
        await manageContentPage.manageContent.clickOnOptionButton(ManageContentOptions.ADD_TO_CAMPAIGN);
        await addToCampaignComponent.clickOnAddToCampaignInput();
        await addToCampaignComponent.typeInAddToCampaignInput(campaignName);
        await addToCampaignComponent.clickOnSaveButton();
        await manageContentPage.verifyToastMessageIsVisibleWithText(
          MANAGE_CONTENT_TEST_DATA.TOAST_MESSAGES.ADDED_CONTENT_TO_CAMPAIGN
        );
      }
    );

    test(
      'to verify the site view option in manage site user drop down sites CONT-26044',
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
        await manageFeaturesPage.clickOnSitesCard();
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
        await manageSiteAppManagerPage.searchSiteNameInSearchBar(siteNames[0]);
        const siteDashBoardPage = new SiteDashboardPage(appManagerFixture.page, firstSiteId);
        await siteDashBoardPage.verifySiteNameIsDisplayedAfterSearch(siteNames[0]);
      }
    );
    test(
      'to verify the onboarding option in manage site content CONT-23737',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23737'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the onboarding option in manage site content',
          zephyrTestId: 'CONT-23737',
          storyId: 'CONT-23737',
        });
        const siteInfo =
          await appManagerFixture.siteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
        await appManagerFixture.contentManagementHelper.createPage({
          siteId: siteInfo,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnContentCard();
        const DashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo);
        const siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, siteInfo);
        await DashboardPage.loadPage();
        await manageSitesComponent.clickOnTheManageSiteButtonAction();
        await manageSitesComponent.clickOnInsideContentButtonAction();
        await siteDetailsPage.clickOnContentTab();
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.manageContent.hoverOnFirstDropDownOption();
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(
          ManageContentOptions.ONBOARDING_OPTION
        );
        await manageContentPage.manageContent.clickOnOnboardingOption();
        await manageContentPage.onboarding.verifyAlreadySelectedOnboardingOptionVisible(TagOption.NOT_ONBOARDING);
        await manageContentPage.onboarding.saveButtonShouldBeDisabled();
        await manageContentPage.onboarding.selectOnboardingOption(TagOption.SITE_ONBOARDING);
        await manageContentPage.onboarding.clickOnSaveButton();
        await manageContentPage.onboarding.verifyTagIsVisibleOnContent(TagOption.SITE_ONBOARDING_TAG);
        await manageContentPage.verifyToastMessageIsVisibleWithText(MANAGE_CONTENT_TEST_DATA.UPDATED_ONBOARDING_STATUS);
        await manageContentPage.manageContent.hoverOnFirstDropDownOption();
        await manageContentPage.manageContent.clickOnOnboardingOption();
        await manageContentPage.onboarding.selectOnboardingOption(TagOption.NOT_ONBOARDING);
        await manageContentPage.onboarding.clickOnSaveButton();
        await manageContentPage.verifyToastMessageIsVisibleWithText(MANAGE_CONTENT_TEST_DATA.UPDATED_ONBOARDING_STATUS);
        await manageContentPage.onboarding.verifyTagShouldNotBeVisibleOnContent(TagOption.SITE_ONBOARDING_TAG);
      }
    );

    test(
      'verify user able to apply publish unpublish delete actions on selected contents under Content tab in Manage Site CONT-20538',
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
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectFirstContent();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectUnpublishButton();
        await manageContentPage.manageContent.selectApplyButton();
        await manageContentPage.manageContent.verifyTagVisibleInManageContent(ManageContentTags.UNPUBLISHED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.UNPUBLISHED);
        await manageContentPage.manageContent.selectFirstContent();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectPublishButton();
        await manageContentPage.manageContent.selectApplyButton();
        await manageContentPage.manageContent.verifyTagVisibleInManageContent(ManageContentTags.PUBLISHED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        await manageContentPage.manageContent.clickSortByButton();
        const contentNames = await manageContentPage.manageContent.getAllContentNames();
        console.log('contentNames', contentNames);
        await manageContentPage.manageContent.selectFirstContent();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectDeleteButton();
        await manageContentPage.manageContent.selectDeleteApplyButton();
        await manageContentPage.manageContent.verifyAllContentsAreDeleted(contentNames);
      }
    );
    test(
      'to verify the UI of favorite people section CONT-26450',
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
        await favoritesPage.clickOnPeopleButton();
        const getPeopleList = await appManagerApiFixture.siteManagementHelper.getListOfPeople();
        const peopleNames = getPeopleList.result.listOfItems.map((item: any) =>
          `${item.firstName || ''} ${item.lastName || ''}`.trim()
        );
        await favoritesPage.verifyPeopleNamesAreDisplayed(peopleNames);
        await appManagerFixture.navigationHelper.clickOnOrgChartButton();
        await orgChartPage.typeInSearchBarInput(peopleNames[0]);
        await userProfilePage.clickOnFollowersTab();
        await userProfilePage.verifyContactInformation();
      }
    );
    test(
      'to verify the site edit option in manage site user drop down sites CONT-26503',
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
        await manageFeaturesPage.clickOnSitesCard();
        const editSitePage = new EditSitePage(appManagerFixture.page);
        await manageSitesComponent.hoverOnFirstSiteNameAction();
        await editSitePage.clickOnEditOption();
        await editSitePage.editSiteNameInput(MANAGE_SITE_TEST_DATA.UPDATED_SITE_NAME);
        await editSitePage.clickOnUpdateButton();
        await editSitePage.verifySiteNameIsUpdated(MANAGE_SITE_TEST_DATA.UPDATED_SITE_NAME);
      }
    );

    /**
     * CONTENT TAB IS NOT VIISBLE, WHY?
     */
    test(
      'to verify the bulk action activate in manage site user drop down CONT-26576',
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
        await manageFeaturesPage.clickOnSitesCard();
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
              await manageSitePage.clickOnShowMoreButtonAction();
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
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.clickOnActivateButton();
        await manageContentPage.manageContent.clickOnActivateApplyButton();
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
      'to verify the bulk action from app manager can activate the site CONT-26574',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26574'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the bulk action from app manager can activate the site',
          zephyrTestId: 'CONT-26574',
          storyId: 'CONT-26574',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnSitesCard();
        const getListOfSitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
        });

        const firstSiteId = getListOfSitesResponse.result.listOfItems[1]?.siteId;
        if (!firstSiteId) {
          throw new Error('No sites found in the response');
        }
        await manageSitesComponent.selectSiteCheckboxByExactName(getListOfSitesResponse.result.listOfItems[1].name);
        await manageContentPage.manageContent.selectActionDropdown();
        await manageSitesComponent.clickOnUpdateCategoryButtonAction();
        await manageContentPage.manageContent.clickOnApply();
        const manageSitePage = new ManageSiteSetUpPage(appManagerFixture.page, firstSiteId);
        await manageSitePage.updatingCategoryToUncategorized('Uncategorized');
      }
    );

    test(
      'verify published and unpublished stamp and its options menu on content under Content tab in Manage Site CONT-20536',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20536'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: '',
          zephyrTestId: 'CONT-20536',
          storyId: 'CONT-20536',
          isKnownFailure: true,
          bugTicket: 'CONT-43937',
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
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.manageContent.verifyTagVisibleInManageContent(ManageContentTags.PUBLISHED);
        await manageContentPage.manageContent.verifyContentDetailsVisibility(pageInfo.albumName);
        await manageContentPage.manageContent.hoverOnFirstDropDownOption();
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.EDIT);
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.DELETE);
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.UNPUBLISH);
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.MOVE);
        await manageContentPage.manageContent.verifyOptionVisibleInManageContent(ManageContentOptions.ADD_TO_CAMPAIGN);
        await manageContentPage.manageContent.selectUnpublishButton();
        await manageContentPage.manageContent.verifyTagVisibleInManageContent(ManageContentTags.UNPUBLISHED);
        await manageContentPage.manageContent.hoverOnFirstDropDownOption();
        await manageContentPage.manageContent.clickOnDeleteOption();
        await manageContentPage.manageContent.clickDeleteModalConfirmButton();
      }
    );

    test(
      'verify published stamp and its options menu on approved content under Content tab in Manage Site CONT-20534',
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
        await siteDetailsPage.clickOnContentTab();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.onboarding.verifyTagIsVisibleOnContent(TagOption.PUBLISHED_TAG);
      }
    );

    test(
      'verify the site activate option in manage site user drop down sites for all site types CONT-26177',
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
        await manageSitePage.clickOnFilterOptionsDropdownButton();
        await manageSitePage.selectFilterOption('All');

        for (const siteType of siteTypes) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getDeactivatedSite(siteType, {
            size: 1000,
            sortBy: 'alphabetical',
          });
          const siteName = siteInfo.siteName;
          await manageSitePage.searchSite(siteName);
          await manageSitePage.clickOnSearchButton();
          await manageSitePage.clickOnOptionsDropdown(siteName);
          await manageSitePage.verifyOptionIsVisibleInOptionsDropdown('Activate');
          await manageSitePage.verifyOptionIsNotVisibleInOptionsDropdown('Deactivate');
        }
      }
    );
    test(
      'to verify the site ownership change in manage site people tab CONT-23662',
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
        await manageFeaturesPage.clickOnSitesCard();
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
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, firstSite.siteId);
        await siteDashboardPage.loadPage();
        await manageSitesComponent.clickOnTheManageSiteButtonAction();
        await manageSiteAppManagerPage.clickOnThePeopleTab();
        await manageSiteAppManagerPage.verifyMemberNameAndSiteOwnerStatus(nonAppManagerMember.name);
      }
    );
    test(
      'to verify add another button in manage site people tab CONT-23554',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23554'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify add another button in manage site people tab',
          zephyrTestId: 'CONT-23554',
          storyId: 'CONT-23554',
        });
        const getListOfSitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          filter: 'public',
          size: 1000,
        });
        const filteredSites = getListOfSitesResponse.result.listOfItems.filter((item: any) => item.isActive === true);
        if (filteredSites.length === 0) {
          throw new Error('No active sites found in the response');
        }
        // Wrap filtered sites in the expected response structure
        const filteredSitesResponse = {
          result: {
            listOfItems: filteredSites,
          },
        };
        const newSite =
          await appManagerApiFixture.siteManagementHelper.getSiteWithManageSiteOption(filteredSitesResponse);
        console.log('newSite', newSite);
        const siteId = newSite.siteId;
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, newSite.siteId);
        await siteDashboardPage.loadPage();
        const manageSitesComponent = new ManageSitesComponent(appManagerFixture.page);
        const addPeopleInSiteComponent = new AddPeopleInSiteComponent(appManagerFixture.page);
        await manageSitesComponent.clickOnTheManageSiteButtonAction();
        await manageSitesComponent.clickOnPeppleTabAction();
        await manageSitesComponent.clickOnAddAnotherButtonAction();

        // Get non-member user names using helper method
        const nonMemberNames = await appManagerApiFixture.siteManagementHelper.getNonMemberUserNames(siteId, {
          minimumCount: 2,
        });

        await addPeopleInSiteComponent.fillAddPeopleInput(nonMemberNames[0]);
        await addPeopleInSiteComponent.clickOnAddButton(siteId);
        await manageSitesComponent.clickOnAddAnotherButtonAction();
        await addPeopleInSiteComponent.fillAddPeopleInput(nonMemberNames[1]);
      }
    );
    test(
      'to verify the favourite content filters CONT-26264',
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
        await favoritesPage.clickOnContentButton();
        await favoritesPage.verifyContentNamesAreDisplayed([
          createPageInfo.pageName,
          createAlbumInfo.albumName,
          createEventInfo.eventName,
        ]);
      }
    );
    test(
      'to verify the UI of favourite content CONT-26267',
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
          createPageInfo.contentId
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
        const newHomePage = new NewHomePage(appManagerFixture.page);
        await newHomePage.loadPage();
        await manageSitesComponent.clickOnTheFavouriteTabsAction();
        await favoritesPage.clickOnContentButton();
        await favoritesPage.verifyContentNamesAreDisplayed([
          createPageInfo.pageName,
          createAlbumInfo.albumName,
          createEventInfo.eventName,
        ]);

        const manageAppManagerUserPage = new ManageSiteSetUpPage(appManagerFixture.page, siteInfo.siteId);
        await favoritesPage.verifyEventsTabImageIsDisplayed();
        await favoritesPage.verifyAlbumTabImageIsDisplayed();
        await manageAppManagerUserPage.verifyPageTabImageIsDisplayed();
        await favoritesPage.verifyEventsTabMatchesApiDate(createEventInfo.startsAt);
        await onboardingComponent.verifyTagIsVisibleOnContentUnderFavoritesTab(TagOption.MUST_READ_TAG);
        await favoritesPage.markAsFavoriteAndCheckRGBColor();
      }
    );
    test(
      'verify user should be able to add and remove content from carousel on clicking three dot menu options CONT-29906',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29906'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the carousel item functionality',
          zephyrTestId: 'CONT-29906',
          storyId: 'CONT-29906',
        });
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const createPageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        const addSiteCarouselItemResponse = await appManagerApiFixture.contentManagementHelper.addSiteCarouselItem(
          siteInfo.siteId,
          createPageInfo.contentId
        );

        const addContentIntoHomeCarouselResponse =
          await appManagerApiFixture.contentManagementHelper.addContentIntoHomeCarousel(createPageInfo.contentId);
        const contentDetails = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          createPageInfo.contentId,
          'page'
        );
        await contentDetails.loadPage();
        await contentDetails.clickOnOptionMenuButton();
        await contentDetails.clickOnRemoveFromHomeCarouselButton(
          addContentIntoHomeCarouselResponse.result.carouselItemId
        );
        await contentDetails.clickOnRemoveFromSiteCarouselButton(
          siteInfo.siteId,
          addSiteCarouselItemResponse.result.carouselItemId
        );
        const homePage = new NewHomePage(appManagerFixture.page);
        await homePage.loadPage();
        await homePage.verifyContentIsNotVisibleInCarousel(createPageInfo.pageName);
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo.siteId);
        await siteDashboardPage.loadPage();
        await homePage.verifyContentIsNotVisibleInCarousel(createPageInfo.pageName);
      }
    );

    test(
      'to verify the created and published dates of content in  Manage site content CONT-23980',
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
        await manageSitePageAppManagerSite.clickOnInsideContentButton();
        const manageContentPage = new ManageContentPage(appManagerFixture.page);
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.manageContent.clickSortByButton();
        // Verify all three dates in parallel since they're already rendered on the page
        await Promise.all([
          manageContentPage.manageContent.verifyCreatedAtDateVisibleInManageContent(pageCreatedAtDate),
          manageContentPage.manageContent.verifyCreatedAtDateVisibleInManageContent(eventCreatedAtDate),
          manageContentPage.manageContent.verifyCreatedAtDateVisibleInManageContent(albumCreatedAtDate),
        ]);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_OLDEST);
        await manageContentPage.manageContent.clickSortByButton();
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
        await manageContentPage.manageContent.verifyCreatedAtDateVisibleInManageContent(oldestContentCreatedAtDate);
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
        await profileScreenPage.openEditTimezone();
        // Generate random timezone value between 1 and 300 (inclusive)
        await profileScreenPage.selectTimezone(PROFILE_TEST_DATA.TIMEZONE.RANDOM_NUMBER.toString());
        await profileScreenPage.clickOnSaveTimezoneButton();

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
        await manageSitePageAppManagerSiteAfterUpdate.clickOnInsideContentButton();
        const manageContentPageAfterUpdate = new ManageContentPage(appManagerFixture.page);
        await manageContentPageAfterUpdate.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.manageContent.clickSortByButton();
        // Verify all three dates in parallel since they're already rendered on the page
        await Promise.all([
          manageContentPage.manageContent.verifyCreatedAtDateVisibleInManageContent(pageCreatedAtDateAfterUpdate),
          manageContentPage.manageContent.verifyCreatedAtDateVisibleInManageContent(eventCreatedAtDateAfterUpdate),
          manageContentPage.manageContent.verifyCreatedAtDateVisibleInManageContent(albumCreatedAtDateAfterUpdate),
        ]);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_OLDEST);
        await manageContentPage.manageContent.clickSortByButton();
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
        await manageContentPageAfterUpdate.manageContent.verifyCreatedAtDateVisibleInManageContent(
          oldestContentCreatedAtDateAfterUpdate
        );
        await profileScreenPage.loadPage();
        await profileScreenPage.openEditTimezone();
        // select default timezone
        await profileScreenPage.selectTimezone('328');
        await profileScreenPage.clickOnSaveTimezoneButton();
      }
    );
    test(
      'verify user able to apply validate action on selected content under Content tab in Manage Site CONT-20539',
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
        await governanceScreenPage.selectContentValidationPeriodTime(CONTENT_VALIDATION_PERIOD_TIME.TWELVE_MONTHS);
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
        await standardUserApiFixture.contentManagementHelper.updateContentPublishDate(
          siteId,
          pageInfo.contentId,
          MANAGE_CONTENT_TEST_DATA.PAST_YEAR_DATE
        );
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        const manageFeaturesPageForStandardUser = new ManageFeaturesPage(standardUserFixture.page);
        await manageFeaturesPageForStandardUser.clickOnContentCard();
        const manageContentPageForStandardUser = new ManageContentPage(standardUserFixture.page);
        await manageContentPageForStandardUser.manageContent.verifyValidationRequiredIsVisible();
        await manageContentPageForStandardUser.manageContent.clickOnValidationViewAllButton();
        await manageContentPageForStandardUser.manageContent.verifyTagVisibleInManageContent(
          ManageContentTags.VALIDATION_REQUIRED
        );
        await manageContentPageForStandardUser.manageContent.hoverOnFirstDropDownOption();
        await manageContentPageForStandardUser.manageContent.selectValidateButton();
        await manageContentPageForStandardUser.manageContent.clickFilterButton();
        await manageContentPageForStandardUser.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPageForStandardUser.manageContent.clickFilterButton();
        await manageContentPageForStandardUser.manageContent.clickSortByButton();
        await manageContentPageForStandardUser.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPageForStandardUser.manageContent.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPageForStandardUser.manageContent.hoverOnFirstDropDownOption();
        await manageContentPageForStandardUser.manageContent.verifyOptionVisibleInManageContent(
          ManageContentOptions.EDIT
        );
        await manageContentPageForStandardUser.manageContent.verifyOptionVisibleInManageContent(
          ManageContentOptions.DELETE
        );
        await manageContentPageForStandardUser.manageContent.verifyOptionVisibleInManageContent(
          ManageContentOptions.UNPUBLISH
        );
        await manageContentPageForStandardUser.manageContent.verifyOptionVisibleInManageContent(
          ManageContentOptions.MOVE
        );
        await manageContentPageForStandardUser.manageContent.verifyTagVisibleInManageContent(
          ManageContentTags.PUBLISHED
        );
      }
    );
    test(
      'verify rejected content functionality under Content tab in Manage Site CONT-20533',
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

        // Loop through sites to find one where standard user is NOT a member, owner, or manager
        const newsiteInfo = await standardUserApiFixture.siteManagementHelper.getSitesWhereUserIsNotMemberOrOwner(
          siteInfo.siteListResponse
        );
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
        await manageSiteSetUpPage.clickOnTheManageSiteButton();
        await manageSiteSetUpPage.clickOnInsideContentButton();
        await siteDetailsPage.clickOnContentTab();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.REJECTED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.onboarding.verifyTagIsVisibleOnContent(TagOption.REJECTED_TAG);
      }
    );

    test(
      'verify content list loads when page category has more than 16 items on site dashboard CONT-43064',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-43064'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify content list loads when page category has more than 16 items on site dashboard',
          zephyrTestId: 'CONT-43064',
          storyId: 'CONT-43064',
        });
        await test.step('Get site with page category having more than 16 pages', async () => {
          // Get a site with a page category that has more than 16 pages
          const categoryInfo =
            await appManagerFixture.contentManagementHelper.getSiteWithPageCategoryHavingMoreThan16Pages({
              minPageCount: 18,
            });

          // Click on the page category
          const siteContentPage = new SiteContentPage(appManagerFixture.page, categoryInfo.siteId);
          await siteContentPage.loadPage();
          await siteContentPage.verifyThePageIsLoaded();
          await siteContentPage.clickPageCategory(categoryInfo.categoryName);
          // Verify content list loads
          await siteContentPage.verifyContentListLoaded();
          await siteContentPage.verifyShowMoreButtonIsVisible();
          await siteContentPage.clickOnShowMoreButton();
          await siteContentPage.verifyContentListAfterClickingShowMoreButton();
        });
      }
    );

    test(
      'verify content list loads when page category has more than 16 items on manage site Page Categories CONT-43065',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-43065'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify content list loads when page category has more than 16 items on manage site Page Categories',
          zephyrTestId: 'CONT-43065',
          storyId: 'CONT-43065',
        });

        // Get a site with a page category that has more than 16 pages
        const categoryInfo =
          await appManagerFixture.contentManagementHelper.getSiteWithPageCategoryHavingMoreThan16Pages({
            minPageCount: 18,
          });
        const manageSitePageCategoryPage = new ManageSitePageCategoryPage(appManagerFixture.page, categoryInfo.siteId);
        await manageSitePageCategoryPage.loadPage();
        await manageSitePageCategoryPage.verifyThePageIsLoaded();
        await manageSitePageCategoryPage.searchCategory(categoryInfo.categoryName);
        await manageSitePageCategoryPage.clickOnCustomCategory(categoryInfo.categoryName);
        await manageSitePageCategoryPage.verifyNoResultsFoundIsNotVisible();
        await manageSitePageCategoryPage.verifyContentListLoaded(categoryInfo.siteId, categoryInfo.categoryId);
        await manageSitePageCategoryPage.verifyShowMoreButtonIsVisible();
        await manageSitePageCategoryPage.clickOnShowMoreButton();
        await manageSitePageCategoryPage.verifyContentListAfterClickingShowMoreButton();
      }
    );
  }
);
