import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FeedApiHelper } from '@/src/modules/content/apis/helpers/feedApiHelper';

test.describe(
  '@FeedAPI',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    test.afterEach(async ({ appManagerApiFixture, standardUserApiFixture }) => {
      // Cleanup if needed
      try {
        await appManagerApiFixture.feedManagementHelper.cleanup();
      } catch (error) {
        console.warn('Feed cleanup failed:', error);
      }
      try {
        await standardUserApiFixture.feedManagementHelper.cleanup();
      } catch (error) {
        console.warn('Feed cleanup failed:', error);
      }
    });

    test(
      'aPI Validation of App manager Feed creation on home Page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-41913', ContentTestSuite.FEED_APP_MANAGER],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation on home Page',
          zephyrTestId: 'CONT-41913',
          storyId: 'CONT-41913',
        });

        // Generate feed test data
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          withAttachment: false,
          waitForSearchIndex: false,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API (more reliable than UI)
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        const feedApiHelper = new FeedApiHelper();
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseCreatedAt(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteAndContent(feedResponse);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, feedTestData.text);
      }
    );

    test(
      'aPI Validation of Standard User Feed creation on home Page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-41915', ContentTestSuite.FEED_STANDARD_USER],
      },
      async ({ standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Standard User Feed creation on home Page',
          zephyrTestId: 'CONT-41915',
          storyId: 'CONT-41915`',
        });

        // Generate feed test data
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          withAttachment: false,
          waitForSearchIndex: false,
        });

        // Get user info for validation
        const userInfo = await standardUserApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API (more reliable than UI)
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        const feedApiHelper = new FeedApiHelper();
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseCreatedAt(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteAndContent(feedResponse);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, feedTestData.text);
      }
    );
  }
);
