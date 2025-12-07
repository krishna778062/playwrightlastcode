import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { FileUtil } from '@core/utils/fileUtil';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage, SiteFeedPage } from '@/src/modules/content/ui/pages/sitePages';

test.describe(
  'feed Comments/Replies Visibility - Verify User can view 10 comments or replies on Feed detail page',
  {
    tag: [ContentTestSuite.FEED_COMMENTS_REPLIES_VISIBILITY],
  },
  () => {
    let homeFeedPage: FeedPage;
    let siteFeedPage: FeedPage;
    let siteDashboardPage: SiteDashboardPage;
    let contentPreviewPage: ContentPreviewPage;
    let homeDashboardFeedId: string = '';
    let siteDashboardFeedId: string = '';
    let contentFeedIds: string[] = [];
    let siteId: string = '';
    let contentId: string = '';
    let contentType: string = '';
    let createdPageId: string = '';
    let createdPageSiteId: string = '';

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Initialize page objects
      homeFeedPage = new FeedPage(appManagerFixture.page);
      siteFeedPage = new FeedPage(appManagerFixture.page);
    });

    test.afterEach('Cleanup created feeds', async ({ appManagerFixture }) => {
      // Cleanup home dashboard feed
      if (homeDashboardFeedId) {
        await appManagerFixture.feedManagementHelper.deleteFeed(homeDashboardFeedId);
        homeDashboardFeedId = '';
      }

      // Cleanup site dashboard feed
      if (siteDashboardFeedId) {
        await appManagerFixture.feedManagementHelper.deleteFeed(siteDashboardFeedId);
        siteDashboardFeedId = '';
      }

      // Cleanup content feeds
      for (const feedId of contentFeedIds) {
        if (feedId) {
          await appManagerFixture.feedManagementHelper.deleteFeed(feedId);
        }
      }
      contentFeedIds = [];

      // Cleanup created page for content feed test
      if (createdPageId && createdPageSiteId) {
        try {
          await appManagerFixture.contentManagementHelper.deleteContent(createdPageSiteId, createdPageId);
          console.log(`Deleted created page: ${createdPageId}`);
          createdPageId = '';
          createdPageSiteId = '';
        } catch (error) {
          console.warn(`Failed to cleanup created page ${createdPageId}:`, error);
        }
      }
    });

    test(
      'home Dashboard Flow - Verify user can view 10 replies on Feed detail page',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-27691'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to view 10 comments or replies on Feed detail page - Home Dashboard Flow',
          zephyrTestId: 'CONT-27691',
          storyId: '27691',
        });

        // Navigate to home feed dashboard
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.verifyThePageIsLoaded();

        // Click "Share your thoughts or questions"
        await homeFeedPage.actions.clickShareThoughtsButton();

        // Create feed post via UI
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        const postResult = await homeFeedPage.actions.createAndPost({
          text: feedTestData.text,
        });
        homeDashboardFeedId = postResult.postId || '';
        const createdPostText = feedTestData.text;

        // Wait for post to be visible
        await homeFeedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Add 11 replies via API
        const replyTexts: string[] = [];
        for (let i = 1; i <= 11; i++) {
          const replyData = TestDataGenerator.generateSimpleReply({
            replyText: `Reply ${i} to home feed post`,
          });
          await appManagerFixture.feedManagementHelper.addComment(homeDashboardFeedId, replyData);
          replyTexts.push(replyData.replyText);
        }

        // Perform hard refresh
        await homeFeedPage.reloadPage();
        await homeFeedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Verify only 1 reply is visible
        await homeFeedPage.assertions.verifyReplyCount(createdPostText, 1);

        // Click post timestamp to navigate to feed detail page
        await homeFeedPage.actions.clickPostTimestamp(createdPostText);

        // Wait for feed detail page to load
        await homeFeedPage.assertions.validatePostText(createdPostText);

        // Verify 10 replies visible + "Show more replies" button
        await homeFeedPage.assertions.verifyReplyCount(createdPostText, 10);

        // Click "Show more replies"
        await homeFeedPage.actions.clickLoadMoreRepliesButton();

        // Verify all 11 replies are visible
        await homeFeedPage.assertions.verifyReplyCount(createdPostText, 11);
      }
    );

    test(
      'site Dashboard Flow - Verify user can view 10 replies on Feed detail page',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-27691'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to view 10 comments or replies on Feed detail page - Site Dashboard Flow',
          zephyrTestId: 'CONT-27691',
          storyId: 'CONT-27691',
        });

        // Search and open an existing site
        const siteResult = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        siteId = siteResult.siteId;

        // Navigate to site dashboard
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });

        // Click "Share your thoughts or questions"
        await siteDashboardPage.actions.clickShareThoughtsButton();

        // Create feed post via UI
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        const postResult = await siteFeedPage.actions.createAndPost({
          text: feedTestData.text,
        });
        siteDashboardFeedId = postResult.postId || '';
        const createdPostText = feedTestData.text;

        // Wait for post to be visible
        await siteFeedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Add 11 replies via API
        const replyTexts: string[] = [];
        for (let i = 1; i <= 11; i++) {
          const replyData = TestDataGenerator.generateSimpleReply({
            replyText: `Reply ${i} to site feed post`,
          });
          await appManagerFixture.feedManagementHelper.addComment(siteDashboardFeedId, replyData);
          replyTexts.push(replyData.replyText);
        }

        // Perform hard refresh
        await siteFeedPage.reloadPage();
        await siteFeedPage.assertions.waitForPostToBeVisible(createdPostText);

        // Verify only 1 reply visible
        await siteFeedPage.assertions.verifyReplyCount(createdPostText, 1);

        // Click timestamp to navigate to feed detail page
        await siteFeedPage.actions.clickPostTimestamp(createdPostText);

        // Wait for feed detail page to load
        await siteFeedPage.assertions.validatePostText(createdPostText);

        // Verify 10 replies + "Show more replies" button
        await siteFeedPage.assertions.verifyReplyCount(createdPostText, 10);

        // Click "Show more replies"
        await siteFeedPage.actions.clickLoadMoreRepliesButton();

        // Verify all replies visible
        await siteFeedPage.assertions.verifyReplyCount(createdPostText, 11);

        // Navigate to Home feed dashboard
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.verifyThePageIsLoaded();

        // Verify site feed post appears with only 1 visible reply
        await homeFeedPage.assertions.waitForPostToBeVisible(createdPostText);
        await homeFeedPage.assertions.verifyReplyCount(createdPostText, 1);
      }
    );

    test(
      'content Feed Flow - Verify user can view comments on Content detail page',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@CONT-27691'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to view 10 comments or replies on Feed detail page - Content Feed Flow',
          zephyrTestId: 'CONT-27691',
          storyId: '27691',
          isKnownFailure: true,
        });

        // Create a fresh page to ensure we start with 0 comments
        // Get a site first
        const siteResult = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        const newSiteId = siteResult.siteId;

        //  Create a new page in the site
        const pageResult = await appManagerFixture.contentManagementHelper.createPage({
          siteId: newSiteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'news',
          },
          options: {
            waitForSearchIndex: false,
          },
        });

        createdPageSiteId = newSiteId;
        createdPageId = pageResult.contentId;
        siteId = newSiteId;
        contentId = pageResult.contentId;
        contentType = 'page';

        console.log(`Created fresh page for test: ${contentId} in site: ${siteId}`);

        // Click Content tab and open content item
        contentPreviewPage = new ContentPreviewPage(appManagerFixture.page, siteId, contentId, contentType);
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });

        // Add 18 feed posts (comments) under the content via API
        const commentTexts: string[] = [];

        for (let i = 1; i <= 18; i++) {
          const feedTestData = TestDataGenerator.generateFeed({
            scope: 'site',
            siteId: siteId,
            contentId: contentId,
            withAttachment: false,
            waitForSearchIndex: false,
          });
          const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestData);
          contentFeedIds.push(feedResponse.result.feedId);
          commentTexts.push(feedTestData.text);
        }

        // Navigate to Home feed dashboard
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.verifyThePageIsLoaded();

        //  Verify feed post from content appears on home feed dashboard
        // Wait for the feed to appear by waiting for the most recent comment
        const mostRecentComment = commentTexts[commentTexts.length - 1];
        await homeFeedPage.assertions.waitForPostToBeVisible(mostRecentComment);

        const secondRecentComment = commentTexts[commentTexts.length - 2];

        // Verify only 1 feed post (recent) is visible
        // The most recent comment should already be visible from step 5
        await homeFeedPage.assertions.verifyPostIsNotVisible(secondRecentComment);

        // Click "All Comments" from home feed dashboard
        await contentPreviewPage.actions.clickAllCommentsLink();

        // Verify navigation to Content Detail Page
        await contentPreviewPage.assertions.waitForPostToBeVisible(commentTexts[commentTexts.length - 1]);

        // Verify 16 recent comments displayed
        await contentPreviewPage.assertions.verifyCommentCount(16);

        // Click "Show more" button
        await contentPreviewPage.actions.clickShowMoreCommentsButton();

        // Verify User is able view the other Comments added to the Content (all 18 should be visible now)
        await contentPreviewPage.assertions.verifyCommentCount(18);
      }
    );

    test(
      'content Comments with Unpublish - Verify comments disappear after content unpublish',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION, '@CONT-19566'],
      },
      async ({ appManagerFixture, standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify user can create comments on content item with file attachments, validate visibility in feeds, and verify comments disappear after unpublish',
          zephyrTestId: 'CONT-19566',
          storyId: 'CONT-19566',
        });

        let testSiteId: string = '';
        let testContentId: string = '';
        let testContentType: string = '';
        let firstCommentText: string = '';
        let secondCommentText: string = '';
        const image1Path = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image1.jpg'
        );

        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.homePage.verifyThePageIsLoaded();

        testSiteId = await standardUserApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        const contentListResponse =
          await standardUserApiFixture.contentManagementHelper.contentManagementService.getContentList({
            siteId: testSiteId,
            sortBy: 'publishedNewest',
            size: 1,
            status: 'published',
          });

        if (contentListResponse.result.listOfItems.length === 0) {
          throw new Error('No published content found in "All Employees" site.');
        }

        const latestContent = contentListResponse.result.listOfItems[0];
        testContentId = latestContent.contentId || latestContent.id;
        testContentType = latestContent.type.toLowerCase();

        const contentPreviewPage = new ContentPreviewPage(
          standardUserFixture.page,
          testSiteId,
          testContentId,
          testContentType
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.verifyThePageIsLoaded();

        await contentPreviewPage.actions.clickShareThoughtsButton();
        const feedTestData1 = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: testSiteId,
          contentId: testContentId,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        firstCommentText = feedTestData1.text;

        const createFeedPostComponent = new CreateFeedPostComponent(standardUserFixture.page);
        await createFeedPostComponent.actions.createAndPost({
          text: firstCommentText,
          attachments: {
            files: [image1Path],
          },
        });

        // Verify first comment on Home Feed, then Site Feed, then click All Comments from Site Feed
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        const homeFeedPage = new FeedPage(standardUserFixture.page);
        await homeFeedPage.verifyThePageIsLoaded();
        await homeFeedPage.assertions.waitForPostToBeVisible(firstCommentText);

        const siteFeedPage = new SiteFeedPage(standardUserFixture.page, testSiteId);
        await siteFeedPage.loadPage({ stepInfo: 'Load site feed page' });
        await siteFeedPage.verifyThePageIsLoaded();
        const siteFeedPageForAssertions = new FeedPage(standardUserFixture.page);
        await siteFeedPageForAssertions.assertions.waitForPostToBeVisible(firstCommentText);

        // Click "All Comments" from site dashboard to open content detail page
        await contentPreviewPage.actions.clickAllCommentsLink();
        await contentPreviewPage.verifyThePageIsLoaded();

        // Post 2nd comment with attachment on content detail page, then verify on home and site
        await contentPreviewPage.actions.clickShareThoughtsButton();
        const feedTestData2 = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: testSiteId,
          contentId: testContentId,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        secondCommentText = feedTestData2.text;

        await createFeedPostComponent.actions.createAndPost({
          text: secondCommentText,
          attachments: {
            files: [image1Path],
          },
        });

        // Verify second comment on Home Feed
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.verifyThePageIsLoaded();
        await homeFeedPage.assertions.waitForPostToBeVisible(secondCommentText);

        // Verify second comment on Site Feed
        await siteFeedPage.loadPage({ stepInfo: 'Navigate to site feed' });
        await siteFeedPageForAssertions.assertions.waitForPostToBeVisible(secondCommentText);

        // As app manager, unpublish the content
        const adminContentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          testSiteId,
          testContentId,
          testContentType
        );
        await adminContentPreviewPage.loadPage({ stepInfo: 'Admin: Load content preview page' });
        await adminContentPreviewPage.verifyThePageIsLoaded();
        await adminContentPreviewPage.actions.unpublishingTheContent();
        await adminContentPreviewPage.assertions.verifyUnpublishedContentToastMessage(
          FEED_TEST_DATA.TOAST_MESSAGES.CONTENT_UNPUBLISHED
        );

        // Verify content and comments are not visible on home and site
        await standardUserFixture.homePage.loadPage();
        await standardUserFixture.navigationHelper.clickOnGlobalFeed();
        await homeFeedPage.verifyThePageIsLoaded();
        await homeFeedPage.assertions.verifyPostIsNotVisible(firstCommentText);
        await homeFeedPage.assertions.verifyPostIsNotVisible(secondCommentText);

        await siteFeedPage.loadPage({ stepInfo: 'Navigate to site feed after unpublish' });
        await siteFeedPageForAssertions.assertions.verifyPostIsNotVisible(firstCommentText);
        await siteFeedPageForAssertions.assertions.verifyPostIsNotVisible(secondCommentText);
      }
    );
  }
);
