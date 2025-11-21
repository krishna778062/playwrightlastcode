import { faker } from '@faker-js/faker';
import { APIRequestContext, test } from '@playwright/test';

import { FeedMode } from '@core/types/feedManagement.types';

import { ContentManagementService } from '@/src/modules/content/apis/services/ContentManagementService';
import {
  buildFeedTextJsonAndTextHtml,
  buildFeedTextWithTopicMentions,
  FeedManagementService,
} from '@/src/modules/content/apis/services/FeedManagementService';
import { EnterpriseSearchHelper } from '@/src/modules/global-search/apis/helpers/enterpriseSearchHelper';

interface CreatedFeed {
  feedId: string;
}

export class FeedManagementHelper {
  private feeds: CreatedFeed[] = [];
  readonly feedManagementService: FeedManagementService;
  readonly contentManagementService: ContentManagementService;
  constructor(
    readonly appManagerApiContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.feedManagementService = new FeedManagementService(appManagerApiContext, baseUrl);
    this.contentManagementService = new ContentManagementService(appManagerApiContext, baseUrl);
  }

  /**
   * Creates a feed with retry mechanism (max 2 retries)
   * @param createFeed - Function that creates the feed
   * @returns Promise with the created feed response
   */
  private async createFeedWithRetry<T>(createFeed: () => Promise<T>): Promise<T> {
    const maxRetries = 2;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await createFeed();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          console.error(`Feed creation failed after ${maxRetries + 1} attempts. Last error:`, lastError.message);
          throw lastError;
        }

