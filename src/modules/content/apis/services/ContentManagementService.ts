import { faker } from '@faker-js/faker';
import { APIRequestContext, expect, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import {
  AlbumCreationPayload,
  ContentListResponse,
  EventCreationPayload,
  TopicListResponse,
} from '@core/types/contentManagement.types';

import { HttpClient } from '../../../../core/api/clients/httpClient';

import { IContentManagementServices } from '@/src/modules/content/apis/interfaces/IContentManagementServices';

const defaultBaseContentPayload = {
  listOfFiles: [],
  publishAt: new Date().toISOString(),
  body: '',
  imgCaption: '',
  publishingStatus: 'immediate',
  bodyHtml: 'Default Description',
  imgLayout: 'small',
  title: 'Default title',
  language: 'en',
  isFeedEnabled: true,
  listOfTopics: [] as { id: string; name: string }[],
  contentType: '',
  isNewTiptap: false,
};

const defaultPageContentPayload = () => {
  const contentText = faker.lorem.sentence();
  return {
    ...defaultBaseContentPayload,
    contentSubType: 'news',
    category: { id: '', name: '' },
    body: `{"type":"doc","content":[{"type":"paragraph","attrs":{"indentation":0,"textAlign":"left","className":"","data-sw-sid":null},"content":[{"type":"text","text":"${contentText}"}]}]}`,
    bodyHtml: `<p indentation="0" textAlign="left" class="">${contentText}</p>`,
    language: 'en-US',
    // Optional scheduling fields
    publishTo: undefined as string | undefined,
    listOfInlineVideos: undefined as any[] | undefined,
    readTimeInMin: undefined as number | undefined,
    targetAudience: undefined as any[] | undefined,
  };
};

const defaultEventContentPayload: EventCreationPayload = {
  ...defaultBaseContentPayload,
  startsAt: new Date().toISOString(),
  endsAt: new Date().toISOString(),
  isAllDay: true,
  timezoneIso: 'UTC',
  location: 'Gurgaon',
  directions: [],
  bodyHtml: '<p indentation="0" textAlign="left" class="">testing event</p>',
  body: '{"type":"doc","content":[{"type":"paragraph","attrs":{"indentation":0,"textAlign":"left","className":"","data-sw-sid":null},"content":[{"type":"text","text":"testing event"}]}]}',
};

const defaultAlbumContentPayload: AlbumCreationPayload = {
  ...defaultBaseContentPayload,
  contentType: 'album',
  coverImageMediaId: '',
  listOfAlbumMedia: [],
};

export function buildBodyAndBodyHtml(text: string, type: 'page' | 'event' | 'album') {
  if (type === 'page' || type === 'album') {
    return {
      body: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: {
              Paragraphclass: '',
              textAlign: 'left',
              indent: null,
            },
            content: [
              {
                type: 'text',
                text: text,
              },
            ],
          },
        ],
        hasInlineImages: true,
      }),
      bodyHtml: `<p>${text}</p>`,
    };
  } else {
    return {
      body: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: {
              indentation: 0,
              textAlign: 'left',
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
      }),
      bodyHtml: `<p indentation="0" textAlign="left" class="">${text}</p>`,
    };
  }
}

export class ContentManagementService implements IContentManagementServices {
  public httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Fetches page categories for a given site.
   * @param siteId - The site ID.
   * @returns The first category's ID and name.
   */
  async getPageCategoryID(siteId: string): Promise<{ categoryId: string; name: string }> {
    let categoryInfo: { categoryId: string; name: string } | undefined;

    await test.step('Fetching page categories via API post request', async () => {
      await expect
        .poll(
          async () => {
            const response = await this.httpClient.post(
              API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.category,
              {
                data: { size: 16 },
              }
            );
            const json = await response.json();
            if (json.result?.listOfItems?.length > 0) {
              categoryInfo = {
                categoryId: json.result.listOfItems[0].id,
                name: json.result.listOfItems[0].name,
              };
            }
            return categoryInfo;
          },
          {
            message: `Could not find page category for site ${siteId} after 3 retries.`,
            intervals: [2000, 4000, 6000],
          }
        )
        .toBeDefined();
    });

    if (!categoryInfo) {
      throw new Error(`Could not find page category for site ${siteId}`);
    }
    return categoryInfo;
  }

