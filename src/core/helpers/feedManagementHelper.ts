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
   * Creates a new feed.
   * @returns An object containing details of the created feed.
   */
  async createFeed(scope: string, siteId?: string, text?: string, options?: { waitForSearchIndex?: boolean }) {
    return await test.step('Creating a new feed', async () => {
      const feedName = text || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Feed`;
      const { textJson, textHtml } = buildFeedTextJsonAndTextHtml(feedName);

      const response = await this.appManagerApiClient.getFeedManagementService().createFeed({
        textJson,
        textHtml,
        scope: scope,
        siteId: siteId || null,
        listOfAttachedFiles: [],
        ignoreToxic: false,
        type: 'post',
        variant: 'standard',
      });
      const feedId = response.result.feedId;
      const authorName = response.result.authoredBy?.name;

      if (options?.waitForSearchIndex !== false) {
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
