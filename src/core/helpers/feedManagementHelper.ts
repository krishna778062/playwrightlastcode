import { faker } from '@faker-js/faker';
import { test } from '@playwright/test';

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
   * Creates a new feed with optional attachment.
   * @returns An object containing details of the created feed.
   */
  async createFeed(params: {
    scope: string;
    siteId?: string;
    text?: string;
    withAttachment?: boolean;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    options?: { waitForSearchIndex?: boolean };
  }) {
    const { scope, siteId, text, withAttachment = false, fileName, fileSize, mimeType, options } = params;
    const stepMessage = withAttachment ? 'Creating a new feed with attachments' : 'Creating a new feed';

    return await test.step(stepMessage, async () => {
      const feedName = text || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Feed`;
      const { textJson, textHtml } = buildFeedTextJsonAndTextHtml(feedName);

      let response;
      if (withAttachment) {
        // Use default values if not provided
        const defaultFileName = fileName || '300x300 RATIO_Text.png';
        const defaultFileSize = fileSize || 12125;
        const defaultMimeType = mimeType || 'image/png';

        response = await this.appManagerApiClient
          .getFeedManagementService()
          .createFeedWithAttachment(defaultFileName, defaultFileSize, defaultMimeType, {
            textJson,
            textHtml,
            scope: scope,
            siteId: siteId || null,
            ignoreToxic: false,
            type: 'post',
            variant: 'standard',
          });
      } else {
        response = await this.appManagerApiClient.getFeedManagementService().createFeed({
          textJson,
          textHtml,
          scope: scope,
          siteId: siteId || null,
          listOfAttachedFiles: [],
          ignoreToxic: false,
          type: 'post',
          variant: 'standard',
        });
      }

      const feedId = response.result.feedId;

      if (options?.waitForSearchIndex !== false) {
        await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
          apiClient: this.appManagerApiClient,
          searchTerm: feedName,
          objectType: 'feed',
          fieldToCheck: 'excerpt',
        });
      }

      this.feeds.push({ feedId });

      // Return the full API response for compatibility
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
          await this.appManagerApiClient.getFeedManagementService().deleteFeed(feedId);
        }
      }
    });
  }

  async deleteFeed(feedId: string) {
    await this.appManagerApiClient.getFeedManagementService().deleteFeed(feedId);
  }
}
