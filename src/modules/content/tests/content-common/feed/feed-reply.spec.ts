import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';

interface FeedResponse {
  result: {
    feedId: string;
    listOfFiles: Array<{
      fileId: string;
      provider: string;
      size: number;
      name: string;
      type: string;
    }>;
  };
  feedName: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Creates required resources based on feed type (API only - no page objects needed)
 * @param helpers - Required helper instances
 * @param options - Configuration for what to create
 * @returns Promise with created resources
 */
async function getPrerequisiteData(
  helpers: {
    siteManagementHelper: any;
    contentManagementHelper: any;
  },
  testData: any
) {
  const resources: any = {};

  // Create site only once, even if both createSite and createPage are true
  if (testData.feedType === 'Site Feed') {
    const siteResult = await helpers.siteManagementHelper.getSiteByAccessType('public');
    resources.siteId = siteResult.siteId;
  }

  if (testData.feedType === 'Content Feed') {
    const response = await helpers.contentManagementHelper.getContentId();
    resources.contentId = response.contentId;
    resources.siteId = response.siteId;
  }

  return resources;
}

// Common feed configuration for all test cases
const commonFeedConfig = {
  hasAttachment: false as const,
  waitForSearchIndex: false,
};

// Test data for different feed types
const feedTestData = [
  {
    feedType: 'Home Feed',
    scope: 'public',
    description: 'Verify user can add reply to Home Feed post',
    storyId: 'CONT-39688',
    ...commonFeedConfig,
  },
  {
    feedType: 'Site Feed',
    scope: 'site',
    description: 'Verify user can add reply to Site Feed post',
    storyId: 'CONT-39687',
    ...commonFeedConfig,
  },
  {
    feedType: 'Content Feed',
    scope: 'site',
    description: 'Verify user can add reply to Content Feed post',
    storyId: 'CONT-26347',
    ...commonFeedConfig,
  },
];

// Data-driven test for different feed types
for (const testData of feedTestData) {
  test.describe(
    `${testData.feedType} Tests`,
    {
      tag: [ContentTestSuite.FEED_REPLY_APP_MANAGER],
    },
    () => {
      let appManagerFeedPage: FeedPage;
      let createdPostText: string;
      let createdPostId: string;
      let siteId: string;
      let contentId: string;
      let feedResponse: FeedResponse;
      let siteDashboardPage: SiteDashboardPage;
      let feedTestDataGenerated: any;
      let replyText: string;
      let contentPreviewPage: ContentPreviewPage;

      test.beforeEach('Setup test environment and data creation', async ({ appManagerFixture }) => {
        // Configure app governance settings and enable timeline comment post(feed)
        /** await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
      */
        // Initialize feed page
        appManagerFeedPage = new FeedPage(appManagerFixture.page);
        const resources = await getPrerequisiteData(
          {
            siteManagementHelper: appManagerFixture.siteManagementHelper,
            contentManagementHelper: appManagerFixture.contentManagementHelper,
          },
          testData
        );

        // Assign created resources
        if (resources.siteId) {
          siteId = resources.siteId;
        }
        if (resources.contentId) {
          siteId = resources.siteId;
          contentId = resources.contentId;
        }

        console.log('spec siteId: ', siteId);
        console.log('spec contentId: ', contentId);

        // Generate feed data based on feed type
        switch (testData.feedType) {
          case 'Home Feed': {
            feedTestDataGenerated = TestDataGenerator.generateFeed({
              scope: 'public',
              siteId: undefined,
              withAttachment: testData.hasAttachment,
              waitForSearchIndex: testData.waitForSearchIndex,
            });
            break;
          }

          case 'Site Feed': {
            feedTestDataGenerated = TestDataGenerator.generateFeed({
              scope: 'site',
              siteId: siteId,
              withAttachment: testData.hasAttachment,
              waitForSearchIndex: testData.waitForSearchIndex,
            });
            break;
          }

          case 'Content Feed': {
            feedTestDataGenerated = TestDataGenerator.generateFeed({
              scope: 'site',
              siteId: siteId,
              contentId: contentId,
              withAttachment: testData.hasAttachment,
              waitForSearchIndex: testData.waitForSearchIndex,
            });
            break;
          }

          default:
            throw new Error(`Unknown feed type: ${testData.feedType}`);
        }
        // Create feed via API
        feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestDataGenerated);
        createdPostText = feedTestDataGenerated.text;
        createdPostId = feedResponse.result.feedId;
        // Generate reply text
        replyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        console.log(`Created feed via API: ${feedResponse.result.feedId}`);

        // Navigate to feed URL
        if (testData.feedType === 'Content Feed') {
          contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            siteId,
            contentId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        } else if (testData.feedType === 'Site Feed') {
          siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboardPage.actions.clickOnFeedLink();
        } else if (testData.feedType === 'Home Feed') {
          await appManagerFeedPage.page.goto(API_ENDPOINTS.feed.feedURL(createdPostId));
        }
        await appManagerFeedPage.assertions.validatePostText(createdPostText);
      });

      test.afterEach('Cleanup created posts', async ({ appManagerFixture }) => {
        if (createdPostId) {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
          createdPostId = '';
        }
      });

      test(
        `Verify user can add reply to ${testData.feedType} post`,
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION, `@${testData.storyId}`],
        },
        async ({}) => {
          tagTest(test.info(), {
            description: testData.description,
            zephyrTestId: testData.storyId,
            storyId: testData.storyId,
          });

          // Add reply to the feed post
          await appManagerFeedPage.actions.addReplyToPost(replyText, createdPostId);

          // Verify reply is associated with the correct post
          await appManagerFeedPage.assertions.verifyReplyIsVisible(replyText);

          // Click reply show more button
          await appManagerFeedPage.actions.clickReplyShowMoreButton();

          // Click delete button
          await appManagerFeedPage.actions.clickOnDeleteReplyButton();

          // Verify delete button is visible
          await appManagerFeedPage.assertions.verifyReplyIsNotVisible(replyText);
        }
      );

