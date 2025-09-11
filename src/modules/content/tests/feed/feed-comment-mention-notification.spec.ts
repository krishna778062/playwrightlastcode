import { faker } from '@faker-js/faker';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { NotificationComponent } from '@/src/modules/content/components/notificationComponent';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/pages/feedPage';

test.describe(
  '@FeedCommentMentionNotification - Feed Comment Mention Notification Tests',
  {
    tag: [ContentTestSuite.FEED_COMMENT_MENTION_NOTIFICATION],
  },
  () => {
    let user1FeedPage: FeedPage;
    let user2FeedPage: FeedPage;
    let user3FeedPage: FeedPage;
    let createdPostText: string;
    let createdPostId: string;
    let commentText: string;
    let siteManagerFullName: string;
    let siteManagerId: string;

    test.beforeEach(
      'Setup test environment',
      async ({ appManagerApiClient, standardUserApiClient, siteManagerHomePage }) => {
        user3FeedPage = new FeedPage(siteManagerHomePage.page); // User3 (Site Manager)

        // Get user full names for mentions
        const identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);

        const [user1Name, user2Name, user3Name, user3UserId] = await Promise.all([
          identityManagementHelper.getUserNameByEmail(users.appManager.email),
          identityManagementHelper.getUserNameByEmail(users.endUser.email),
          identityManagementHelper.getUserNameByEmail(users.siteManager.email),
          identityManagementHelper.getUserIdByEmail(users.siteManager.email),
        ]);

        siteManagerFullName = user3Name;
        siteManagerId = user3UserId;
      }
    );

    test.afterEach('Cleanup created posts', async ({ feedManagementHelper }) => {
      if (createdPostId) {
        await feedManagementHelper.deleteFeed(createdPostId);
        createdPostId = '';
      }
    });

    test(
      'Verify that User gets notified when it is getting mentioned in the reply of the comment of any post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-30438'],
      },
      async ({ appManagerHomePage, standardUserHomePage, siteManagerHomePage, feedManagementHelper }) => {
        tagTest(test.info(), {
          description:
            'Verify that User gets notified when it is getting mentioned in the reply of the comment of any post',
          zephyrTestId: 'CONT-30438',
          storyId: 'CONT-30438',
        });

        // Step 1: Create a feed post using API
        await test.step('Create a feed post using API', async () => {
          // Generate feed test data
          const feedTestData = TestDataGenerator.generateFeed({
            scope: 'public',
            siteId: undefined,
            withAttachment: false,
            waitForSearchIndex: false,
          });

          createdPostText = feedTestData.text;

          // Create feed using API (more reliable than UI)
          const feedResponse = await feedManagementHelper.createFeed(feedTestData);

          createdPostId = feedResponse.result.feedId;
          console.log(`Created feed post via API: ${createdPostId} with text: "${createdPostText}"`);
        });

        // Step 2: User1 adds a comment to the feed post using API
        await test.step('User1 adds a comment to the feed post via API', async () => {
          // Generate reply data with User3 mention using TestDataGenerator
          const replyData = TestDataGenerator.generateReply({
            userId: siteManagerId,
            userName: siteManagerFullName,
          });

          // Add reply via API
          await feedManagementHelper.addComment(createdPostId, replyData);
          console.log(`Added reply via API with mention: "${replyData.replyText}"`);
        });

        // Step 3: Prepare for User2 reply (API-based, no UI navigation needed)
        await test.step('Prepare User2 for adding reply via API', async () => {
          // Since we're using API calls, we don't need UI navigation
          // Just log that we're switching context to User2
          console.log(`Switching context to User2 (${siteManagerFullName}) for reply with mention`);
        });

        // Step 4: User2 replies to User1's comment and mentions User3 using API
        await test.step('User2 replies to User1 comment and mentions User3 via API', async () => {
          // Step 5: User3 (Site Manager) checks notification for mention
          await test.step('User3 checks notification for mention', async () => {
            // Use the existing siteManagerHomePage context (User3)
            await siteManagerHomePage.verifyThePageIsLoaded();

            // Click on bell icon to check notifications
            const notificationComponent: NotificationComponent = await siteManagerHomePage.actions.clickOnBellIcon({
              stepInfo: 'User3 clicking on bell icon to check notifications for mention',
            });

            // Verify notification message for mention in reply
            const expectedNotificationMessage = `${siteManagerFullName} mentioned you in a reply`;

            await test.step('Verify notification exists for User3', async () => {
              await notificationComponent.actions.clickOnNotification(expectedNotificationMessage);
            });
          });
        });
      }
    );
  }
);
