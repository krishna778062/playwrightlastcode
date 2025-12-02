import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { log } from '@core/utils/logger';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FeedApiHelper } from '@/src/modules/content/apis/apiValidation/feedApiHelper';

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
        log.warn('Feed cleanup failed', error);
      }
      try {
        await standardUserApiFixture.feedManagementHelper.cleanup();
      } catch (error) {
        log.warn('Feed cleanup failed', error);
      }
    });

    test(
      'validation of App manager Feed creation on home Page',
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
      'validation of Standard User Feed creation on home Page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-41915', ContentTestSuite.FEED_STANDARD_USER],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
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
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

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

    test(
      'validation of App manager Feed creation with all features on home',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42012', ContentTestSuite.FEED_APP_MANAGER],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with all features on home',
          zephyrTestId: 'CONT-42012',
          storyId: 'CONT-42012',
        });

        // Get user info for mentions and validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Get topic list for topic mentions
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        const topics =
          availableTopics.length >= 2
            ? [
                { id: availableTopics[0].topic_id, label: availableTopics[0].name },
                { id: availableTopics[1].topic_id, label: availableTopics[1].name },
              ]
            : availableTopics.length === 1
              ? [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }]
              : [];

        // Get a public site for site mention (optional)
        let siteMention;
        try {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
          if (publicSite) {
            siteMention = { id: publicSite.siteId, label: publicSite.name };
          }
        } catch (error) {
          log.warn('Could not get public site for mention', error);
        }

        // Upload file first to get fileId for attachment
        let fileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.feedManagementService.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          fileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for attachment', error);
        }

        // Generate feed test data with all features using TestDataGenerator
        const feedTestData = fileId
          ? TestDataGenerator.generateFeedWithAllFeatures({
              scope: 'public',
              baseText: 'Add a Feed',
              emoji: { name: 'monkey', emoji: '🐒' },
              siteMention: siteMention,
              userMention: { id: userInfo.userId, label: userInfo.fullName },
              topics: topics,
              linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
              siteId: null,
              withAttachment: true,
              fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
              fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
              mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType,
              fileId: fileId,
            })
          : TestDataGenerator.generateFeedWithAllFeatures({
              scope: 'public',
              baseText: 'Add a Feed',
              emoji: { name: 'monkey', emoji: '🐒' },
              siteMention: siteMention,
              userMention: { id: userInfo.userId, label: userInfo.fullName },
              topics: topics,
              linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
              siteId: null,
            });

        // Create feed using API with all features
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        const feedApiHelper = new FeedApiHelper();
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseCreatedAt(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteAndContent(feedResponse);

        // Additional validations for all features
        await feedApiHelper.validateFeedResponseTopics(feedResponse);
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        await feedApiHelper.validateFeedResponseFiles(feedResponse);
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
      }
    );

    test(
      'validation of Standard User Feed creation with all features on home',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42052', ContentTestSuite.FEED_STANDARD_USER],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Standard User Feed creation with all features on home',
          zephyrTestId: 'CONT-42052',
          storyId: 'CONT-42052',
        });

        // Get user info for mentions and validation (using appManagerApiFixture for user lookup)
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Get topic list for topic mentions (using appManagerApiFixture for topic access)
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        const topics =
          availableTopics.length >= 2
            ? [
                { id: availableTopics[0].topic_id, label: availableTopics[0].name },
                { id: availableTopics[1].topic_id, label: availableTopics[1].name },
              ]
            : availableTopics.length === 1
              ? [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }]
              : [];

        // Get a public site for site mention (optional)
        let siteMention;
        try {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
          if (publicSite) {
            siteMention = { id: publicSite.siteId, label: publicSite.name };
          }
        } catch (error) {
          log.warn('Could not get public site for mention', error);
        }

        // Upload file first to get fileId for attachment (using appManagerApiFixture for upload)
        let fileId: string | undefined;
        try {
          const uploadResponse = await standardUserApiFixture.feedManagementHelper.feedManagementService.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          fileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for attachment', error);
        }

        // Generate feed test data with all features using TestDataGenerator
        const feedTestData = fileId
          ? TestDataGenerator.generateFeedWithAllFeatures({
              scope: 'public',
              baseText: 'Add a Feed',
              emoji: { name: 'monkey', emoji: '🐒' },
              siteMention: siteMention,
              userMention: { id: userInfo.userId, label: userInfo.fullName },
              topics: topics,
              linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
              siteId: null,
              withAttachment: true,
              fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
              fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
              mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType,
              fileId: fileId,
            })
          : TestDataGenerator.generateFeedWithAllFeatures({
              scope: 'public',
              baseText: 'Add a Feed',
              emoji: { name: 'monkey', emoji: '🐒' },
              siteMention: siteMention,
              userMention: { id: userInfo.userId, label: userInfo.fullName },
              topics: topics,
              linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
              siteId: null,
            });

        // Create feed using API with all features (using standardUserApiFixture for feed creation)
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        const feedApiHelper = new FeedApiHelper();
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseCreatedAt(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteAndContent(feedResponse);

        // Additional validations for all features
        await feedApiHelper.validateFeedResponseTopics(feedResponse);
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        await feedApiHelper.validateFeedResponseFiles(feedResponse);
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
      }
    );
  }
);
