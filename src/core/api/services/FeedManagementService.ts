import { APIRequestContext, test } from '@playwright/test';
import { faker } from '@faker-js/faker';

import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { IFeedManagementOperations } from '@core/api/interfaces/IFeedManagementOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { Feed } from '@core/types/feed.type';

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

const defaultFeedPayload: Feed = {
  ...buildFeedTextJsonAndTextHtml(faker.lorem.sentence()),
  scope: 'public',
  siteId: null,
  listOfAttachedFiles: [],
  ignoreToxic: false,
  type: 'post',
  variant: 'standard',
};

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
  async createFeed(overrides: Partial<Feed> = {}): Promise<any> {
    return await test.step('Creating a feed via API post request', async () => {
      const payload = {
        ...defaultFeedPayload,
        ...overrides,
      };
      console.log('feed payload: ', payload);
      const response = await this.post(API_ENDPOINTS.feed.create, {
        data: payload,
      });
      const json = await response.json();
      console.log('feed JSON Response:', JSON.stringify(json, null, 2));
      if (json.status !== 'success' || !json.result?.feedId) {
        throw new Error(`Feed creation failed. Response: ${JSON.stringify(json)}`);
      }
      return json;
    });
  }

  /**
   * @description Deletes a feed
   * @param {string} feedId The ID of the feed to delete
   * @returns {Promise<any>}
   * @memberof FeedManagementService
   */
  async deleteFeed(feedId: string): Promise<any> {
    return await test.step(`Deleting a feed with ID "${feedId}" via API delete request`, async () => {
      const response = await this.delete(API_ENDPOINTS.feed.delete(feedId));
      return this.parseResponse<any>(response);
    });
  }
}
