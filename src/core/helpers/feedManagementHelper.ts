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
  async createFeed(
    params:
      | {
          scope: string;
          siteId?: string;
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

      let response;
      if (params.withAttachment) {
        response = await this.appManagerApiClient
          .getFeedManagementService()
          .createFeedWithAttachment(params.fileName, params.fileSize, params.mimeType, params.filePath, {
            textJson,
            textHtml,
            scope: params.scope,
            siteId: params.siteId || null,
            ignoreToxic: false,
            type: 'post',
            variant: 'standard',
          });
      } else {
        response = await this.appManagerApiClient.getFeedManagementService().createFeed({
          textJson,
          textHtml,
          scope: params.scope,
          siteId: params.siteId || null,
          listOfAttachedFiles: [],
          ignoreToxic: false,
          type: 'post',
          variant: 'standard',
        });
      }

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

      // Return both the specific properties and the full API response
      return {
        feedId,
        feedName,
        authorName,
        response, // Full API response for compatibility
      };
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
