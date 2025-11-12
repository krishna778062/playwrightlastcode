import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';

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

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });

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
    });

    test(
      'home Dashboard Flow - Verify user can view 10 replies on Feed detail page',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@27691'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to view 10 comments or replies on Feed detail page - Home Dashboard Flow',
          zephyrTestId: '27691',
          storyId: '27691',
        });

        // Navigate to home feed dashboard
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
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
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });
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
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@27691'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to view 10 comments or replies on Feed detail page - Site Dashboard Flow',
          zephyrTestId: '27691',
          storyId: '27691',
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
        await appManagerFixture.page.reload({ waitUntil: 'domcontentloaded' });
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
        tag: [TestPriority.P0, TestGroupType.REGRESSION, '@27691'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to view 10 comments or replies on Feed detail page - Content Feed Flow',
          zephyrTestId: '27691',
          storyId: '27691',
        });

        // Search and open an existing site
        const contentData = await appManagerFixture.contentManagementHelper.getContentId();
        siteId = contentData.siteId;
        contentId = contentData.contentId;
        contentType = contentData.contentType;

        // Click Content tab and open content item
        contentPreviewPage = new ContentPreviewPage(appManagerFixture.page, siteId, contentId, contentType);
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });

        // Add 18 feed posts (comments) under the content via API
        const previousCommentCount = await contentPreviewPage.actions.getVisibleCommentCount();
        console.log('Previous comment count: ', previousCommentCount);
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
        await appManagerFixture.homePage.verifyThePageIsLoaded();
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
        await contentPreviewPage.assertions.verifyCommentCount(18 + previousCommentCount);
      }
    );
  }
);
