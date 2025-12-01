import { faker } from '@faker-js/faker';
import { APIRequestContext, APIResponse, expect, test } from '@playwright/test';
import * as fs from 'fs';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import {
  AttachedFile,
  CreateFeedPostPayload,
  CreateQuestionPayload,
  FeedPostResponse,
  GetQuestionDetailsResponse,
  QuestionResponse,
  UpdateFeedPostPayload,
  UpdateQuestionPayload,
} from '@core/types/feed.type';
import { AppConfigResponse, FeedMode } from '@core/types/feedManagement.types';
import { log } from '@core/utils/logger';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { IFeedManagementOperations } from '@/src/modules/content/apis/interfaces/IFeedManagementOperations';

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

export function buildFeedTextWithTopicMentions(text: string, topics: { id: string; name: string }[]) {
  const content = [
    {
      type: 'paragraph',
      attrs: {
        className: '',
        'data-sw-sid': null,
      },
      content: [] as any[],
    },
  ];

  // Add the main text
  if (text) {
    content[0].content.push({
      type: 'text',
      text: text + ' ',
    });
  }

  // Add topic mentions
  topics.forEach((topic, index) => {
    content[0].content.push({
      type: 'TopicMention',
      attrs: {
        id: topic.id,
        label: topic.name,
        type: 'topic',
      },
    });

    if (index < topics.length - 1) {
      content[0].content.push({
        type: 'text',
        text: ' ',
      });
    }
  });

  const textJson = JSON.stringify({
    type: 'doc',
    content,
  });

  const topicLinks = topics
    .map(
      topic =>
        `<span data-type="topic" data-id="${topic.id}" data-label="${topic.name}"><a href="/topic/${topic.id}" target="_blank">#${topic.name}</a></span>`
    )
    .join(' ');

  const textHtml = `<p>${text} ${topicLinks}</p>`;

  return {
    textJson,
    textHtml,
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

/**
 * Builds a feed payload with all features: emoji, site mention, user mention, topic mentions,
 * formatted bullet list (bold, italic, strikethrough, underline), nested list with link, and attachments
 * @param params Configuration parameters for the feed
 * @returns Complete CreateFeedPostPayload object with all features
 *
 * @example
 * const feedPayload = buildFeedWithAllFeatures({
 *   baseText: 'Add a Feed',
 *   emoji: { name: 'monkey', emoji: '🐒' },
 *   siteMention: { id: '34a91ba1-2982-48d1-9c0a-1f6f5b674f37', label: 'Public_subscription_site' },
 *   userMention: { id: 'd18d9abc-88d8-486a-a034-d8451cf2e7f5', label: 'Application Manager1' },
 *   topics: [
 *     { id: 'new_topicCreat', label: 'topicCreat' },
 *     { id: '2b92cfc0-21d9-4da4-a663-f09314b12741', label: 'best practices' }
 *   ],
 *   linkUrl: 'https://www.youtube.com/watch?v=F_77M3ZZ1z8',
 *   listOfAttachedFiles: [{ fileId: '421a335e-9d97-47ad-b0d3-e88d8eabb878', provider: 'intranet', size: 187288, name: 'boitumelo-_8gR561QtEA-unsplash', type: 'JPEG' }],
 *   scope: 'public',
 *   siteId: null
 * });
 */
export function buildFeedWithAllFeatures(params: {
  baseText?: string;
  emoji?: { name: string; emoji: string };
  siteMention?: { id: string; label: string };
  userMention?: { id: string; label: string };
  topics?: { id: string; label: string }[];
  linkUrl?: string;
  listOfAttachedFiles?: AttachedFile[];
  scope?: string;
  siteId?: string | null;
  contentId?: string | null;
  ignoreToxic?: boolean;
  type?: string;
  variant?: string;
}): CreateFeedPostPayload {
  const {
    baseText = 'Add a Feed',
    emoji = { name: 'monkey', emoji: '🐒' },
    siteMention,
    userMention,
    topics = [],
    linkUrl = 'https://www.youtube.com/watch?v=F_77M3ZZ1z8',
    listOfAttachedFiles = [],
    scope = 'public',
    siteId = null,
    contentId = null,
    ignoreToxic = false,
    type = 'post',
    variant = 'standard',
  } = params;

  // Build the main paragraph content
  const paragraphContent: any[] = [
    {
      type: 'text',
      text: `${baseText} `,
    },
  ];

  // Add emoji if provided
  if (emoji) {
    paragraphContent.push({
      type: 'emoji',
      attrs: {
        name: emoji.name,
        emoji: emoji.emoji,
      },
    });
    paragraphContent.push({
      type: 'text',
      text: '. ',
    });
  }

  // Add site mention if provided
  if (siteMention) {
    paragraphContent.push({
      type: 'UserAndSiteMention',
      attrs: {
        id: siteMention.id,
        label: siteMention.label,
        type: 'site',
      },
    });
    paragraphContent.push({
      type: 'text',
      text: '  ',
    });
  }

  // Add user mention if provided
  if (userMention) {
    paragraphContent.push({
      type: 'UserAndSiteMention',
      attrs: {
        id: userMention.id,
        label: userMention.label,
        type: 'user',
      },
    });
    paragraphContent.push({
      type: 'text',
      text: ' ',
    });
  }

  // Add topic mentions
  topics.forEach((topic, index) => {
    paragraphContent.push({
      type: 'TopicMention',
      attrs: {
        id: topic.id,
        label: topic.label,
        type: 'topic',
      },
    });
    if (index < topics.length - 1) {
      paragraphContent.push({
        type: 'text',
        text: ' ',
      });
    }
  });

  // Build bullet list with formatting
  const bulletListContent = [
    // Bold text item
    {
      type: 'listItem',
      attrs: {
        'data-sw-sid': null,
      },
      content: [
        {
          type: 'paragraph',
          attrs: {
            class: null,
            style: null,
          },
          content: [
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: 'Text with bold',
            },
          ],
        },
      ],
    },
    // Italic text item
    {
      type: 'listItem',
      attrs: {
        'data-sw-sid': null,
      },
      content: [
        {
          type: 'paragraph',
          attrs: {
            class: null,
            style: null,
          },
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: 'Text with italic',
            },
          ],
        },
      ],
    },
    // Strikethrough text item
    {
      type: 'listItem',
      attrs: {
        'data-sw-sid': null,
      },
      content: [
        {
          type: 'paragraph',
          attrs: {
            class: null,
            style: null,
          },
          content: [
            {
              type: 'text',
              marks: [{ type: 'strike' }],
              text: 'Text with strikethrough',
            },
          ],
        },
      ],
    },
    // Underline text item with nested bullet list containing link
    {
      type: 'listItem',
      attrs: {
        'data-sw-sid': null,
      },
      content: [
        {
          type: 'paragraph',
          attrs: {
            class: null,
            style: null,
          },
          content: [
            {
              type: 'text',
              marks: [{ type: 'underline' }],
              text: 'text with underline',
            },
          ],
        },
        {
          type: 'bulletList',
          attrs: {
            className: '',
            'data-sw-sid': null,
          },
          content: [
            {
              type: 'listItem',
              attrs: {
                'data-sw-sid': null,
              },
              content: [
                {
                  type: 'paragraph',
                  attrs: {
                    class: null,
                    style: null,
                  },
                  content: [
                    {
                      type: 'text',
                      marks: [
                        {
                          type: 'link',
                          attrs: {
                            href: linkUrl,
                            target: '_blank',
                            rel: 'noopener noreferrer nofollow',
                            class: null,
                            alt: null,
                            align: null,
                            display: 'inline',
                            isButton: null,
                          },
                        },
                        { type: 'textStyle' },
                      ],
                      text: linkUrl,
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  attrs: {
                    class: null,
                    style: null,
                  },
                  content: [
                    {
                      type: 'hardBreak',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  // Build the complete content structure
  const content = [
    {
      type: 'paragraph',
      attrs: {
        class: null,
        style: null,
      },
      content: paragraphContent,
    },
    {
      type: 'bulletList',
      attrs: {
        className: '',
        'data-sw-sid': null,
      },
      content: bulletListContent,
    },
  ];

  // Build textJson
  const textJson = JSON.stringify({
    type: 'doc',
    content,
  });

  // Build textHtml
  let textHtml = '<p>';

  // Add base text
  textHtml += `${baseText} `;

  // Add emoji
  if (emoji) {
    textHtml += `<span data-name="${emoji.name}" class="tiptap-emoji" data-type="emoji">${emoji.emoji}</span>. `;
  }

  // Add site mention
  if (siteMention) {
    textHtml += `<span data-type="site" data-id="${siteMention.id}" data-label="${siteMention.label}"><a href="/site/${siteMention.id}" target="_blank">@${siteMention.label}</a></span>  `;
  }

  // Add user mention
  if (userMention) {
    textHtml += `<span data-type="user" data-id="${userMention.id}" data-label="${userMention.label}"><a href="/people/${userMention.id}" target="_blank">@${userMention.label}</a></span> `;
  }

  // Add topic mentions
  topics.forEach(topic => {
    textHtml += `<span data-type="topic" data-id="${topic.id}" data-label="${topic.label}"><a href="/topic/${topic.id}" target="_blank">#${topic.label}</a></span> `;
  });

  textHtml += '</p>';

  // Add bullet list HTML
  textHtml += '<ul>';
  textHtml += '<li><p><strong>Text with bold</strong></p></li>';
  textHtml += '<li><p><em>Text with italic</em></p></li>';
  textHtml += '<li><p><s>Text with strikethrough</s></p></li>';
  textHtml += '<li><p><u>text with underline</u>';
  textHtml += '<ul>';
  textHtml += `<li><p><a target="_blank" rel="noopener noreferrer nofollow" href="${linkUrl}"><span>${linkUrl}</span></a></p><p><br></p></li>`;
  textHtml += '</ul>';
  textHtml += '</li>';
  textHtml += '</ul>';

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

const defaultFeedPayload: CreateFeedPostPayload = buildCreateFeedPayload(faker.lorem.sentence(), 'public');

/**
 * @description Service for managing feeds
 * @export
 * @class FeedManagementService
 * @implements {IFeedManagementOperations}
 */
export class FeedManagementService implements IFeedManagementOperations {
  /**
   * @description Creates an instance of FeedManagementService.
   * @param {APIRequestContext} context The API request context
   * @param {string} [baseUrl] The base URL for the API
   * @memberof FeedManagementService
   */
  public httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
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
      log.debug('feed payload JSON', { payload: JSON.stringify(payload, null, 2) });

      const response = await this.httpClient.post(API_ENDPOINTS.feed.create, {
        data: payload,
      });
      const responseBody = await response.json();
      log.debug('feed response JSON', { response: JSON.stringify(responseBody, null, 2) });
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to create feed post. Status: ${response.status()}`);
      }

      return responseBody;
    });
  }

  /**
   * @description Creates a feed with all features: emoji, site mention, user mention, topic mentions,
   * formatted bullet list (bold, italic, strikethrough, underline), nested list with link, and attachments
   * @param params Configuration parameters for the feed with all features
   * @returns {Promise<FeedPostResponse>}
   * @memberof FeedManagementService
   *
   * @example
   * const feedResponse = await feedService.createWithAllFeatures({
   *   baseText: 'Add a Feed',
   *   emoji: { name: 'monkey', emoji: '🐒' },
   *   siteMention: { id: '34a91ba1-2982-48d1-9c0a-1f6f5b674f37', label: 'Public_subscription_site' },
   *   userMention: { id: 'd18d9abc-88d8-486a-a034-d8451cf2e7f5', label: 'Application Manager1' },
   *   topics: [
   *     { id: 'new_topicCreat', label: 'topicCreat' },
   *     { id: '2b92cfc0-21d9-4da4-a663-f09314b12741', label: 'best practices' }
   *   ],
   *   linkUrl: 'https://www.youtube.com/watch?v=F_77M3ZZ1z8',
   *   listOfAttachedFiles: [{ fileId: '421a335e-9d97-47ad-b0d3-e88d8eabb878', provider: 'intranet', size: 187288, name: 'boitumelo-_8gR561QtEA-unsplash', type: 'JPEG' }],
   *   scope: 'public',
   *   siteId: null
   * });
   */
  async createWithAllFeatures(params: {
    baseText?: string;
    emoji?: { name: string; emoji: string };
    siteMention?: { id: string; label: string };
    userMention?: { id: string; label: string };
    topics?: { id: string; label: string }[];
    linkUrl?: string;
    listOfAttachedFiles?: AttachedFile[];
    scope?: string;
    siteId?: string | null;
    contentId?: string | null;
    ignoreToxic?: boolean;
    type?: string;
    variant?: string;
  }): Promise<FeedPostResponse> {
    return await test.step('Creating a feed with all features via API post request', async () => {
      const payload = buildFeedWithAllFeatures(params);
      log.debug('feed payload JSON with all features', { payload: JSON.stringify(payload, null, 2) });

      const response = await this.httpClient.post(API_ENDPOINTS.feed.create, {
        data: payload,
      });
      const responseBody = await response.json();
      log.debug('feed response JSON', { response: JSON.stringify(responseBody, null, 2) });
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to create feed post with all features. Status: ${response.status()}`);
      }

      return responseBody;
    });
  }

  async updatePost(postId: string, postData: UpdateFeedPostPayload): Promise<FeedPostResponse> {
    return await test.step(`Updating feed post ${postId}`, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.feed.update(postId), {
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

      const response = await this.httpClient.post(API_ENDPOINTS.content.signedUrl, {
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
   * @param {string} fileName The original filename for Content-Disposition header
   * @param {string} filePath The local path to the file
   * @param {string} [mimeType] The MIME type of the file (optional, defaults to 'image/png')
   * @returns {Promise<APIResponse>}
   * @memberof FeedManagementService
   */
  async uploadToAttachmentURL(
    uploadUrl: string,
    fileName: string,
    filePath: string,
    mimeType: string
  ): Promise<APIResponse> {
    return await test.step(`Uploading file binary data to attachment URL for "${fileName}"`, async () => {
      if (!uploadUrl) {
        throw new Error('Upload URL is required but not provided');
      }
      const fileBuffer = fs.readFileSync(filePath);

      // Build headers for the request
      const headers = {
        'Content-Type': mimeType,
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
      log.debug(`Deleting feed post ${postId}`);
      const response = await this.httpClient.delete(API_ENDPOINTS.feed.delete(postId), {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const responseBody = await response.json();
      log.debug('Delete response', { response: responseBody });

      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(
          `Failed to delete feed post ${postId}. Status: ${response.status()}, Message: ${responseBody.message || 'Unknown error'}`
        );
      }

      log.debug(`Feed post ${postId} deleted successfully`, { message: responseBody.message });
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
      log.debug('File upload details', { fileId, attachmentURL });
      if (!fileId) {
        throw new Error('Failed to get fileId from upload response');
      }
      await this.uploadToAttachmentURL(attachmentURL, fileName, filePath, mimeType);
      // Create attachment object with the uploaded fileId
      const listOfAttachedFiles = [buildAttachmentObject(fileId)];

      const payload = {
        ...defaultFeedPayload,
        listOfAttachedFiles: listOfAttachedFiles,
        ...overrides,
      };

      log.debug('Feed with attachment payload', { payload: JSON.stringify(payload, null, 2) });

      const response = await this.httpClient.post(API_ENDPOINTS.feed.create, {
        data: payload,
      });

      const responseBody = await response.json();
      log.debug('Feed with attachment response', { response: JSON.stringify(responseBody, null, 2) });

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
      const response = await this.httpClient.post(API_ENDPOINTS.feed.comment(feedId), {
        data: commentData,
      });

      const responseBody = await response.json();
      log.debug('Add comment response', { response: JSON.stringify(responseBody, null, 2) });

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
      feedMode: FeedMode;
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
    }> = {},
    feedMode: FeedMode = FeedMode.TIMELINE_COMMENT_POST
  ): Promise<APIResponse> {
    return await test.step('Configuring app governance settings', async () => {
      // Default values from the curl command
      const defaultSettings = {
        isExpertiseAppManagerControlled: true,
        isHomeAppManagerControlled: true,
        isSiteAppManagerControlled: false,
        isExpertiseCreateAppManagerControlled: true,
        feedMode: feedMode,
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

      const response = await this.httpClient.post(API_ENDPOINTS.appConfig.governance, {
        data: finalSettings,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseBody = await response.json();
      log.debug('App governance configuration response', { response: JSON.stringify(responseBody, null, 2) });

      if (!response.ok()) {
        throw new Error(`Failed to configure app governance. Status: ${response.status()}`);
      }

      return response;
    });
  }

  /**
   * Gets the current app configuration settings
   * @returns Promise<AppConfigResponse>
   */
  async getAppConfig(): Promise<AppConfigResponse> {
    return await test.step('Get app configuration', async () => {
      const response = await this.httpClient.get(API_ENDPOINTS.appConfig.appConfig, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      const responseBody = (await response.json()) as AppConfigResponse;
      log.debug('App configuration response', { response: JSON.stringify(responseBody, null, 2) });

      if (!response.ok()) {
        throw new Error(`Failed to get app configuration. Status: ${response.status()}`);
      }

      return responseBody;
    });
  }

  /**
   * Updates app configuration settings
   * @param config - App configuration settings to update
   * @returns Promise<APIResponse>
   */
  async updateAppConfig(config: {
    appName?: string;
    automatedTranslationEnabled?: boolean;
    availableContentTypes?: string[];
    addToCalendar?: string[];
    feedbackRecipients?: string[];
    enableSmsNotifications?: boolean;
    enablePushNotificationMobile?: boolean;
    shareFeedback?: boolean;
    socialCampaignsPolicyUrl?: string;
    selectedLanguages?: number[];
    orgChartEnabled?: boolean;
    isSmartWritingEnabled?: boolean;
    isSmartAnswerEnabled?: boolean;
    isContentAiSummaryEnabled?: boolean;
    isMultilingualModelEnabled?: boolean;
    calendarOffice365Enabled?: boolean;
    calendarOffice365Url?: string;
    isContentFeaturePromotionEnabled?: boolean;
    isQuestionAnswerEnabled?: boolean;
    isNewsletterTranslationEnabled?: boolean;
  }): Promise<APIResponse> {
    return await test.step('Update app configuration', async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.appConfig.general, {
        data: config,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseBody = await response.json();
      log.debug('App configuration update response', { response: JSON.stringify(responseBody, null, 2) });

      if (!response.ok()) {
        throw new Error(`Failed to update app configuration. Status: ${response.status()}`);
      }

      return response;
    });
  }

  /**
   * Creates a question via API
   * @param payload - The question payload
   * @returns Promise with the question response
   */
  async createQuestion(payload: CreateQuestionPayload): Promise<QuestionResponse> {
    return await test.step('Creating a question via API post request', async () => {
      log.debug('Question payload JSON', { payload: JSON.stringify(payload, null, 2) });

      const response = await this.httpClient.post(API_ENDPOINTS.feed.create, {
        data: payload,
      });
      const responseBody = await response.json();
      log.debug('Question response JSON', { response: JSON.stringify(responseBody, null, 2) });
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to create question. Status: ${response.status()}, Message: ${responseBody.message}`);
      }

      return responseBody as QuestionResponse;
    });
  }

  /**
   * Updates a question via API
   * @param questionId - The question ID to update
   * @param payload - The update payload
   * @returns Promise with the updated question response
   */
  async updateQuestion(questionId: string, payload: UpdateQuestionPayload): Promise<QuestionResponse> {
    return await test.step(`Updating question ${questionId}`, async () => {
      log.debug('Question update payload JSON', { payload: JSON.stringify(payload, null, 2) });
      const response = await this.httpClient.put(API_ENDPOINTS.feed.update(questionId), {
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      });
      const responseBody = await response.json();
      log.debug('Question update response JSON', { response: JSON.stringify(responseBody, null, 2) });
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(
          `Failed to update question ${questionId}. Status: ${response.status()}, Message: ${responseBody.message || 'Unknown error'}`
        );
      }
      return responseBody as QuestionResponse;
    });
  }

  /**
   * Deletes a question via API
   * @param questionId - The question ID to delete
   * @returns Promise with the delete response
   */
  async deleteQuestion(questionId: string): Promise<any> {
    return await test.step(`Deleting question ${questionId}`, async () => {
      const response = await this.httpClient.delete(API_ENDPOINTS.feed.delete(questionId));
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to delete question ${questionId}. Status: ${response.status()}`);
      }
      return responseBody;
    });
  }

  /**
   * Upvotes a question via API
   * @param questionId - The question ID to upvote
   * @returns Promise with the reaction response
   */
  async upvoteQuestion(questionId: string): Promise<any> {
    return await test.step(`Upvoting question ${questionId}`, async () => {
      const response = await this.httpClient.post(`${API_ENDPOINTS.feed.create}/${questionId}/reactions`, {
        headers: { 'Content-Type': 'application/json' },
        data: { reactionType: 'emoji/2B06', action: 'add' },
      });
      const responseBody = await response.json();
      log.debug('Upvote response JSON', { response: JSON.stringify(responseBody, null, 2) });
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(
          `Failed to upvote question ${questionId}. Status: ${response.status()}, Message: ${responseBody.message || 'Unknown error'}`
        );
      }
      return responseBody;
    });
  }

  /**
   * Removes upvote from a question via API
   * @param questionId - The question ID to remove upvote from
   * @returns Promise with the reaction response
   */
  async removeUpvoteFromQuestion(questionId: string): Promise<any> {
    return await test.step(`Removing upvote from question ${questionId}`, async () => {
      const response = await this.httpClient.post(`${API_ENDPOINTS.feed.create}/${questionId}/reactions`, {
        headers: { 'Content-Type': 'application/json' },
        data: { reactionType: 'emoji/2B06', action: 'remove' },
      });
      const responseBody = await response.json();
      log.debug('Remove upvote response JSON', { response: JSON.stringify(responseBody, null, 2) });
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(
          `Failed to remove upvote from question ${questionId}. Status: ${response.status()}, Message: ${responseBody.message || 'Unknown error'}`
        );
      }
      return responseBody;
    });
  }

  /**
   * Creates an answer (comment) on a question via API
   * @param questionId - The question ID to answer
   * @param payload - The answer payload
   * @returns Promise with the answer response
   */
  async createAnswer(
    questionId: string,
    payload: { textJson: string; textHtml: string; listOfAttachedFiles?: AttachedFile[]; ignoreToxic?: boolean }
  ): Promise<any> {
    return await test.step(`Creating answer on question ${questionId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.feed.comment(questionId), {
        data: payload,
      });
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to create answer on question ${questionId}. Status: ${response.status()}`);
      }
      return responseBody;
    });
  }

  /**
   * Updates an answer (comment) on a question via API
   * @param questionId - The question ID
   * @param answerId - The answer ID to update
   * @param payload - The answer payload
   * @returns Promise with the answer response
   */
  async updateAnswer(
    questionId: string,
    answerId: string,
    payload: { textJson: string; textHtml: string; listOfAttachedFiles?: AttachedFile[]; ignoreToxic?: boolean }
  ): Promise<any> {
    return await test.step(`Updating answer ${answerId} on question ${questionId}`, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.feed.updateComment(questionId, answerId), {
        data: payload,
      });
      const responseBody = await response.json();

      log.debug('Update answer response JSON', { response: JSON.stringify(responseBody, null, 2) });
      // Check for error status or error messages in response
      if (!response.ok() || responseBody.status !== 'success') {
        const errorMessage = responseBody.message || `Failed to update answer ${answerId} on question ${questionId}`;
        throw new Error(`${errorMessage}. Status: ${response.status()}`);
      }

      // Also check if response indicates the comment was not found or deleted
      if (
        responseBody.message &&
        (responseBody.message.includes('Not Found') || responseBody.message.includes('not found'))
      ) {
        throw new Error(
          `Failed to update answer ${answerId} on question ${questionId}. Comment not found. Status: ${response.status()}`
        );
      }

      // Check if the response indicates the answer is deleted
      if (responseBody.result?.isDeleted === true) {
        throw new Error(
          `Failed to update answer ${answerId} on question ${questionId}. Answer is deleted. Status: ${response.status()}`
        );
      }

      // Check HTTP status code - 404 indicates resource not found (deleted)
      if (response.status() === 404) {
        throw new Error(
          `Failed to update answer ${answerId} on question ${questionId}. Answer not found (likely deleted). Status: ${response.status()}`
        );
      }

      return responseBody;
    });
  }

  /**
   * Deletes an answer (comment) on a question via API
   * @param questionId - The question ID
   * @param answerId - The answer ID to delete
   * @returns Promise with the delete response
   */
  async deleteAnswer(questionId: string, answerId: string): Promise<any> {
    return await test.step(`Deleting answer ${answerId} on question ${questionId}`, async () => {
      const response = await this.httpClient.delete(API_ENDPOINTS.feed.deleteComment(questionId, answerId));
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to delete answer ${answerId} on question ${questionId}. Status: ${response.status()}`);
      }
      return responseBody;
    });
  }

  /**
   * Upvotes an answer (comment) on a question via API
   * @param questionId - The question ID
   * @param answerId - The answer ID to upvote
   * @returns Promise with the upvote response
   */
  async upvoteAnswer(questionId: string, answerId: string): Promise<any> {
    return await test.step(`Upvoting answer ${answerId} on question ${questionId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.feed.commentReaction(questionId, answerId), {
        data: {
          reactionType: 'emoji/2B06',
          action: 'add',
        },
        headers: { 'Content-Type': 'application/json' },
      });
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to upvote answer ${answerId} on question ${questionId}. Status: ${response.status()}`);
      }
      return responseBody;
    });
  }

  /**
   * Removes upvote from an answer (comment) on a question via API
   * @param questionId - The question ID
   * @param answerId - The answer ID to remove upvote from
   * @returns Promise with the remove upvote response
   */
  async removeUpvoteFromAnswer(questionId: string, answerId: string): Promise<any> {
    return await test.step(`Removing upvote from answer ${answerId} on question ${questionId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.feed.commentReaction(questionId, answerId), {
        data: {
          reactionType: 'emoji/2B06',
          action: 'remove',
        },
        headers: { 'Content-Type': 'application/json' },
      });
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(
          `Failed to remove upvote from answer ${answerId} on question ${questionId}. Status: ${response.status()}`
        );
      }
      return responseBody;
    });
  }

  /**
   * Gets question details including answers (comments) via API
   * @param questionId - The question ID
   * @returns Promise with the question details response including answers
   */
  async getQuestionDetails(questionId: string): Promise<GetQuestionDetailsResponse> {
    return await test.step(`Getting question details for question ${questionId}`, async () => {
      const response = await this.httpClient.get(API_ENDPOINTS.feed.fetchQuestionDetails(questionId), {
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        const errorDetails = JSON.stringify(responseBody, null, 2);
        throw new Error(
          `Failed to get question details for question ${questionId}. Status: ${response.status()}. Response: ${errorDetails}`
        );
      }
      return responseBody;
    });
  }

  /**
   * Fetches answers (comments) for a question via API
   * @param questionId - The question ID
   * @param options - Optional query parameters (kept for backward compatibility)
   * @returns Promise with the answers response
   */
  async fetchAnswers(
    questionId: string,
    options?: { size?: number; nextPageToken?: string; sortBy?: string }
  ): Promise<any> {
    return await test.step(`Fetching answers for question ${questionId}`, async () => {
      // Get question details which includes answers/comments
      const questionDetails = await this.getQuestionDetails(questionId);

      // Extract answers from the question details response
      // The answers are typically in recentComments.listOfItems
      if (questionDetails.result?.recentComments) {
        return {
          status: 'success',
          result: {
            listOfItems: questionDetails.result.recentComments.listOfItems || [],
            nextPageToken: questionDetails.result.recentComments.nextPageToken || null,
          },
        };
      }

      // If structure is different, return the full response
      return questionDetails;
    });
  }
}
