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

import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { initializeContentConfig } from '@/src/modules/content/config/contentConfig';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

interface FeedResponse {
  result: {
    feedId: string;
  };
}

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
    let feedPage: FeedPage;
    let placeholder: boolean;

    // Cleanup variables for timeline mode tests
    let homeFeedPostId: string = '';
    let siteFeedPostId: string = '';
    let contentFeedPostId: string = '';
    let siteId: string = '';
    let contentId: string = '';
    let createdContentSiteId: string = '';
    let createdContentId: string = '';
    let commentText: string = '';
    let feedPostText: string = '';
    let feedReplyText: string = '';
    let commentReplyText: string = '';

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
      feedPage = new FeedPage(appManagerFixture.page);
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageFeaturePage = new ManageFeature(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      manageSiteSetUpPage = new ManageSiteSetUpPage(appManagerFixture.page, '');
      siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, '');
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
      contentPreviewPage = new ContentPreviewPage(appManagerFixture.page, '', '', '');

      // Set Timeline & feed setting to default mode (for timeline mode tests)
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnApplication();
      await manageApplicationPage.actions.clickOnGovernance();
      //await governanceScreenPage.actions.selectTimelineFeedSettingsAsDefaultMode();
    });

    test.afterEach('Reset the placeholder and cleanup created posts', async ({ appManagerFixture }) => {
      // Reset placeholder if it was modified
      if (placeholder) {
        //revert the custom placeholder
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.makePlaceholderDefault();
      }

      // Reset Timeline & feed setting to default mode
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);

      await governanceScreenPage.loadPage();
      await governanceScreenPage.actions.selectTimelineFeedSettingsAsDefaultMode();

      // Cleanup home feed post
      if (homeFeedPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(homeFeedPostId);
        } catch (error) {
          console.log('Failed to cleanup home feed post:', error);
        }
        homeFeedPostId = '';
      }

      // Cleanup site feed post
      if (siteFeedPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(siteFeedPostId);
        } catch (error) {
          console.log('Failed to cleanup site feed post:', error);
        }
        siteFeedPostId = '';
      }

      // Cleanup content feed post
      if (contentFeedPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(contentFeedPostId);
        } catch (error) {
          console.log('Failed to cleanup content feed post:', error);
        }
        contentFeedPostId = '';
      }

      // Cleanup created content
      if (createdContentId && createdContentSiteId) {
        try {
          await appManagerFixture.contentManagementHelper.deleteContent(createdContentSiteId, createdContentId);
        } catch (error) {
          console.log('Failed to cleanup created content:', error);
        }
        createdContentId = '';
        createdContentSiteId = '';
      }

      siteId = '';
      contentId = '';
      commentText = '';
      feedPostText = '';
      feedReplyText = '';
      commentReplyText = '';
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
        await governanceScreenPage.actions.clickOnTimelineFeedEnabled();
        const customPlaceholder =
          'Share your thoughts @' + userInfo.firstName + ' about #' + topic + ' #' + userInfo.lastName + '#';
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

    test(
      'verify Selection of Default Placeholder Text',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33862'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Selection of Default Placeholder Text',
          zephyrTestId: 'CONT-33862',
          storyId: 'CONT-33862',
        });

        // Select Default Placeholder option
        await governanceScreenPage.actions.makePlaceholderDefault();

        const appConfig = await appManagerFixture.feedManagementHelper.getAppConfig();
        const isRecognitionEnabled = appConfig.result?.isRecognitionEnabled || false;

        // Expected placeholder texts based on Recognition feature flag
        const expectedPlaceholderWithRecognition = FEED_TEST_DATA.PLACEHOLDER_TEXT.WITH_RECOGNITION;
        const expectedPlaceholderWithoutRecognition = FEED_TEST_DATA.PLACEHOLDER_TEXT.WITHOUT_RECOGNITION;

        // Navigate to Global Feed and verify placeholder
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Verify placeholder text matches expected based on Recognition flag
        if (isRecognitionEnabled) {
          await feedPage.assertions.verifyFeedPlaceholderText(expectedPlaceholderWithRecognition);
        } else {
          await feedPage.assertions.verifyFeedPlaceholderText(expectedPlaceholderWithoutRecognition);
        }

        // Also verify on Site Feed
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo.siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.actions.clickOnFeedLink();

        if (isRecognitionEnabled) {
          await siteDashboardPage.assertions.verifyFeedPlaceholderText(expectedPlaceholderWithRecognition);
        } else {
          await siteDashboardPage.assertions.verifyFeedPlaceholderText(expectedPlaceholderWithoutRecognition);
        }

        // Verify on Content Feed
        const contentInfo = await appManagerFixture.contentManagementHelper.getContentId();
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteInfo.siteId,
          contentInfo.contentId,
          contentInfo.contentType
        );
        await contentPreviewPage.loadPage();

        if (isRecognitionEnabled) {
          await contentPreviewPage.assertions.verifyFeedPlaceholderText(expectedPlaceholderWithRecognition);
        } else {
          await contentPreviewPage.assertions.verifyFeedPlaceholderText(expectedPlaceholderWithoutRecognition);
        }
      }
    );

    test(
      'verify Placeholder Text Storage and Retrieval',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33865'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Placeholder Text Storage and Retrieval',
          zephyrTestId: 'CONT-33865',
          storyId: 'CONT-33865',
        });

        // Step 1: Admin configures custom placeholder text
        await appManagerFixture.feedManagementHelper.setOneLanguage();
        await governanceScreenPage.actions.clickOnTimelineFeedEnabled();
        const customPlaceholder = 'Share your thoughts ' + TestDataGenerator.generateRandomString('');
        await governanceScreenPage.actions.updateTheCustomFeedPlaceholder(customPlaceholder);
        placeholder = true;

        // Step 2: Verify placeholder is displayed before logout
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const appManagerFeedPage = new FeedPage(appManagerFixture.page);
        await appManagerFeedPage.assertions.verifyFeedPlaceholderText(customPlaceholder);

        //Verify the place holder text for the standard user
        const standardUserFeedPage = new FeedPage(standardUserFixture.page);
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await standardUserFeedPage.assertions.verifyFeedPlaceholderText(customPlaceholder);

        // Step 3: Log out
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerFixture.page);
        // Wait for logout to complete and ensure we're on login page
        await appManagerFixture.page.waitForURL(/login|logout/, { timeout: 10000 });

        // Step 4: Log in again as Admin
        const adminHomePage = await LoginHelper.loginWithPassword(appManagerFixture.page, {
          email: users.appManager.email,
          password: users.appManager.password,
        });
        await adminHomePage.loadPage();
        await adminHomePage.verifyThePageIsLoaded();

        // Step 5: Verify placeholder text persists after logout/login
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await appManagerFeedPage.assertions.verifyFeedPlaceholderText(customPlaceholder);
      }
    );

    test(
      'verify Feed Custom Placeholder Setting is Displayed in Governance Settings',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33860'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Feed Custom Placeholder Setting is Displayed in Governance Settings',
          zephyrTestId: 'CONT-33860',
          storyId: 'CONT-33860',
        });

        // Step 1: Set feed mode to timeline_comment_post
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.clickOnTimelineFeedEnabled();

        // Step 2: Set languages to 1 or fewer
        await appManagerFixture.feedManagementHelper.setOneLanguage();

        // Step 3: Navigate to Governance Settings (already on the page, but ensure it's loaded)
        await governanceScreenPage.loadPage();
        await governanceScreenPage.verifyThePageIsLoaded();

        // Step 4: Verify "Feed placeholder" section is visible
        await governanceScreenPage.assertions.verifyFeedPlaceholderSettingIsVisible();

        // Step 5: Verify it's positioned below "Timeline & Feed" heading
        await governanceScreenPage.assertions.verifyFeedPlaceholderPositionedBelowTimelineFeed();
      }
    );

    test(
      'verify Feed Custom Placeholder Setting is not displayed when number of enabled languages is greater than 1',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33861'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Feed Custom Placeholder Setting is not displayed when number of enabled languages is greater than 1',
          zephyrTestId: 'CONT-33861',
          storyId: 'CONT-33861',
        });

        // ----- Set feed mode to timeline and verify "Feed placeholder" section is not visible -----
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimeline();

        // Verify "Feed placeholder" section is not visible
        await governanceScreenPage.assertions.verifyFeedPlaceholderSettingIsNotVisible();

        // ----- Set multiple languages to 2 and verify "Feed placeholder" section is not visible -----
        await appManagerFixture.feedManagementHelper.setMultipleLanguages([1, 2]);
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsDefaultMode();
        await governanceScreenPage.assertions.verifyFeedPlaceholderSettingIsNotVisible();
      }
    );

    test(
      'verify user should not be able to share feed post content file when Timeline & feed setting should be set to "Timeline"',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-26731'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Share button is not visible on feed posts on home dashboard, site dashboard, and page dashboard when Timeline mode is enabled',
          zephyrTestId: 'CONT-26731',
          storyId: 'CONT-26731',
          isKnownFailure: true,
        });

        // Create feed posts BEFORE setting Timeline mode (posts can only be created when Timeline is disabled)
        // Create feed post on Home Feed
        const homeFeedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          waitForSearchIndex: false,
        });
        const homeFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(homeFeedTestData);
        homeFeedPostId = homeFeedResponse.result.feedId;
        console.log(`Created home feed post via API: ${homeFeedPostId}`);

        // Create feed post on Site Feed
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        siteId = siteDetails.siteId;

        const siteFeedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          waitForSearchIndex: false,
        });
        const siteFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(siteFeedTestData);
        siteFeedPostId = siteFeedResponse.result.feedId;
        console.log(`Created site feed post via API: ${siteFeedPostId}`);

        // Create feed post on Content/Page Dashboard
        const pageDetails = await appManagerFixture.contentManagementHelper.getContentId();
        contentId = pageDetails.contentId;
        // Use the siteId from pageDetails if available, otherwise use the siteId from siteDetails
        if (pageDetails.siteId) {
          siteId = pageDetails.siteId;
        }

        const contentFeedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          contentId: contentId,
          waitForSearchIndex: false,
        });
        const contentFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(contentFeedTestData);
        contentFeedPostId = contentFeedResponse.result.feedId;
        console.log(`Created content feed post via API: ${contentFeedPostId}`);

        // Set Timeline & feed setting to "Timeline"
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimeline();
        console.log('Timeline mode enabled');

        // Navigate to Home Feed and verify post is not visible and share button is NOT visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();
        await feedPage.assertions.verifyPostIsNotVisible(homeFeedTestData.text);
        await feedPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Home feed: Post is not visible and Share button is NOT visible');

        // Navigate to Site Dashboard and verify post is not visible and share button is NOT visible
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();
        await siteDashboardPage.assertions.verifyThePageIsLoadedWithTimelineMode();
        await siteDashboardPage.assertions.validatePostNotVisible(siteFeedTestData.text);
        await siteDashboardPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Site feed: Post is not visible and Share button is NOT visible');

        // Step 5: Navigate to Content Preview Page and verify post is not visible and share button is NOT visible
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.assertions.verifyThePageIsLoadedWithTimelineModeOnContentPage();
        await contentPreviewPage.assertions.verifyPostIsNotVisible(contentFeedTestData.text);
        await contentPreviewPage.assertions.verifyShareButtonIsNotVisible();
        // Verify content share button is visible on content preview page
        await contentPreviewPage.assertions.verifyContentShareButtonIsNotVisible();
        console.log('Content feed: Post is not visible and Share button is NOT visible on content and comments');
      }
    );

    test(
      'verify user should not be able to share feed post content file when Timeline & feed setting should be set to "Timeline and comments on Content"',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-26730'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Share button is not visible on feed posts on home dashboard, site dashboard, and page dashboard when Timeline mode is enabled',
          zephyrTestId: 'CONT-26730',
          storyId: 'CONT-26730',
          isKnownFailure: true,
        });

        // Create feed posts BEFORE setting Timeline mode (posts can only be created when Timeline is disabled)
        // Create feed post on Home Feed
        const homeFeedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          waitForSearchIndex: false,
        });
        const homeFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(homeFeedTestData);
        homeFeedPostId = homeFeedResponse.result.feedId;
        console.log(`Created home feed post via API: ${homeFeedPostId}`);

        // Create feed post on Site Feed
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        siteId = siteDetails.siteId;

        const siteFeedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          waitForSearchIndex: false,
        });
        const siteFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(siteFeedTestData);
        siteFeedPostId = siteFeedResponse.result.feedId;
        console.log(`Created site feed post via API: ${siteFeedPostId}`);

        // Create feed post on Content/Page Dashboard
        const pageDetails = await appManagerFixture.contentManagementHelper.getContentId();
        contentId = pageDetails.contentId;
        // Use the siteId from pageDetails if available, otherwise use the siteId from siteDetails
        if (pageDetails.siteId) {
          siteId = pageDetails.siteId;
        }

        const contentFeedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          contentId: contentId,
          waitForSearchIndex: false,
        });
        const contentFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(contentFeedTestData);
        contentFeedPostId = contentFeedResponse.result.feedId;
        console.log(`Created content feed post via API: ${contentFeedPostId}`);

        // Set Timeline & feed setting to "Timeline and comments on Content"
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimelineAndCommentsOnContent();
        console.log('Timeline and comments on content feed mode enabled');

        //  Navigate to Home Feed and verify post is not visible and share button is NOT visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();
        await feedPage.assertions.verifyPostIsNotVisible(homeFeedTestData.text);
        await feedPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Home feed: Post is not visible and Share button is NOT visible');

        // Navigate to Site Dashboard and verify post is not visible and share button is NOT visible
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();
        console.log('Site feed post text: ', siteFeedTestData.text);
        await siteDashboardPage.assertions.validatePostNotVisible(siteFeedTestData.text);
        await siteDashboardPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Site feed: Post is not visible and Share button is NOT visible');

        // Navigate to Content Preview Page and verify post is not visible and share button is NOT visible
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.assertions.verifyThePageIsLoadedWithTimelineModeOnContentPage();
        await contentPreviewPage.assertions.waitForPostToBeVisible(contentFeedTestData.text);
        await contentPreviewPage.assertions.verifyShareButtonIsNotVisible();
        // Verify content share button is visible on content preview page
        await contentPreviewPage.assertions.verifyContentShareButtonIsNotVisible();
        console.log('Content feed: Post is not visible and Share button is NOT visible on content and comments');
      }
    );

    test(
      'verify user should not be able to add reactions when Timeline & feed setting is set to "Timeline"',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-31813'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Share your thoughts button and Add Reaction button are not visible when Timeline mode is enabled',
          zephyrTestId: 'CONT-31813',
          storyId: 'CONT-31813',
        });

        // Set Timeline & feed setting to "Timeline" (already done in beforeEach, but ensuring it's set)
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimeline();
        console.log('Timeline mode enabled');

        // Navigate to Home Feed
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();

        // Verify "Share your thoughts" is not displayed
        await feedPage.assertions.verifyFeedSectionIsNotVisible();
        console.log('Share your thoughts button is not visible');

        // Verify "Add Reaction" icon should not be visible
        await feedPage.assertions.verifyReactionButtonIsNotVisible();
        console.log('Add Reaction button is not visible');
      }
    );

    test(
      'verify user should be able to add reactions for Content Comments when Timeline & feed setting is set to "Timeline and Comments on Content"',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-31814'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Add Reaction button is visible for Content Comments when Timeline and Comments on Content mode is enabled',
          zephyrTestId: 'CONT-31814',
          storyId: 'CONT-31814',
          isKnownFailure: true,
          bugTicket: 'CONT-42038',
        });

        // Create content (page) via API helper (in default mode)
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        createdContentSiteId = siteDetails.siteId;

        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: createdContentSiteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'knowledge',
          },
          options: {
            waitForSearchIndex: false,
          },
        });
        createdContentId = pageInfo.contentId;
        console.log(
          `Created page via API: ${pageInfo.pageName} with ID: ${createdContentId} in site: ${createdContentSiteId}`
        );

        // Navigate to content preview page
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          createdContentSiteId,
          createdContentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();

        // Click "Share your thoughts" button
        await contentPreviewPage.assertions.verifyCommentOptionIsVisible();
        await contentPreviewPage.actions.clickShareThoughtsButton();

        // Create a comment/post using CreateFeedPostComponent
        commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
        await createFeedPostComponent.actions.createPost(commentText);
        await createFeedPostComponent.actions.clickPostButton();

        // Verify comment is visible
        await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);
        console.log(`Comment created successfully: ${commentText}`);

        // Set Timeline & feed setting to "Timeline and Comments on Content"
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimelineAndCommentsOnContent();
        console.log('Timeline and Comments on Content mode enabled');

        // Navigate to home page and click Global Feed
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();

        // Verify "Share your thoughts" is not displayed
        await feedPage.assertions.verifyFeedSectionIsNotVisible();
        console.log('Share your thoughts button is not visible on Global Feed');

        await feedPage.assertions.validatePostText(commentText);
        console.log('Comment is visible on Global Feed');

        await feedPage.assertions.verifyReactionButtonIsVisible();
        console.log('Add Reaction button is visible on Global Feed');

        // Navigate back to content preview page
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          createdContentSiteId,
          createdContentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page again' });
        await contentPreviewPage.assertions.verifyThePageIsLoadedWithTimelineModeOnContentPage();

        // Verify comment is still visible
        await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);
        console.log('Comment is still visible on content page');

        // Verify "Add Reaction" button is visible for the comment
        await contentPreviewPage.assertions.verifyReactionButtonIsVisible();
        console.log('Add Reaction button is visible for Content Comments');
      }
    );

    test(
      'verify user should be able to add reactions for Feed posts, Feed replies, Content comments, and Comment replies when Timeline & feed setting is set to "Timeline, Comments on Content, and Feed Post"',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-31815'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Add Reaction button is visible for Feed posts, Feed replies, Content comments, and Comment replies when Timeline, Comments on Content, and Feed Post mode is enabled',
          zephyrTestId: 'CONT-31815',
          storyId: 'CONT-31815',
        });

        // Set Timeline & feed setting to "Default Mode" (Timeline, Comments on Content, and Feed Post)
        await governanceScreenPage.loadPage();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsDefaultMode();
        console.log('Timeline, Comments on Content, and Feed Post mode enabled (Default Mode)');

        // Create a feed post via API (in default mode, posts can be created)
        const feedPostTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          waitForSearchIndex: false,
        });
        feedPostText = feedPostTestData.text;
        const feedPostResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(feedPostTestData);
        homeFeedPostId = feedPostResponse.result.feedId;
        console.log(`Created feed post via API: ${homeFeedPostId} with text: "${feedPostText}"`);

        // Navigate to Home Feed and verify feed post is visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.waitForPostToBeVisible(feedPostText);
        console.log('Feed post is visible on Global Feed');

        // Verify "Add Reaction" button is visible for the feed post
        await feedPage.assertions.verifyReactionButtonIsVisible();
        console.log('Add Reaction button is visible for Feed post');

        // Add a reply to the feed post
        feedReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        await feedPage.actions.addReplyToPost(feedReplyText, homeFeedPostId);
        console.log(`Added reply to feed post: "${feedReplyText}"`);

        // Verify reply is visible
        await feedPage.assertions.verifyReplyIsVisible(feedReplyText);
        console.log('Feed reply is visible');

        // Verify "Add Reaction" button is visible for the feed reply
        await feedPage.assertions.verifyReactionButtonIsVisibleForReply();
        console.log('Add Reaction button is visible for Feed reply');

        // Create content (page) via API helper
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        createdContentSiteId = siteDetails.siteId;

        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: createdContentSiteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'knowledge',
          },
          options: {
            waitForSearchIndex: false,
          },
        });
        createdContentId = pageInfo.contentId;
        console.log(
          `Created page via API: ${pageInfo.pageName} with ID: ${createdContentId} in site: ${createdContentSiteId}`
        );

        // Navigate to content preview page
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          createdContentSiteId,
          createdContentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();

        // Click "Share your thoughts" button and create a comment
        await contentPreviewPage.assertions.verifyCommentOptionIsVisible();
        await contentPreviewPage.actions.clickShareThoughtsButton();

        commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
        const commentResponse = await createFeedPostComponent.actions.createAndPost({ text: commentText });
        console.log(`Created content comment: "${commentText}"`);

        // Verify comment is visible
        await contentPreviewPage.assertions.waitForPostToBeVisible(commentResponse.postText);
        console.log('Content comment is visible');

        // Verify "Add Reaction" button is visible for the content comment
        await contentPreviewPage.assertions.verifyReactionButtonIsVisible();
        console.log('Add Reaction button is visible for Content comment');

        // Add a reply to the content comment
        commentReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        await contentPreviewPage.actions.addReplyToComment(commentReplyText, commentResponse.postId as string);
        console.log(`Added reply to content comment: "${commentReplyText}"`);

        // Verify comment reply is visible
        await contentPreviewPage.assertions.verifyReplyIsVisible(commentReplyText);
        console.log('Comment reply is visible');

        // Verify "Add Reaction" button is visible for the comment reply
        await contentPreviewPage.assertions.verifyReactionButtonIsVisibleForReply();
        console.log('Add Reaction button is visible for Comment reply');
      }
    );
  }
);
