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
   * @returns Promise with the API response
   */
  async enableQuestionAnswer() {
    return await test.step('Enable Question & Answer feature', async () => {
      // Get current app configuration
      const currentConfig = await this.feedManagementService.getAppConfig();

      console.log('Current Q&A status:', currentConfig.result.isQuestionAnswerEnabled);

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

      return responseBody;
    });
  }
}
