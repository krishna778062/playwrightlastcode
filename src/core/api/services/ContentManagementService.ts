import { APIRequestContext, expect, test } from '@playwright/test';
import { BaseApiClient } from '../clients/baseApiClient';
import { IContentManagementServices } from '../interfaces/IContentManagementServices';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { PageCreationPayload, EventCreationPayload } from '../../types/contentManagement.types';

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

export function buildBodyAndBodyHtml(text: string, type: 'page' | 'event') {
  if (type === 'page') {
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
        return { pageId: json.result.id };
      }
    );
  }

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
        return { eventId: json.result.id };
      }
    );
  }
}
