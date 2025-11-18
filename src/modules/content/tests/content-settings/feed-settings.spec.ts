import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { GovernanceScreenPage } from '@content/ui/pages/governanceScreenPage';
import { ManageApplicationPage } from '@content/ui/pages/manageApplicationPage';
import { ManageContentPage } from '@content/ui/pages/manageContentPage';
import { ManageFeaturesPage as ManageFeature } from '@content/ui/pages/manageFeaturesPage';
import { ManageSiteSetUpPage } from '@content/ui/pages/manageSiteSetUpPage';
import { SiteDetailsPage } from '@content/ui/pages/siteDetailsPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { initializeContentConfig } from '@/src/modules/content/config/contentConfig';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

// Initialize config for contentSettings tenant
initializeContentConfig('contentSettings');

test.describe(
  `feed settings using different tenant`,
  {
    tag: [ContentTestSuite.FEED_APP_MANAGER, ContentSuiteTags.FEED_SETTINGS],
  },
  () => {
    let contentPreviewPage: ContentPreviewPage;
    let siteDashboardPage: SiteDashboardPage;
    let applicationScreenPage: ApplicationScreenPage;
    let manageFeaturePage: ManageFeature;
    let manageApplicationPage: ManageApplicationPage;
    let governanceScreenPage: GovernanceScreenPage;
    let manageContentPage: ManageContentPage;
    let manageSiteSetUpPage: ManageSiteSetUpPage;
    let siteDetailsPage: SiteDetailsPage;
    let placeholder: boolean;

    test.beforeEach('Setting up the environment', async ({ appManagerFixture }) => {
      placeholder = false;
      // Configure app governance
      try {
        await appManagerFixture.feedManagementHelper.configureAppGovernance({
          feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
        });
      } catch (error) {
        console.warn('Failed to configure app governance, continuing with test:', error);
      }

      // Create home page instance
      await appManagerFixture.homePage.verifyThePageIsLoaded();

      // Initialize page objects for the test cases
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageFeaturePage = new ManageFeature(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      manageSiteSetUpPage = new ManageSiteSetUpPage(appManagerFixture.page, '');
      siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, '');
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
      contentPreviewPage = new ContentPreviewPage(appManagerFixture.page, '', '', '');
    });

    test.afterEach('Reset the placeholder', async ({ appManagerFixture }) => {
      if (placeholder) {
        //revert the custom placeholder
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.makePlaceholderDefault();
      }
    });
    test(
      'verify that feeds and comments are displayed when enabled and not displayed when disabled at the app level',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.VERIFY_COMMENTS_AND_FEEDS, '@CONT-26613'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify feed and comment should not be displayed when feed and comments are disabled app level',
          zephyrTestId: 'CONT-26613',
          storyId: 'CONT-26613',
        });
        // Create home page instance
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationScreenPage.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.clickOnTimelineFeedDisabled();
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.assertions.verifyFeedSectionIsNotVisible();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnContent();
        await contentPreviewPage.assertions.verifyCommentOptionIsNotVisible();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.actions.clickOnSitesCard();
        await manageSiteSetUpPage.actions.clickOnSite();
        await siteDetailsPage.actions.ViewSite();
        await siteDashboardPage.assertions.verifyFeedSectionIsNotVisible();
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.clickOnTimelineFeedEnabled();
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyFeedSectionIsVisible();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnContent();
        await contentPreviewPage.assertions.verifyCommentOptionIsVisible();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.actions.clickOnSitesCard();
        await manageSiteSetUpPage.actions.clickOnSite();
        await siteDetailsPage.actions.ViewSite();
        await siteDashboardPage.assertions.verifyFeedSectionIsVisible();
      }
    );

    test(
      'verify Placeholder Update is Reflected in Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33869'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Placeholder Update is Reflected in Feed',
          zephyrTestId: 'CONT-33869',
          storyId: 'CONT-33869',
        });

        const userInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);
        const topicList = await appManagerFixture.contentManagementHelper.getTopicList();
        const topic = topicList.result.listOfItems[0].name;
        await appManagerFixture.feedManagementHelper.setOneLanguage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.clickOnTimelineFeedEnabled();
        const customPlaceholder = 'Share your thoughts @' + userInfo.firstName + ' about #' + topic;
        await governanceScreenPage.actions.updateTheCustomFeedPlaceholder(customPlaceholder);
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.assertions.verifyFeedPlaceholderText(customPlaceholder);
        const contentInfo = await appManagerFixture.contentManagementHelper.getContentId();
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          contentInfo.contentId,
          siteInfo.siteId,
          contentInfo.contentType
        );
        await contentPreviewPage.loadPage();
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo.siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.assertions.verifyFeedPlaceholderText(customPlaceholder);
        placeholder = true;
      }
    );
  }
);
