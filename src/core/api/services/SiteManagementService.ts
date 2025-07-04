import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { ISiteManagementOperations } from '@core/api/interfaces/ISiteManagemenOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { SiteCreationPayload } from '@core/types/siteManagement.types';

const defaultSitePayload: SiteCreationPayload = {
  access: 'public',
  hasPages: true,
  hasEvents: true,
  hasAlbums: true,
  hasDashboard: true,
  landingPage: 'dashboard',
  isContentFeedEnabled: true,
  isContentSubmissionsEnabled: true,
  isOwner: true,
  isMembershipAutoApproved: false,
  isBroadcast: false,
  name: 'Default Site Name',
  category: {
    categoryId: 'default-category-id',
    name: 'Default Category',
  },
};

export class SiteManagementService extends BaseApiClient implements ISiteManagementOperations {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }
  async getCategoryId(category: string) {
    const response = await this.post(API_ENDPOINTS.site.category, {
      data: {
        size: 16,
        sortBy: 'alphabetical',
        term: category,
      },
    });
    const json = await response.json();
    if (!json.result?.listOfItems?.length) throw new Error('Category not found');
    return {
      categoryId: json.result.listOfItems[0].categoryId,
      name: json.result.listOfItems[0].name,
    };
  }

  async addNewSite(overrides: Partial<SiteCreationPayload> = {}) {

    const payload: SiteCreationPayload = {
      ...defaultSitePayload,
      ...overrides,
      category: {
        ...defaultSitePayload.category,
        ...overrides.category,
      },
    };

    const response = await this.post(API_ENDPOINTS.site.url, {
      data: {
        data: {
          access: payload.access,
          hasPages: payload.hasPages,
          hasEvents: payload.hasEvents,
          hasAlbums: payload.hasAlbums,
          hasDashboard: payload.hasDashboard,
          landingPage: payload.landingPage,
          isContentFeedEnabled: payload.isContentFeedEnabled,
          isContentSubmissionsEnabled: payload.isContentSubmissionsEnabled,
          isOwner: payload.isOwner,
          isMembershipAutoApproved: payload.isMembershipAutoApproved,
          isBroadcast: payload.isBroadcast,
          name: payload.name,
          category: {
            categoryId: payload.category.categoryId,
            name: payload.category.name,
          },
        },
      },
    });
    const siteJson = await response.json();
    console.log('Full JSON Response:', JSON.stringify(siteJson, null, 2));
    if (siteJson.status !== 'success' || !siteJson.result?.siteId) {
      throw new Error(`Site creation failed. Response: ${JSON.stringify(siteJson)}`);
    }
    return { siteId: siteJson.result.siteId };
  }

  async deactivateSite(siteId: string) {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${API_ENDPOINTS.site.deactivate}` : API_ENDPOINTS.site.deactivate;
    console.log('Deactivate site full URL:', fullUrl);
    const response = await this.put(API_ENDPOINTS.site.deactivate, {
      data: {
        ids: [siteId],
        newStatus: 'deactivated',
      },
    });
    console.log('Deactivate site response:', response.status());
    const json = await response.json();
    if (json.status !== 'success') {
      throw new Error(`Failed to deactivate site: ${JSON.stringify(json)}`);
    }
    return json;
  }
}
