import { faker } from '@faker-js/faker';
import { APIRequestContext, request, test } from '@playwright/test';
import * as fs from 'fs';

import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { IFeedManagementOperations } from '@core/api/interfaces/IFeedManagementOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { CreateFeedPostPayload, FeedPostResponse, UpdateFeedPostPayload } from '@core/types/feed.type';
import { getEnvConfig } from '@core/utils/getEnvConfig';

import { FileUtil } from '../../utils/fileUtil';

import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

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
      console.log('--------------------------------');
      console.log('Upload image response:', JSON.stringify(json, null, 2));
      console.log('--------------------------------');

      if (json.status !== 'success') {
        throw new Error(`Image upload failed. Response: ${JSON.stringify(json)}`);
      }

      // Extract key values for easy access
      const responseFileId = json.result.file_id;
      const uploadUrl = json.result.upload_url;

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
  async uploadToAttachmentURL(uploadUrl: string, fileName: string): Promise<any> {
    return await test.step(`Uploading file binary data to attachment URL for "${fileName}"`, async () => {
      if (!uploadUrl) {
        throw new Error('Upload URL is required but not provided');
      }
      const fileName = CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName;
      const filePath = FileUtil.getFilePath(
        __dirname,
        '..',
        '..',
        '..',
        'modules',
        'content',
        'test-data',
        'static-files',
        'images',
        fileName
      );
      const fileBuffer = fs.readFileSync(filePath);

      // Build headers for the request
      const headers = {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename=300x300 RATIO_Text.png',
        ...BaseApiClient.headers,
      };

      // Log the curl equivalent
      const headersString = Object.entries(headers)
        .map(([key, value]) => `--header '${key}: ${value}'`)
        .join(' ');

      console.log('--------------------------------');
      console.log('Curl equivalent for uploadToAttachmentURL:');
      console.log(`curl --location --request PUT '${uploadUrl}' \\`);
      console.log(`${headersString} \\`);
      console.log(`--data-binary '@${filePath}'`);
      console.log('--------------------------------');

      // Log complete fetch request details
      console.log('--------------------------------');
      console.log('Complete fetch request details:');
      console.log('URL:', uploadUrl);
      console.log('Method: PUT');
      console.log('Headers:', JSON.stringify(headers, null, 2));
      console.log('Body size:', fileBuffer.length, 'bytes');
      console.log('File path:', filePath);
      console.log('--------------------------------');

      // Make a PUT request to the signed URL with the file data
      const response = await this.context.fetch(uploadUrl, {
        method: 'PUT',
        headers,
        data: fileBuffer,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload to attachment URL failed. Status: ${response.status}, Error: ${errorText}`);
      }

      // For PUT requests to S3, successful uploads typically return empty body with 200 status
      const responseText = await response.text();
      console.log('--------------------------------');
      console.log('Attachment upload response body:', responseText);
      console.log('--------------------------------');

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
      console.log('--------------------------------');
      console.log('Location complete URL:', locationHeader);
      console.log('--------------------------------');

      // Make a PUT request to the signed URL with the file data
      const response = await this.context.fetch(locationHeader, {
        method: 'GET',
      });

      const responseText = await response.text();
      console.log('Location response body:', responseText);

      // Validate status code 200
      if (!response.ok() || response.status() !== 200) {
        throw new Error(`getLocation failed. Status: ${response.status()}, URL: ${locationHeader}`);
      }
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

  /**
   * @description Creates a feed with attachments
   * @param {Partial<CreateFeedPostPayload>} [overrides] The partial feed data to override the defaults
   * @returns {Promise<FeedPostResponse>}
   * @memberof FeedManagementService
   */
  async createFeedWithAttachment(overrides: Partial<CreateFeedPostPayload> = {}): Promise<FeedPostResponse> {
    return await test.step('Creating a feed with attachment via API post request', async () => {
      // Default image upload parameters
      const fileName = '300x300 RATIO_Text.png';
      const fileSize = 12125;
      const mimeType = 'image/png';

      if (BaseApiClient.globalLocationHeader) {
        await this.getLocation(BaseApiClient.globalLocationHeader);
      }
      // Upload image to get fileId
      const uploadResponse = await this.uploadImage(fileName, fileSize, mimeType);
      const fileId = uploadResponse.result.file_id;
      const attachmentURL = uploadResponse.result.upload_url;
      console.log('fileId: ', fileId);
      console.log('attachmentURL: ', attachmentURL);
      if (!fileId) {
        throw new Error('Failed to get fileId from upload response');
      }
      await this.uploadToAttachmentURL(attachmentURL, fileName);
      // Create attachment object with the uploaded fileId
      const listOfAttachedFiles = [buildAttachmentObject(fileId)];

      const payload = {
        ...defaultFeedPayload,
        listOfAttachedFiles: listOfAttachedFiles,
        ...overrides,
      };

      console.log('Feed with attachment payload:', JSON.stringify(payload, null, 2));

      const response = await this.post(API_ENDPOINTS.feed.create, {
        data: payload,
      });

      const responseBody = await response.json();
      console.log('Feed with attachment response:', JSON.stringify(responseBody, null, 2));

      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to create feed with attachment. Status: ${response.status()}`);
      }

      return responseBody;
    });
  }
}
