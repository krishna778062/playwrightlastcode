import { APIRequestContext, test } from '@playwright/test';
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

  /**
   * Gets the category id for a given category
   * @param category - The category to get the id for
   * @returns The category id and name
   */
  async getCategoryId(category: string) {
    return await test.step(`Getting category id using API: ${category}`, async () => {
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
    });
  }

  /**
   * Adds a new site using the API
   * @param overrides - The overrides to use for the site creation
   * @returns The site name and id
   */
  async addNewSite(overrides: Partial<SiteCreationPayload> = {}) {
    return await test.step(`Adding new site using API`, async () => {
      const randomNum = Math.floor(Math.random() * 1000000 + 1);
      const siteName = `AutomateUI_Test_${randomNum}`;
      const categoryObj = await this.getCategoryId(overrides.category?.name || 'default');

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
      return { siteName: siteName, siteId: siteJson.result.siteId };
    });
  }

  /**
   * Deactivates a site using the API
   * @param siteId - The id of the site to deactivate
   */
  async deactivateSite(siteId: string) {
    return await test.step(`Deactivating site using API: ${siteId}`, async () => {
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
    });
  }
}
