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
import { TopNavBarComponent } from '@/src/core/ui/components/topNavBarComponent';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { initializeContentConfig } from '@/src/modules/content/config/contentConfig';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { SmartFeedBlock } from '@/src/modules/content/constants/smartFeedBlocks';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
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
    // Variables for smart feed blocks setup
    let setupEventId: string = '';
    let setupEventSiteId: string = '';
    let setupPageId: string = '';
    let setupPageSiteId: string = '';

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
    });

    test.afterEach('Reset the placeholder and cleanup created posts', async ({ appManagerFixture }) => {
      // Reset placeholder if it was modified
      if (placeholder) {
        //revert the custom placeholder
        await governanceScreenPage.loadPage();
        await governanceScreenPage.makePlaceholderDefault();
      }

      // Reset Timeline & feed setting to default mode
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);

      await governanceScreenPage.loadPage();
      await governanceScreenPage.selectTimelineFeedSettingsAsDefaultMode();

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

      // Cleanup setup event for smart feed blocks
      if (setupEventId && setupEventSiteId) {
        try {
          await appManagerFixture.contentManagementHelper.deleteContent(setupEventSiteId, setupEventId);
        } catch (error) {
          console.log('Failed to cleanup setup event:', error);
        }
        setupEventId = '';
        setupEventSiteId = '';
      }

      // Cleanup setup page for smart feed blocks
      if (setupPageId && setupPageSiteId) {
        try {
          await appManagerFixture.contentManagementHelper.deleteContent(setupPageSiteId, setupPageId);
        } catch (error) {
          console.log('Failed to cleanup setup page:', error);
        }
        setupPageId = '';
        setupPageSiteId = '';
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
        await governanceScreenPage.loadPage();
        await governanceScreenPage.clickOnTimelineFeedDisabled();
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyFeedSectionIsNotVisible();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.clickOnContentCard();
        await manageContentPage.manageContent.clickOnContent();
        await contentPreviewPage.verifyCommentOptionIsNotVisible();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.clickOnSitesCard();
        await manageSiteSetUpPage.clickOnSite();
        await siteDetailsPage.ViewSite();
        await siteDashboardPage.verifyFeedSectionIsNotVisible();
        await governanceScreenPage.loadPage();
        await governanceScreenPage.clickOnTimelineFeedEnabled();
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.verifyFeedSectionIsVisible();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.clickOnContentCard();
        await manageContentPage.manageContent.clickOnContent();
        await contentPreviewPage.verifyCommentOptionIsVisible();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.clickOnSitesCard();
        await manageSiteSetUpPage.clickOnSite();
        await siteDetailsPage.ViewSite();
        await siteDashboardPage.verifyFeedSectionIsVisible();
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
        await governanceScreenPage.loadPage();
        await governanceScreenPage.clickOnTimelineFeedEnabled();
        const customPlaceholder =
          'Share your thoughts @' + userInfo.firstName + ' about #' + topic + ' #' + userInfo.lastName + '#';
        await governanceScreenPage.updateTheCustomFeedPlaceholder(customPlaceholder);
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.postEditor.verifyFeedPlaceholderText(customPlaceholder);
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
        await siteDashboardPage.createFeedPostComponent.verifyFeedPlaceholderText(customPlaceholder);
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

        await governanceScreenPage.loadPage();
        await governanceScreenPage.makePlaceholderDefault();

        const recognitionConfig = await appManagerFixture.feedManagementHelper.getRecognitionConfig();
        const isRecognitionEnabled = recognitionConfig.enabled;

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
          await feedPage.postEditor.verifyFeedPlaceholderText(expectedPlaceholderWithRecognition);
        } else {
          await feedPage.postEditor.verifyFeedPlaceholderText(expectedPlaceholderWithoutRecognition);
        }

        // Also verify on Site Feed
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo.siteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.clickOnFeedLink();

        if (isRecognitionEnabled) {
          await siteDashboardPage.createFeedPostComponent.verifyFeedPlaceholderText(expectedPlaceholderWithRecognition);
        } else {
          await siteDashboardPage.createFeedPostComponent.verifyFeedPlaceholderText(
            expectedPlaceholderWithoutRecognition
          );
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
          await contentPreviewPage.createFeedPostComponent.verifyFeedPlaceholderText(
            expectedPlaceholderWithRecognition
          );
        } else {
          await contentPreviewPage.createFeedPostComponent.verifyFeedPlaceholderText(
            expectedPlaceholderWithoutRecognition
          );
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
        await governanceScreenPage.loadPage();
        await governanceScreenPage.clickOnTimelineFeedEnabled();
        const customPlaceholder = 'Share your thoughts ' + TestDataGenerator.generateRandomString('');
        await governanceScreenPage.updateTheCustomFeedPlaceholder(customPlaceholder);
        placeholder = true;

        // Step 2: Verify placeholder is displayed before logout
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const appManagerFeedPage = new FeedPage(appManagerFixture.page);
        await appManagerFeedPage.postEditor.verifyFeedPlaceholderText(customPlaceholder);

        //Verify the place holder text for the standard user
        const standardUserFeedPage = new FeedPage(standardUserFixture.page);
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await standardUserFeedPage.postEditor.verifyFeedPlaceholderText(customPlaceholder);

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
        await appManagerFeedPage.postEditor.verifyFeedPlaceholderText(customPlaceholder);
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
        await governanceScreenPage.clickOnTimelineFeedEnabled();

        // Step 2: Set languages to 1 or fewer
        await appManagerFixture.feedManagementHelper.setOneLanguage();

        // Step 3: Navigate to Governance Settings (already on the page, but ensure it's loaded)
        await governanceScreenPage.loadPage();
        await governanceScreenPage.verifyThePageIsLoaded();

        // Step 4: Verify "Feed placeholder" section is visible
        await governanceScreenPage.verifyFeedPlaceholderSettingIsVisible();

        // Step 5: Verify it's positioned below "Timeline & Feed" heading
        await governanceScreenPage.verifyFeedPlaceholderPositionedBelowTimelineFeed();
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
        await governanceScreenPage.selectTimelineFeedSettingsAsTimeline();

        // Verify "Feed placeholder" section is not visible
        await governanceScreenPage.verifyFeedPlaceholderSettingIsNotVisible();

        // ----- Set multiple languages to 2 and verify "Feed placeholder" section is not visible -----
        await appManagerFixture.feedManagementHelper.setMultipleLanguages([1, 2]);
        await governanceScreenPage.loadPage();
        await governanceScreenPage.selectTimelineFeedSettingsAsDefaultMode();
        await governanceScreenPage.verifyFeedPlaceholderSettingIsNotVisible();
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

        // Set Timeline & feed setting to "Timeline"
        await governanceScreenPage.loadPage();
        await governanceScreenPage.selectTimelineFeedSettingsAsTimeline();

        // Navigate to Home Feed and verify post is not visible and share button is NOT visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.reloadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();
        await feedPage.feedList.verifyPostIsNotVisible(homeFeedTestData.text);
        await feedPage.feedList.verifyShareButtonIsNotVisible();

        // Navigate to Site Dashboard and verify post is not visible and share button is NOT visible
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();
        await siteDashboardPage.listFeedComponent.verifyThePageIsLoadedWithTimelineMode();
        await siteDashboardPage.validatePostNotVisible(siteFeedTestData.text);
        await siteDashboardPage.listFeedComponent.verifyShareButtonIsNotVisible();

        // Step 5: Navigate to Content Preview Page and verify post is not visible and share button is NOT visible
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoadedWithTimelineModeOnContentPage();
        await contentPreviewPage.listFeedComponent.verifyPostIsNotVisible(contentFeedTestData.text);
        await contentPreviewPage.listFeedComponent.verifyShareButtonIsNotVisible();
        // Verify content share button is visible on content preview page
        await contentPreviewPage.verifyContentShareButtonIsVisible();
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
        });

        // Generate unique post text for each feed (for visibility assertions)
        const homeFeedPostText = TestDataGenerator.generateRandomText('Home post', 3, true);
        const siteFeedPostText = TestDataGenerator.generateRandomText('Site post', 3, true);
        const contentFeedPostText = TestDataGenerator.generateRandomText('Content post', 3, true);

        // Create feed posts via UI BEFORE setting Timeline mode (posts can only be created when Timeline is disabled)
        // Create feed post on Home Feed via UI
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.verifyThePageIsLoaded();
        await feedPage.clickShareThoughtsButton();
        const homePostResult = await feedPage.postEditor.createAndPost({ text: homeFeedPostText });
        homeFeedPostId = homePostResult.postId ?? '';

        // Create feed post on Site Feed via UI
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        siteId = siteDetails.siteId;
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.clickOnFeedLink();
        await feedPage.verifyThePageIsLoaded();
        await feedPage.clickShareThoughtsButton();
        const sitePostResult = await feedPage.postEditor.createAndPost({ text: siteFeedPostText });
        siteFeedPostId = sitePostResult.postId ?? '';

        // Create feed post (comment) on Content/Page Dashboard via UI
        const pageDetails = await appManagerFixture.contentManagementHelper.getContentId();
        contentId = pageDetails.contentId;
        if (pageDetails.siteId) {
          siteId = pageDetails.siteId;
        }
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();
        await contentPreviewPage.clickShareThoughtsButton();
        const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
        const contentPostResult = await createFeedPostComponent.createAndPost({ text: contentFeedPostText });
        contentFeedPostId = contentPostResult.postId ?? '';

        // Set Timeline & feed setting to "Timeline and comments on Content"
        await governanceScreenPage.loadPage();
        await governanceScreenPage.selectTimelineFeedSettingsAsTimelineAndCommentsOnContent();

        // Navigate to Home Feed and verify post is not visible and share button is NOT visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();
        await feedPage.feedList.verifyPostIsNotVisible(homeFeedPostText);
        await feedPage.feedList.verifyShareButtonIsNotVisible();

        // Navigate to Site Dashboard and verify post is not visible and share button is NOT visible
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();
        await siteDashboardPage.validatePostNotVisible(siteFeedPostText);
        await siteDashboardPage.listFeedComponent.verifyShareButtonIsNotVisible();

        // Navigate to Content Preview Page and verify post is visible and share button is NOT visible
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoadedWithTimelineModeOnContentPage();
        await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(contentFeedPostText);
        await contentPreviewPage.listFeedComponent.verifyShareButtonIsNotVisible();
        // Verify content share button is visible on content preview page
        await contentPreviewPage.verifyContentShareButtonIsVisible();
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
        await governanceScreenPage.selectTimelineFeedSettingsAsTimeline();

        // Navigate to Home Feed
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

        // Verify "Share your thoughts" is not displayed
        await feedPage.verifyFeedSectionIsNotVisible();

        // Verify "Add Reaction" icon should not be visible
        await feedPage.feedList.verifyReactionButtonIsNotVisible();
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
        await contentPreviewPage.verifyCommentOptionIsVisible();
        await contentPreviewPage.clickShareThoughtsButton();

        // Create a comment/post using CreateFeedPostComponent
        commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
        await createFeedPostComponent.createPost(commentText);
        await createFeedPostComponent.clickPostButton();
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page again' });

        // Verify comment is visible
        await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(commentText);

        // Set Timeline & feed setting to "Timeline and Comments on Content"
        await governanceScreenPage.loadPage();
        await governanceScreenPage.selectTimelineFeedSettingsAsTimelineAndCommentsOnContent();

        // Navigate to home page and click Global Feed
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.reloadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

        // Verify "Share your thoughts" is not displayed
        await feedPage.verifyFeedSectionIsNotVisible();

        await feedPage.feedList.validatePostText(commentText);

        await feedPage.feedList.verifyReactionButtonIsVisible();

        // Navigate back to content preview page
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          createdContentSiteId,
          createdContentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page again' });
        await contentPreviewPage.verifyThePageIsLoadedWithTimelineModeOnContentPage();

        // Verify comment is still visible
        await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(commentText);

        // Verify "Add Reaction" button is visible for the comment
        await contentPreviewPage.listFeedComponent.verifyReactionButtonIsVisible();
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
        await governanceScreenPage.selectTimelineFeedSettingsAsDefaultMode();

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

        // Navigate to Home Feed and verify feed post is visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.feedList.waitForPostToBeVisible(feedPostText);

        // Verify "Add Reaction" button is visible for the feed post
        await feedPage.feedList.verifyReactionButtonIsVisible();

        // Add a reply to the feed post
        feedReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        await feedPage.feedList.addReplyToPost(feedReplyText, homeFeedPostId);

        // Verify reply is visible
        await feedPage.feedList.verifyReplyIsVisible(feedReplyText);

        // Verify "Add Reaction" button is visible for the feed reply
        await feedPage.feedList.verifyReactionButtonIsVisibleForReply();

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
        await contentPreviewPage.verifyCommentOptionIsVisible();
        await contentPreviewPage.clickShareThoughtsButton();

        commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
        const commentResponse = await createFeedPostComponent.createAndPost({ text: commentText });

        // Verify comment is visible
        await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(commentResponse.postText);

        // Verify "Add Reaction" button is visible for the content comment
        await contentPreviewPage.listFeedComponent.verifyReactionButtonIsVisible();

        // Add a reply to the content comment
        commentReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        await contentPreviewPage.addReplyToComment(commentReplyText, commentResponse.postId as string);

        // Verify comment reply is visible
        await contentPreviewPage.listFeedComponent.verifyReplyIsVisible(commentReplyText);

        // Verify "Add Reaction" button is visible for the comment reply
        await contentPreviewPage.listFeedComponent.verifyReactionButtonIsVisibleForReply();
      }
    );

    test(
      'verify Timeline Option Governance Setting on Home, Site, and Content Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-19576'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Timeline Option Governance Setting on Home, Site, and Content Feed',
          zephyrTestId: 'CONT-19576',
          storyId: 'CONT-19576',
        });

        // Setup: Create event and page content so smart feed blocks are visible
        const setupSiteId =
          await appManagerFixture.siteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);

        // Create an event for "Upcoming events" block
        const eventInfo = await appManagerFixture.contentManagementHelper.createEvent({
          siteId: setupSiteId,
          contentInfo: {
            contentType: 'event',
          },
          options: {
            waitForSearchIndex: false,
          },
        });
        setupEventId = eventInfo.contentId;
        setupEventSiteId = setupSiteId;

        // Create a page for "Recently published" and "Top picks" blocks
        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: setupSiteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'knowledge',
          },
          options: {
            waitForSearchIndex: false,
          },
        });
        setupPageId = pageInfo.contentId;
        setupPageSiteId = setupSiteId;

        //  Set Timeline option under "Timeline & feed" section
        await governanceScreenPage.loadPage();
        await governanceScreenPage.selectTimelineFeedSettingsAsTimeline();

        // Verify Home-Global Feed
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

        // Verify "Share your thoughts or question" is not displayed
        await feedPage.verifyFeedSectionIsNotVisible();

        // Verify Content Comment icon is not visible on Timeline
        await feedPage.feedList.verifyCommentIconIsNotVisible();

        // Verify smart feed blocks are displayed
        await feedPage.feedList.verifySmartFeedBlockIsVisible(SmartFeedBlock.TOP_PICKS);
        await feedPage.feedList.verifySmartFeedBlockIsVisible(SmartFeedBlock.UPCOMING_EVENTS);
        await feedPage.feedList.verifySmartFeedBlockIsVisible(SmartFeedBlock.CELEBRATION);

        // Click on "feed" link
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, setupSiteId);
        await siteDashboardPage.loadPage();
        await siteDashboardPage.clickOnFeedLink();

        // Verify "Share your thoughts or question" is not displayed
        await siteDashboardPage.verifyFeedSectionIsNotVisible();

        // Verify smart feed blocks are displayed
        await siteDashboardPage.listFeedComponent.verifySmartFeedBlockIsVisible(SmartFeedBlock.POPULAR_CONTENT);
        await siteDashboardPage.listFeedComponent.verifySmartFeedBlockIsVisible(SmartFeedBlock.UPCOMING_EVENTS);
        await siteDashboardPage.listFeedComponent.verifySmartFeedBlockIsVisible(SmartFeedBlock.CELEBRATION);

        // Get first available content and navigate to content detail page
        const contentInfo = await appManagerFixture.contentManagementHelper.getContentId();
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          contentInfo.siteId,
          contentInfo.contentId,
          contentInfo.contentType
        );
        await contentPreviewPage.loadPage();

        // Verify comment icon on the detail page is not visible
        await contentPreviewPage.verifyCommentOptionIsNotVisible();
      }
    );

    test(
      'verify Timeline and content comments governance setting on Home Feed, Site Feed, and Content Feed',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19577'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Timeline and content comments option governance setting on Home Feed, Site Feed, and Content Feed',
          zephyrTestId: 'CONT-19577',
          storyId: 'CONT-19577',
        });

        let commentText: string = '';
        let commentPostId: string = '';
        let siteId: string = '';
        let contentId: string = '';
        let createdContentSiteId: string = '';
        let replyText: string = '';
        let eventId: string = '';

        await test.step('Create a page on site, create an event, update user DOB, and make a comment on the page', async () => {
          // Get a public site
          const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
          siteId = siteDetails.siteId;
          createdContentSiteId = siteId;

          // Create an event on the site for "Upcoming events" block
          const eventInfo = await appManagerFixture.contentManagementHelper.createEvent({
            siteId: siteId,
            contentInfo: {
              contentType: 'event',
            },
            options: {
              waitForSearchIndex: false,
            },
          });
          eventId = eventInfo.contentId;
          console.log(`Created event via API: ${eventId} in site: ${siteId}`);

          // Update user's date of birth for celebration block
          const today = new Date();
          const appManagerTopNavBarComponent = new TopNavBarComponent(appManagerFixture.page);

          const appManagerUserId = await appManagerFixture.page.evaluate(() => {
            return (window as any).Simpplr?.CurrentUser?.uid;
          });

          if (appManagerUserId) {
            // Set birth month and day (using current month and tomorrow's day)
            const birthMonth = today.getMonth() + 1;
            const birthDay = today.getDate() + 1;

            await appManagerTopNavBarComponent.openViewProfile({
              stepInfo: 'Opening app manager view profile from profile icon',
            });

            const appManagerProfileScreenPage = new ProfileScreenPage(appManagerFixture.page, appManagerUserId);
            await appManagerProfileScreenPage.clickEditAbout();
            await appManagerProfileScreenPage.updateDateOfBirth(birthMonth, birthDay);
            await appManagerProfileScreenPage.saveProfileChanges();
          }

          // Create a page on the site
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
          contentId = pageInfo.contentId;

          // Navigate to content preview page and create a comment
          contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            createdContentSiteId,
            contentId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();

          // Click Share your thoughts button and create a comment
          await contentPreviewPage.clickShareThoughtsButton();
          commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
          const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
          const commentResponse = await createFeedPostComponent.createAndPost({ text: commentText });
          commentPostId = commentResponse.postId as string;

          // Verify comment is created
          await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(commentText);
        });
        await test.step('Set feed setting as timeline and commentsOnContent', async () => {
          await governanceScreenPage.loadPage();
          await governanceScreenPage.selectTimelineFeedSettingsAsTimelineAndCommentsOnContent();
        });

        await test.step('Home Feed: Verify governance setting, smart blocks, comment visibility, and reply functionality', async () => {
          await appManagerFixture.homePage.loadPage();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify "Share your thoughts" is NOT displayed
          await feedPage.verifyFeedSectionIsNotVisible();

          // Verify smart feed blocks are displayed
          await feedPage.verifyTopPicksBlockIsVisible();
          await feedPage.verifyUpcomingEventsBlockIsVisible();
          await feedPage.verifyCelebrationBlockIsVisible();

          // Verify the created comment is displayed
          await feedPage.feedList.validatePostText(commentText);

          // Click on Reply button of the comment (this should redirect to post detail page)

          await feedPage.feedList.clickReplyOnContentComment(commentText);

          await feedPage.feedList.validatePostText(commentText);

          await feedPage.feedList.openReplyEditorForPost(commentText);

          // Create a reply
          replyText = FEED_TEST_DATA.POST_TEXT.REPLY;
          await feedPage.feedList.addReplyToPost(replyText, commentPostId);

          // Verify reply is visible
          await feedPage.feedList.verifyReplyIsVisible(replyText);
        });

        await test.step('Site Feed: Verify governance setting, smart blocks, comment visibility, and reply functionality', async () => {
          siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboardPage.clickOnFeedLink();
          await siteDashboardPage.listFeedComponent.verifyThePageIsLoadedWithTimelineMode();

          // Verify "Share your thoughts" is NOT displayed
          await siteDashboardPage.verifyFeedSectionIsNotVisible();

          // Verify smart feed blocks are displayed
          await siteDashboardPage.verifyPopularContentBlockIsVisible();
          await siteDashboardPage.verifyRecentlyPublishedBlockIsVisible();
          await siteDashboardPage.verifyUpcomingEventsBlockIsVisible();
          await siteDashboardPage.verifyCelebrationBlockIsVisible();

          // Verify the created comment is displayed
          const siteFeedPage = new FeedPage(appManagerFixture.page);
          await siteFeedPage.feedList.validatePostText(commentText);

          // Click on Reply button of the comment (this should redirect to post detail page)
          await siteFeedPage.feedList.clickReplyOnContentComment(commentText);

          await siteFeedPage.feedList.validatePostText(commentText);

          // Click on "Leave a reply" button on the detail page
          await siteFeedPage.feedList.openReplyEditorForPost(commentText);

          // Create a reply
          const siteReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
          await siteFeedPage.feedList.addReplyToPost(siteReplyText, commentPostId);

          // Verify reply is visible
          await siteFeedPage.feedList.verifyReplyIsVisible(siteReplyText);
        });

        await test.step('Content Feed: Verify Share Your Thoughts is visible and user can create feed post', async () => {
          contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            createdContentSiteId,
            contentId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
          await contentPreviewPage.verifyThePageIsLoaded();

          await contentPreviewPage.verifyCommentOptionIsVisible();

          await contentPreviewPage.clickShareThoughtsButton();
          const commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
          const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
          await createFeedPostComponent.createPost(commentText);
          await createFeedPostComponent.clickPostButton();

          // Verify the feed post is created
          await contentPreviewPage.listFeedComponent.waitForPostToBeVisible(commentText);
        });

        // Cleanup
        if (commentPostId) {
          try {
            await appManagerFixture.feedManagementHelper.deleteFeed(commentPostId);
          } catch (error) {
            console.log('Failed to cleanup comment post:', error);
          }
        }
        if (eventId && createdContentSiteId) {
          try {
            await appManagerFixture.contentManagementHelper.deleteContent(createdContentSiteId, eventId);
          } catch (error) {
            console.log('Failed to cleanup event:', error);
          }
        }
      }
    );
  }
);