      test(
        `Verify user can see and click Cancel button while replying to ${testData.feedType} post`,
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-30149'],
        },
        async ({}) => {
          tagTest(test.info(), {
            description: `Verify user can see and click Cancel button while replying to ${testData.feedType} post`,
            zephyrTestId: 'CONT-30149',
            storyId: 'CONT-30149',
          });

          // Open reply editor for the post
          await appManagerFeedPage.actions.openReplyEditorForPost(createdPostText);

          // Verify editor box opens
          await appManagerFeedPage.actions.verifyReplyEditorVisible(createdPostText);

          // Verify user can see the Cancel button
          await appManagerFeedPage.actions.verifyCancelButtonVisible(createdPostText);

          // Click Cancel
          await appManagerFeedPage.actions.clickCancelButton(createdPostText);

          // Verify editor box closes
          await appManagerFeedPage.actions.verifyReplyEditorClosed(createdPostText);
        }
      );

      // Test case for CONT-19537: Verify user able to add, edit, delete reply on Home Feed
      if (testData.feedType === 'Home Feed') {
        test(
          'verify user can add, edit, delete reply on Home Feed with image attachments',
          {
            tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19537'],
          },
          async ({ appManagerFixture }) => {
            tagTest(test.info(), {
              description: 'Verify user able to add, edit, delete reply on Home Feed',
              zephyrTestId: 'CONT-19537',
              storyId: 'CONT-19537',
            });

            // Get file paths for test images
            const image1Path = FileUtil.getFilePath(
              __dirname,
              '..',
              '..',
              '..',
              'test-data',
              'static-files',
              'images',
              FEED_TEST_DATA.ATTACHMENTS.IMAGE
            );
            const faviconPath = FileUtil.getFilePath(
              __dirname,
              '..',
              '..',
              '..',
              'test-data',
              'static-files',
              'images',
              FEED_TEST_DATA.ATTACHMENTS.FAVICON
            );

            // Generate unique reply text
            const replyText = FEED_TEST_DATA.POST_TEXT.REPLY;
            const updatedReplyText = FEED_TEST_DATA.POST_TEXT.UPDATED_REPLY;

            // ==================== CREATE REPLY ====================
            // Open reply editor for the post
            await appManagerFeedPage.actions.openReplyEditorForPost(createdPostText);

            // Get the createFeedPostComponent from the page (used for reply editor)
            const createFeedPostComponent = appManagerFeedPage['createFeedPostComponent'];
            const listFeedComponent = appManagerFeedPage['listFeedComponent'];

            // Create reply text in editor
            await createFeedPostComponent.createPost(replyText);

            // Upload image1.jpg
            await createFeedPostComponent.uploadFiles([image1Path]);

            // Verify image1.jpg is attached
            await createFeedPostComponent.assertions.verifyAttachedFileCount(1);

            // Remove the file
            await createFeedPostComponent.removeAttachedFile(0);

            // Verify file is removed
            await createFeedPostComponent.assertions.verifyAttachedFileCount(0);

            // Upload favicon.png
            await createFeedPostComponent.uploadFiles([faviconPath]);

            // Verify favicon.png is attached
            await createFeedPostComponent.assertions.verifyAttachedFileCount(1);
            await createFeedPostComponent.assertions.verifyFileIsAttached(FEED_TEST_DATA.ATTACHMENTS.FAVICON);

            // Submit reply
            await listFeedComponent.submitReplyAndGetResponse();

            // ==================== VERIFY REPLY CREATED ====================
            // Verify reply is visible
            await appManagerFeedPage.assertions.verifyReplyIsVisible(replyText);

            // Verify timestamp is present
            await listFeedComponent.verifyReplyTimestamp(replyText);

            // Verify reply count = 1
            await appManagerFeedPage.assertions.verifyReplyCount(createdPostText, 1);

            // ==================== EDIT REPLY ====================
            // Open reply options menu
            await listFeedComponent.openReplyOptionsMenu(replyText);

            // Click Edit
            await listFeedComponent.clickReplyEditOption();

            // Verify editor is visible
            await createFeedPostComponent.assertions.verifyEditorVisible();

            // // Verify image button is NOT visible (cannot add new files)
            // await appManagerFeedPage.actions.verifyImageButtonIsNotVisible();

            // Verify attached file count is still 1 (cannot remove files)
            await createFeedPostComponent.assertions.verifyAttachedFileCount(1);

            // Update reply text
            await createFeedPostComponent.updatePostText(updatedReplyText);

            // Click Update button
            await createFeedPostComponent.clickUpdateButton();

            // Verify updated reply is visible
            await appManagerFeedPage.assertions.verifyReplyIsVisible(updatedReplyText);

            // ==================== DELETE REPLY ====================
            // Open reply options menu
            await listFeedComponent.openReplyOptionsMenu(updatedReplyText);

            // Click Delete option
            await listFeedComponent.clickReplyDeleteOption();

            // Confirm deletion
            await listFeedComponent.confirmDelete();

            await appManagerFeedPage.assertions.verifyReplyIsNotVisible(updatedReplyText);

            await appManagerFeedPage.actions.deletePost(createdPostText);
          }
        );
      }
    }
  );
}

