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
  buildFeedWithAllFeatures,
} from '@/src/modules/content/apis/services/FeedManagementService';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  '@FeedAPI - End User',
  {
    tag: [ContentTestSuite.API, ContentTestSuite.FEED_STANDARD_USER],
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
      'end User Add Edit Delete Text Feed Post on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-39588'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation, edit and delete on home Page',
          zephyrTestId: 'CONT-39588',
          storyId: 'CONT-39588',
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

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, feedTestData.text);

        //Edit Text Feed Post
        const updatedText = feedTestData.text + ' Edit Feed Text only';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Text Feed Post
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User Add Edit Delete Text with Special Characters on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-33433'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with special characters on home',
          zephyrTestId: 'CONT-33433',
          storyId: 'CONT-33433',
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
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, specialCharsText);

        //Edit Delete Text Feed with Special Characters
        const updatedText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?%^&* -updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Text Feed with Special Characters
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User Add Edit Delete Text Feed Post with Emojis on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-5444'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with emojis on home',
          zephyrTestId: 'CONT-5444',
          storyId: 'CONT-5444',
        });

        // Create feed with emoji using generateFeedWithAllFeatures
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with emoji',
          emoji: { name: 'grin', emoji: '😀' },
          siteId: null,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);

        //Edit Delete Text Feed with Emojis
        const updatedText = 'Test feed with emoji - Updated 😀';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Text Feed with Emojis
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User Add Edit Delete Text Feed with html Tags Feed Post on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-10641'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with HTML tags on home',
          zephyrTestId: 'CONT-10641',
          storyId: 'CONT-10641',
        });

        // Generate feed test data with HTML tags
        const htmlText = '<p>Test with HTML tags</p><b>Bold text</b><i>Italic text</i>';
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          withAttachment: false,
          waitForSearchIndex: false,
        });
        feedTestData.text = htmlText;

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);

        //Edit Delete Text Feed with HTML Tags
        const updatedText = '<p>Updated HTML text</p><b>Updated Bold</b>';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Text Feed with HTML Tags
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User Add Edit Delete New Topic Feed on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-10620'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with new topic on home',
          zephyrTestId: 'CONT-10620',
          storyId: 'CONT-10620',
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
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTopics(feedResponse);

        //Edit Delete New Topic Feed
        const updatedText = 'Test feed with new topic - Updated';
        const { textJson: updatedTextJson, textHtml: updatedTextHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = (await standardUserApiFixture.feedManagementHelper.feedManagementService.updatePost(
          feedResponse.result?.feedId,
          {
            textJson: updatedTextJson,
            textHtml: updatedTextHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        )) as unknown as FeedResult;

        // Validate the update response
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete New Topic Feed
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User Add Edit Delete Existing Topic Feed on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-10835'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with existing topic on home',
          zephyrTestId: 'CONT-10835',
          storyId: 'CONT-10835',
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
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseTopics(feedResponse);

        //Edit Delete Existing Topic Feed
        const updatedText = existingTopic.name + ' - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Existing Topic Feed
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User Add Edit Delete Feed post with User Mentions on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-11288'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with user mention on home',
          zephyrTestId: 'CONT-11288',
          storyId: 'CONT-11288',
        });

        // Get user info for mention
        const mentionUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Create feed with user mention
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with user mention',
          userMention: { id: mentionUserInfo.userId, label: mentionUserInfo.fullName },
          siteId: null,
        });

        // Get end user info for validation
        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, endUserInfo.userId, endUserInfo.fullName);
        await feedApiHelper.validateFeedResponseMentions(feedResponse);

        //Edit Delete User Mention Feed
        const { textJson, textHtml } = buildFeedTextWithUserMentions('', [
          { id: mentionUserInfo.userId, label: mentionUserInfo.fullName },
        ]);
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
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
          { id: mentionUserInfo.userId, label: mentionUserInfo.fullName },
        ]);

        //Delete User Mention Feed
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User Add Edit Delete Feed post with Site Mentions on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-12302'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with site mention on home',
          zephyrTestId: 'CONT-12302',
          storyId: 'CONT-12302',
        });

        // Get public site for mention
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
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
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseMentions(feedResponse);

        //Edit Delete Site Mention Feed
        const { textJson, textHtml } = buildFeedTextWithSiteMentions('', [
          { id: publicSiteId, label: DEFAULT_PUBLIC_SITE_NAME },
        ]);
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
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
          { id: publicSiteId, label: DEFAULT_PUBLIC_SITE_NAME },
        ]);

        //Delete Site Mention Feed
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User Add Edit Delete Feed with Embedded URL on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-25351'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with embedded URL on home',
          zephyrTestId: 'CONT-25351',
          storyId: 'CONT-25351',
        });

        // Create feed with embedded URL
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with embedded URL',
          linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
          siteId: null,
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseLinks(feedResponse);

        //Edit Delete Feed with Embedded URL
        const updatedText = 'Updated feed with embedded URL';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Feed with Embedded URL
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User Add Edit Delete Combination Feed on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-25286'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with combination features on home',
          zephyrTestId: 'CONT-25286',
          storyId: 'CONT-25286',
        });

        // Get user info for mentions and validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const mentionUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.appManager.email
        );

        // Get topic list for topic mentions
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        const topics =
          availableTopics.length >= 1 ? [{ id: availableTopics[0].topic_id, label: availableTopics[0].name }] : [];

        // Get a public site for site mention (optional)
        let siteMention;
        try {
          const publicSiteId =
            await appManagerApiFixture.siteManagementHelper.searchSiteAndActivateIfNeeded(DEFAULT_PUBLIC_SITE_NAME);
          if (publicSiteId) {
            siteMention = { id: publicSiteId, label: DEFAULT_PUBLIC_SITE_NAME };
          }
        } catch (error) {
          log.warn('Could not get public site for mention', error);
        }

        // Upload file first to get fileId for attachment
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

        // Generate feed test data with all features
        const feedTestData = fileId
          ? TestDataGenerator.generateFeedWithAllFeatures({
              scope: 'public',
              baseText: 'Add a Feed',
              emoji: { name: 'monkey', emoji: '🐒' },
              siteMention: siteMention,
              userMention: { id: mentionUserInfo.userId, label: mentionUserInfo.fullName },
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
              userMention: { id: mentionUserInfo.userId, label: mentionUserInfo.fullName },
              topics: topics,
              linkUrl: FEED_TEST_DATA.URLS.EMBED_YOUTUBE_URL,
              siteId: null,
            });

        // Create feed using API with all features
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);

        // Additional validations for all features
        if (topics.length > 0) {
          await feedApiHelper.validateFeedResponseTopics(feedResponse);
        }
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        if (fileId) {
          await feedApiHelper.validateFeedResponseFiles(feedResponse);
        }
        await feedApiHelper.validateFeedResponseLinks(feedResponse);

        //Edit Delete Combination Feed
        const updatedText = 'Updated combination feed';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson,
            textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedText);

        //Delete Combination Feed
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'end User should fail to create blank Feed Post on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-11310'],
      },
      async ({ standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed creation with blank text should fail',
          zephyrTestId: 'CONT-11310',
          storyId: 'CONT-11310',
        });

        // Try to create feed with empty text - should fail
        await feedApiHelper.validateCreateBlankFeedError(async payload => {
          return await standardUserApiFixture.feedManagementHelper.feedManagementService.createFeed(payload);
        });
      }
    );

    test(
      'end User should fail to delete already deleted Feed Post on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-11637'],
      },
      async ({ standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of End User Feed deletion of already deleted feed should fail',
          zephyrTestId: 'CONT-11637',
          storyId: 'CONT-11637',
        });

        // Create a feed first
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
        });

        const feedResponse = await standardUserApiFixture.feedManagementHelper.createFeed(feedTestData);
        const feedId = feedResponse.result?.feedId;

        if (!feedId) {
          throw new Error('Failed to create feed for deletion test');
        }

        // Delete the feed
        await standardUserApiFixture.feedManagementHelper.deleteFeed(feedId);

        // Try to delete again - should fail
        await feedApiHelper.validateDeleteAlreadyDeletedFeedError(async () => {
          await standardUserApiFixture.feedManagementHelper.deleteFeed(feedId);
        });
      }
    );

    test(
      'end User Add Edit Delete Editor - Bold, Italic, Underline, Strike, bullets, Emojies, Link Feed Post on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_STANDARD_USER, '@CONT-43150'],
      },
      async ({ standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'API Validation of End User Feed creation with Editor formatting (Bold, Italic, Underline, Strike, bullets, Emojies, Link) on home',
          zephyrTestId: 'CONT-43150',
          storyId: 'CONT-43150',
        });

        // Create feed with all editor formatting features
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'public',
          baseText: 'Test feed with editor formatting',
          emoji: { name: 'smile', emoji: '😊' },
          linkUrl: 'https://www.example.com',
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create feed using API
        const feedResponse = await standardUserApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);

        //Edit Editor Feed Post
        const updatedBaseText = 'Updated test feed with editor formatting';
        const updatedFeedPayload = buildFeedWithAllFeatures({
          scope: 'public',
          baseText: updatedBaseText,
          emoji: { name: 'heart', emoji: '❤️' },
          linkUrl: 'https://www.updated-example.com',
        });
        const updatedFeedResult = await standardUserApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson: updatedFeedPayload.textJson,
            textHtml: updatedFeedPayload.textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedBaseText);

        //Delete Editor Feed Post
        await standardUserApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );
  }
);
