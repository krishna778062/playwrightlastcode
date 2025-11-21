import { expect } from '@playwright/test';

import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { CreateQuestionPayload } from '@/src/core/types/feed.type';
import { QAndAApiHelper } from '@/src/modules/content/apis/apiValidation/qAndAApiHelper';

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

        const questionPayload: CreateQuestionPayload = {
          title: questionTitle,
          textJson: JSON.stringify({ type: 'doc', content: [] }),
          textHtml: '',
          scope: 'public',
          siteId: null,
          listOfAttachedFiles: [],
          ignoreToxic: false,
          type: 'question',
          variant: 'standard',
        };

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
        const linkUrl = 'https://www.pinterest.com/pin/21532904463411701/';

        // Build textJson with mentions, links, and formatting
        const textJsonContent: any[] = [];

        if (userInfo) {
          textJsonContent.push({
            type: 'paragraph',
            attrs: { className: '', 'data-sw-sid': null },
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'When? ' },
              {
                type: 'UserAndSiteMention',
                attrs: { id: userInfo.userId, label: userInfo.fullName, type: 'user' },
              },
              { type: 'text', marks: [{ type: 'textStyle', attrs: { className: '' } }], text: ' ' },
            ],
          });
        }

        textJsonContent.push({
          type: 'paragraph',
          attrs: { className: '', 'data-sw-sid': null },
          content: [
            {
              type: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: linkUrl,
                    target: '_blank',
                    rel: 'noopener noreferrer nofollow',
                    class: null,
                    alt: null,
                    align: null,
                    display: 'inline',
                    isButton: null,
                  },
                },
              ],
              text: 'LINK',
            },
          ],
        });

        textJsonContent.push({
          type: 'paragraph',
          attrs: { className: '', 'data-sw-sid': null },
          content: [{ type: 'text', text: 'List' }],
        });

        textJsonContent.push({
          type: 'orderedList',
          attrs: { start: 1, className: '', 'data-sw-sid': null },
          content: [
            {
              type: 'listItem',
              attrs: { 'data-sw-sid': null },
              content: [
                {
                  type: 'paragraph',
                  attrs: { className: '', 'data-sw-sid': null },
                  content: [{ type: 'text', text: 'Ordered List' }],
                },
              ],
            },
          ],
        });

        if (topic) {
          textJsonContent.push({
            type: 'paragraph',
            attrs: { className: '', 'data-sw-sid': null },
            content: [
              {
                type: 'TopicMention',
                attrs: { id: `new_${topic.name}`, label: topic.name, type: 'topic' },
              },
              { type: 'text', text: ' ' },
            ],
          });
        }

        const questionPayload: CreateQuestionPayload = {
          title: questionTitle,
          textJson: JSON.stringify({ type: 'doc', content: textJsonContent }),
          textHtml:
            '<p><strong>When? </strong><span data-type="user" data-id="' +
            userInfo.userId +
            '" data-label="' +
            userInfo.fullName +
            '"><a href="/people/' +
            userInfo.userId +
            '" target="_blank">@' +
            userInfo.fullName +
            '</a></span><span> </span></p><p><a target="_blank" rel="noopener noreferrer nofollow" href="' +
            linkUrl +
            '">LINK</a></p><p>List</p><ol><li><p>Ordered List</p></li></ol><p><span data-type="topic" data-id="new_' +
            (topic?.name || '') +
            '" data-label="' +
            (topic?.name || '') +
            '"><a href="/topic/new_' +
            (topic?.name || '') +
            '" target="_blank">#' +
            (topic?.name || '') +
            '</a></span> </p>',
          scope: 'public',
          siteId: null,
          listOfAttachedFiles: [],
          ignoreToxic: false,
          type: 'question',
          variant: 'standard',
        };

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
        const questionPayload: CreateQuestionPayload = {
          title: questionTitle,
          textJson: JSON.stringify({ type: 'doc', content: [] }),
          textHtml: '',
          scope: 'public',
          siteId: null,
          listOfAttachedFiles: [],
          ignoreToxic: false,
          type: 'question',
          variant: 'standard',
        };

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
        const questionPayload: CreateQuestionPayload = {
          title: questionTitle,
          textJson: JSON.stringify({ type: 'doc', content: [] }),
          textHtml: '',
          scope: 'public',
          siteId: null,
          listOfAttachedFiles: [],
          ignoreToxic: false,
          type: 'question',
          variant: 'standard',
        };

        const createResponse =
          await appManagerApiFixture.feedManagementHelper.feedManagementService.createQuestion(questionPayload);
        const questionId = createResponse.result.feedId;
        createdQuestionIds.push(questionId);

        // Step 1: Upvote the question
        await test.step('Upvote the question and verify', async () => {
          const upvoteResponse = await appManagerApiFixture.feedManagementHelper.upvoteQuestion(questionId);
          await qAndAApiHelper.validateUpvoteResponse(upvoteResponse);
        });

        // Step 2: Remove upvote from the question
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
        const questionPayload: CreateQuestionPayload = {
          title: questionTitle,
          textJson: JSON.stringify({ type: 'doc', content: [] }),
          textHtml: '',
          scope: 'public',
          siteId: null,
          listOfAttachedFiles: [],
          ignoreToxic: false,
          type: 'question',
          variant: 'standard',
        };

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

        // Step 1: Enable Q&A
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

          expect(enableResponse.ok(), 'Enable Q&A should be successful').toBe(true);

          // Verify Q&A is enabled
          const verifyEnabledConfig =
            await appManagerApiFixture.feedManagementHelper.feedManagementService.getAppConfig();
          expect(verifyEnabledConfig.result.isQuestionAnswerEnabled, 'isQuestionAnswerEnabled should be true').toBe(
            true
          );
        });

        // Step 2: Disable Q&A
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

          expect(disableResponse.ok(), 'Disable Q&A should be successful').toBe(true);

          // Verify Q&A is disabled
          const verifyDisabledConfig =
            await appManagerApiFixture.feedManagementHelper.feedManagementService.getAppConfig();
          expect(verifyDisabledConfig.result.isQuestionAnswerEnabled, 'isQuestionAnswerEnabled should be false').toBe(
            false
          );
        });
      }
    );
  }
);
