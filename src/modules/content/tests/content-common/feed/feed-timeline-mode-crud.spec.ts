import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { FEED_TEST_DATA } from '@modules/content/test-data/feed.test-data';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { GovernanceScreenPage } from '@/src/modules/content/ui/pages/governanceScreenPage';
import { ManageApplicationPage } from '@/src/modules/content/ui/pages/manageApplicationPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';

interface FeedResponse {
  result: {
    feedId: string;
  };
}

test.describe(
  '@FeedPost - Timeline Share Button Visibility',
  {
    tag: [ContentTestSuite.FEED_APP_MANAGER],
  },
  () => {
    let feedPage: FeedPage;
    let siteDashboardPage: SiteDashboardPage;
    let contentPreviewPage: ContentPreviewPage;
    let applicationScreenPage: ApplicationScreenPage;
    let manageApplicationPage: ManageApplicationPage;
    let governanceScreenPage: GovernanceScreenPage;

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

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Initialize page objects
      feedPage = new FeedPage(appManagerFixture.page);
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnApplication();
      await manageApplicationPage.actions.clickOnGovernance();
      await governanceScreenPage.actions.selectTimelineFeedSettingsAsDefaultMode();
    });

    test.afterEach('Cleanup created posts', async ({ appManagerFixture }) => {
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);

      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnApplication();
      await manageApplicationPage.actions.clickOnGovernance();
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
    });

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
        });

        // Step 1: Create feed posts BEFORE setting Timeline mode (posts can only be created when Timeline is disabled)
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

        // Step 2: Set Timeline & feed setting to "Timeline"
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationScreenPage.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimeline();
        console.log('Timeline mode enabled');

        // Step 3: Navigate to Home Feed and verify post is not visible and share button is NOT visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();
        await feedPage.assertions.verifyPostIsNotVisible(homeFeedTestData.text);
        await feedPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Home feed: Post is not visible and Share button is NOT visible');

        // Step 4: Navigate to Site Dashboard and verify post is not visible and share button is NOT visible
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
        // Currently, the content share button is visible on content preview page, so we are not verifying it
        // await contentPreviewPage.assertions.verifyContentShareButtonIsNotVisible();
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
        });

        // Step 1: Create feed posts BEFORE setting Timeline mode (posts can only be created when Timeline is disabled)
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

        // Step 2: Set Timeline & feed setting to "Timeline and comments on Content"
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationScreenPage.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimelineAndCommentsOnContent();
        console.log('Timeline and comments on content feed mode enabled');

        // Step 3: Navigate to Home Feed and verify post is not visible and share button is NOT visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();
        await feedPage.assertions.verifyPostIsNotVisible(homeFeedTestData.text);
        await feedPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Home feed: Post is not visible and Share button is NOT visible');

        // Step 4: Navigate to Site Dashboard and verify post is not visible and share button is NOT visible
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();
        console.log('Site feed post text: ', siteFeedTestData.text);
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
        await contentPreviewPage.assertions.waitForPostToBeVisible(contentFeedTestData.text);
        await contentPreviewPage.assertions.verifyShareButtonIsNotVisible();
        // Currently, the content share button is visible on content preview page, so we are not verifying it
        // await contentPreviewPage.assertions.verifyContentShareButtonIsNotVisible();
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

        // Step 1: Set Timeline & feed setting to "Timeline" (already done in beforeEach, but ensuring it's set)
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationScreenPage.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimeline();
        console.log('Timeline mode enabled');

        // Step 2: Navigate to Home Feed
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();

        // Step 3: Verify "Share your thoughts" is not displayed
        await feedPage.assertions.verifyFeedSectionIsNotVisible();
        console.log('Share your thoughts button is not visible');

        // Step 4: Verify "Add Reaction" icon should not be visible
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
        });

        // Step 1: Create content (page) via API helper (in default mode)
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

        // Step 2: Navigate to content preview page
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          createdContentSiteId,
          createdContentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();

        // Step 3: Click "Share your thoughts" button
        await contentPreviewPage.assertions.verifyCommentOptionIsVisible();
        await contentPreviewPage.actions.clickShareThoughtsButton();

        // Step 4: Create a comment/post using CreateFeedPostComponent
        commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
        await createFeedPostComponent.actions.createPost(commentText);
        await createFeedPostComponent.actions.clickPostButton();

        // Step 5: Verify comment is visible
        await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);
        console.log(`Comment created successfully: ${commentText}`);

        // Step 6: Set Timeline & feed setting to "Timeline and Comments on Content"
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationScreenPage.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimelineAndCommentsOnContent();
        console.log('Timeline and Comments on Content mode enabled');

        // Step 7: Navigate to home page and click Global Feed
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();

        // Step 8: Verify "Share your thoughts" is not displayed
        await feedPage.assertions.verifyFeedSectionIsNotVisible();
        console.log('Share your thoughts button is not visible on Global Feed');

        await feedPage.assertions.validatePostText(commentText);
        console.log('Comment is not visible on Global Feed');

        await feedPage.assertions.verifyReactionButtonIsVisible();
        console.log('Add Reaction button is visible on Global Feed');

        // Step 9: Navigate back to content preview page
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          createdContentSiteId,
          createdContentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page again' });
        await contentPreviewPage.assertions.verifyThePageIsLoadedWithTimelineModeOnContentPage();

        // Step 10: Verify comment is still visible
        await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);
        console.log('Comment is still visible on content page');

        // Step 11: Verify "Add Reaction" button is visible for the comment
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

        // Step 1: Set Timeline & feed setting to "Default Mode" (Timeline, Comments on Content, and Feed Post)
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationScreenPage.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsDefaultMode();
        console.log('Timeline, Comments on Content, and Feed Post mode enabled (Default Mode)');

        // Step 2: Create a feed post via API (in default mode, posts can be created)
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

        // Step 3: Navigate to Home Feed and verify feed post is visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.waitForPostToBeVisible(feedPostText);
        console.log('Feed post is visible on Global Feed');

        // Step 4: Verify "Add Reaction" button is visible for the feed post
        await feedPage.assertions.verifyReactionButtonIsVisible();
        console.log('Add Reaction button is visible for Feed post');

        // Step 5: Add a reply to the feed post
        feedReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        await feedPage.actions.addReplyToPost(feedReplyText);
        console.log(`Added reply to feed post: "${feedReplyText}"`);

        // Step 6: Verify reply is visible
        await feedPage.assertions.verifyReplyIsVisible(feedReplyText);
        console.log('Feed reply is visible');

        // Step 7: Verify "Add Reaction" button is visible for the feed reply
        await feedPage.assertions.verifyReactionButtonIsVisibleForReply();
        console.log('Add Reaction button is visible for Feed reply');

        // Step 8: Create content (page) via API helper
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

        // Step 9: Navigate to content preview page
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          createdContentSiteId,
          createdContentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();

        // Step 10: Click "Share your thoughts" button and create a comment
        await contentPreviewPage.assertions.verifyCommentOptionIsVisible();
        await contentPreviewPage.actions.clickShareThoughtsButton();

        commentText = FEED_TEST_DATA.POST_TEXT.COMMENT;
        const createFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
        await createFeedPostComponent.actions.createPost(commentText);
        await createFeedPostComponent.actions.clickPostButton();
        console.log(`Created content comment: "${commentText}"`);

        // Step 11: Verify comment is visible
        await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);
        console.log('Content comment is visible');

        // Step 12: Verify "Add Reaction" button is visible for the content comment
        await contentPreviewPage.assertions.verifyReactionButtonIsVisible();
        console.log('Add Reaction button is visible for Content comment');

        // Step 13: Add a reply to the content comment
        commentReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        await contentPreviewPage.actions.addReplyToComment(commentReplyText);
        console.log(`Added reply to content comment: "${commentReplyText}"`);

        // Step 14: Verify comment reply is visible
        await contentPreviewPage.assertions.verifyReplyIsVisible(commentReplyText);
        console.log('Comment reply is visible');

        // Step 15: Verify "Add Reaction" button is visible for the comment reply
        await contentPreviewPage.assertions.verifyReactionButtonIsVisibleForReply();
        console.log('Add Reaction button is visible for Comment reply');
      }
    );
  }
);
