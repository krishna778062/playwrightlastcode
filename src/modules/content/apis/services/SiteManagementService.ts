import { APIRequestContext, expect, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import {
  SiteCreationPayload,
  SiteListOptions,
  SiteListResponse,
  SiteMembershipAction,
  SiteMembershipListResponse,
  SiteMembershipResponse,
  SitePermission,
} from '@core/types/siteManagement.types';

import { HttpClient } from '../../../../core/api/clients/httpClient';

import { ISiteManagementOperations } from '@/src/modules/content/apis/interfaces/ISiteManagemenOperations';

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

export class SiteManagementService implements ISiteManagementOperations {
  public httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Gets the category id for a given category
   * @param category - The category to get the id for
   * @returns The category id and name
   */
  async getCategoryId(category: string) {
    return await test.step(`Getting category id using API: ${category}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.site.category, {
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
      // Use the provided name as-is, or generate a unique one if not provided
      const siteName =
        overrides.name ||
        (() => {
          const randomNum = Math.floor(Math.random() * 1000000 + 1);
          return `AutomateUI_Test_${randomNum}`;
        })();
      const categoryObj = await this.getCategoryId(overrides.category?.name || 'default');

      // Always include as true, only override if explicitly provided
      const optionalParams = {
        hasPages: overrides.hasPages !== undefined ? overrides.hasPages : true,
        hasEvents: overrides.hasEvents !== undefined ? overrides.hasEvents : true,
        hasAlbums: overrides.hasAlbums !== undefined ? overrides.hasAlbums : true,
      };

      const payload: SiteCreationPayload = {
        ...defaultSitePayload,
        ...optionalParams,
        ...overrides,
        name: siteName, // Use the unique name
        category: {
          ...defaultSitePayload.category,
          ...overrides.category,
          categoryId: categoryObj.categoryId,
          name: categoryObj.name,
        },
      };

      // Build API payload with all required properties
      const apiPayload: any = {
        access: payload.access,
        hasDashboard: payload.hasDashboard,
        landingPage: payload.landingPage,
        isOwner: payload.isOwner,
        isMembershipAutoApproved: payload.isMembershipAutoApproved,
        isBroadcast: payload.isBroadcast,
        name: payload.name,
        category: {
          categoryId: payload.category.categoryId,
          name: payload.category.name,
        },
        // Always include required properties
        hasPages: payload.hasPages,
        hasEvents: payload.hasEvents,
        hasAlbums: payload.hasAlbums,
        isContentFeedEnabled: payload.isContentFeedEnabled,
        isContentSubmissionsEnabled: payload.isContentSubmissionsEnabled,
      };

      const response = await this.httpClient.post(API_ENDPOINTS.site.url, {
        data: {
          data: apiPayload,
        },
      });
      const siteJson = await response.json();
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
      const response = await this.httpClient.put(API_ENDPOINTS.site.deactivate, {
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

  /**
   * Activates a site using the API
   * @param siteId - The id of the site to activate
   */
  async activateSite(siteId: string) {
    return await test.step(`Activating site using API: ${siteId}`, async () => {
      const fullUrl = this.baseUrl ? `${this.baseUrl}${API_ENDPOINTS.site.activate}` : API_ENDPOINTS.site.activate;
      console.log('Activate site full URL:', fullUrl);
      const response = await this.httpClient.put(API_ENDPOINTS.site.activate, {
        data: {
          ids: [siteId],
          newStatus: 'activated',
        },
      });
      console.log('Activate site response:', response.status());
      const json = await response.json();
      if (json.status !== 'success') {
        throw new Error(`Failed to activate site: ${JSON.stringify(json)}`);
      }
      return json;
    });
  }

  async getFileIdFromSite(siteId: string, fileName: string): Promise<{ fileId: string; authorName: string }> {
    let file: any;
    await test.step(`Getting file id from site: ${siteId} and file name: ${fileName}`, async () => {
      await expect(async () => {
        const response = await this.httpClient.post(API_ENDPOINTS.content.listFiles, {
          data: {
            size: 16,
            siteId: siteId,
            term: '',
            context: 'siteFiles',
            provider: 'intranet',
            sortBy: 'createdNewest',
          },
        });
        const json = await response.json();
        file = json.result.listOfItems.find((item: any) => item.title === fileName);
        expect(file).toBeDefined();
      }).toPass({
        intervals: [5_000, 10_000, 20_000, 30_000],
        timeout: 40_000,
      });
    });
    if (!file) {
      throw new Error(`File with name ${fileName} not found in site ${siteId}`);
    }
    console.log('File found:', file.id);
    console.log('Author name:', file.owner.name);
    return {
      fileId: file.id,
      authorName: file.owner.name,
    };
  }

  /**
   * Searches for a video file by name within a specific site and retrieves its file ID and author information.
   * Uses the intranet file search API with retry logic to handle potential delays.
   *
   * @param siteId - The ID of the site to search within
   * @param fileName - The name of the video file to search for
   * @returns Promise resolving to an object containing the file ID and author name
   * @throws Will throw an error if the file is not found or API request fails
   */
  async getVideoFileIdFromSearch(siteId: string, fileName: string): Promise<{ fileId: string; authorName: string }> {
    let file: any;
    await test.step(`Fetching video file id using search API for site: ${siteId} and file name: ${fileName}`, async () => {
      await expect(
        async () => {
          const response = await this.httpClient.post(API_ENDPOINTS.search.intranetFile, {
            data: {
              q: fileName,
              site: siteId,
              includeImages: true,
            },
          });
          const responseBody = await response.json();
          console.log('responseBody', responseBody);
          // Find the specific file by checking the title field
          file = responseBody.result?.listOfItems?.find((item: any) => item.item.title === fileName);
          expect(file).toBeDefined();
        },
        {
          message: `Video file "${fileName}" to appear in search results for site ${siteId}`,
        }
      ).toPass({ intervals: [10_000, 20_000, 40_000], timeout: 60_000 });
    });
    console.log('fileID', file.item.fileId);
    return { fileId: file.item.fileId, authorName: file.item.owner.name };
  }

  /**
   * Gets a list of sites with optional filtering
   * @param options - The options for filtering sites
   * @param options.size - The number of sites to return (default: 100)
   * @param options.canManage - Filter sites that can be managed (default: true)
   * @param options.filter - Filter by site status (default: 'active')
   * @returns Promise resolving to the sites list response
   */
  async getListOfSites(options: SiteListOptions = {}): Promise<SiteListResponse> {
    return await test.step('Getting list of sites via API', async () => {
      const payload = {
        size: options.size || 1000,
        canManage: options.canManage !== undefined ? options.canManage : true,
        filter: options.filter || 'active',
        sortBy: options.sortBy || 'createdNewest',
      };

      const response = await this.httpClient.post(API_ENDPOINTS.site.listOfSites, {
        data: payload,
      });

      const json = await response.json();

      if (json.status !== 'success') {
        throw new Error(`Failed to get sites list. Status: ${json.status}`);
      }

      return json;
    });
  }
  async approveContent(siteId: string, contentId: string): Promise<void> {
    return await test.step(`Approving content: ${contentId} for site: ${siteId}`, async () => {
      // First, get the content details to get all required fields
      const getResponse = await this.httpClient.get(API_ENDPOINTS.content.delete(siteId, contentId));
      const contentData = await getResponse.json();

      if (!getResponse.ok() || contentData.status !== 'success') {
        throw new Error(`Failed to get content details. Status: ${getResponse.status()}`);
      }

      const content = contentData.result;

      // Prepare the approval payload with all required fields from the existing content
      const approvalPayload = {
        authoredBy: content.authoredBy?.id || content.authoredBy?.peopleId || content.authoredBy?.email,
        contentSubType: content.contentSubType || content.type || 'general',
        contentType: content.type || 'page',
        listOfFiles: content.listOfFiles || [],
        publishAt: content.publishAt || content.expiresAt || new Date().toISOString(),
        body: content.body || '',
        imgCaption: content.imgCaption || '',
        isRestricted: content.isRestricted || false,
        publishingStatus: content.status === 'published' ? 'immediate' : content.publishingStatus || 'immediate',
        listOfInlineImages: content.listOfInlineImages || [],
        listOfInlineVideos: content.listOfInlineVideos || [],
        summary: content.summary || null,
        readTimeInMin: content.readTimeInMin || 1,
        publishTo: content.publishTo || null,
        bodyHtml: content.bodyHtml || `<p>${content.excerpt || ''}</p>`,
        imgLayout: content.imgLayout || 'small',
        isMaximumWidth: content.isMaximumWidth || false,
        isQuestionAnswerEnabled: content.isQuestionAnswerEnabled !== undefined ? content.isQuestionAnswerEnabled : true,
        targetAudience: content.targetAudience || [],
        title: content.title || '',
        language: content.language || 'en-US',
        isFeedEnabled: content.isFeedEnabled !== undefined ? content.isFeedEnabled : true,
        listOfTopics: content.listOfTopics || [],
        category: content.category
          ? {
              id: content.category.id || content.category.categoryId || '',
              name: content.category.name || '',
            }
          : { id: '', name: 'Uncategorized' },
        manualTransEnabled: content.manualTransEnabled || false,
        // Event-specific fields
        ...(content.startsAt && { startsAt: content.startsAt }),
        ...(content.endsAt && { endsAt: content.endsAt }),
        ...(content.timezoneIso && { timezoneIso: content.timezoneIso }),
        ...(content.location && { location: content.location }),
        ...(content.isAllDay !== undefined && { isAllDay: content.isAllDay }),
        // Album-specific fields
        ...(content.listOfAlbumMedia && { listOfAlbumMedia: content.listOfAlbumMedia }),
        ...(content.coverImageMediaId && { coverImageMediaId: content.coverImageMediaId }),
      };

      const response = await this.httpClient.put(API_ENDPOINTS.content.approveContent(siteId, contentId), {
        data: approvalPayload,
      });
      return await response.json();
    });
  }

  /**
   * Unfeatures a site (removes it from featured sites)
   * @param siteId - The ID of the site to unfeature
   * @returns Promise containing the response
   */
  async unfeatureSite(siteId: string): Promise<any> {
    return await test.step(`Unfeaturing site: ${siteId}`, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.site.unfeature(siteId), {
        data: {},
      });

      const json = await response.json();

      if (json.status !== 'success') {
        throw new Error(
          `Failed to unfeature site. Status: ${json.status}, Message: ${json.message || 'Unknown error'}`
        );
      }

      console.log(`Successfully unfeatured site: ${siteId}`);
      return json;
    });
  }

  /**
   * Makes a user a site content manager
   * @param siteId - The ID of the site
   * @param userId - The ID of the user to make content manager
   * @returns Promise with the response
   */
  async makeUserSiteMembership(
    siteId: string,
    userId: string,
    permission: SitePermission = SitePermission.MEMBER,
    action: SiteMembershipAction = SiteMembershipAction.ADD
  ): Promise<SiteMembershipResponse> {
    return await test.step(`Making user ${userId} a content manager for site ${siteId}`, async () => {
      const payload: any = {
        userId: userId,
        action: action.toString(), // Convert enum to string
      };

      // Include permission for ADD and SET_PERMISSION operations, not for REMOVE
      if (action === SiteMembershipAction.ADD || action === SiteMembershipAction.SET_PERMISSION) {
        payload.permission = permission.toString(); // Convert enum to string
      }

      const response = await this.httpClient.post(API_ENDPOINTS.site.manageMembers(siteId), {
        data: payload,
      });

      const json = await response.json();

      if (!response.ok()) {
        throw new Error(
          `Failed to make user content manager. Status: ${response.status()}, Response: ${JSON.stringify(json)}`
        );
      }

      return json;
    });
  }

  /**
   * Updates site access level (public/private/unlisted)
   * @param siteId - The ID of the site to update
   * @param newAccess - The new access level ('public', 'private', 'unlisted')
   */
  async updateSiteAccess(siteId: string, newAccess: 'public' | 'private' | 'unlisted'): Promise<any> {
    return await test.step(`Updating site access level to ${newAccess} for site ${siteId}`, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.site.updateAccess, {
        data: {
          ids: [siteId],
          newAccessType: newAccess,
        },
      });

      const json = await response.json();

      if (!response.ok()) {
        throw new Error(
          `Failed to update site access. Status: ${response.status()}, Response: ${JSON.stringify(json)}`
        );
      }

      return json;
    });
  }

  /**
   * Deletes a site category by name using the API
   * @param categoryName - The name of the category to delete
   */
  async deleteCategory(categoryName: string): Promise<void> {
    return await test.step(`Deleting site category using API: ${categoryName}`, async () => {
      try {
        // First, get the category ID by name
        const categoryInfo = await this.getCategoryId(categoryName);

        // Delete the category using the category ID
        const response = await this.httpClient.delete(`${API_ENDPOINTS.site.category}/${categoryInfo.categoryId}`);

        if (response.status() === 200) {
          console.log(`Category "${categoryName}" deleted successfully via API`);
        } else {
          console.log(`Category deletion response status: ${response.status()}`);
        }
      } catch (error) {
        console.log(`Failed to delete category "${categoryName}" via API: ${error}`);
        throw error;
      }
    });
  }

  async getListOfCategories(options: { size?: number; sortBy?: string } = {}): Promise<any> {
    return await test.step('Getting list of categories via API', async () => {
      const defaultOptions = {
        includeSites: false,
        size: 10000,
        sortBy: 'alphabetical',
      };
      const response = await this.httpClient.post(API_ENDPOINTS.site.listOfCategories, {
        data: defaultOptions,
      });
      return await response.json();
    });
  }

  /**
   * Gets the membership list for a site
   * @param siteId - The site ID
   * @param options - Optional parameters for the membership list request
   * @returns Promise containing the membership list response
   */
  async getSiteMembershipList(
    siteId: string,
    options?: { size?: number; type?: string }
  ): Promise<SiteMembershipListResponse> {
    return await test.step(`Getting membership list for site ${siteId}`, async () => {
      const defaultOptions = {
        size: 16,
        type: 'members',
        ...options,
      };

      const response = await this.httpClient.post(API_ENDPOINTS.site.membershipList(siteId), {
        data: defaultOptions,
      });

      return await this.httpClient.parseResponse(response);
    });
  }

  /**
   * Gets detailed information about a specific site
   * @param siteId - The site ID to retrieve details for
   * @returns Promise containing the site details
   */
  async getSiteDetails(siteId: string): Promise<any> {
    return await test.step(`Getting site details for site ID: ${siteId}`, async () => {
      const response = await this.httpClient.get(API_ENDPOINTS.site.siteDetails(siteId), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseBody = await response.json();

      if (!response.ok()) {
        throw new Error(`Failed to get site details for ${siteId}. Status: ${response.status()}`);
      }

      return responseBody;
    });
  }

  /**
   * Gets the carousel items list for a specific site
   * @param siteId - The site ID to retrieve carousel items for
   * @returns Promise containing the carousel items response
   */
  async getSiteCarouselItems(siteId: string): Promise<any> {
    return await test.step(`Getting carousel items for site ID: ${siteId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.site.carouselItems(siteId), {
        data: {
          siteId: siteId,
        },
      });

      const responseBody = await response.json();
      console.log('Carousel items response:', JSON.stringify(responseBody, null, 2));

      if (!response.ok()) {
        throw new Error(`Failed to get carousel items for ${siteId}. Status: ${response.status()}`);
      }

      return responseBody;
    });
  }

  /**
   * Deletes a carousel item from a specific site
   * @param siteId - The site ID containing the carousel item
   * @param carouselItemId - The carousel item ID to delete
   * @returns Promise containing the delete response
   */
  async deleteSiteCarouselItem(siteId: string, carouselItemId: string): Promise<any> {
    return await test.step(`Deleting carousel item ${carouselItemId} from site ${siteId}`, async () => {
      const response = await this.httpClient.delete(API_ENDPOINTS.site.deleteCarouselItem(siteId, carouselItemId));

      const responseBody = await response.json();
      console.log('Delete carousel item response:', JSON.stringify(responseBody, null, 2));

      if (!response.ok()) {
        throw new Error(
          `Failed to delete carousel item ${carouselItemId} from site ${siteId}. Status: ${response.status()}`
        );
      }

      if (responseBody.status !== 'success') {
        throw new Error(`Delete carousel item failed. Response: ${JSON.stringify(responseBody)}`);
      }

      return responseBody;
    });
  }
}