  /**
   * Publishes new page content to a site.
   * @param siteId - The site ID.
   * @param overrides - Page content overrides.
   * @returns The created page's ID.
   */
  async addNewPageContent(siteId: string, overrides: Partial<ReturnType<typeof defaultPageContentPayload>> = {}) {
    return await test.step('Publishing page content via API post request', async () => {
      const payload = {
        ...defaultPageContentPayload(),
        ...overrides,
        category: {
          ...defaultPageContentPayload().category,
          ...overrides.category,
        },
      };
      const response = await this.httpClient.post(
        API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.publish,
        {
          data: {
            contentSubType: payload.contentSubType,
            listOfFiles: payload.listOfFiles,
            publishAt: payload.publishAt,
            body: payload.body,
            imgCaption: payload.imgCaption,
            publishingStatus: payload.publishingStatus,
            bodyHtml: payload.bodyHtml,
            imgLayout: payload.imgLayout,
            title: payload.title,
            language: payload.language,
            isFeedEnabled: payload.isFeedEnabled,
            listOfTopics: payload.listOfTopics,
            category: {
              id: payload.category.id,
              name: payload.category.name,
            },
            contentType: payload.contentType,
            isNewTiptap: payload.isNewTiptap,
            ...(payload.publishAt && { publishAt: payload.publishAt }),
            ...(payload.publishTo && { publishTo: payload.publishTo }),
          },
        }
      );

      const json = await response.json();
      if (json.status !== 'success' || !json.result?.id) {
        throw new Error(`Page creation failed. Response: ${JSON.stringify(json)}`);
      }
      return {
        pageId: json.result.id,
        authorName: json.result.authoredBy?.name,
        publishAt: json.result.publishAt,
        publishTo: json.result.publishTo,
        isScheduled: json.result.isScheduled,
      };
    });
  }

  /**
   * Publishes new event content to a site.
   * @param siteId - The site ID.
   * @param overrides - Event content overrides.
   * @returns The created event's ID.
   */
  async addNewEventContent(siteId: string, overrides: Partial<EventCreationPayload> = {}) {
    return await test.step('Publishing event content via API post request', async () => {
      const payload: EventCreationPayload = {
        ...defaultEventContentPayload,
        ...overrides,
      };
      console.log('event payload: ', payload);
      const response = await this.httpClient.post(
        API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.publish,
        {
          data: {
            listOfFiles: payload.listOfFiles,
            publishAt: payload.publishAt,
            body: payload.body,
            imgCaption: payload.imgCaption,
            startsAt: payload.startsAt,
            isAllDay: payload.isAllDay,
            publishingStatus: payload.publishingStatus,
            endsAt: payload.endsAt,
            timezoneIso: payload.timezoneIso,
            bodyHtml: payload.bodyHtml,
            imgLayout: payload.imgLayout,
            directions: payload.directions,
            location: payload.location,
            title: payload.title,
            language: payload.language,
            isFeedEnabled: payload.isFeedEnabled,
            listOfTopics: payload.listOfTopics,
            contentType: payload.contentType,
            isNewTiptap: payload.isNewTiptap,
            ...(payload.eventSync && { eventSync: payload.eventSync }),
            ...(payload.rsvp && { rsvp: payload.rsvp }),
          },
        }
      );
      const json = await response.json();
      console.log('event JSON Response:', JSON.stringify(json, null, 2));
      if (json.status !== 'success' || !json.result?.id) {
        throw new Error(`Event creation failed. Response: ${JSON.stringify(json)}`);
      }
      return {
        eventId: json.result.id,
        authorName: json.result.authoredBy?.name,
        ...(json.result.eventSyncDetails && { eventSyncDetails: json.result.eventSyncDetails }),
        ...(json.result.hasRsvp !== undefined && { hasRsvp: json.result.hasRsvp }),
        ...(json.result.rsvp && { rsvpDetails: json.result.rsvp }),
      };
    });
  }

  /**
   * Publishes new album content to a site.
   * @param siteId - The site ID.
   * @param overrides - Album content overrides.
   * @returns The created album's ID.
   */
  async addNewAlbumContent(siteId: string, overrides: Partial<AlbumCreationPayload> = {}) {
    return await test.step('Publishing album content via API post request', async () => {
      const payload: AlbumCreationPayload = {
        ...defaultAlbumContentPayload,
        ...overrides,
      };
      const response = await this.httpClient.post(
        API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.publish,
        {
          data: {
            listOfFiles: payload.listOfFiles,
            publishAt: payload.publishAt,
            body: payload.body,
            imgCaption: payload.imgCaption,
            publishingStatus: payload.publishingStatus,
            bodyHtml: payload.bodyHtml,
            imgLayout: payload.imgLayout,
            title: payload.title,
            language: payload.language,
            isFeedEnabled: payload.isFeedEnabled,
            listOfTopics: payload.listOfTopics,
            contentType: payload.contentType,
            isNewTiptap: payload.isNewTiptap,
            coverImageMediaId: payload.coverImageMediaId,
            listOfAlbumMedia: payload.listOfAlbumMedia,
          },
        }
      );
      const json = await response.json();
      if (json.status !== 'success' || !json.result?.id) {
        throw new Error(`Album creation failed. Response: ${JSON.stringify(json)}`);
      }
      return {
        albumId: json.result.id,
        authorName: json.result.authoredBy?.name,
      };
    });
  }

