import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { QAndAApiHelper } from '@/src/modules/content/apis/apiValidation/qAndAApiHelper';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';

test.describe(
  '@Q&A API',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    let createdQuestionIds: string[] = [];
    let qAndAApiHelper: QAndAApiHelper;

    test.beforeEach(async ({ appManagerApiFixture }) => {
      // Enable Q&A feature before each test
      await appManagerApiFixture.feedManagementHelper.enableQuestionAnswer();
      qAndAApiHelper = new QAndAApiHelper();
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup: Delete all created questions
      for (const questionId of createdQuestionIds) {
        try {
          await appManagerApiFixture.feedManagementHelper.feedManagementService.deleteQuestion(questionId);
        } catch (error) {
          console.warn(`Failed to delete question ${questionId}:`, error);
        }
      }
      createdQuestionIds = [];
    });

    test(
      'create Question with Mandatory Field',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33548', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Create Question with Mandatory Field on home feed',
          zephyrTestId: 'CONT-33548',
          storyId: 'CONT-33548',
        });

        const questionTitle = `Question on Home Feed ${TestDataGenerator.generateRandomString()}`;

        // Build question payload with mandatory fields using helper
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'public',
          null
        );

        const questionResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);

        createdQuestionIds.push(questionResponse.result.feedId);

        // Validate the question response
        await qAndAApiHelper.validateQuestionCreation(questionResponse, 'Question on Home Feed');
      }
    );

    test(
      'create question with all fields without files',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33594', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Create question with all fields without files on home feed',
          zephyrTestId: 'CONT-33594',
          storyId: 'CONT-33594',
        });

        // Get user info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Get topic list for topic mentions
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        const topic = availableTopics.length > 0 ? availableTopics[0] : null;

        const questionTitle = TestDataGenerator.generateRandomText();

        // Build question payload with all fields using helper
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithAllFields(
          questionTitle,
          'public',
          null,
          {
            userInfo: userInfo ? { userId: userInfo.userId, fullName: userInfo.fullName } : undefined,
            topic: topic ? { name: topic.name, topicId: topic.topic_id } : undefined,
            includeOrderedList: true,
          }
        );

        const questionResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);

        createdQuestionIds.push(questionResponse.result.feedId);

        // Validate the question response
        await qAndAApiHelper.validateQuestionResponseBasic(questionResponse);
        await qAndAApiHelper.validateQuestionIdentification(questionResponse);
        await qAndAApiHelper.validateQuestionWithAllFields(questionResponse);
      }
    );

    test(
      'edit home feed question',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33593', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Edit home feed question',
          zephyrTestId: 'CONT-33593',
          storyId: 'CONT-33593',
        });

        // Create a question first
        const questionTitle = `Question on Home Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'public',
          null
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        // Edit the question
        const updatedTitle = `Updated Question ${TestDataGenerator.generateRandomString()}`;
        const updatedTextJson = JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { className: '', 'data-sw-sid': null },
              content: [{ type: 'text', text: 'Updated question body' }],
            },
          ],
        });

        const updateResponse = await appManagerApiFixture.feedManagementHelper.feedManagementService.updateQuestion(
          questionId,
          {
            title: updatedTitle,
            textJson: updatedTextJson,
            textHtml: '<p>Updated question body</p>',
            ignoreToxic: false,
            listOfAttachedFiles: [],
          }
        );

        // Validate the updated question
        await qAndAApiHelper.validateQuestionUpdate(updateResponse, 'Updated Question');
      }
    );

    test(
      'upvote and Remove upvote from a question',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33628', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Upvote a question and remove upvote from a question on home feed',
          zephyrTestId: 'CONT-33628',
          storyId: 'CONT-33628',
        });

        // Create a question first
        const questionTitle = `Question on Home Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'public',
          null
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        //  Upvote the question
        await test.step('Upvote the question and verify', async () => {
          const upvoteResponse = await appManagerApiFixture.feedManagementHelper.upvoteQuestion(questionId);
          await qAndAApiHelper.validateUpvoteResponse(upvoteResponse);
        });

        // : Remove upvote from the question
        await test.step('Remove upvote from the question and verify', async () => {
          const removeUpvoteResponse =
            await appManagerApiFixture.feedManagementHelper.removeUpvoteFromQuestion(questionId);
          await qAndAApiHelper.validateRemoveUpvoteResponse(removeUpvoteResponse);
        });
      }
    );

    test(
      'delete a Question',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33598', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Delete a question on home feed',
          zephyrTestId: 'CONT-33598',
          storyId: 'CONT-33598',
        });

        // Create a question first
        const questionTitle = `Question on Home Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'public',
          null
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;

        // Delete the question
        const deleteResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.deleteQuestion(questionId);

        // Validate the delete
        await qAndAApiHelper.validateQuestionDelete(deleteResponse);
        // Don't add to cleanup list since it's already deleted
      }
    );

    test(
      'update App settings - Enable and Disable Q&A',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33130', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Update App settings to enable and disable Q&A',
          zephyrTestId: 'CONT-33130',
          storyId: 'CONT-33130',
        });

        // Get current app configuration
        const currentConfig = await appManagerApiFixture.feedManagementHelper.feedManagementService.getAppConfig();

        //  Enable Q&A
        await test.step('Enable Q&A and verify', async () => {
          const enablePayload = {
            appName: currentConfig.result.appName,
            automatedTranslationEnabled: currentConfig.result.automatedTranslationEnabled,
            availableContentTypes: currentConfig.result.availableContentTypes,
            addToCalendar: currentConfig.result.addToCalendar,
            feedbackRecipients: currentConfig.result.feedbackRecipients,
            enableSmsNotifications: currentConfig.result.enableSmsNotifications,
            enablePushNotificationMobile: currentConfig.result.enablePushNotificationMobile,
            shareFeedback: currentConfig.result.shareFeedback,
            socialCampaignsPolicyUrl: currentConfig.result.socialCampaignsPolicyUrl,
            selectedLanguages: currentConfig.result.selectedLanguages.ids,
            orgChartEnabled: currentConfig.result.orgChartEnabled,
            isSmartWritingEnabled: currentConfig.result.isSmartWritingEnabled,
            isSmartAnswerEnabled: currentConfig.result.isSmartAnswerEnabled,
            isContentAiSummaryEnabled: currentConfig.result.isContentAiSummaryEnabled,
            isMultilingualModelEnabled: currentConfig.result.isMultilingualModelEnabled,
            calendarOffice365Enabled: currentConfig.result.calendarOffice365Enabled,
            calendarOffice365Url: currentConfig.result.calendarOffice365Url,
            isQuestionAnswerEnabled: true,
          };

          const enableResponse =
            await appManagerApiFixture.feedManagementHelper.feedManagementService.updateAppConfig(enablePayload);

          await qAndAApiHelper.validateUpdateAppConfigResponse(enableResponse);

          // Verify Q&A is enabled
          const verifyEnabledConfig =
            await appManagerApiFixture.feedManagementHelper.feedManagementService.getAppConfig();
          await qAndAApiHelper.validateQAndAEnabled(verifyEnabledConfig);
        });

        // : Disable Q&A
        await test.step('Disable Q&A and verify', async () => {
          const disableConfig = await appManagerApiFixture.feedManagementHelper.feedManagementService.getAppConfig();

          const disablePayload = {
            appName: disableConfig.result.appName,
            automatedTranslationEnabled: disableConfig.result.automatedTranslationEnabled,
            availableContentTypes: disableConfig.result.availableContentTypes,
            addToCalendar: disableConfig.result.addToCalendar,
            feedbackRecipients: disableConfig.result.feedbackRecipients,
            enableSmsNotifications: disableConfig.result.enableSmsNotifications,
            enablePushNotificationMobile: disableConfig.result.enablePushNotificationMobile,
            shareFeedback: disableConfig.result.shareFeedback,
            socialCampaignsPolicyUrl: disableConfig.result.socialCampaignsPolicyUrl,
            selectedLanguages: disableConfig.result.selectedLanguages.ids,
            orgChartEnabled: disableConfig.result.orgChartEnabled,
            isSmartWritingEnabled: disableConfig.result.isSmartWritingEnabled,
            isSmartAnswerEnabled: disableConfig.result.isSmartAnswerEnabled,
            isContentAiSummaryEnabled: disableConfig.result.isContentAiSummaryEnabled,
            isMultilingualModelEnabled: disableConfig.result.isMultilingualModelEnabled,
            calendarOffice365Enabled: disableConfig.result.calendarOffice365Enabled,
            calendarOffice365Url: disableConfig.result.calendarOffice365Url,
            isQuestionAnswerEnabled: false,
          };

          const disableResponse =
            await appManagerApiFixture.feedManagementHelper.feedManagementService.updateAppConfig(disablePayload);

          await qAndAApiHelper.validateUpdateAppConfigResponse(disableResponse);

          // Wait for the configuration to be updated
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Verify Q&A is disabled with retry
          await qAndAApiHelper.validateQAndADisabledWithRetry(
            () => appManagerApiFixture.feedManagementHelper.feedManagementService.getAppConfig(),
            2,
            2000
          );
        });
      }
    );

    test(
      'create question with all fields with unique file types',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33596', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Create question with all fields with unique file types on home feed',
          zephyrTestId: 'CONT-33596',
          storyId: 'CONT-33596',
        });

        // Get user info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Get topic list for topic mentions
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        const topic = availableTopics.length > 0 ? availableTopics[0] : null;

        const questionTitle = TestDataGenerator.generateRandomText();

        // Build question payload with all fields using helper
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithAllFields(
          questionTitle,
          'public',
          null,
          {
            userInfo: userInfo ? { userId: userInfo.userId, fullName: userInfo.fullName } : undefined,
            topic: topic ? { name: topic.name, topicId: topic.topic_id } : undefined,
          }
        );

        const questionResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);

        createdQuestionIds.push(questionResponse.result.feedId);

        // Validate the question response
        await qAndAApiHelper.validateQuestionResponseBasic(questionResponse);
        await qAndAApiHelper.validateQuestionIdentification(questionResponse);
        await qAndAApiHelper.validateQuestionWithAllFields(questionResponse);
      }
    );

    test(
      'create Question with Mandatory Field on site feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33642', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Create Question with Mandatory Field on site feed',
          zephyrTestId: 'CONT-33642',
          storyId: 'CONT-33642',
        });

        // Get or create a public site
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);

        const questionTitle = `Question on Site Feed ${TestDataGenerator.generateRandomString()}`;

        // Build question payload with mandatory fields using helper
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'site',
          siteInfo.siteId
        );

        const questionResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);

        createdQuestionIds.push(questionResponse.result.feedId);

        // Validate the question response
        await qAndAApiHelper.validateQuestionCreationOnSiteFeed(
          questionResponse,
          'Question on Site Feed',
          siteInfo.siteId
        );
      }
    );

    test(
      'create question with all fields without files on site feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33643', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Create question with all fields without files on site feed',
          zephyrTestId: 'CONT-33643',
          storyId: 'CONT-33643',
        });

        // Get or create a public site
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);

        // Get user info for mentions
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Get topic list for topic mentions
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        const topic = availableTopics.length > 0 ? availableTopics[0] : null;

        const questionTitle = TestDataGenerator.generateRandomText();

        // Build question payload with all fields using helper
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithAllFields(
          questionTitle,
          'site',
          siteInfo.siteId,
          {
            userInfo: userInfo ? { userId: userInfo.userId, fullName: userInfo.fullName } : undefined,
            topic: topic ? { name: topic.name, topicId: topic.topic_id } : undefined,
          }
        );

        const questionResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);

        createdQuestionIds.push(questionResponse.result.feedId);

        // Validate the question response
        await qAndAApiHelper.validateQuestionResponseBasic(questionResponse);
        await qAndAApiHelper.validateQuestionIdentification(questionResponse);
        await qAndAApiHelper.validateQuestionWithAllFields(questionResponse);
        await qAndAApiHelper.validateQuestionCreationOnSiteFeed(questionResponse, undefined, siteInfo.siteId);
      }
    );

    test(
      'edit feed question on site feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33644', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Edit feed question on site feed',
          zephyrTestId: 'CONT-33644',
          storyId: 'CONT-33644',
        });

        // Get or create a public site
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);

        // Create a question first
        const questionTitle = `Question on Site Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'site',
          siteInfo.siteId
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        // Edit the question
        const updatedTitle = `Updated Question ${TestDataGenerator.generateRandomString()}`;
        const updatedTextJson = JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { className: '', 'data-sw-sid': null },
              content: [{ type: 'text', text: 'Updated question body' }],
            },
          ],
        });

        const updateResponse = await appManagerApiFixture.feedManagementHelper.feedManagementService.updateQuestion(
          questionId,
          {
            title: updatedTitle,
            textJson: updatedTextJson,
            textHtml: '<p>Updated question body</p>',
            ignoreToxic: false,
            listOfAttachedFiles: [],
          }
        );

        // Validate the updated question
        await qAndAApiHelper.validateQuestionUpdate(updateResponse, 'Updated Question');
      }
    );

    test(
      'delete a Question on site feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33645', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Delete a question on site feed',
          zephyrTestId: 'CONT-33645',
          storyId: 'CONT-33645',
        });

        // Get or create a public site
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);

        // Create a question first
        const questionTitle = `Question on Site Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'site',
          siteInfo.siteId
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;

        // Delete the question
        const deleteResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.deleteQuestion(questionId);

        // Validate the delete
        await qAndAApiHelper.validateQuestionDelete(deleteResponse);
        // Don't add to cleanup list since it's already deleted
      }
    );

    test(
      'create Answer on a question',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33884', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Create Answer on a question',
          zephyrTestId: 'CONT-33884',
          storyId: 'CONT-33884',
        });

        // Create a question first
        const questionTitle = `Question on Home Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'public',
          null
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        // Create an answer
        const answerText = `This is an answer to the question ${TestDataGenerator.generateRandomString()}`;
        const answerResponse = await appManagerApiFixture.feedManagementHelper.createAnswer(questionId, answerText);

        // Validate the answer response
        await qAndAApiHelper.validateAnswerCreation(answerResponse);
      }
    );

    test(
      'edit Answer on a question and edit deleted Answer',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33891', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Edit Answer on a question and edit deleted Answer',
          zephyrTestId: 'CONT-33891',
          storyId: 'CONT-33891',
        });

        // Create a question first
        const questionTitle = `Question on Home Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'public',
          null
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        // Create an answer first
        const answerText = `This is an answer to the question ${TestDataGenerator.generateRandomString()}`;
        const answerResponse = await appManagerApiFixture.feedManagementHelper.createAnswer(questionId, answerText);
        const answerId = answerResponse.result.commentId;

        //  Edit the answer (positive scenario)
        await test.step('Edit the answer', async () => {
          const updatedAnswerText = `${answerText} @Edited`;
          const updateResponse = await appManagerApiFixture.feedManagementHelper.updateAnswer(
            questionId,
            answerId,
            updatedAnswerText
          );

          // Validate the updated answer
          await qAndAApiHelper.validateAnswerUpdate(updateResponse);
        });

        // Delete the answer and try to edit it (negative scenario)
        await test.step('Delete the answer and try to edit deleted answer', async () => {
          // Delete the answer
          await appManagerApiFixture.feedManagementHelper.deleteAnswer(questionId, answerId);

          // Try to edit the deleted answer - should fail
          let errorCaught = false;
          try {
            const updatedAnswerText = `${answerText} @Edited`;
            await appManagerApiFixture.feedManagementHelper.updateAnswer(questionId, answerId, updatedAnswerText);
          } catch (error: any) {
            errorCaught = true;
            // Validate error - should contain 404 or indicate failure
            await qAndAApiHelper.validateUpdateDeletedAnswerError(error);
          }
          await qAndAApiHelper.validateErrorCaughtForEditDeletedAnswer(errorCaught);
        });
      }
    );

    test(
      'upvote and Remove upvote from an answer',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33892', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Upvote an answer and remove upvote from an answer',
          zephyrTestId: 'CONT-33892',
          storyId: 'CONT-33892',
        });

        // Create a question first
        const questionTitle = `Question on Home Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'public',
          null
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        // Create an answer first
        const answerText = `This is an answer to the question ${TestDataGenerator.generateRandomString()}`;
        const answerResponse = await appManagerApiFixture.feedManagementHelper.createAnswer(questionId, answerText);
        const answerId = answerResponse.result.commentId;

        // Upvote the answer
        await test.step('Upvote the answer and verify', async () => {
          const upvoteResponse = await appManagerApiFixture.feedManagementHelper.upvoteAnswer(questionId, answerId);
          await qAndAApiHelper.validateAnswerUpvoteResponse(upvoteResponse);
        });

        // Remove upvote from the answer
        await test.step('Remove upvote from the answer and verify', async () => {
          const removeUpvoteResponse = await appManagerApiFixture.feedManagementHelper.removeUpvoteFromAnswer(
            questionId,
            answerId
          );
          await qAndAApiHelper.validateAnswerRemoveUpvoteResponse(removeUpvoteResponse);
        });
      }
    );

    test(
      'delete an Answer and delete an already Deleted Answer',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33849', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Delete an answer on a question and delete an already Deleted Answer',
          zephyrTestId: 'CONT-33849',
          storyId: 'CONT-33849',
        });

        // Create a question first
        const questionTitle = `Question on Home Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'public',
          null
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        // Create an answer first
        const answerText = `This is an answer to the question ${TestDataGenerator.generateRandomString()}`;
        const answerResponse = await appManagerApiFixture.feedManagementHelper.createAnswer(questionId, answerText);
        const answerId = answerResponse.result.commentId;

        //  Delete the answer (positive scenario)
        await test.step('Delete the answer', async () => {
          const deleteResponse = await appManagerApiFixture.feedManagementHelper.deleteAnswer(questionId, answerId);

          // Validate the delete
          await qAndAApiHelper.validateAnswerDelete(deleteResponse);
        });

        // : Try to delete the already deleted answer (negative scenario)
        await test.step('Try to delete the already deleted answer', async () => {
          // Try to delete the already deleted answer - should fail
          let errorCaught = false;
          try {
            await appManagerApiFixture.feedManagementHelper.deleteAnswer(questionId, answerId);
          } catch (error: any) {
            errorCaught = true;
            // Validate error - should contain 404 or indicate failure
            await qAndAApiHelper.validateDeleteAlreadyDeletedAnswerError(error);
          }
          await qAndAApiHelper.validateErrorCaughtForDeleteAlreadyDeletedAnswer(errorCaught);
        });
      }
    );

    test(
      'create Answer with all fields and files',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33889', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Create Answer with all fields and files for question with all fields and files',
          zephyrTestId: 'CONT-33889',
          storyId: 'CONT-33889',
        });

        // Create a question first with all fields
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const topicList = await appManagerApiFixture.contentManagementHelper.getTopicList();
        const availableTopics = topicList.result?.listOfItems || [];
        const topic = availableTopics.length > 0 ? availableTopics[0] : null;

        const questionTitle = TestDataGenerator.generateRandomText();
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithAllFields(
          questionTitle,
          'public',
          null,
          {
            userInfo: userInfo ? { userId: userInfo.userId, fullName: userInfo.fullName } : undefined,
            topic: topic ? { name: topic.name, topicId: topic.topic_id } : undefined,
          }
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        // Get site info for site mention
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);

        // Create an answer with all fields (mentions, topics, site mentions)
        const answerText = `This is a comprehensive answer ${TestDataGenerator.generateRandomString()}`;
        const answerResponse = await appManagerApiFixture.feedManagementHelper.createAnswerWithAllFields(
          questionId,
          answerText,
          {
            userInfo: userInfo ? { userId: userInfo.userId, fullName: userInfo.fullName } : undefined,
            siteInfo: { siteId: siteInfo.siteId, siteName: siteInfo.name },
            topic: topic ? { name: topic.name, topicId: topic.topic_id } : undefined,
          }
        );

        // Validate the answer response
        await qAndAApiHelper.validateAnswerCreation(answerResponse);
        await qAndAApiHelper.validateAnswerCreationWithAllFields(answerResponse);
      }
    );

    test(
      'fetch Answer - Question detail page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33893', ContentTestSuite.Q_AND_A],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Fetch Answer - Question detail page',
          zephyrTestId: 'CONT-33893',
          storyId: 'CONT-33893',
        });

        // Create a question first
        const questionTitle = `Question on Home Feed ${TestDataGenerator.generateRandomString()}`;
        const questionPayload = appManagerApiFixture.feedManagementHelper.buildQuestionPayloadWithMandatoryFields(
          questionTitle,
          'public',
          null
        );

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        // Create an answer first
        const answerText = `This is an answer to the question ${TestDataGenerator.generateRandomString()}`;
        const answerResponse = await appManagerApiFixture.feedManagementHelper.createAnswer(questionId, answerText);

        // Fetch answers for the question
        const fetchResponse = await appManagerApiFixture.feedManagementHelper.fetchAnswers(questionId, {
          size: 10,
          sortBy: 'createdAt',
        });

        // Validate the fetch response
        await qAndAApiHelper.validateFetchAnswersResponse(fetchResponse);
      }
    );
  }
);
