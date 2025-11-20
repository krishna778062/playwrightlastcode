import { expect, test } from '@playwright/test';

import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { FeedPostResponse } from '@core/types/feed.type';

export class FeedApiHelper {
  /**
   * Validates the basic feed response structure (apiName, message, status)
   * @param feedResponse - The feed response to validate
   */
  async validateFeedResponseBasic(feedResponse: FeedPostResponse): Promise<void> {
    await test.step('Validate feed response basic fields', async () => {
      expect(feedResponse.apiName, 'apiName should be "CreateFeed"').toBe('CreateFeed');

      expect(feedResponse.message, 'message should match expected success message').toBe(
        FEED_TEST_DATA.API_RESPONSE_MESSAGES.FEED_POST_CREATED
      );
      expect(feedResponse.status, 'status should be "success"').toBe('success');
    });
  }

  /**
   * Validates the createdAt timestamp format
   * @param feedResponse - The feed response to validate
   */
  async validateFeedResponseCreatedAt(feedResponse: FeedPostResponse): Promise<void> {
    await test.step('Validate feed response createdAt timestamp', async () => {
      expect(feedResponse.result.createdAt, 'createdAt should be a valid ISO timestamp').toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
  }

  /**
   * Validates the authoredBy fields match the expected user info
   * @param feedResponse - The feed response to validate
   * @param expectedUserId - The expected user ID
   * @param expectedUserName - The expected user name
   */
  async validateFeedResponseAuthoredBy(
    feedResponse: FeedPostResponse,
    expectedUserId: string,
    expectedUserName: string
  ): Promise<void> {
    await test.step('Validate feed response authoredBy fields', async () => {
      expect(feedResponse.result.authoredBy.userId, 'authoredBy.userId should match expected userId').toBe(
        expectedUserId
      );
      expect(feedResponse.result.authoredBy.name, 'authoredBy.name should match expected user name').toBe(
        expectedUserName
      );
    });
  }

  /**
   * Validates that site and content are null for public/home feed posts
   * @param feedResponse - The feed response to validate
   */
  async validateFeedResponseSiteAndContent(feedResponse: FeedPostResponse): Promise<void> {
    await test.step('Validate feed response site and content are null', async () => {
      expect(feedResponse.result.site, 'site should be null for public feed posts').toBeNull();
      expect(feedResponse.result.content, 'content should be null for feed posts without content').toBeNull();
    });
  }

  /**
   * Validates that textJson contains the expected feed text
   * @param feedResponse - The feed response to validate
   * @param expectedText - The expected text that should be in textJson
   */
  async validateFeedResponseTextJson(feedResponse: FeedPostResponse, expectedText: string): Promise<void> {
    await test.step('Validate feed response textJson contains expected text', async () => {
      const textJsonParsed = JSON.parse(feedResponse.result.textJson);
      const extractedText = textJsonParsed.content
        ?.map((paragraph: any) =>
          paragraph.content?.map((item: any) => (item.type === 'text' ? item.text : '')).join('')
        )
        .join('')
        .trim();

      expect(extractedText, 'textJson should contain the feed test data text').toContain(expectedText);
    });
  }
}