// Test case for CONT-30148: Verify user can see and click Cancel button while creating Home Feed, Site Feed, and Content Feed post
test.describe(
  'post creation cancel button tests',
  {
    tag: [ContentTestSuite.FEED_REPLY_APP_MANAGER],
  },
  () => {
    test(
      'verify user can see and click Cancel button while creating Home Feed, Site Feed, and Content Feed post',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-30148'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify user can see and click Cancel button while creating Home Feed, Site Feed, and Content Feed post',
          zephyrTestId: 'CONT-30148',
          storyId: 'CONT-30148',
        });

        const appManagerFeedPage = new FeedPage(appManagerFixture.page);

        // ==================== HOME FEED SCENARIO ====================
        await test.step('Home Feed: Verify Cancel button functionality', async () => {
          // Navigate to Home Feed
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          await appManagerFeedPage.verifyThePageIsLoaded();

          await appManagerFeedPage.actions.clickShareThoughtsButton();

          await appManagerFeedPage.actions.verifyPostCreationCancelButtonVisible();

          await appManagerFeedPage.actions.clickPostCreationCancelButton();

          await appManagerFeedPage.actions.verifyPostCreationEditorClosed();
        });

        // ==================== SITE FEED SCENARIO ====================
        await test.step('Site Feed: Verify Cancel button functionality', async () => {
          // Get or create site
          const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
          const siteId = siteInfo.siteId;

          const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
          await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
          await siteDashboardPage.actions.clickOnFeedLink();
          await appManagerFeedPage.verifyThePageIsLoaded();

          await siteDashboardPage.actions.clickShareThoughtsButton();

          await siteDashboardPage.actions.verifyPostCreationCancelButtonVisible();

          await siteDashboardPage.actions.clickPostCreationCancelButton();

          await siteDashboardPage.actions.verifyPostCreationEditorClosed();
        });

        // ==================== CONTENT FEED SCENARIO ====================
        await test.step('Content Feed: Verify Cancel button functionality', async () => {
          // Get content details
          const { contentId, siteId } = await appManagerFixture.contentManagementHelper.getContentId();

          // Navigate to Content Preview Page
          const contentPreviewPage = new ContentPreviewPage(
            appManagerFixture.page,
            siteId,
            contentId,
            ContentType.PAGE.toLowerCase()
          );
          await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });

          await contentPreviewPage.actions.clickShareThoughtsButton();

          await contentPreviewPage.actions.verifyPostCreationCancelButtonVisible();

          await contentPreviewPage.actions.clickPostCreationCancelButton();

          await contentPreviewPage.actions.verifyPostCreationEditorClosed();
        });
      }
    );
  }
);