        const delay = (attempt + 1) * 1000; // 1s, 2s delays
        console.warn(
          `Feed creation attempt ${attempt + 1} failed. Retrying in ${delay}ms... Error:`,
          lastError.message
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Creates a new feed with optional attachment.
   * Includes retry mechanism with max 2 retries for failed feed creation.
   * @returns An object containing details of the created feed.
   */
  async createFeed(
    params:
      | {
          scope: string;
          siteId?: string;
          contentId?: string;
          text?: string;
          withAttachment?: false;
          fileName?: undefined;
          fileSize?: undefined;
          mimeType?: undefined;
          filePath?: undefined;
          options?: { waitForSearchIndex?: boolean };
          listOfTopics?: string[];
        }
      | {
          scope: string;
          siteId?: string;
          contentId?: string;
          text?: string;
          withAttachment: true;
          fileName: string;
          fileSize: number;
          mimeType: string;
          filePath: string; // Required when withAttachment is true
          options?: { waitForSearchIndex?: boolean };
          listOfTopics?: string[];
        }
  ) {
    const stepMessage = params.withAttachment ? 'Creating a new feed with attachments' : 'Creating a new feed';

    return await test.step(stepMessage, async () => {
      const feedName = params.text || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Feed`;

      // Build text with topic mentions if topics are provided
      let textJson: string;
      let textHtml: string;

      if (params.listOfTopics && params.listOfTopics.length > 0) {
        // Get topic IDs for proper mention formatting
        const topicList = await this.contentManagementService.getTopicList();
        const topicObjects = params.listOfTopics.map(topicName => {
          const topic = topicList.result?.listOfItems?.find((t: { name: string }) => t.name === topicName);
          return {
            id: topic?.topic_id || '',
            name: topicName,
          };
        });

        const { textJson: topicTextJson, textHtml: topicTextHtml } = buildFeedTextWithTopicMentions(
          feedName,
          topicObjects
        );
        textJson = topicTextJson;
        textHtml = topicTextHtml;
      } else {
        const { textJson: baseTextJson, textHtml: baseTextHtml } = buildFeedTextJsonAndTextHtml(feedName);
        textJson = baseTextJson;
        textHtml = baseTextHtml;
      }

      // Use Playwright's polling mechanism for retry
      const response = await this.createFeedWithRetry(async () => {
        if (params.withAttachment) {
          return await this.feedManagementService.createFeedWithAttachment(
            params.fileName,
            params.fileSize,
            params.mimeType,
            params.filePath,
            {
              textJson,
              textHtml,
              scope: params.scope,
              siteId: params.siteId || null,
              contentId: params.contentId || null,
              ignoreToxic: false,
              type: 'post',
              variant: 'standard',
            }
          );
        } else {
          return await this.feedManagementService.createFeed({
            textJson,
            textHtml,
            scope: params.scope,
            siteId: params.siteId || null,
            contentId: params.contentId || null,
            listOfAttachedFiles: [],
            ignoreToxic: false,
            type: 'post',
            variant: 'standard',
          });
        }
      });

      const feedId = response.result.feedId;

      if (params.options?.waitForSearchIndex !== false) {
        await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
          apiClient: this.feedManagementService.httpClient,
          searchTerm: feedName,
          objectType: 'feed',
          fieldToCheck: 'excerpt',
        });
      }

      this.feeds.push({ feedId });

      // Return the API response with feedName added for convenience
      return { ...response, feedName };
    });
  }

  /**
   * Creates a feed with all features: emoji, site mention, user mention, topic mentions,
   * formatted bullet list (bold, italic, strikethrough, underline), nested list with link, and attachments
   * @param params Configuration parameters for the feed with all features
   * @returns Promise with the created feed response
   *
   * @example
   * const feedResponse = await feedHelper.createWithAllFeatures({
   *   baseText: 'Add a Feed',
   *   emoji: { name: 'monkey', emoji: '🐒' },
   *   siteMention: { id: '34a91ba1-2982-48d1-9c0a-1f6f5b674f37', label: 'Public_subscription_site' },
   *   userMention: { id: 'd18d9abc-88d8-486a-a034-d8451cf2e7f5', label: 'Application Manager1' },
   *   topics: [
   *     { id: 'new_topicCreat', label: 'topicCreat' },
   *     { id: '2b92cfc0-21d9-4da4-a663-f09314b12741', label: 'best practices' }
   *   ],
   *   linkUrl: 'https://www.youtube.com/watch?v=F_77M3ZZ1z8',
   *   listOfAttachedFiles: [{ fileId: '421a335e-9d97-47ad-b0d3-e88d8eabb878', provider: 'intranet', size: 187288, name: 'boitumelo-_8gR561QtEA-unsplash', type: 'JPEG' }],
   *   scope: 'public',
   *   siteId: null
   * });
   */
  async createWithAllFeatures(params: {
    baseText?: string;
    emoji?: { name: string; emoji: string };
    siteMention?: { id: string; label: string };
    userMention?: { id: string; label: string };
    topics?: { id: string; label: string }[];
    linkUrl?: string;
    listOfAttachedFiles?: Array<{
      fileId: string;
      provider: string;
      size: number;
      name: string;
      type: string;
      thumbnail?: string;
    }>;
    scope?: string;
    siteId?: string | null;
    contentId?: string | null;
    ignoreToxic?: boolean;
    type?: string;
    variant?: string;
  }) {
    return await test.step('Creating a feed with all features', async () => {
      const response = await this.createFeedWithRetry(() => this.feedManagementService.createWithAllFeatures(params));

      const feedId = response.result?.feedId;
      if (feedId) {
        this.feeds.push({ feedId });
      }

      return response;
    });
  }

  /**
   * Cleans up all feeds created by this helper instance.
   */
  async cleanup() {
    await test.step('Cleaning up feeds', async () => {
      for (const { feedId } of this.feeds) {
        if (feedId) {
          await this.feedManagementService.deleteFeed(feedId);
        }
      }
    });
  }

  async deleteFeed(feedId: string) {
    await this.feedManagementService.deleteFeed(feedId);
  }

  /**
   * Adds a comment/reply to a feed post
   * @param feedId - The ID of the feed post to comment on
   * @param commentData - The comment data including textHtml, textJson, etc.
   * @returns Promise with the API response
   */
  async addComment(
    feedId: string,
    commentData: {
      textHtml: string;
      textJson: string;
      listOfAttachedFiles: any[];
      ignoreToxic: boolean;
    }
  ) {
    return await test.step(`Adding comment to feed ${feedId}`, async () => {
      const response = await this.feedManagementService.addComment(feedId, commentData);
      const responseBody = await response.json();
      return responseBody;
    });
  }

  /**
   * Configures app governance settings for feeds and content
   * @param settings - Optional governance settings to override defaults
   * @returns Promise with the API response
   */
  async configureAppGovernance(
    settings?: Partial<{
      isExpertiseAppManagerControlled: boolean;
      isHomeAppManagerControlled: boolean;
      isSiteAppManagerControlled: boolean;
      isExpertiseCreateAppManagerControlled: boolean;
      feedMode: FeedMode;
      autoGovValidationPeriod: number;
      autoGovernanceEnabled: boolean;
      contentSubmissionsEnabled: boolean;
      feedOnContentEnabled: boolean;
      isExpertiseEnabled: boolean;
      isHomeCarouselEnabled: boolean;
      isSiteCarouselEnabled: boolean;
      allowFileUpload: string;
      siteFilePermission: string;
      htmlTileEnabled: boolean;
      isNativeVideoAutoPlayEnabled: boolean;
      allowFileShareWithPublicLink: boolean;
      enablePersonalizedContentEmails: boolean;
      feedPlaceholder: string;
      isFeedPlaceholderDefault: boolean;
      sitesToUploadFiles: string[];
      privacyPolicy: {
        isPPEnabled: boolean;
        isPPLinkCustom: boolean;
        ppLink: string;
        isPPLabelCustom: boolean;
        ppLabel: string;
      };
      termsOfService: {
        isTOSEnabled: boolean;
        isTOSLinkCustom: boolean;
        tosLink: string;
        isTOSLabelCustom: boolean;
        tosLabel: string;
      };
      takeLegalAcknowledgement: boolean;
    }>,
    feedMode?: FeedMode
  ) {
    return await test.step('Configuring app governance settings', async () => {
      const response = await this.feedManagementService.configureAppGovernance(settings, feedMode);
      const responseBody = await response.json();
      console.log('App governance configuration completed:', responseBody);
      return responseBody;
    });
  }

  /**
   * Gets the current app configuration
   * @returns Promise with the app configuration response
   */
  async getAppConfig() {
    return await test.step('Getting app configuration', async () => {
      const response = await this.feedManagementService.getAppConfig();
      return response;
    });
  }

  /**
   * Sets one language in app configuration
   * Gets current config, preserves all settings, and sets selectedLanguages to [1]
   * @returns Promise with the API response
   */
  async setOneLanguage() {
    return await test.step('Setting one language in app configuration', async () => {
      // Get current app configuration
      const currentConfig = await this.feedManagementService.getAppConfig();

      // Prepare update payload preserving all current values except selectedLanguages
      const updatePayload = {
        appName: currentConfig.result.appName,
        automatedTranslationEnabled: currentConfig.result.automatedTranslationEnabled,
        availableContentTypes: currentConfig.result.availableContentTypes,
        addToCalendar: currentConfig.result.addToCalendar,
        feedbackRecipients: currentConfig.result.feedbackRecipients || [],
        enableSmsNotifications: currentConfig.result.enableSmsNotifications,
        enablePushNotificationMobile: currentConfig.result.enablePushNotificationMobile,
        selectedLanguages: [1], // Set to one language (language ID 1)
        orgChartEnabled: currentConfig.result.orgChartEnabled,
        isSmartWritingEnabled: currentConfig.result.isSmartWritingEnabled,
        isSmartAnswerEnabled: currentConfig.result.isSmartAnswerEnabled,
        isContentAiSummaryEnabled: currentConfig.result.isContentAiSummaryEnabled,
        isMultilingualModelEnabled: currentConfig.result.isMultilingualModelEnabled,
        calendarOffice365Url: currentConfig.result.calendarOffice365Url || '',
        isContentFeaturePromotionEnabled: currentConfig.result.isContentFeaturePromotionEnabled,
        isQuestionAnswerEnabled: currentConfig.result.isQuestionAnswerEnabled,
        isNewsletterTranslationEnabled: currentConfig.result.isNewsletterTranslationEnabled,
      };

      // Update app configuration
      const response = await this.feedManagementService.updateAppConfig(updatePayload);

      const responseBody = await response.json();
      console.log('App configuration updated with one language. Response:', JSON.stringify(responseBody, null, 2));

      return responseBody;
    });
  }

  /**
   * Enables Q&A feature by getting current app config and updating it with isQuestionAnswerEnabled: true
   * This preserves all other existing settings while ensuring Q&A is always enabled
   * Retries up to 2 times if the feature is not enabled successfully
   * @returns Promise with the API response
   */
  async enableQuestionAnswer() {
    return await test.step('Enable Question & Answer feature', async () => {
      const maxRetries = 2;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // Get current app configuration
          const currentConfig = await this.feedManagementService.getAppConfig();

          if (attempt === 0) {
            console.log('Current Q&A status:', currentConfig.result.isQuestionAnswerEnabled);
          } else {
            console.log(`Retry attempt ${attempt} to enable Q&A feature`);
          }

          // Prepare update payload with all current values except isQuestionAnswerEnabled
          const updatePayload = {
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
            isContentFeaturePromotionEnabled: currentConfig.result.isContentFeaturePromotionEnabled,
            isQuestionAnswerEnabled: true, // Always set to true
            isNewsletterTranslationEnabled: currentConfig.result.isNewsletterTranslationEnabled,
          };

          // Update app configuration
          const response = await this.feedManagementService.updateAppConfig(updatePayload);

          const responseBody = await response.json();
          console.log('Q&A enabled successfully. Response:', JSON.stringify(responseBody, null, 2));

          // Wait a bit to ensure Q&A is properly enabled
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Verify Q&A is enabled
          const verifyConfig = await this.feedManagementService.getAppConfig();
          if (!verifyConfig.result.isQuestionAnswerEnabled) {
            throw new Error('Q&A feature was not enabled successfully');
          }

          // Success - return the response
          return responseBody;
        } catch (error) {
          lastError = error as Error;
          console.log(`Attempt ${attempt + 1} failed:`, lastError.message);

          // If this is not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      // If we get here, all attempts failed
      throw new Error(
        `Q&A feature was not enabled successfully after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
      );
    });
  }

