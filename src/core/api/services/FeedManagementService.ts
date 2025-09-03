import { faker } from '@faker-js/faker';
import { APIRequestContext, test } from '@playwright/test';

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

export function buildAttachmentObject(
  fileId: string,
  options: {
    provider?: string;
    size?: number;
    name?: string;
    type?: string;
  } = {}
) {
  const { provider = 'intranet', size = 187280, name = 'boitumelo-_8gR561QtEA-unsplash', type = 'JPEG' } = options;

  return {
    fileId: fileId,
    provider: provider,
    size: size,
    name: name,
    type: type,
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
   * @description Creates a feed with attachments
   * @param {string} text The text content for the feed
   * @param {string[]} fileIds Array of file IDs to attach
   * @param {Partial<Feed>} [overrides] Additional overrides for the feed
   * @returns {Promise<any>}
   * @memberof FeedManagementService
   */
  async createFeedWithAttachment(text: string, fileIds: string[], overrides: Partial<Feed> = {}): Promise<any> {
    return await test.step(`Creating a feed with ${fileIds.length} attachment(s) via API post request`, async () => {
      // Get location header from context headers and call getLocation if available
      const contextHeaders = (this.context as any)._options.extraHTTPHeaders;
      const locationHeader = contextHeaders.location;
      await this.getLocation(locationHeader);

      // Call uploadImage
      await this.uploadImage('Upload Image', 1024, 'image/jpeg');

      const textContent = buildFeedTextJsonAndTextHtml(text);

      // Map file IDs to attachment objects
      const listOfAttachedFiles = fileIds.map(fileId => buildAttachmentObject(fileId));

      const payload = {
        ...defaultFeedPayload,
        ...textContent,
        listOfAttachedFiles: listOfAttachedFiles,
        ...overrides,
      };

      console.log('Feed with attachment payload:', JSON.stringify(payload, null, 2));

      const response = await this.post(API_ENDPOINTS.feed.create, {
        data: payload,
      });

      const json = await response.json();
      console.log('Feed with attachment JSON Response:', JSON.stringify(json, null, 2));

      if (json.status !== 'success' || !json.result?.feedId) {
        throw new Error(`Feed with attachment creation failed. Response: ${JSON.stringify(json)}`);
      }

      return json;
    });
  }

  /**
   * @description Uploads an image and gets signed URL for upload
   * @param {string} fileName The name of the file to upload
   * @param {number} size The size of the file in bytes
   * @param {string} mimeType The MIME type of the file
   * @param {object} options Additional options for upload
   * @param {string} [options.altText] Alt text for the image
   * @param {string} [options.fileId] Existing file ID if updating
   * @param {string} [options.uploadContext='home-feed'] Upload context
   * @param {string} [options.siteId] Site ID if uploading to specific site
   * @returns {Promise<any>}
   * @memberof FeedManagementService
   */
  async uploadImage(
    fileName: string,
    size: number,
    mimeType: string,
    options: {
      altText?: string | null;
      fileId?: string;
      uploadContext?: string;
      siteId?: string | null;
    } = {}
  ): Promise<any> {
    return await test.step(`Uploading image "${fileName}" to get signed URL`, async () => {
      const { altText = null, fileId = '', uploadContext = 'home-feed', siteId = null } = options;

      const payload = {
        file_name: fileName,
        size: size,
        alt_text: altText,
        mime_type: mimeType,
        file_id: fileId,
        uploadContext: uploadContext,
        siteId: siteId,
      };

      console.log('Upload image payload:', JSON.stringify(payload, null, 2));

      const response = await this.post(API_ENDPOINTS.content.signedUrl, {
        data: payload,
      });

      const json = await response.json();
      console.log('Upload image response:', JSON.stringify(json, null, 2));

      if (json.status !== 'success') {
        throw new Error(`Image upload failed. Response: ${JSON.stringify(json)}`);
      }

      // Extract key values for easy access
      const responseFileId = json.result?.file_id;
      const uploadUrl = json.result?.upload_url;

      console.log('Extracted file_id:', responseFileId);
      console.log('Extracted upload_url:', uploadUrl);

      return {
        ...json,
        responseFileId,
        uploadUrl,
      };
    });
  }

  /**
   * @description Uploads file binary data to the signed upload URL
   * @param {string} uploadUrl The signed upload URL from uploadImage response
   * @param {Buffer | string} fileData The file data to upload (binary data)
   * @param {string} fileName The original filename for Content-Disposition header
   * @param {string} mimeType The MIME type of the file
   * @returns {Promise<any>}
   * @memberof FeedManagementService
   */
  async uploadToAttachmentURL(
    uploadUrl: string,
    fileData: Buffer | string,
    fileName: string,
    mimeType: string
  ): Promise<any> {
    return await test.step(`Uploading file binary data to attachment URL for "${fileName}"`, async () => {
      if (!uploadUrl) {
        throw new Error('Upload URL is required but not provided');
      }

      console.log('Uploading to URL:', uploadUrl);
      console.log('File name:', fileName);
      console.log('MIME type:', mimeType);

      // Make a PUT request to the signed URL with the file data
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Disposition': `attachment; filename=${fileName}`,
          'Content-Type': mimeType,
        },
        body: fileData,
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload to attachment URL failed. Status: ${response.status}, Error: ${errorText}`);
      }

      // For PUT requests to S3, successful uploads typically return empty body with 200 status
      const responseText = await response.text();
      console.log('Upload response body:', responseText);

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: responseText,
        success: response.ok,
      };
    });
  }

  /**
   * @description Makes a GET request to the location header URL (authorization endpoint)
   * @param {string} locationHeader The location header URL from previous API response
   * @returns {Promise<any>}
   * @memberof FeedManagementService
   */
  async getLocation(locationHeader: string): Promise<any> {
    return await test.step(`Making GET request to location header URL: ${locationHeader}`, async () => {
      if (!locationHeader) {
        throw new Error('Location header is required but not provided');
      }

      // Extract just the path and query parameters from the location header
      const url = new URL(locationHeader);
      const pathWithQuery = url.pathname + url.search;

      console.log('Location header request path:', pathWithQuery);

      const response = await this.get(pathWithQuery);

      const json = await response.json();
      console.log('Location header response:', JSON.stringify(json, null, 2));

      return {
        response,
        json,
        locationHeader: BaseApiClient.fetchLocationHeader(response),
      };
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
