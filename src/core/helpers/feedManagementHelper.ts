import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

import { FeedMode } from '@core/types/feedManagement.types';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { buildFeedTextJsonAndTextHtml } from '@/src/core/api/services/FeedManagementService';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';

interface CreatedFeed {
  feedId: string;
}

export class FeedManagementHelper {
  private feeds: CreatedFeed[] = [];
  constructor(private appManagerApiClient: AppManagerApiClient) {}

  /**
   * Creates a feed with retry mechanism using Playwright's polling
   * @param feedCreationFn - Function that creates the feed
   * @returns Promise with the created feed response
   */
  private async createFeedWithRetry<T>(feedCreationFn: () => Promise<T>): Promise<T> {
    const result = await expect.poll(
      async () => {
        try {
          return await feedCreationFn();
        } catch (error) {
          // Throw error to indicate failure, polling will retry
          console.warn('Feed creation attempt failed, retrying...', (error as Error).message);
          throw error;
        }
      },
      {
        message: 'Feed creation should succeed',
        timeout: 10000, // 10 seconds total timeout
        intervals: [1000, 2000], // Retry after 1s, then 2s (max 2 retries)
      }
    );

    return result as T;
  }

  /**
   * Creates a new feed with optional attachment.
   * Uses Playwright's polling mechanism for retry with max 2 retries.
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
        }
  ) {
    const stepMessage = params.withAttachment ? 'Creating a new feed with attachments' : 'Creating a new feed';

    return await test.step(stepMessage, async () => {
      const feedName = params.text || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Feed`;
      const { textJson, textHtml } = buildFeedTextJsonAndTextHtml(feedName);

      // Use Playwright's polling mechanism for retry
      const response = await this.createFeedWithRetry(async () => {
        if (params.withAttachment) {
          return await this.appManagerApiClient
            .getFeedManagementService()
            .createFeedWithAttachment(params.fileName, params.fileSize, params.mimeType, params.filePath, {
              textJson,
              textHtml,
              scope: params.scope,
              siteId: params.siteId || null,
              contentId: params.contentId || null,
              ignoreToxic: false,
              type: 'post',
              variant: 'standard',
            });
        } else {
          return await this.appManagerApiClient.getFeedManagementService().createFeed({
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
          apiClient: this.appManagerApiClient,
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
          await this.appManagerApiClient.getFeedManagementService().deleteFeed(feedId);
        }
      }
    });
  }

  async deleteFeed(feedId: string) {
    await this.appManagerApiClient.getFeedManagementService().deleteFeed(feedId);
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
      const response = await this.appManagerApiClient.getFeedManagementService().addComment(feedId, commentData);
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
      const response = await this.appManagerApiClient
        .getFeedManagementService()
        .configureAppGovernance(settings, feedMode);
      const responseBody = await response.json();
      console.log('App governance configuration completed:', responseBody);
      return responseBody;
    });
  }
}