  /**
   * Upvotes a question via API
   * @param questionId - The question ID to upvote
   * @returns Promise with the reaction response
   */
  async upvoteQuestion(questionId: string): Promise<any> {
    return await test.step(`Upvoting question ${questionId}`, async () => {
      const response = await this.feedManagementService.upvoteQuestion(questionId);
      return response;
    });
  }

  /**
   * Removes upvote from a question via API
   * @param questionId - The question ID to remove upvote from
   * @returns Promise with the reaction response
   */
  async removeUpvoteFromQuestion(questionId: string): Promise<any> {
    return await test.step(`Removing upvote from question ${questionId}`, async () => {
      const response = await this.feedManagementService.removeUpvoteFromQuestion(questionId);
      return response;
    });
  }

  /**
   * Creates an answer on a question
   * @param questionId - The question ID to answer
   * @param answerText - The answer text
   * @returns Promise with the answer response
   */
  async createAnswer(questionId: string, answerText: string): Promise<any> {
    return await test.step(`Creating answer on question ${questionId} via helper`, async () => {
      const { textJson, textHtml } = buildFeedTextJsonAndTextHtml(answerText);
      return await this.feedManagementService.createAnswer(questionId, {
        textJson,
        textHtml,
        listOfAttachedFiles: [],
        ignoreToxic: false,
      });
    });
  }

