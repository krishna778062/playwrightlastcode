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
  buildFeedReplyText,
  buildFeedTextWithSiteMentions,
  buildFeedTextWithUserMentions,
} from '@/src/modules/content/apis/services/FeedManagementService';

test.describe(
  '@FeedAPI',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    test.beforeEach(async ({ appManagerApiFixture }) => {
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
        const feedApiHelper = new FeedApiHelper();
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, specialCharsText);

        //Add Edit Delete Text Feed Reply with Special Characters on Home Dashboard
        const updatedText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?%^&* -updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        // Note: updatePost returns FeedResult (responseBody.result) despite being typed as FeedPostResponse
        const updatedFeedResult = (await appManagerApiFixture.feedManagementHelper.feedManagementService.updatePost(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        )) as unknown as FeedResult;

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
        const feedApiHelper = new FeedApiHelper();
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);

        //Edit Delete Text Feed Reply with Emojis Feed Post on Home Dashboard
        const updatedText = 'Test feed with emoji - Updated 😀';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = (await appManagerApiFixture.feedManagementHelper.feedManagementService.updatePost(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        )) as unknown as FeedResult;

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
        const feedApiHelper = new FeedApiHelper();
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
        const feedApiHelper = new FeedApiHelper();
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTopics(feedResponse);

        //Edit Delete Existing Topic Feed on Home Dashboard
        const updatedText = existingTopic.name + ' - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = (await appManagerApiFixture.feedManagementHelper.feedManagementService.updatePost(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        )) as unknown as FeedResult;
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
        const feedApiHelper = new FeedApiHelper();
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
        const updatedFeedResult = (await appManagerApiFixture.feedManagementHelper.feedManagementService.updatePost(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        )) as unknown as FeedResult;

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
        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        if (!publicSite) {
          throw new Error('No public site available for mention');
        }

        // Create feed with site mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with site mention',
          siteMention: { id: publicSite.siteId, label: publicSite.name },
          siteId: null,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.appManager.email);

        // Create feed using API
        const feedResponse = await appManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        const feedApiHelper = new FeedApiHelper();
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseMentions(feedResponse);

        // Get public site for mention
        const updateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        if (!updateSite) {
          throw new Error('No public site available for mention');
        }

        // Build update payload with site mentions
        const { textJson, textHtml } = buildFeedTextWithSiteMentions('', [
          { id: updateSite.siteId, label: updateSite.name },
        ]);
        const updatedFeedResult = (await appManagerApiFixture.feedManagementHelper.feedManagementService.updatePost(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        )) as unknown as FeedResult;

        // Validate the update response contains site mentions
        await feedApiHelper.validateFeedUpdateResponseSiteMentions(updatedFeedResult, [
          { id: updateSite.siteId, label: updateSite.name },
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
        const feedApiHelper = new FeedApiHelper();
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseLinks(feedResponse);

        //Edit Delete Site Mention Feed on Home Dashboard
        const updatedText = 'Test feed with site mention - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = (await appManagerApiFixture.feedManagementHelper.feedManagementService.updatePost(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        )) as unknown as FeedResult;
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);
        await appManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );
  }
);
