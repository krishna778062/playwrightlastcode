import { faker } from '@faker-js/faker';
import { APIRequestContext, test } from '@playwright/test';

import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { IFeedManagementOperations } from '@core/api/interfaces/IFeedManagementOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { CreateFeedPostPayload, FeedPostResponse, UpdateFeedPostPayload } from '@core/types/feed.type';

export function buildFeedTextJsonAndTextHtml(text: string) {
  const textJsonObject = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: {
          className: '',
          'data-sw-sid': null,
        },
        content: [
          {
            type: 'text',
            text: text,
          },
        ],
      },
    ],
  };
  return {
    textJson: JSON.stringify(textJsonObject),
    textHtml: `<p>${text}</p>`,
  };
}

/**
 * Creates a complete feed payload with the specified parameters
 * @param text - The text content for the feed post
 * @param scope - Scope of the post (default: "public")
 * @param siteId - Site ID for site-specific posts (default: null)
 * @param listOfAttachedFiles - Array of attached files (default: [])
 * @param ignoreToxic - Whether to ignore toxic content check (default: false)
 * @param type - Type of the post (default: "post")
 * @param variant - Variant of the post (default: "standard")
 * @returns Complete CreateFeedPostPayload object
 */
export function buildCreateFeedPayload(
  text: string,
  scope: string,
  siteId: string | null = null,
  listOfAttachedFiles: any[] = [],
  ignoreToxic: boolean = false,
  type: string = 'post',
  variant: string = 'standard'
): CreateFeedPostPayload {
  const { textJson, textHtml } = buildFeedTextJsonAndTextHtml(text);

  return {
    textJson,
    textHtml,
    scope,
    siteId,
    listOfAttachedFiles,
    ignoreToxic,
    type,
    variant,
  };
}

const defaultFeedPayload: CreateFeedPostPayload = buildCreateFeedPayload(faker.lorem.sentence(), 'public');

/**
 * @description Service for managing feeds
 * @export
 * @class FeedManagementService
 * @extends {BaseApiClient}
 * @implements {IFeedManagementOperations}
 */
export class FeedManagementService extends BaseApiClient implements IFeedManagementOperations {
  /**
   * @description Creates an instance of FeedManagementService.
   * @param {APIRequestContext} context The API request context
   * @param {string} [baseUrl] The base URL for the API
   * @memberof FeedManagementService
   */
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }

  /**
   * @description Creates a feed
   * @param {Partial<Feed>} [overrides] The partial feed data to override the defaults
   * @returns {Promise<any>}
   * @memberof FeedManagementService
   */
  async createFeed(overrides: Partial<CreateFeedPostPayload> = {}): Promise<FeedPostResponse> {
    return await test.step('Creating a feed via API post request', async () => {
      const payload = {
        ...defaultFeedPayload,
        ...overrides,
      };
      console.log('feed payload JSON: ', JSON.stringify(payload, null, 2));
      const response = await this.post(API_ENDPOINTS.feed.create, {
        data: payload,
      });
      const responseBody = await response.json();
      console.log('feed response JSON: ', JSON.stringify(responseBody, null, 2));
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to create feed post. Status: ${response.status()}`);
      }

      return responseBody;
    });
  }

  async updatePost(postId: string, postData: UpdateFeedPostPayload): Promise<FeedPostResponse> {
    return await test.step(`Updating feed post ${postId}`, async () => {
      const response = await this.put(API_ENDPOINTS.feed.update(postId), {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        data: postData,
      });
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to update feed post ${postId}. Status: ${response.status()}`);
      }
      return responseBody.result;
    });
  }

  /**
   * Deletes a feed post
   * @param siteId - The site ID where the post exists
   * @param postId - The ID of the post to delete
   * @returns Promise that resolves when the post is deleted
   */
  async deleteFeed(postId: string): Promise<void> {
    return await test.step(`Deleting feed post ${postId}`, async () => {
      console.log(`Deleting feed post ${postId}`);
      const response = await this.delete(API_ENDPOINTS.feed.delete(postId), {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const responseBody = await response.json();
      console.log(`Delete response:`, responseBody);

      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(
          `Failed to delete feed post ${postId}. Status: ${response.status()}, Message: ${responseBody.message || 'Unknown error'}`
        );
      }

      console.log(`Feed post ${postId} deleted successfully. Message: ${responseBody.message}`);
    });
  }
}