  /**
   * Updates an answer on a question
   * @param questionId - The question ID
   * @param answerId - The answer ID to update
   * @param updatedAnswerText - The updated answer text
   * @returns Promise with the updated answer response
   */
  async updateAnswer(questionId: string, answerId: string, updatedAnswerText: string): Promise<any> {
    return await test.step(`Updating answer ${answerId} on question ${questionId} via helper`, async () => {
      const { textJson, textHtml } = buildFeedTextJsonAndTextHtml(updatedAnswerText);
      return await this.feedManagementService.updateAnswer(questionId, answerId, {
        textJson,
        textHtml,
        listOfAttachedFiles: [],
        ignoreToxic: false,
      });
    });
  }

  /**
   * Deletes an answer on a question
   * @param questionId - The question ID
   * @param answerId - The answer ID to delete
   * @returns Promise with the delete response
   */
  async deleteAnswer(questionId: string, answerId: string): Promise<any> {
    return await test.step(`Deleting answer ${answerId} on question ${questionId} via helper`, async () => {
      return await this.feedManagementService.deleteAnswer(questionId, answerId);
    });
  }

  /**
   * Upvotes an answer on a question
   * @param questionId - The question ID
   * @param answerId - The answer ID to upvote
   * @returns Promise with the upvote response
   */
  async upvoteAnswer(questionId: string, answerId: string): Promise<any> {
    return await test.step(`Upvoting answer ${answerId} on question ${questionId} via helper`, async () => {
      return await this.feedManagementService.upvoteAnswer(questionId, answerId);
    });
  }

