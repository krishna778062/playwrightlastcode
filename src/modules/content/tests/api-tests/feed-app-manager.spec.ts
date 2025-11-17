import { expect } from '@playwright/test';

import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

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
        await test.step('Validate feed response JSON', async () => {
          expect(feedResponse.apiName, 'apiName should be "CreateFeed"').toBe('CreateFeed');

          expect(feedResponse.message, 'message should match expected success message').toBe(
            FEED_TEST_DATA.API_RESPONSE_MESSAGES.FEED_POST_CREATED
          );
          expect(feedResponse.status, 'status should be "success"').toBe('success');

          expect(feedResponse.result.createdAt, 'createdAt should be a valid ISO timestamp').toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
          );
          expect(feedResponse.result.authoredBy.userId, 'authoredBy.userId should match app manager userId').toBe(
            userInfo.userId
          );
          expect(feedResponse.result.authoredBy.name, 'authoredBy.name should match app manager name').toBe(
            userInfo.fullName
          );
          expect(feedResponse.result.site, 'site should be null for public feed posts').toBeNull();

          expect(feedResponse.result.content, 'content should be null for feed posts without content').toBeNull();

          const textJsonParsed = JSON.parse(feedResponse.result.textJson);
          const extractedText = textJsonParsed.content
            ?.map((paragraph: any) =>
              paragraph.content?.map((item: any) => (item.type === 'text' ? item.text : '')).join('')
            )
            .join('')
            .trim();

          expect(extractedText, 'textJson should contain the feed test data text').toContain(feedTestData.text);
        });
      }
    );

    test(
      'aPI Validation of Standard User Feed creation on home Page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-41914', ContentTestSuite.FEED_STANDARD_USER],
      },
      async ({ standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Standard User Feed creation on home Page',
          zephyrTestId: 'CONT-41914',
          storyId: 'CONT-41914',
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
        await test.step('Validate feed response JSON', async () => {
          expect(feedResponse.apiName, 'apiName should be "CreateFeed"').toBe('CreateFeed');

          expect(feedResponse.message, 'message should match expected success message').toBe(
            FEED_TEST_DATA.API_RESPONSE_MESSAGES.FEED_POST_CREATED
          );
          expect(feedResponse.status, 'status should be "success"').toBe('success');

          expect(feedResponse.result.createdAt, 'createdAt should be a valid ISO timestamp').toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
          );
          expect(feedResponse.result.authoredBy.userId, 'authoredBy.userId should match standard user userId').toBe(
            userInfo.userId
          );
          expect(feedResponse.result.authoredBy.name, 'authoredBy.name should match standard user name').toBe(
            userInfo.fullName
          );
          expect(feedResponse.result.site, 'site should be null for public feed posts').toBeNull();

          expect(feedResponse.result.content, 'content should be null for feed posts without content').toBeNull();

          const textJsonParsed = JSON.parse(feedResponse.result.textJson);
          const extractedText = textJsonParsed.content
            ?.map((paragraph: any) =>
              paragraph.content?.map((item: any) => (item.type === 'text' ? item.text : '')).join('')
            )
            .join('')
            .trim();

          expect(extractedText, 'textJson should contain the feed test data text').toContain(feedTestData.text);
        });
      }
    );
  }
);
