import { APIRequestContext, expect, test } from '@playwright/test';
import { BaseApiClient } from '@api/clients/baseApiClient';
import { IContentManagementServices } from '@api/interfaces/IContentManagementServices';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { PageCreationPayload, EventCreationPayload, AlbumCreationPayload } from '@core/types/contentManagement.types';

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
  listOfTopics: [],
  contentType: '',
  isNewTiptap: false,
};

const defaultPageContentPayload: PageCreationPayload = {
  ...defaultBaseContentPayload,
  contentSubType: 'news',
  category: { id: '', name: '' },
  body: '{"type":"doc","content":[{"type":"paragraph","attrs":{"Paragraphclass":"","textAlign":"left","indent":null},"content":[{"type":"text","text":"tesr"}]}],"hasInlineImages":true}',
  bodyHtml: '<p>tesr123</p>',
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

export function buildBodyAndBodyHtml(text: string, type: 'page' | 'event'|'album') {
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

export class ContentManagementService extends BaseApiClient implements IContentManagementServices {
  constructor(context: APIRequestContext, baseUrl: string) {
    super(context, baseUrl);
  }

  /**
   * Fetches page categories for a given site.
   * @param siteId - The site ID.
   * @returns The first category's ID and name.
   */
  async getPageCategoryID(siteId: string) {
    return await test.step(
      'Fetching page categories via API post request',
      async () => {
        const response = await this.post(API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.category, {
          data: { size: 16 },
        });
        const json = await response.json();
        if (!json.result?.listOfItems?.length) throw new Error('Category not found');
        return {
          categoryId: json.result.listOfItems[0].id,
          name: json.result.listOfItems[0].name,
        };
      }
    );
  }

  /**
   * Publishes new page content to a site.
   * @param siteId - The site ID.
   * @param overrides - Page content overrides.
   * @returns The created page's ID.
   */
  async addNewPageContent(siteId: string, overrides: Partial<typeof defaultPageContentPayload> = {}) {
    return await test.step(
      'Publishing page content via API post request',
      async () => {
        const payload = {
          ...defaultPageContentPayload,
          ...overrides,
          category: {
            ...defaultPageContentPayload.category,
            ...overrides.category,
          },
        };
        console.log('content payload: ', payload);
        const response = await this.post(API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.publish, {
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
          },
        });
        const json = await response.json();
        console.log('content JSON Response:', JSON.stringify(json, null, 2));
        if (json.status !== 'success' || !json.result?.id) {
          throw new Error(`Page creation failed. Response: ${JSON.stringify(json)}`);
        }
        return { 
          pageId: json.result.id,
          authorName: json.result.authoredBy?.name
        };
      }
    );
  }

  /**
   * Publishes new event content to a site.
   * @param siteId - The site ID.
   * @param overrides - Event content overrides.
   * @returns The created event's ID.
   */
  async addNewEventContent(siteId: string, overrides: Partial<EventCreationPayload> = {}) {
    return await test.step(
      'Publishing event content via API post request',
      async () => {
        const payload: EventCreationPayload = {
          ...defaultEventContentPayload,
          ...overrides,
        };
        console.log('event payload: ', payload);
        const response = await this.post(API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.publish, {
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
          },
        });
        const json = await response.json();
        console.log('event JSON Response:', JSON.stringify(json, null, 2));
        if (json.status !== 'success' || !json.result?.id) {
          throw new Error(`Event creation failed. Response: ${JSON.stringify(json)}`);
        }
        return { 
          eventId: json.result.id,
          authorName: json.result.authoredBy?.name
        };
      }
    );
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
      const response = await this.post(API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.publish, {
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
      });
      const json = await response.json();
      if (json.status !== 'success' || !json.result?.id) {
        throw new Error(`Album creation failed. Response: ${JSON.stringify(json)}`);
      }
      return { 
        albumId: json.result.id,
        authorName: json.result.authoredBy?.name
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
      const response = await this.delete(API_ENDPOINTS.content.delete(siteId, contentId));
      expect(response.status()).toBe(200);
    });
  }
}
