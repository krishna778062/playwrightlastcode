import { expect, test } from '@playwright/test';

import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { FeedPostResponse, FeedResult } from '@core/types/feed.type';

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

  /**
   * Validates that feed response contains topics with required fields
   * @param feedResponse - The feed response to validate
   */
  async validateFeedResponseTopics(feedResponse: FeedPostResponse): Promise<void> {
    await test.step('Validate feed response contains topics', async () => {
      expect(feedResponse.result.listOfTopics, 'listOfTopics should be an array').toBeInstanceOf(Array);
      if (feedResponse.result.listOfTopics.length > 0) {
        expect(feedResponse.result.listOfTopics[0], 'Topic should have required fields').toHaveProperty('topicId');
        expect(feedResponse.result.listOfTopics[0], 'Topic should have required fields').toHaveProperty('name');
        expect(feedResponse.result.listOfTopics[0], 'Topic should have required fields').toHaveProperty('link');
      }
    });
  }

  /**
   * Validates that feed response contains mentions with required fields
   * @param feedResponse - The feed response to validate
   */
  async validateFeedResponseMentions(feedResponse: FeedPostResponse): Promise<void> {
    await test.step('Validate feed response contains mentions', async () => {
      expect(feedResponse.result.listOfMentions, 'listOfMentions should be an array').toBeInstanceOf(Array);
      if (feedResponse.result.listOfMentions.length > 0) {
        expect(feedResponse.result.listOfMentions[0], 'Mention should have required fields').toHaveProperty('id');
        expect(feedResponse.result.listOfMentions[0], 'Mention should have required fields').toHaveProperty('name');
        expect(feedResponse.result.listOfMentions[0], 'Mention should have required fields').toHaveProperty('type');
      }
    });
  }

  /**
   * Validates that feed response contains files with required fields
   * @param feedResponse - The feed response to validate
   */
  async validateFeedResponseFiles(feedResponse: FeedPostResponse): Promise<void> {
    await test.step('Validate feed response contains files', async () => {
      expect(feedResponse.result.listOfFiles, 'listOfFiles should be an array').toBeInstanceOf(Array);
      if (feedResponse.result.listOfFiles.length > 0) {
        expect(feedResponse.result.listOfFiles[0], 'File should have required fields').toHaveProperty('fileId');
        expect(feedResponse.result.listOfFiles[0], 'File should have required fields').toHaveProperty('name');
        expect(feedResponse.result.listOfFiles[0], 'File should have required fields').toHaveProperty('provider');
      }
    });
  }

  /**
   * Validates that feed response contains links
   * @param feedResponse - The feed response to validate
   */
  async validateFeedResponseLinks(feedResponse: FeedPostResponse): Promise<void> {
    await test.step('Validate feed response contains links', async () => {
      expect(feedResponse.result.listOfLinks, 'listOfLinks should be an array').toBeInstanceOf(Array);
      expect(feedResponse.result.listOfLinks.length, 'Should contain at least one link').toBeGreaterThan(0);
      expect(typeof feedResponse.result.listOfLinks[0], 'Link should be a string').toBe('string');
    });
  }

  /**
   * Validates the feed update response (FeedResult from updatePost)
   * @param updatedFeedResult - The FeedResult from updatePost response
   * @param originalFeedId - The original feed ID that was updated
   * @param expectedText - The expected text that should be in textJson
   */
  async validateFeedUpdateResponse(
    updatedFeedResult: FeedResult,
    originalFeedId: string,
    expectedText: string
  ): Promise<void> {
    await test.step('Validate feed update response', async () => {
      expect(updatedFeedResult.feedId, 'Feed ID should match the original feed ID').toBe(originalFeedId);
      expect(updatedFeedResult.textJson, 'Text JSON should contain the updated text').toContain(expectedText);
    });
  }

  /**
   * Validates that the feed update response contains site mentions
   * @param updatedFeedResult - The FeedResult from updatePost response
   * @param siteMentions - Array of site mentions with id and label
   */
  async validateFeedUpdateResponseSiteMentions(
    updatedFeedResult: FeedResult,
    siteMentions: { id: string; label: string }[]
  ): Promise<void> {
    // Store in local variable to ensure proper closure capture
    const mentions = siteMentions;
    await test.step('Validate feed update response contains site mentions', async () => {
      if (!mentions || mentions.length === 0) {
        throw new Error('siteMentions array is required and must not be empty');
      }
      expect(updatedFeedResult.textJson, 'Text JSON should contain site mentions').toContain('UserAndSiteMention');
      expect(updatedFeedResult.textJson, 'Text JSON should contain first site ID').toContain(mentions[0].id);
      expect(updatedFeedResult.textJson, 'Text JSON should contain site type').toContain('"type":"site"');
      if (mentions.length > 1) {
        expect(updatedFeedResult.textJson, 'Text JSON should contain second site ID').toContain(mentions[1].id);
      }
    });
  }

  /**
   * Validates that the feed update response contains user mentions
   * @param updatedFeedResult - The FeedResult from updatePost response
   * @param userMentions - Array of user mentions with id and label
   */
  async validateFeedUpdateResponseUserMentions(
    updatedFeedResult: FeedResult,
    userMentions: { id: string; label: string }[]
  ): Promise<void> {
    // Store in local variable to ensure proper closure capture
    const mentions = userMentions;
    await test.step('Validate feed update response contains user mentions', async () => {
      if (!mentions || mentions.length === 0) {
        throw new Error('userMentions array is required and must not be empty');
      }
      expect(updatedFeedResult.textJson, 'Text JSON should contain user mentions').toContain('UserAndSiteMention');
      expect(updatedFeedResult.textJson, 'Text JSON should contain first user ID').toContain(mentions[0].id);
      expect(updatedFeedResult.textJson, 'Text JSON should contain user type').toContain('"type":"user"');
      if (mentions.length > 1) {
        expect(updatedFeedResult.textJson, 'Text JSON should contain second user ID').toContain(mentions[1].id);
      }
    });
  }
}
