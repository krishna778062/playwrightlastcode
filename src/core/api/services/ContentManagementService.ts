import { APIRequestContext, expect } from '@playwright/test';
import { BaseApiClient } from '../clients/baseApiClient';
import { IContentManagementServices } from '../interfaces/IContentManagementServices';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { PageCreationPayload } from '../../types/pageManagement.types';

const defaultPageContentPayload: PageCreationPayload = {
  contentSubType: 'news',
  listOfFiles: [],
  publishAt: new Date().toISOString(),
  body: '{"type":"doc","content":[{"type":"paragraph","attrs":{"Paragraphclass":"","textAlign":"left","indent":null},"content":[{"type":"text","text":"AutomateDescription"}]}],"hasInlineImages":true}',
  imgCaption: '',
  publishingStatus: 'immediate',
  bodyHtml: '<p>AutomateDescription</p>',
  imgLayout: 'small',
  title: 'Default Page Name',
  language: 'en',
  isFeedEnabled: true,
  listOfTopics: [],
  category: {
    id: 'default-category-id',
    name: 'Uncategorized',
  },
  contentType: 'page',
  isNewTiptap: false,
};

export class ContentManagementService extends BaseApiClient implements IContentManagementServices {
  constructor(context: APIRequestContext, baseUrl: string) {
    super(context, baseUrl);
  }

  async getPageCategoryID(siteId: string) {
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

  async addNewPageContent(siteId: string, overrides: Partial<typeof defaultPageContentPayload> = {}) {
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
}