  /**
   * Deletes content from a site.
   * @param siteId - The site ID.
   * @param contentId - The content ID.
   */
  async deleteContent(siteId: string, contentId: string) {
    return await test.step('Deleting page via API delete request', async () => {
      await expect
        .poll(
          async () => {
            const response = await this.httpClient.delete(API_ENDPOINTS.content.delete(siteId, contentId), {
              timeout: 50_000,
            });
            return response.status() === 200;
          },
          {
            intervals: [10000, 20000, 30000],
            timeout: 50_000,
          }
        )
        .toBe(true);
    });
  }

  /**
   * Creates a new topic
   * @param topicName - The name of the topic to create
   * @returns The created topic response
   */
  async createTopic(topicName: string): Promise<{ topicId: string; name: string }> {
    return await test.step(`Creating topic: ${topicName}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.content.createTopic, {
        data: {
          name: topicName,
        },
      });
      const json = await response.json();
      if (json.status !== 'success' || !json.result?.topic_id) {
        throw new Error(`Topic creation failed. Response: ${JSON.stringify(json)}`);
      }
      return {
        topicId: json.result.topic_id,
        name: json.result.name,
      };
    });
  }

  /**
   * Deletes one or more topics by their IDs
   * @param topicIds - Array of topic IDs to delete
   * @returns Promise that resolves when topics are deleted
   */
  async deleteTopic(topicIds: string[]): Promise<void> {
    return await test.step(`Deleting topics: ${topicIds.join(', ')}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.content.deleteTopics, {
        data: {
          ids: topicIds,
        },
      });

      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete topics. Status: ${response.status()}, Response: ${errorText.substring(0, 200)}`
        );
      }

      const json = await response.json();
      if (json.status !== 'success') {
        throw new Error(`Topic deletion failed. Response: ${JSON.stringify(json)}`);
      }

      console.log(`Topics deleted successfully: ${topicIds.join(', ')}`);
    });
  }

  /**
   * Gets the list of topics
   * @param size - Number of topics to return (default: 16)
   * @param term - Search term to filter topics (default: empty string)
   * @param nextPageToken - Token for pagination (default: 0)
   * @returns The topic list response
   */
  async getTopicList(size: number = 16, term: string = '', nextPageToken: number = 0): Promise<TopicListResponse> {
    return await test.step(`Getting list of topics with size: ${size}, term: "${term}", nextPageToken: ${nextPageToken}`, async () => {
      const requestData = {
        size: 16,
      };

      const response = await this.httpClient.post(API_ENDPOINTS.content.topics, {
        data: requestData,
      });
      return await this.httpClient.parseResponse<TopicListResponse>(response);
    });
  }

  /**
   * Gets the content list in a specific site
   * @param siteId - The ID of the site to get content from
   * @param options - Optional parameters for content filtering
   * @returns Promise with the content list response
   */
  async getContentList(
    options: {
      siteId?: string;
      size?: number;
      status?: string;
      filter?: string;
      sortBy?: string;
      contribution?: string;
    } = {}
  ) {
    return await test.step('Getting content list ', async () => {
      const requestData = {
        size: options.size || 16,
        status: options.status || 'published',
        sortBy: options.sortBy || 'publishedNewest',
        contribution: options.contribution || 'all',
        filter: options.filter || 'managing',
        ...(options.siteId && { siteId: options.siteId }),
      };

      const response = await this.httpClient.post(API_ENDPOINTS.content.contentListInSite, {
        data: requestData,
      });
      return await this.httpClient.parseResponse<ContentListResponse>(response);
    });
  }

  /**
   * Gets the must read content list
   * @param options - Optional parameters for must read content filtering
   * @param options.size - Number of items to return (default: 16)
   * @param options.sortBy - Sort order (default: 'unreadMustReadNewest')
   * @param options.peopleId - The people ID of the user
   * @param options.isMustRead - Filter for must read content (default: true)
   * @returns Promise with the content list response
   */
  async getMustReadContentList(options: { size?: number; sortBy?: string; peopleId: string; isMustRead?: boolean }) {
    return await test.step('Getting must read content list', async () => {
      const requestData: {
        size: number;
        peopleId: string;
        isMustRead: boolean;
        sortBy?: string;
      } = {
        size: options.size || 16,
        peopleId: options.peopleId,
        isMustRead: options.isMustRead !== undefined ? options.isMustRead : true,
      };

      if (options.sortBy) {
        requestData.sortBy = options.sortBy;
      }

      const response = await this.httpClient.post(API_ENDPOINTS.content.contentListInSite, {
        data: requestData,
      });
      return await this.httpClient.parseResponse<ContentListResponse>(response);
    });
  }
}
