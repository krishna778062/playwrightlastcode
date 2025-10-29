import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { ContentStatus, OnboardingOption, SortOptionLabels } from '@/src/modules/content/constants';
import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_CONTENT_TEST_DATA } from '@/src/modules/content/test-data/manage-content.test-data';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { ManageSitesComponent, OnboardingComponent } from '@/src/modules/content/ui/components';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { SiteDetailsPage } from '@/src/modules/content/ui/pages/siteDetailsPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe('manage Site Tests', () => {
  let manageFeaturesPage: ManageFeaturesPage;
  let manageContentPage: ManageContentPage;
  let manageSitesComponent: ManageSitesComponent;
  let onboardingComponent: OnboardingComponent;

  test.beforeEach(async ({ appManagerFixture }) => {
    await appManagerFixture.homePage.verifyThePageIsLoaded();
    manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
    manageContentPage = new ManageContentPage(appManagerFixture.page);
    manageSitesComponent = new ManageSitesComponent(appManagerFixture.page);
    onboardingComponent = new OnboardingComponent(appManagerFixture.page);
  });

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
      await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
      await manageContentPage.actions.scheduledTagVisibleInManageContent();
      await manageContentPage.actions.checkContentDetailsVisibility(pageInfo.pageName);
      await manageContentPage.actions.hoverOnFirstDropDownOption();
      await manageContentPage.actions.verifyEditOptionVisibleInManageContent();
      await manageContentPage.actions.verifyDeleteOptionVisibleInManageContent();
      await manageContentPage.actions.verifyPublishOptionVisibleInManageContent();
      await manageContentPage.actions.verifyMoveOptionVisibleInManageContent();
      await manageContentPage.actions.clickOnPublishButton();
    }
  );
  test(
    'to verify the onboarding option in manage site content',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT, '@CONT-23737'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Scheduled stamp and its options menu under-manage site content tab',
        zephyrTestId: 'CONT-23737',
        storyId: 'CONT-23737',
      });
      const siteInfo = await appManagerFixture.siteManagementHelper.getSiteBySpecificName('All Employees', {
        hasPages: true,
      });
      await appManagerFixture.contentManagementHelper.createPage({
        siteId: siteInfo.siteId,
        contentInfo: { contentType: 'page', contentSubType: 'news' },
      });
      await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
      await manageFeaturesPage.actions.clickOnContentCard();
      const DashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo.siteId);
      const siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, siteInfo.siteId);
      await DashboardPage.loadPage();
      await manageSitesComponent.clickOnTheManageSiteButtonAction();
      await manageSitesComponent.clickOnInsideContentButtonAction();
      await siteDetailsPage.actions.clickOnContentTab();
      await manageContentPage.actions.clickSortByButton();
      await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
      await manageContentPage.actions.clickSortByButton();
      await manageContentPage.actions.hoverOnFirstDropDownOption();
      await manageContentPage.actions.verifyOnboardingOptionVisibleInManageContent();
      await manageContentPage.actions.clickOnOnboardingOption();
      await onboardingComponent.verifyAlreadySelectedOnboardingOptionVisible(OnboardingOption.NOT_ONBOARDING);
      await onboardingComponent.saveButtonShouldBeDisabled();
      await onboardingComponent.selectOnboardingOption(OnboardingOption.SITE_ONBOARDING);
      await onboardingComponent.clickOnSaveButton();
      await onboardingComponent.verifyTagIsVisibleOnContent(OnboardingOption.SITE_ONBOARDING_TAG);
      await onboardingComponent.verifyToastMessageIsVisibleWithText('Updated onboarding status');
      await manageContentPage.actions.hoverOnFirstDropDownOption();
      await manageContentPage.actions.clickOnOnboardingOption();
      await onboardingComponent.selectOnboardingOption(OnboardingOption.NOT_ONBOARDING);
      await onboardingComponent.clickOnSaveButton();
      await onboardingComponent.verifyToastMessageIsVisibleWithText('Updated onboarding status');
      await onboardingComponent.verifyTagShouldNotBeVisibleOnContent(OnboardingOption.SITE_ONBOARDING_TAG);
    }
  );
  test(
    'verify user able to apply publish unpublish delete actions on selected contents under Content tab in Manage Site',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT, '@CONT-20538'],
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
      await manageContentPage.actions.verifyUnpublishedStampVisibleInManageContent();
      await appManagerFixture.page.reload();
      await manageContentPage.actions.clickFilterButton();
      await manageContentPage.actions.selectTheStatusFilter(ContentStatus.UNPUBLISHED);
      await manageContentPage.actions.clickOnFirstContentButton();
      await manageContentPage.actions.clickOnSelectActionDropdown();
      await manageContentPage.actions.clickOnPublishButton();
      await manageContentPage.actions.clickOnApplyButton();
      await manageContentPage.actions.verifyPublishedStampVisibleInManageContent();
      await appManagerFixture.page.reload();
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
    'verify published and unpublished stamp and its options menu on content under Content tab in Manage Site',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MY_CONTENT_FILTER, '@CONT-20536'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'verify published and unpublished stamp and its options menu on content under Content tab in Manage Site',
        customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
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
      await manageContentPage.actions.verifyPublishedStampVisibleInManageContent();
      await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.albumName);
      await manageContentPage.actions.hoverOnFirstDropDownOption();
      await manageContentPage.actions.verifyEditOptionVisibleInManageContent();
      await manageContentPage.actions.verifyDeleteOptionVisibleInManageContent();
      await manageContentPage.actions.verifyUnpublishOptionVisibleInManageContent();
      await manageContentPage.actions.verifyMoveOptionVisibleInManageContent();
      await manageContentPage.actions.verifyAddToCampaignOptionShouldNotBeVisibleInManageContent();
      await manageContentPage.actions.clickOnUnpublishButton();
      await manageContentPage.actions.verifyUnpublishedStampVisibleInManageContent();
      await manageContentPage.actions.hoverOnFirstDropDownOption();
      await manageContentPage.actions.clickOnDeleteOption();
      await manageContentPage.actions.clickDeleteModalConfirmButton();
    }
  );

  test(
    'verify published stamp and its options menu on approved content under Content tab in Manage Site',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT, '@CONT-20534'],
    },
    async ({ appManagerApiFixture, standardUserApiFixture }) => {
      tagTest(test.info(), {
        description: 'Verify published stamp and its options menu on approved content under Content tab in Manage Site',
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
      await manageContentPage.actions.verifyTagIsVisibleOnContent(OnboardingOption.PUBLISHED_TAG);
    }
  );
});
