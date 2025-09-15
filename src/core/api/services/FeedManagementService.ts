import { faker } from '@faker-js/faker';
import { APIRequestContext, APIResponse, expect, test } from '@playwright/test';
import * as fs from 'fs';

import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { IFeedManagementOperations } from '@core/api/interfaces/IFeedManagementOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { CreateFeedPostPayload, FeedPostResponse, UpdateFeedPostPayload } from '@core/types/feed.type';

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
  contentId: string | null = null,
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
    contentId,
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
   * @param {string} [options.contentId] Content ID if uploading to specific content
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
      siteId?: string | null;
      contentId?: string | null;
    } = {}
  ): Promise<any> {
    return await test.step(`Uploading image "${fileName}" to get signed URL`, async () => {
      const { altText = null, fileId = '', siteId = null, contentId = null } = options;

      const payload = {
        file_name: fileName,
        size: size,
        alt_text: altText,
        mime_type: mimeType,
        file_id: fileId,
        siteId: siteId,
      };

      const response = await this.post(API_ENDPOINTS.content.signedUrl, {
        data: payload,
      });

      expect(response.ok(), 'Expecting image uplaod api to pass').toBe(true);

      const imageUploadResponseJson = await response.json();

      // Extract key values for easy access
      const responseFileId = imageUploadResponseJson.result.file_id;
      const uploadUrl = imageUploadResponseJson.result.upload_url;

      return {
        ...imageUploadResponseJson,
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
  async uploadToAttachmentURL(uploadUrl: string, fileName: string, filePath: string): Promise<APIResponse> {
    return await test.step(`Uploading file binary data to attachment URL for "${fileName}"`, async () => {
      if (!uploadUrl) {
        throw new Error('Upload URL is required but not provided');
      }
      const fileBuffer = fs.readFileSync(filePath);

      // Build headers for the request
      const headers = {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename=${fileName}`,
      };

      // Make a PUT request to the signed URL with the file data
      const response = await this.context.put(uploadUrl, {
        headers,
        data: fileBuffer,
      });
      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(`File upload to attachment URL failed. Status: ${response.status}, Error: ${errorText}`);
      }
      return response;
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
   * @param {string} fileName The name of the file to attach
   * @param {number} fileSize The size of the file
   * @param {string} mimeType The MIME type of the file
   * @param {string} filePath The full path to the file
   * @param {Partial<CreateFeedPostPayload>} [overrides] The partial feed data to override the defaults
   * @returns {Promise<FeedPostResponse>}
   * @memberof FeedManagementService
   */
  async createFeedWithAttachment(
    fileName: string,
    fileSize: number,
    mimeType: string,
    filePath: string,
    overrides: Partial<CreateFeedPostPayload> = {}
  ): Promise<FeedPostResponse> {
    return await test.step('Creating a feed with attachment via API post request', async () => {
      // Default image upload parameters

      // Upload image to get fileId
      const uploadResponse = await this.uploadImage(fileName, fileSize, mimeType);
      const fileId = uploadResponse.result.file_id;
      const attachmentURL = uploadResponse.result.upload_url;
      console.log('fileId: ', fileId);
      console.log('attachmentURL: ', attachmentURL);
      if (!fileId) {
        throw new Error('Failed to get fileId from upload response');
      }
      await this.uploadToAttachmentURL(attachmentURL, fileName, filePath);
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

      return { ...responseBody };
    });
  }

  /**
   * Adds a comment/reply to a feed post
   * @param feedId - The ID of the feed post to comment on
   * @param commentData - The comment data including textHtml, textJson, etc.
   * @returns Promise<APIResponse> - The API response
   */
  async addComment(
    feedId: string,
    commentData: {
      textHtml: string;
      textJson: string;
      listOfAttachedFiles: any[];
      ignoreToxic: boolean;
    }
  ): Promise<APIResponse> {
    return await test.step(`Adding comment to feed ${feedId}`, async () => {
      const response = await this.post(API_ENDPOINTS.feed.comment(feedId), {
        data: commentData,
      });

      const responseBody = await response.json();
      console.log('Add comment response:', JSON.stringify(responseBody, null, 2));

      if (!response.ok()) {
        throw new Error(`Failed to add comment to feed ${feedId}. Status: ${response.status()}`);
      }

      return response;
    });
  }

  /**
   * Configures app governance settings
   * @param settings - The governance settings to configure (optional, uses defaults from curl)
   * @returns Promise<APIResponse> - The API response
   */
  async configureAppGovernance(
    settings: Partial<{
      isExpertiseAppManagerControlled: boolean;
      isHomeAppManagerControlled: boolean;
      isSiteAppManagerControlled: boolean;
      isExpertiseCreateAppManagerControlled: boolean;
      feedMode: string;
      autoGovValidationPeriod: number;
      autoGovernanceEnabled: boolean;
      contentSubmissionsEnabled: boolean;
      feedOnContentEnabled: boolean;
      isExpertiseEnabled: boolean;
      isHomeCarouselEnabled: boolean;
      isSiteCarouselEnabled: boolean;
      allowFileUpload: string;
      siteFilePermission: string;
      htmlTileEnabled: boolean;
      isNativeVideoAutoPlayEnabled: boolean;
      allowFileShareWithPublicLink: boolean;
      enablePersonalizedContentEmails: boolean;
      feedPlaceholder: string;
      isFeedPlaceholderDefault: boolean;
      sitesToUploadFiles: string[];
      privacyPolicy: {
        isPPEnabled: boolean;
        isPPLinkCustom: boolean;
        ppLink: string;
        isPPLabelCustom: boolean;
        ppLabel: string;
      };
      termsOfService: {
        isTOSEnabled: boolean;
        isTOSLinkCustom: boolean;
        tosLink: string;
        isTOSLabelCustom: boolean;
        tosLabel: string;
      };
      takeLegalAcknowledgement: boolean;
    }> = {}
  ): Promise<APIResponse> {
    return await test.step('Configuring app governance settings', async () => {
      // Default values from the curl command
      const defaultSettings = {
        isExpertiseAppManagerControlled: true,
        isHomeAppManagerControlled: true,
        isSiteAppManagerControlled: false,
        isExpertiseCreateAppManagerControlled: true,
        feedMode: 'timeline_comment_post',
        autoGovValidationPeriod: 12,
        autoGovernanceEnabled: true,
        contentSubmissionsEnabled: true,
        feedOnContentEnabled: true,
        isExpertiseEnabled: true,
        isHomeCarouselEnabled: true,
        isSiteCarouselEnabled: true,
        allowFileUpload: 'all',
        siteFilePermission: 'sameAsAllUsers',
        htmlTileEnabled: false,
        isNativeVideoAutoPlayEnabled: true,
        allowFileShareWithPublicLink: false,
        enablePersonalizedContentEmails: false,
        feedPlaceholder: '',
        isFeedPlaceholderDefault: true,
        sitesToUploadFiles: [],
        privacyPolicy: {
          isPPEnabled: true,
          isPPLinkCustom: false,
          ppLink: 'https://www.simpplr.com/privacy/',
          isPPLabelCustom: false,
          ppLabel: 'Privacy Policy',
        },
        termsOfService: {
          isTOSEnabled: true,
          isTOSLinkCustom: false,
          tosLink: 'https://www.simpplr.com/tos/',
          isTOSLabelCustom: false,
          tosLabel: 'Terms of Service',
        },
        takeLegalAcknowledgement: true,
      };

      // Merge provided settings with defaults
      const finalSettings = { ...defaultSettings, ...settings };

      const response = await this.post(API_ENDPOINTS.appConfig.governance, {
        data: finalSettings,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseBody = await response.json();
      console.log('App governance configuration response:', JSON.stringify(responseBody, null, 2));

      if (!response.ok()) {
        throw new Error(`Failed to configure app governance. Status: ${response.status()}`);
      }

      return response;
    });
  }
}