// Test case for CONT-30407: Verify user gets notified for replies on comments
test.describe(
  'feed Reply Notifications',
  {
    tag: [ContentTestSuite.FEED_REPLY_APP_MANAGER],
  },
  () => {
    let appManagerPostId: string;
    let socialUserPostId: string;
    let endUserInfo: { userId: string; fullName: string };
    let socialUserInfo: { userId: string; fullName: string };

    test.beforeEach('Setup test environment', async ({ appManagerFixture, socialCampaignManagerFixture }) => {
      // Configure app governance settings
      /** await appManagerFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
      */

      // Generate test data
      const feedTestDataByAppManager = TestDataGenerator.generateFeed({
        scope: 'public',
        siteId: undefined,
        withAttachment: false,
        waitForSearchIndex: false,
      });

      // Generate test data
      const feedTestDataBySocialUser = TestDataGenerator.generateFeed({
        scope: 'public',
        siteId: undefined,
        withAttachment: false,
        waitForSearchIndex: false,
      });

      // Create feed via API as app manager
      const appManagerFeedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestDataByAppManager);
      appManagerPostId = appManagerFeedResponse.result.feedId;

      // Create feed via API as app manager
      const socialUserFeedResponse =
        await socialCampaignManagerFixture.feedManagementHelper.createFeed(feedTestDataBySocialUser);
      socialUserPostId = socialUserFeedResponse.result.feedId;

      const [endUserData, socialUserData, appManagerData] = await Promise.all([
        appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email),
        appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.socialCampaignManager.email),
        appManagerFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email),
      ]);

      endUserInfo = { userId: endUserData.userId, fullName: endUserData.fullName };
      socialUserInfo = { userId: socialUserData.userId, fullName: socialUserData.fullName };

      console.log(`Created feed via API: ${appManagerFeedResponse.result.feedId}`);
    });

    test.afterEach('Cleanup created posts', async ({ appManagerFixture }) => {
      if (appManagerPostId) {
        await appManagerFixture.feedManagementHelper.deleteFeed(appManagerPostId);
        appManagerPostId = '';
      }
      if (socialUserPostId) {
        await appManagerFixture.feedManagementHelper.deleteFeed(socialUserPostId);
        socialUserPostId = '';
      }
    });

    test(
      'verify that User gets notified for getting a reply on its comment from another user on a feedpost for both authored by it and not authored by it',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-30407'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that User gets notified for getting a reply on its comment from another user on a feedpost for both authored by it and not authored by it',
          zephyrTestId: 'CONT-30407',
          storyId: 'CONT-30407',
        });

        const appManagerReplyData = TestDataGenerator.generateSimpleReply();

        const standardUserCommentData = TestDataGenerator.generateSimpleReply();

        const appManageReplyOnSocialUserPostResponse = await appManagerFixture.feedManagementHelper.addComment(
          socialUserPostId,
          appManagerReplyData
        );

        // Standard user adds a comment to the feed post
        const standardUserCommentResponse = await standardUserFixture.feedManagementHelper.addComment(
          socialUserPostId,
          standardUserCommentData
        );

        const standardUserReplyOnAppManagerPostData = await standardUserFixture.feedManagementHelper.addComment(
          appManagerPostId,
          standardUserCommentData
        );

        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const notificationComponentSiteManager = await appManagerFixture.navigationHelper.clickOnBellIcon({
          stepInfo: 'Application Manager clicking on bell icon to view notifications',
        });
        const activityNotificationPage = await notificationComponentSiteManager.actions.clickOnViewAllNotifications();

        // Verify notification message for mention in reply
        const expectedNotificationMessage = `${endUserInfo.fullName} replied to your post "${standardUserCommentData.replyText}"`;
        await activityNotificationPage.assertions.verifyNotificationExists(expectedNotificationMessage);
        const expectedNotificationMessage2 = `${endUserInfo.fullName} also replied to ${socialUserInfo.fullName}'s post`;
        await activityNotificationPage.assertions.verifyNotificationExists(expectedNotificationMessage2);
      }
    );
  }
);

// Test case for CONT-26348: Verify that application should allow user to edit the comment
test.describe(
  'comment Editing Tests',
  {
    tag: [ContentTestSuite.FEED_REPLY_APP_MANAGER],
  },
  () => {
    let appManagerFeedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string;
    let originalReplyText: string;
    let editedReplyText: string;

    test(
      'verify that application should allow user to edit the comment',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-26348'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify that application should allow user to edit the comment',
          zephyrTestId: 'CONT-26348',
          storyId: 'CONT-26348',
        });

        const { contentId, siteId, contentType } = await appManagerFixture.contentManagementHelper.getContentId();

        const feedTestDataGenerated = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          contentId: contentId,
          withAttachment: false,
          waitForSearchIndex: false,
        });

        const feedResponse = await appManagerFixture.feedManagementHelper.createFeed(feedTestDataGenerated);
        createdPostId = feedResponse.result.feedId;
        createdPostText = feedTestDataGenerated.text;
        const contentPreviewPage = new ContentPreviewPage(appManagerFixture.page, siteId, contentId, contentType);
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        const updatedPostText = TestDataGenerator.generateRandomText('Updated Test Post', 3, true);
        await contentPreviewPage.actions.editPost(createdPostText, updatedPostText);
        await contentPreviewPage.assertions.waitForPostToBeVisible(updatedPostText);
      }
    );
  }
);
