import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { buildFeedTextJsonAndTextHtml } from '@/src/core/api/services/FeedManagementService';

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
  async createFeed() {
    return await test.step('Creating a new feed', async () => {
      const feedName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Feed`;
      const { textJson, textHtml } = buildFeedTextJsonAndTextHtml(feedName);

      const response = await this.appManagerApiClient.getFeedManagementService().createFeed({
        textJson,
        textHtml,
      });
      const feedId = response.result.feedId;
      const authorName = response.result.authoredBy?.name;

      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
        this.appManagerApiClient,
        feedName,
        feedName,
        'feed',
        'excerpt'
      );

      const createdFeed = {
        feedId,
        feedName,
        authorName,
      };
      this.feeds.push({ feedId });

      return createdFeed;
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
}
