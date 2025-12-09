import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { FeedResult } from '@core/types/feed.type';
import { log } from '@core/utils/logger';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FeedApiHelper } from '@/src/modules/content/apis/apiValidation/feedApiHelper';
import {
  buildAttachmentObject,
  buildFeedReplyText,
  buildFeedTextWithSiteMentions,
  buildFeedTextWithUserMentions,
} from '@/src/modules/content/apis/services/FeedManagementService';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  '@FeedAPI',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    let feedApiHelper: FeedApiHelper;

    test.beforeEach(async ({ appManagerApiFixture }) => {
      //Initialize feedApiHelper
      feedApiHelper = new FeedApiHelper();
      //Enable feed mode
      await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
    });
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
          const publicSiteId =
            await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
          if (publicSiteId) {
            siteMention = { id: publicSiteId, label: DEFAULT_PUBLIC_SITE_NAME };
          }
        } catch (error) {
          log.warn('Could not get public site for mention', error);
        }

        // Upload file first to get fileId for attachment
        let fileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.uploadImage(
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
          const publicSiteId =
            await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
          if (publicSiteId) {
            siteMention = { id: publicSiteId, label: DEFAULT_PUBLIC_SITE_NAME };
          }
        } catch (error) {
          log.warn('Could not get public site for mention', error);
        }

        // Upload file first to get fileId for attachment (using appManagerApiFixture for upload)
        let fileId: string | undefined;
        try {
          const uploadResponse = await standardUserApiFixture.feedManagementHelper.uploadImage(
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
      'app Manager Add Edit Delete Text with Special Characters on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36043'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with special characters on home',
          zephyrTestId: 'CONT-36043',
          storyId: 'CONT-36043',
        });

        // Generate feed test data with special characters
        const specialCharsText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        // Override text with special characters
        feedTestData.text = specialCharsText;

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, specialCharsText);

        //Add Edit Delete Text Feed Reply with Special Characters on Home Dashboard
        const updatedText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?%^&* -updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        // Note: updatePost returns FeedResult (responseBody.result) despite being typed as FeedPostResponse
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );

        // Validate the update response (updatePost returns FeedResult, not FeedPostResponse)
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Text Feed Reply with Special Characters on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(feedResponse.result?.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete with Emojis Feed Post on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36044'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with emojis on home',
          zephyrTestId: 'CONT-36044',
          storyId: 'CONT-36044',
        });

        // Create feed with emoji using generateFeedWithAllFeatures
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with emoji',
          emoji: { name: 'grin', emoji: '😀' },
          siteId: null,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);

        //Edit Delete Text Feed Reply with Emojis Feed Post on Home Dashboard
        const updatedText = 'Test feed with emoji - Updated 😀';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );

        // Validate the update response (updatePost returns FeedResult, not FeedPostResponse)
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Text Feed Reply with Emojis Feed Post on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(feedResponse.result?.feedId);
      }
    );

    test(
      'app Manager Add Edit and Delete New Topic Feed on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36048'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with new topic on home',
          zephyrTestId: 'CONT-36048',
          storyId: 'CONT-36048',
        });

        // Generate topic name
        const topicName = TestDataGenerator.generateRandomString('NewTopic');

        // Create feed with new topic
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          withAttachment: false,
          waitForSearchIndex: false,
          topics: [topicName],
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTopics(feedResponse);

        //Add Edit Delete New Topic Feed on Home Dashboard
        const updatedText = 'Test feed with new topic - Updated';
        const { textJson: updatedTextJson, textHtml: updatedTextHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = (await appManagerApiFixture.feedManagementHelper.feedManagementService.updatePost(
          feedResponse.result?.feedId,
          {
            textJson: updatedTextJson,
            textHtml: updatedTextHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        )) as unknown as FeedResult;

        // Validate the update response (updatePost returns FeedResult, not FeedPostResponse)
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete New Topic Feed on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add, Edit and delete Existing Topic Feed on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36050'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with existing topic on home',
          zephyrTestId: 'CONT-36050',
          storyId: 'CONT-36050',
        });

        // Get existing topic list
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];

        if (availableTopics.length === 0) {
          // Create a topic first if none exist
          const topicName = TestDataGenerator.generateRandomString('ExistingTopic');
          const feedTestData = TestDataGenerator.generateFeed({
            scope: 'public',
            siteId: undefined,
            withAttachment: false,
            waitForSearchIndex: false,
            topics: [topicName],
          });
          await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

          // Get updated topic list
          const updatedTopicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
          const updatedTopics = updatedTopicList.result?.listOfItems || [];
          if (updatedTopics.length > 0) {
            availableTopics.push(updatedTopics[0]);
          }
        }

        if (availableTopics.length === 0) {
          throw new Error('No topics available for test');
        }

        // Use existing topic
        const existingTopic = availableTopics[0];
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          withAttachment: false,
          waitForSearchIndex: false,
          topics: [existingTopic.name],
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTopics(feedResponse);

        //Edit Delete Existing Topic Feed on Home Dashboard
        const updatedText = existingTopic.name + ' - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Existing Topic Feed on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'validation of App manager Feed creation with user mention on home',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36053'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with user mention on home',
          zephyrTestId: 'CONT-36053',
          storyId: 'CONT-36053',
        });

        // Get user info for mention
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed with user mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with user mention',
          userMention: { id: userInfo.userId, label: userInfo.fullName },
          siteId: null,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);

        //Edit Delete User Mention Feed on Home Dashboard
        // Get another user for mention in update
        const updateUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );

        // Build update payload with user mentions
        const { textJson, textHtml } = buildFeedTextWithUserMentions('', [
          { id: updateUserInfo.userId, label: updateUserInfo.fullName },
        ]);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );

        // Validate the update response contains user mentions
        await feedApiHelper.validateFeedUpdateResponseUserMentions(updatedFeedResult, [
          { id: updateUserInfo.userId, label: updateUserInfo.fullName },
        ]);

        //Delete User Mention Feed on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit and delete Feed post with Site Mentions on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36056'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with site mention on home',
          zephyrTestId: 'CONT-36056',
          storyId: 'CONT-36056',
        });

        // Get public site for mention
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available for mention');
        }

        // Create feed with site mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with site mention',
          siteMention: { id: publicSiteId, label: DEFAULT_PUBLIC_SITE_NAME },
          siteId: null,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseMentions(feedResponse);

        // Get public site for mention
        const updateSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!updateSiteId) {
          throw new Error('No public site available for mention');
        }

        // Build update payload with site mentions
        const { textJson, textHtml } = buildFeedTextWithSiteMentions('', [
          { id: updateSiteId, label: DEFAULT_PUBLIC_SITE_NAME },
        ]);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );

        // Validate the update response contains site mentions
        await feedApiHelper.validateFeedUpdateResponseSiteMentions(updatedFeedResult, [
          { id: updateSiteId, label: DEFAULT_PUBLIC_SITE_NAME },
        ]);
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit and delete Feed with Embedded URL on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36059'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with embedded URL on home',
          zephyrTestId: 'CONT-36059',
          storyId: 'CONT-36059',
        });

        // Create feed with embedded URL
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with embedded URL',
          linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
          siteId: null,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseLinks(feedResponse);

        //Edit Delete Site Mention Feed on Home Dashboard
        const updatedText = 'Test feed with site mention - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Text Feed with html Tags Feed Post on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36045'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with HTML tags on home',
          zephyrTestId: 'CONT-36045',
          storyId: 'CONT-36045',
        });

        // Create feed with HTML tags (XSS protection test)
        const htmlText = "<script>alert('XSS')</script>";
        const { textJson: htmlTextJson, textHtml: htmlTextHtml } = buildFeedReplyText(htmlText);
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        // Override text with HTML tags - HTML should be escaped
        feedTestData.text = htmlText;
        // Manually set textJson and textHtml for HTML tags
        (feedTestData as any).textJson = htmlTextJson;
        (feedTestData as any).textHtml = `<p>&lt;script&gt;alert(&apos;XSS&apos;)&lt;/script&gt;</p>`;

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        // HTML should be escaped in the response
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, htmlText);

        //Edit Delete HTML Tags Feed on Home Dashboard
        const updatedHtmlText = "<script>alert('XSS')</script> Updated";
        const { textJson: updatedHtmlTextJson } = buildFeedReplyText(updatedHtmlText);
        const updatedFeedResult = (await appManagerApiFixture.feedManagementHelper.feedManagementService.updatePost(
          feedResponse.result?.feedId,
          {
            textJson: updatedHtmlTextJson,
            textHtml: `<p>&lt;script&gt;alert(&apos;XSS&apos;)&lt;/script&gt; Updated</p>`,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        )) as unknown as FeedResult;
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedHtmlText);

        //Delete HTML Tags Feed on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Combination Feed on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36062'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with combination features on home',
          zephyrTestId: 'CONT-36062',
          storyId: 'CONT-36062',
        });

        // Get user and site info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available for mention');
        }
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];

        // Create combination feed with all features
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Hello World',
          emoji: { name: 'grin', emoji: '😀' },
          siteMention: { id: publicSiteId, label: DEFAULT_PUBLIC_SITE_NAME },
          userMention: { id: userInfo.userId, label: userInfo.fullName },
          topics:
            availableTopics.length > 0 ? [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }] : [],
          linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
          siteId: null,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        if (availableTopics.length > 0) {
          await feedApiHelper.validateFeedResponseTopics(feedResponse);
        }
        await feedApiHelper.validateFeedResponseLinks(feedResponse);

        //Edit Delete Combination Feed on Home Dashboard
        const updatedText = 'Hello Nation';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Combination Feed on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with File Attachment on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36055'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with file attachment on home',
          zephyrTestId: 'CONT-36055',
          storyId: 'CONT-36055',
        });

        // Upload file first to get fileId for attachment
        let fileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          fileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for attachment', error);
        }

        if (!fileId) {
          throw new Error('Failed to upload file for attachment');
        }

        // Create feed with file attachment
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with file attachment',
          siteId: null,
          withAttachment: true,
          fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
          fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
          mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType,
          fileId: fileId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseFiles(feedResponse);

        //Edit Delete File Attachment Feed on Home Dashboard
        // Upload a new image for the update
        let updatedFileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          updatedFileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for update attachment', error);
        }

        const updatedText = 'Test feed with file attachment - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: updatedFileId ? [buildAttachmentObject(updatedFileId)] : [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);
        if (updatedFileId) {
          await feedApiHelper.validateFeedResultFiles(updatedFeedResult);
        }

        //Delete File Attachment Feed on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Text Feed on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42929'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with text on public site',
          zephyrTestId: 'CONT-42929',
          storyId: 'CONT-42929',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Generate feed test data for site
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: publicSiteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, feedTestData.text);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Text Feed on Public Site Dashboard
        const updatedText = 'Updated text feed on public site';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Text Feed on Public Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Text Feed on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42928'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with text on private site',
          zephyrTestId: 'CONT-42928',
          storyId: 'CONT-42928',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Generate feed test data for site
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: privateSite.siteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, feedTestData.text);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Text Feed on Private Site Dashboard
        const updatedText = 'Updated text feed on private site';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Text Feed on Private Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Text Feed on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42929'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with text on unlisted site',
          zephyrTestId: 'CONT-42929',
          storyId: 'CONT-42929',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Generate feed test data for site
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: unlistedSite.siteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, feedTestData.text);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Text Feed on Unlisted Site Dashboard
        const updatedText = 'Updated text feed on unlisted site';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Text Feed on Unlisted Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Special Characters on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36066'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with special characters on public site',
          zephyrTestId: 'CONT-36066',
          storyId: 'CONT-36066',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Generate feed test data with special characters
        const specialCharsText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: publicSiteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        // Override text with special characters
        feedTestData.text = specialCharsText;

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, specialCharsText);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with Special Characters on Public Site Dashboard
        const updatedText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?%^&* -updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Special Characters on Public Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Emojis on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36046'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with emojis on public site',
          zephyrTestId: 'CONT-36046',
          storyId: 'CONT-36046',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Create feed with emojis
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Created a feed post with Emoji',
          emoji: { name: 'grin', emoji: '😀' },
          siteId: publicSiteId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with Emojis on Public Site Dashboard
        const updatedText = 'Updated feed with emoji 😅';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Emojis on Public Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with File Attachment on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42930'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with file attachment on public site',
          zephyrTestId: 'CONT-42930',
          storyId: 'CONT-42930',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Upload file first to get fileId for attachment
        let fileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          fileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for attachment', error);
        }

        if (!fileId) {
          throw new Error('Failed to upload file for attachment');
        }

        // Create feed with file attachment
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with file attachment on public site',
          siteId: publicSiteId,
          withAttachment: true,
          fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
          fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
          mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType,
          fileId: fileId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseFiles(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with File Attachment on Public Site Dashboard
        // Upload a new image for the update
        let updatedFileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          updatedFileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for update attachment', error);
        }

        const updatedText = 'Test feed with file attachment on public site - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: updatedFileId ? [buildAttachmentObject(updatedFileId)] : [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);
        if (updatedFileId) {
          await feedApiHelper.validateFeedResultFiles(updatedFeedResult);
        }

        //Delete Feed with File Attachment on Public Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Special Characters on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42936'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with special characters on private site',
          zephyrTestId: 'CONT-42936',
          storyId: 'CONT-42936',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Generate feed test data with special characters
        const specialCharsText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: privateSite.siteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        // Override text with special characters
        feedTestData.text = specialCharsText;

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, specialCharsText);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with Special Characters on Private Site Dashboard
        const updatedText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?%^&* -updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Special Characters on Private Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Special Characters on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42935'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with special characters on unlisted site',
          zephyrTestId: 'CONT-42935',
          storyId: 'CONT-42935',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Generate feed test data with special characters
        const specialCharsText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: unlistedSite.siteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        // Override text with special characters
        feedTestData.text = specialCharsText;

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, specialCharsText);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with Special Characters on Unlisted Site Dashboard
        const updatedText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?%^&* -updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Special Characters on Unlisted Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Emojis on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42934'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with emojis on private site',
          zephyrTestId: 'CONT-42934',
          storyId: 'CONT-42934',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Create feed with emojis
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Created a feed post with Emoji',
          emoji: { name: 'grin', emoji: '😀' },
          siteId: privateSite.siteId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with Emojis on Private Site Dashboard
        const updatedText = 'Updated feed with emoji 😅';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Emojis on Private Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Emojis on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42933'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with emojis on unlisted site',
          zephyrTestId: 'CONT-42933',
          storyId: 'CONT-42933',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Create feed with emojis
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Created a feed post with Emoji',
          emoji: { name: 'grin', emoji: '😀' },
          siteId: unlistedSite.siteId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with Emojis on Unlisted Site Dashboard
        const updatedText = 'Updated feed with emoji 😅';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Emojis on Unlisted Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with File Attachment on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42932'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with file attachment on private site',
          zephyrTestId: 'CONT-42932',
          storyId: 'CONT-42932',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Upload file first to get fileId for attachment
        let fileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          fileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for attachment', error);
        }

        if (!fileId) {
          throw new Error('Failed to upload file for attachment');
        }

        // Create feed with file attachment
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with file attachment on private site',
          siteId: privateSite.siteId,
          withAttachment: true,
          fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
          fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
          mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType,
          fileId: fileId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseFiles(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with File Attachment on Private Site Dashboard
        // Upload a new image for the update
        let updatedFileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          updatedFileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for update attachment', error);
        }

        const updatedText = 'Test feed with file attachment on private site - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: updatedFileId ? [buildAttachmentObject(updatedFileId)] : [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);
        if (updatedFileId) {
          await feedApiHelper.validateFeedResultFiles(updatedFeedResult);
        }

        //Delete Feed with File Attachment on Private Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with File Attachment on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42931'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with file attachment on unlisted site',
          zephyrTestId: 'CONT-42931',
          storyId: 'CONT-42931',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Upload file first to get fileId for attachment
        let fileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          fileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for attachment', error);
        }

        if (!fileId) {
          throw new Error('Failed to upload file for attachment');
        }

        // Create feed with file attachment
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with file attachment on unlisted site',
          siteId: unlistedSite.siteId,
          withAttachment: true,
          fileName: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
          fileSize: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
          mimeType: FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType,
          fileId: fileId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseFiles(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with File Attachment on Unlisted Site Dashboard
        // Upload a new image for the update
        let updatedFileId: string | undefined;
        try {
          const uploadResponse = await appManagerApiFixture.feedManagementHelper.uploadImage(
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileName,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.fileSize,
            FEED_TEST_DATA.DEFAULT_FEED_CONTENT_JPEG.mimeType
          );
          updatedFileId = uploadResponse.responseFileId || uploadResponse.result?.file_id;
        } catch (error) {
          log.warn('Could not upload file for update attachment', error);
        }

        const updatedText = 'Test feed with file attachment on unlisted site - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: updatedFileId ? [buildAttachmentObject(updatedFileId)] : [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);
        if (updatedFileId) {
          await feedApiHelper.validateFeedResultFiles(updatedFeedResult);
        }

        //Delete Feed with File Attachment on Unlisted Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Topics on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36052'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with topics on public site',
          zephyrTestId: 'CONT-36052',
          storyId: 'CONT-36052',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Get topic list
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        if (availableTopics.length === 0) {
          throw new Error('No topics available');
        }

        // Create feed with existing topic
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with topic on public site',
          topics: [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }],
          siteId: publicSiteId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTopics(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with Topics on Public Site Dashboard
        const updatedText = 'Updated feed with topic';
        const { textJson, textHtml } = buildFeedReplyText(updatedText, {
          topics: [{ id: availableTopics[0].topic_id, name: availableTopics[0].name }],
        });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Topics on Public Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with User Mentions on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36058'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with user mentions on public site',
          zephyrTestId: 'CONT-36058',
          storyId: 'CONT-36058',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Get user info for mention
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed with user mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with user mention on public site',
          userMention: { id: userInfo.userId, label: userInfo.fullName },
          siteId: publicSiteId,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with User Mentions on Public Site Dashboard
        // Use the same user for update (or get app manager if different user needed)
        const userMentions = [{ id: userInfo.userId, label: userInfo.fullName }];
        const { textJson, textHtml } = buildFeedReplyText('', { userMentions });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponseUserMentions(updatedFeedResult, userMentions);

        //Delete Feed with User Mentions on Public Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Site Mentions on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36054'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with site mentions on public site',
          zephyrTestId: 'CONT-36054',
          storyId: 'CONT-36054',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Get another site for mention (try different access types if same access type returns same site)
        let mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        if (!mentionedSite || mentionedSite.siteId === publicSiteId) {
          // Try private site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        }
        if (!mentionedSite || mentionedSite.siteId === publicSiteId) {
          // Try unlisted site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        }
        if (!mentionedSite || mentionedSite.siteId === publicSiteId) {
          throw new Error('No additional site available for mention');
        }

        // Create feed with site mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with site mention on public site',
          siteMention: { id: mentionedSite.siteId, label: mentionedSite.name },
          siteId: publicSiteId,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with Site Mentions on Public Site Dashboard
        const siteMentions = [{ id: mentionedSite.siteId, label: mentionedSite.name }];
        const { textJson, textHtml } = buildFeedReplyText('', { siteMentions });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponseSiteMentions(updatedFeedResult, siteMentions);

        //Delete Feed with Site Mentions on Public Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Embedded URL on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-36078'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with embedded URL on public site',
          zephyrTestId: 'CONT-36078',
          storyId: 'CONT-36078',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Create feed with embedded URL
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with embedded URL on public site',
          linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
          siteId: publicSiteId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with Embedded URL on Public Site Dashboard
        const updatedText = 'Updated feed with embedded URL';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Embedded URL on Public Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Combination Feed on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-37705'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with combination features on public site',
          zephyrTestId: 'CONT-42938',
          storyId: 'CONT-42938',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Get user and site info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        // Get another site for mention (try different access types if same access type returns same site)
        let mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        if (!mentionedSite || mentionedSite.siteId === publicSiteId) {
          // Try private site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        }
        if (!mentionedSite || mentionedSite.siteId === publicSiteId) {
          // Try unlisted site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        }
        if (!mentionedSite || mentionedSite.siteId === publicSiteId) {
          throw new Error('No additional site available for mention');
        }
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];

        // Create combination feed with all features
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Hello World',
          emoji: { name: 'grin', emoji: '😀' },
          siteMention: { id: mentionedSite.siteId, label: mentionedSite.name },
          userMention: { id: userInfo.userId, label: userInfo.fullName },
          topics:
            availableTopics.length > 0 ? [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }] : [],
          linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
          siteId: publicSiteId,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        if (availableTopics.length > 0) {
          await feedApiHelper.validateFeedResponseTopics(feedResponse);
        }
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Combination Feed on Public Site Dashboard
        const updatedText = 'Hello Nation';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Combination Feed on Public Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Topics on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42589'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with topics on private site',
          zephyrTestId: 'CONT-42589',
          storyId: 'CONT-42589',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Get topic list
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        if (availableTopics.length === 0) {
          throw new Error('No topics available');
        }

        // Create feed with existing topic
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with topic on private site',
          topics: [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }],
          siteId: privateSite.siteId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTopics(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with Topics on Private Site Dashboard
        const updatedText = 'Updated feed with topic';
        const { textJson, textHtml } = buildFeedReplyText(updatedText, {
          topics: [{ id: availableTopics[0].topic_id, name: availableTopics[0].name }],
        });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Topics on Private Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Topics on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-37704'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with topics on unlisted site',
          zephyrTestId: 'CONT-42588',
          storyId: 'CONT-42588',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Get topic list
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        if (availableTopics.length === 0) {
          throw new Error('No topics available');
        }

        // Create feed with existing topic
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with topic on unlisted site',
          topics: [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }],
          siteId: unlistedSite.siteId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTopics(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with Topics on Unlisted Site Dashboard
        const updatedText = 'Updated feed with topic';
        const { textJson, textHtml } = buildFeedReplyText(updatedText, {
          topics: [{ id: availableTopics[0].topic_id, name: availableTopics[0].name }],
        });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Topics on Unlisted Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with User Mentions on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-33867'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with user mentions on private site',
          zephyrTestId: 'CONT-33867',
          storyId: 'CONT-33867',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Get user info for mention
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed with user mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with user mention on private site',
          userMention: { id: userInfo.userId, label: userInfo.fullName },
          siteId: privateSite.siteId,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with User Mentions on Private Site Dashboard
        const userMentions = [{ id: userInfo.userId, label: userInfo.fullName }];
        const { textJson, textHtml } = buildFeedReplyText('', { userMentions });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponseUserMentions(updatedFeedResult, userMentions);

        //Delete Feed with User Mentions on Private Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with User Mentions on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-33864'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with user mentions on unlisted site',
          zephyrTestId: 'CONT-33864',
          storyId: 'CONT-33864',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Get user info for mention
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed with user mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with user mention on unlisted site',
          userMention: { id: userInfo.userId, label: userInfo.fullName },
          siteId: unlistedSite.siteId,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with User Mentions on Unlisted Site Dashboard
        const userMentions = [{ id: userInfo.userId, label: userInfo.fullName }];
        const { textJson, textHtml } = buildFeedReplyText('', { userMentions });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponseUserMentions(updatedFeedResult, userMentions);

        //Delete Feed with User Mentions on Unlisted Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Site Mentions on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-33863'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with site mentions on private site',
          zephyrTestId: 'CONT-33863',
          storyId: 'CONT-33863',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Get another site for mention (try different access types if same access type returns same site)
        let mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!mentionedSite || mentionedSite.siteId === privateSite.siteId) {
          // Try public site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        }
        if (!mentionedSite || mentionedSite.siteId === privateSite.siteId) {
          // Try unlisted site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        }
        if (!mentionedSite || mentionedSite.siteId === privateSite.siteId) {
          throw new Error('No additional site available for mention');
        }

        // Create feed with site mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with site mention on private site',
          siteMention: { id: mentionedSite.siteId, label: mentionedSite.name },
          siteId: privateSite.siteId,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with Site Mentions on Private Site Dashboard
        const siteMentions = [{ id: mentionedSite.siteId, label: mentionedSite.name }];
        const { textJson, textHtml } = buildFeedReplyText('', { siteMentions });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponseSiteMentions(updatedFeedResult, siteMentions);

        //Delete Feed with Site Mentions on Private Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Site Mentions on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-25969'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with site mentions on unlisted site',
          zephyrTestId: 'CONT-25969',
          storyId: 'CONT-25969',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Get another site for mention (try different access types if same access type returns same site)
        let mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!mentionedSite || mentionedSite.siteId === unlistedSite.siteId) {
          // Try public site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        }
        if (!mentionedSite || mentionedSite.siteId === unlistedSite.siteId) {
          // Try private site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        }
        if (!mentionedSite || mentionedSite.siteId === unlistedSite.siteId) {
          throw new Error('No additional site available for mention');
        }

        // Create feed with site mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with site mention on unlisted site',
          siteMention: { id: mentionedSite.siteId, label: mentionedSite.name },
          siteId: unlistedSite.siteId,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with Site Mentions on Unlisted Site Dashboard
        const siteMentions = [{ id: mentionedSite.siteId, label: mentionedSite.name }];
        const { textJson, textHtml } = buildFeedReplyText('', { siteMentions });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponseSiteMentions(updatedFeedResult, siteMentions);

        //Delete Feed with Site Mentions on Unlisted Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Embedded URL on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CCONT-42606'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with embedded URL on private site',
          zephyrTestId: 'CONT-42606',
          storyId: 'CONT-42606',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Create feed with embedded URL
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with embedded URL on private site',
          linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
          siteId: privateSite.siteId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with Embedded URL on Private Site Dashboard
        const updatedText = 'Updated feed with embedded URL';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Embedded URL on Private Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Embedded URL on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42604'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with embedded URL on unlisted site',
          zephyrTestId: 'CONT-42604',
          storyId: 'CONT-42604',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Create feed with embedded URL
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with embedded URL on unlisted site',
          linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
          siteId: unlistedSite.siteId,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with Embedded URL on Unlisted Site Dashboard
        const updatedText = 'Updated feed with embedded URL';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Embedded URL on Unlisted Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Combination Feed on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42605'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with combination features on private site',
          zephyrTestId: 'CONT-42605',
          storyId: 'CONT-42605',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Get user and site info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        // Get another site for mention (try different access types if same access type returns same site)
        let mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!mentionedSite || mentionedSite.siteId === privateSite.siteId) {
          // Try public site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        }
        if (!mentionedSite || mentionedSite.siteId === privateSite.siteId) {
          // Try unlisted site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        }
        if (!mentionedSite || mentionedSite.siteId === privateSite.siteId) {
          throw new Error('No additional site available for mention');
        }
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];

        // Create combination feed with all features
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Hello World',
          emoji: { name: 'grin', emoji: '😀' },
          siteMention: { id: mentionedSite.siteId, label: mentionedSite.name },
          userMention: { id: userInfo.userId, label: userInfo.fullName },
          topics:
            availableTopics.length > 0 ? [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }] : [],
          linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
          siteId: privateSite.siteId,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        if (availableTopics.length > 0) {
          await feedApiHelper.validateFeedResponseTopics(feedResponse);
        }
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Combination Feed on Private Site Dashboard
        const updatedText = 'Hello Nation';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Combination Feed on Private Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Combination Feed on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42594'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with combination features on unlisted site',
          zephyrTestId: 'CONT-42594',
          storyId: 'CONT-42594',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Get user and site info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        // Get another site for mention (try different access types if same access type returns same site)
        let mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!mentionedSite || mentionedSite.siteId === unlistedSite.siteId) {
          // Try public site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        }
        if (!mentionedSite || mentionedSite.siteId === unlistedSite.siteId) {
          // Try private site
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        }
        if (!mentionedSite || mentionedSite.siteId === unlistedSite.siteId) {
          throw new Error('No additional site available for mention');
        }
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];

        // Create combination feed with all features
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Hello World',
          emoji: { name: 'grin', emoji: '😀' },
          siteMention: { id: mentionedSite.siteId, label: mentionedSite.name },
          userMention: { id: userInfo.userId, label: userInfo.fullName },
          topics:
            availableTopics.length > 0 ? [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }] : [],
          linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
          siteId: unlistedSite.siteId,
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        if (availableTopics.length > 0) {
          await feedApiHelper.validateFeedResponseTopics(feedResponse);
        }
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Combination Feed on Unlisted Site Dashboard
        const updatedText = 'Hello Nation';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Combination Feed on Unlisted Site Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Multiple Topics on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-33856'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with multiple topics on home dashboard',
          zephyrTestId: 'CONT-33856',
          storyId: 'CONT-33856',
        });

        // Get topic list
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        if (availableTopics.length < 2) {
          throw new Error('At least 2 topics required for this test');
        }

        // Create feed with multiple topics
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with multiple topics',
          topics: [
            { id: availableTopics[0].topic_id, label: availableTopics[0].name },
            { id: availableTopics[1].topic_id, label: availableTopics[1].name },
          ],
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTopics(feedResponse);

        //Edit Delete Feed with Multiple Topics on Home Dashboard
        const updatedText = 'Updated feed with multiple topics';
        const { textJson, textHtml } = buildFeedReplyText(updatedText, {
          topics: [
            { id: availableTopics[0].topic_id, name: availableTopics[0].name },
            { id: availableTopics[1].topic_id, name: availableTopics[1].name },
          ],
        });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Multiple Topics on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Multiple User Mentions on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-26614'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with multiple user mentions on home dashboard',
          zephyrTestId: 'CONT-26614',
          storyId: 'CONT-26614',
        });

        // Get user info for mentions
        const user1 = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const user2 = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.siteManager.email);

        // Create feed with multiple user mentions
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with multiple user mentions',
          userMention: { id: user1.userId, label: user1.fullName },
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);

        //Edit Delete Feed with Multiple User Mentions on Home Dashboard
        const userMentions = [
          { id: user1.userId, label: user1.fullName },
          { id: user2.userId, label: user2.fullName },
        ];
        const { textJson, textHtml } = buildFeedReplyText('', { userMentions });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponseUserMentions(updatedFeedResult, userMentions);

        //Delete Feed with Multiple User Mentions on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager Add Edit Delete Feed with Multiple Site Mentions on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-20935'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with multiple site mentions on home dashboard',
          zephyrTestId: 'CONT-20935',
          storyId: 'CONT-20935',
        });

        // Get sites for mentions
        const site1Id = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        const site2 = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!site1Id || !site2) {
          throw new Error('At least 2 sites required for this test');
        }

        // Create feed with multiple site mentions
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with multiple site mentions',
          siteMention: { id: site1Id, label: DEFAULT_PUBLIC_SITE_NAME },
        });

        // Get app manager info for validation
        const appManagerInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(
          feedResponse,
          appManagerInfo.userId,
          appManagerInfo.fullName
        );
        await feedApiHelper.validateFeedResponseMentions(feedResponse);

        //Edit Delete Feed with Multiple Site Mentions on Home Dashboard
        const siteMentions = [
          { id: site1Id, label: DEFAULT_PUBLIC_SITE_NAME },
          { id: site2.siteId, label: site2.name },
        ];
        const { textJson, textHtml } = buildFeedReplyText('', { siteMentions });
        const updatedFeedResult = await appManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponseSiteMentions(updatedFeedResult, siteMentions);

        //Delete Feed with Multiple Site Mentions on Home Dashboard
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'app Manager should fail to create blank Feed Post on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42983'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed creation with blank text should fail',
          zephyrTestId: 'CONT-42983',
          storyId: 'CONT-42983',
        });

        // Try to create feed with empty text - should fail
        await feedApiHelper.validateCreateBlankFeedError(async payload => {
          return await appManagerApiFixture.feedManagementHelper.feedManagementService.createFeed(payload);
        });
      }
    );

    test(
      'app Manager should fail to delete already deleted Feed Post on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-42982'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of App manager Feed deletion of already deleted feed should fail',
          zephyrTestId: 'CONT-42982',
          storyId: 'CONT-42982',
        });

        // Create a feed first
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
        });

        const feedResponse = await appManagerApiFixture.feedManagementHelper.createFeed(feedTestData);
        const feedId = feedResponse.result?.feedId;

        if (!feedId) {
          throw new Error('Failed to create feed for deletion test');
        }

        // Delete the feed
        await appManagerApiFixture.feedManagementHelper.deleteFeed(feedId);

        // Try to delete again - should fail
        await feedApiHelper.validateDeleteAlreadyDeletedFeedError(async () => {
          await appManagerApiFixture.feedManagementHelper.deleteFeed(feedId);
        });
      }
    );
  }
);
