import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { log } from '@core/utils/logger';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FeedApiHelper } from '@/src/modules/content/apis/apiValidation/feedApiHelper';
import {
  buildAttachmentObject,
  buildFeedReplyText,
  buildFeedWithAllFeatures,
} from '@/src/modules/content/apis/services/FeedManagementService';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';

test.describe(
  '@FeedAPI - Site Manager',
  {
    tag: [ContentTestSuite.API, ContentTestSuite.FEED_APP_MANAGER],
  },
  () => {
    let feedApiHelper: FeedApiHelper;

    test.beforeEach(async ({ appManagerApiFixture, siteManagerApiFixture }) => {
      //Initialize feedApiHelper
      feedApiHelper = new FeedApiHelper();
      //Enable feed mode
      await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
        feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      });
    });

    test.afterEach(async ({ appManagerApiFixture, siteManagerApiFixture }) => {
      // Cleanup if needed
      try {
        await appManagerApiFixture.feedManagementHelper.cleanup();
      } catch (error) {
        log.warn('Feed cleanup failed', error);
      }
      try {
        await siteManagerApiFixture.feedManagementHelper.cleanup();
      } catch (error) {
        log.warn('Feed cleanup failed', error);
      }
    });

    test(
      'site Manager Add Edit Delete Text Feed on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-15552'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with text on public site',
          zephyrTestId: 'CONT-15552',
          storyId: 'CONT-15552',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Get user info for validation (site manager role)
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.siteManager.email
        );

        // Generate feed test data for site
        const feedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: publicSiteId,
          withAttachment: false,
          waitForSearchIndex: false,
        });

        // Create feed using API with siteManagerApiFixture
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, feedTestData.text);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Text Feed on Public Site Dashboard
        const updatedText = 'Updated text feed on public site';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Text Feed on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-14902'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with text on private site',
          zephyrTestId: 'CONT-14902',
          storyId: 'CONT-14902',
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, feedTestData.text);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Text Feed on Private Site Dashboard
        const updatedText = 'Updated text feed on private site';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Text Feed on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-15553'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with text on unlisted site',
          zephyrTestId: 'CONT-15553',
          storyId: 'CONT-15553',
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, feedTestData.text);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Text Feed on Unlisted Site Dashboard
        const updatedText = 'Updated text feed on unlisted site';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Feed with Special Characters on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-19539'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with special characters on public site',
          zephyrTestId: 'CONT-19539',
          storyId: 'CONT-19539',
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, specialCharsText);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with Special Characters on Public Site Dashboard
        const updatedText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?%^&* -updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Feed with Special Characters on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-19542'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with special characters on private site',
          zephyrTestId: 'CONT-19542',
          storyId: 'CONT-19542',
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, specialCharsText);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with Special Characters on Private Site Dashboard
        const updatedText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?%^&* -updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Feed with Special Characters on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-19543'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with special characters on unlisted site',
          zephyrTestId: 'CONT-19543',
          storyId: 'CONT-19543',
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createFeed(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseTextJson(feedResponse, specialCharsText);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with Special Characters on Unlisted Site Dashboard
        const updatedText = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?%^&* -updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Feed with Emojis on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-19545'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with emojis on public site',
          zephyrTestId: 'CONT-19545',
          storyId: 'CONT-19545',
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with Emojis on Public Site Dashboard
        const updatedText = 'Updated feed with emoji 😅';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Feed with Emojis on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-20585'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with emojis on private site',
          zephyrTestId: 'CONT-20585',
          storyId: 'CONT-20585',
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with Emojis on Private Site Dashboard
        const updatedText = 'Updated feed with emoji 😅';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Feed with Emojis on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-20882'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with emojis on unlisted site',
          zephyrTestId: 'CONT-20882',
          storyId: 'CONT-20882',
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with Emojis on Unlisted Site Dashboard
        const updatedText = 'Updated feed with emoji 😅';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Feed with File Attachment on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-21603'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with file attachment on public site',
          zephyrTestId: 'CONT-21603',
          storyId: 'CONT-21603',
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
          const uploadResponse = await siteManagerApiFixture.feedManagementHelper.uploadImage(
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseFiles(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Feed with File Attachment on Public Site Dashboard
        // Upload a new image for the update
        let updatedFileId: string | undefined;
        try {
          const uploadResponse = await siteManagerApiFixture.feedManagementHelper.uploadImage(
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
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Feed with File Attachment on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-21604'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with file attachment on private site',
          zephyrTestId: 'CONT-21604',
          storyId: 'CONT-21604',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Upload file first to get fileId for attachment
        let fileId: string | undefined;
        try {
          const uploadResponse = await siteManagerApiFixture.feedManagementHelper.uploadImage(
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseFiles(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Feed with File Attachment on Private Site Dashboard
        const updatedText = 'Test feed with file attachment on private site - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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

        //Delete Feed with File Attachment on Private Site Dashboard
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Feed with File Attachment on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-22139'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with file attachment on unlisted site',
          zephyrTestId: 'CONT-22139',
          storyId: 'CONT-22139',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Upload file first to get fileId for attachment
        let fileId: string | undefined;
        try {
          const uploadResponse = await siteManagerApiFixture.feedManagementHelper.uploadImage(
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseFiles(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Feed with File Attachment on Unlisted Site Dashboard
        const updatedText = 'Test feed with file attachment on unlisted site - Updated';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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

        //Delete Feed with File Attachment on Unlisted Site Dashboard
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Combination Feed on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-22405'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with combination features on public site',
          zephyrTestId: 'CONT-22405',
          storyId: 'CONT-22405',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Get user and site info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        // Get another site for mention
        let mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        if (!mentionedSite || mentionedSite.siteId === publicSiteId) {
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        }
        if (!mentionedSite || mentionedSite.siteId === publicSiteId) {
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        if (availableTopics.length > 0) {
          await feedApiHelper.validateFeedResponseTopics(feedResponse);
        }
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Delete Combination Feed on Public Site Dashboard
        const updatedText = 'Hello Nation';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Combination Feed on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-24648'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with combination features on private site',
          zephyrTestId: 'CONT-24648',
          storyId: 'CONT-24648',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Get user and site info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        // Get another site for mention
        let mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!mentionedSite || mentionedSite.siteId === privateSite.siteId) {
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        }
        if (!mentionedSite || mentionedSite.siteId === privateSite.siteId) {
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        if (availableTopics.length > 0) {
          await feedApiHelper.validateFeedResponseTopics(feedResponse);
        }
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Delete Combination Feed on Private Site Dashboard
        const updatedText = 'Hello Nation';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Combination Feed on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-35811'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with combination features on unlisted site',
          zephyrTestId: 'CONT-35811',
          storyId: 'CONT-35811',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Get user and site info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        // Get another site for mention
        let mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!mentionedSite || mentionedSite.siteId === unlistedSite.siteId) {
          mentionedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public');
        }
        if (!mentionedSite || mentionedSite.siteId === unlistedSite.siteId) {
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

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseMentions(feedResponse);
        if (availableTopics.length > 0) {
          await feedApiHelper.validateFeedResponseTopics(feedResponse);
        }
        await feedApiHelper.validateFeedResponseLinks(feedResponse);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Delete Combination Feed on Unlisted Site Dashboard
        const updatedText = 'Hello Nation';
        const { textJson, textHtml } = buildFeedReplyText(updatedText);
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
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
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Editor - Bold, Italic, Underline, Strike, bullets, Emojies, Link Feed Post on Public Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-43152'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with Editor formatting on public site',
          zephyrTestId: 'CONT-43152',
          storyId: 'CONT-43152',
        });

        // Get or create a public site
        const publicSiteId =
          await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);
        if (!publicSiteId) {
          throw new Error('No public site available');
        }

        // Create feed with all editor formatting features
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with editor formatting on public site',
          siteId: publicSiteId,
          emoji: { name: 'smile', emoji: '😊' },
          linkUrl: 'https://www.example.com',
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.siteManager.email
        );

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, publicSiteId);

        //Edit Editor Feed Post
        const updatedBaseText = 'Updated test feed with editor formatting on public site';
        const updatedFeedPayload = buildFeedWithAllFeatures({
          scope: 'site',
          baseText: updatedBaseText,
          siteId: publicSiteId,
          emoji: { name: 'heart', emoji: '❤️' },
          linkUrl: 'https://www.updated-example.com',
        });
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson: updatedFeedPayload.textJson,
            textHtml: updatedFeedPayload.textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: publicSiteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedBaseText);

        //Delete Editor Feed Post
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Editor - Bold, Italic, Underline, Strike, bullets, Emojies, Link Feed Post on Private Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-43151'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with Editor formatting on private site',
          zephyrTestId: 'CONT-43151',
          storyId: 'CONT-43151',
        });

        // Get or create a private site
        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private');
        if (!privateSite) {
          throw new Error('No private site available');
        }

        // Create feed with all editor formatting features
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with editor formatting on private site',
          siteId: privateSite.siteId,
          emoji: { name: 'smile', emoji: '😊' },
          linkUrl: 'https://www.example.com',
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.siteManager.email
        );

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, privateSite.siteId);

        //Edit Editor Feed Post
        const updatedBaseText = 'Updated test feed with editor formatting on private site';
        const updatedFeedPayload = buildFeedWithAllFeatures({
          scope: 'site',
          baseText: updatedBaseText,
          siteId: privateSite.siteId,
          emoji: { name: 'heart', emoji: '❤️' },
          linkUrl: 'https://www.updated-example.com',
        });
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson: updatedFeedPayload.textJson,
            textHtml: updatedFeedPayload.textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: privateSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedBaseText);

        //Delete Editor Feed Post
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );

    test(
      'site Manager Add Edit Delete Editor - Bold, Italic, Underline, Strike, bullets, Emojies, Link Feed Post on Unlisted Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.FEED_APP_MANAGER, '@CONT-43153'],
      },
      async ({ appManagerApiFixture, siteManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'API Validation of Site Manager Feed creation with Editor formatting on unlisted site',
          zephyrTestId: 'CONT-43153',
          storyId: 'CONT-43153',
        });

        // Get or create an unlisted site
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted');
        if (!unlistedSite) {
          throw new Error('No unlisted site available');
        }

        // Create feed with all editor formatting features
        const feedTestData = TestDataGenerator.generateFeedWithAllFeatures({
          scope: 'site',
          baseText: 'Test feed with editor formatting on unlisted site',
          siteId: unlistedSite.siteId,
          emoji: { name: 'smile', emoji: '😊' },
          linkUrl: 'https://www.example.com',
        });

        // Get user info for validation
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.siteManager.email
        );

        // Create feed using API
        const feedResponse = await siteManagerApiFixture.feedManagementHelper.createWithAllFeatures(feedTestData);

        // Validate the Feed response
        await feedApiHelper.validateFeedResponseBasic(feedResponse);
        await feedApiHelper.validateFeedResponseAuthoredBy(feedResponse, userInfo.userId, userInfo.fullName);
        await feedApiHelper.validateFeedResponseSiteId(feedResponse, unlistedSite.siteId);

        //Edit Editor Feed Post
        const updatedBaseText = 'Updated test feed with editor formatting on unlisted site';
        const updatedFeedPayload = buildFeedWithAllFeatures({
          scope: 'site',
          baseText: updatedBaseText,
          siteId: unlistedSite.siteId,
          emoji: { name: 'heart', emoji: '❤️' },
          linkUrl: 'https://www.updated-example.com',
        });
        const updatedFeedResult = await siteManagerApiFixture.feedManagementHelper.updateFeed(
          feedResponse.result?.feedId,
          {
            textJson: updatedFeedPayload.textJson,
            textHtml: updatedFeedPayload.textHtml,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            siteId: unlistedSite.siteId,
          }
        );
        await feedApiHelper.validateFeedUpdateResponse(updatedFeedResult, feedResponse.result?.feedId, updatedBaseText);

        //Delete Editor Feed Post
        await siteManagerApiFixture.feedManagementHelper.deleteFeed(updatedFeedResult.feedId);
      }
    );
  }
);