  /**
   * Removes upvote from an answer on a question
   * @param questionId - The question ID
   * @param answerId - The answer ID to remove upvote from
   * @returns Promise with the remove upvote response
   */
  async removeUpvoteFromAnswer(questionId: string, answerId: string): Promise<any> {
    return await test.step(`Removing upvote from answer ${answerId} on question ${questionId} via helper`, async () => {
      return await this.feedManagementService.removeUpvoteFromAnswer(questionId, answerId);
    });
  }

  /**
   * Fetches answers for a question
   * @param questionId - The question ID
   * @param options - Optional query parameters
   * @returns Promise with the answers response
   */
  async fetchAnswers(
    questionId: string,
    options?: { size?: number; nextPageToken?: string; sortBy?: string }
  ): Promise<any> {
    return await test.step(`Fetching answers for question ${questionId} via helper`, async () => {
      return await this.feedManagementService.fetchAnswers(questionId, options);
    });
  }

  /**
   * Builds a question payload with mandatory fields only
   * @param title - The question title
   * @param scope - The scope ('public' for home feed, 'site' for site feed)
   * @param siteId - Optional site ID (required for site feed)
   * @returns CreateQuestionPayload
   */
  buildQuestionPayloadWithMandatoryFields(
    title: string,
    scope: 'public' | 'site',
    siteId?: string | null
  ): import('@core/types/feed.type').CreateQuestionPayload {
    return {
      title,
      textJson: JSON.stringify({ type: 'doc', content: [] }),
      textHtml: '',
      scope,
      siteId: scope === 'site' ? siteId || null : null,
      listOfAttachedFiles: [],
      ignoreToxic: false,
      type: 'question',
      variant: 'standard',
    };
  }

  /**
   * Builds a question payload with all fields (mentions, links, topics, formatting)
   * @param title - The question title
   * @param scope - The scope ('public' for home feed, 'site' for site feed)
   * @param siteId - Optional site ID (required for site feed)
   * @param options - Optional fields for mentions, links, topics, and formatting
   * @returns CreateQuestionPayload
   */
  buildQuestionPayloadWithAllFields(
    title: string,
    scope: 'public' | 'site',
    siteId?: string | null,
    options?: {
      userInfo?: { userId: string; fullName: string };
      topic?: { name: string; topicId?: string };
      linkUrl?: string;
      includeOrderedList?: boolean;
    }
  ): import('@core/types/feed.type').CreateQuestionPayload {
    const {
      userInfo,
      topic,
      linkUrl = 'https://www.pinterest.com/pin/21532904463411701/',
      includeOrderedList = false,
    } = options || {};

    const textJsonContent: any[] = [];

    // Add user mention with bold text
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

    // Add link
    if (linkUrl) {
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
    }

    // Add ordered list if requested
    if (includeOrderedList) {
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
    }

    // Add topic mention
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

    // Build textHtml
    let textHtml = '';
    if (userInfo) {
      textHtml += `<p><strong>When? </strong><span data-type="user" data-id="${userInfo.userId}" data-label="${userInfo.fullName}"><a href="/people/${userInfo.userId}" target="_blank">@${userInfo.fullName}</a></span><span> </span></p>`;
    }
    if (linkUrl) {
      textHtml += `<p><a target="_blank" rel="noopener noreferrer nofollow" href="${linkUrl}">LINK</a></p>`;
    }
    if (includeOrderedList) {
      textHtml += '<p>List</p><ol><li><p>Ordered List</p></li></ol>';
    }
    if (topic) {
      textHtml += `<p><span data-type="topic" data-id="new_${topic.name}" data-label="${topic.name}"><a href="/topic/new_${topic.name}" target="_blank">#${topic.name}</a></span> </p>`;
    }

    return {
      title,
      textJson: JSON.stringify({ type: 'doc', content: textJsonContent }),
      textHtml: textHtml || '<p></p>',
      scope,
      siteId: scope === 'site' ? siteId || null : null,
      listOfAttachedFiles: [],
      ignoreToxic: false,
      type: 'question',
      variant: 'standard',
    };
  }
}
