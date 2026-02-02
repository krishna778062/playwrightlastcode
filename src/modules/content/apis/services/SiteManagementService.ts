import { APIRequestContext, expect, test } from '@playwright/test';

import { HttpClient } from '@core/api/clients/httpClient';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import {
  SearchSitesResponse,
  SiteCreationPayload,
  SiteListOptions,
  SiteListResponse,
  SiteMembershipAction,
  SiteMembershipListResponse,
  SiteMembershipResponse,
  SitePermission,
} from '@core/types/siteManagement.types';
import { log } from '@core/utils/logger';

import { PeopleListResponse } from '@/src/core/types/people.type';
import { ISiteManagementOperations } from '@/src/modules/content/apis/interfaces/ISiteManagemenOperations';
import { getContentTenantConfigFromCache } from '@/src/modules/content/config/contentConfig';

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
        timeout: 30000,
      });
      const json = await response.json();
      if (!json.result?.listOfItems?.length) throw new Error('Category not found');
      return {
        categoryId: json.result.listOfItems[0].categoryId,
        name: json.result.listOfItems[0].name,
      };
    });
  }

  async getListOfPeople(options?: { size?: number; filter?: string }): Promise<PeopleListResponse> {
    return await test.step(`Getting list of people using API`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.site.people, {
        data: {
          filter: options?.filter || 'favorites',
          size: options?.size || 100,
        },
      });
      return await this.httpClient.parseResponse<PeopleListResponse>(response);
    });
  }

  async acceptMembershipRequest(siteId: string, requestId: string): Promise<void> {
    return await test.step(`Accepting membership request for site: ${siteId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.site.acceptMembershipRequest(siteId), {
        data: {
          action: 'approve',
          request_id: requestId,
        },
      });
      return await response.json();
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
      const categoryObj = await this.getCategoryId(overrides.category?.name || 'uncategorized');

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

  async getFollowersAndFollowingList(userId: string, size: number = 100): Promise<any> {
    return await test.step(`Getting followers and following list for user: ${userId}`, async () => {
      const allResults: any[] = [];
      let nextPageToken: number | undefined = undefined;
      let hasMorePages = true;
      let lastResponse: any = null;

      while (hasMorePages) {
        const response = await this.httpClient.get(
          API_ENDPOINTS.identity.followersAndFollowingList(userId, size, nextPageToken)
        );
        if (!response.ok()) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to get followers and following list. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`
          );
        }
        const json = await response.json();
        lastResponse = json;
        log.debug('followersAndFollowingList response', { response: json });

        // Merge results by type
        if (json.result && Array.isArray(json.result)) {
          for (const item of json.result) {
            const existingItem = allResults.find(r => r.type === item.type);
            if (existingItem) {
              // Append to existing list
              existingItem.listOfItems = [...existingItem.listOfItems, ...item.listOfItems];
              existingItem.count = String(parseInt(existingItem.count) + item.listOfItems.length);
              existingItem.nextPageToken = item.nextPageToken;
            } else {
              // Add new item
              allResults.push({ ...item });
            }
          }

          // Check if there's a nextPageToken for any type
          const followingItem = json.result.find((item: any) => item.type === 'following');
          nextPageToken = followingItem?.nextPageToken;
          hasMorePages = nextPageToken !== undefined && nextPageToken !== null;
        } else {
          hasMorePages = false;
        }
      }

      return {
        status: lastResponse?.status || 'success',
        responseTimeStamp: lastResponse?.responseTimeStamp,
        message: lastResponse?.message || 'Retrieved list successfully',
        result: allResults,
      };
    });
  }
  /**
   * Deactivates a site using the API
   * @param siteId - The id of the site to deactivate
   */
  async deactivateSite(siteId: string) {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${API_ENDPOINTS.site.deactivate}` : API_ENDPOINTS.site.deactivate;
    log.debug('Deactivate site full URL', { url: fullUrl });
    const response = await this.httpClient.put(API_ENDPOINTS.site.deactivate, {
      data: {
        ids: [siteId],
        newStatus: 'deactivated',
      },
    });
    log.debug('Deactivate site response', { status: response.status() });
    const json = await response.json();
    if (json.status !== 'success') {
      throw new Error(`Failed to deactivate site: ${JSON.stringify(json)}`);
    }
    return json;
  }

  /**
   * Activates a site using the API
   * @param siteId - The id of the site to activate
   */
  async activateSite(siteId: string) {
    return await test.step(`Activating site using API: ${siteId}`, async () => {
      const fullUrl = this.baseUrl ? `${this.baseUrl}${API_ENDPOINTS.site.activate}` : API_ENDPOINTS.site.activate;
      log.debug('Activate site full URL', { url: fullUrl });
      const response = await this.httpClient.put(API_ENDPOINTS.site.activate, {
        data: {
          ids: [siteId],
          newStatus: 'activated',
        },
      });
      log.debug('Activate site response', { status: response.status() });
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
    log.debug('File found', { fileId: file.id, authorName: file.owner.name });
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
          log.debug('responseBody', { response: responseBody });
          // Find the specific file by checking the title field
          file = responseBody.result?.listOfItems?.find((item: any) => item.item.title === fileName);
          expect(file).toBeDefined();
        },
        {
          message: `Video file "${fileName}" to appear in search results for site ${siteId}`,
        }
      ).toPass({ intervals: [10_000, 20_000, 40_000, 60_000, 80_000, 100_000, 110_000, 120_000], timeout: 120_000 });
    });
    log.debug('fileID', { fileId: file.item.fileId });
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
        sortBy: options.sortBy || 'alphabetical',
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

  /**
   * Gets list of unfeatured sites
   * @param options - Optional parameters for size and sortBy
   * @returns Promise containing list of unfeatured sites
   */
  async getUnfeaturedSites(options?: { size?: number; sortBy?: string }): Promise<SiteListResponse> {
    return await test.step('Getting list of unfeatured sites via API', async () => {
      const payload = {
        filter: 'unfeatured',
        size: options?.size || 64,
        sortBy: options?.sortBy || 'alphabetical',
      };

      const response = await this.httpClient.post(API_ENDPOINTS.site.listOfSites, {
        data: payload,
      });

      const json = await response.json();

      if (json.status !== 'success') {
        throw new Error(`Failed to get unfeatured sites list. Status: ${json.status}`);
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
        contentSubType: content.contentSubType || content.type || 'news',
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

  async rejectContent(siteId: string, contentId: string, rejectionComment?: string): Promise<any> {
    return await test.step(`Rejecting content: ${contentId} for site: ${siteId}`, async () => {
      const rejectPayload = {
        rejectionComment: rejectionComment || 'This is not good',
        action: 'reject',
      };

      // Use action as query parameter similar to approveContent endpoint pattern
      const endpointWithAction = `${API_ENDPOINTS.content.manageContent(siteId, contentId)}`;

      log.debug('Attempting to reject content', { payload: JSON.stringify(rejectPayload) });
      const response = await this.httpClient.post(endpointWithAction, {
        data: rejectPayload,
      });

      const json = await response.json();
      log.debug('rejectContent response', {
        status: response.status(),
        responseBody: JSON.stringify(json, null, 2),
      });

      if (!response.ok() || json.status !== 'success') {
        // Extract error details from errors array if present
        const errors = json.errors || [];
        const errorMessages = errors.map((err: any) => `${err.error_code}: ${err.message}`).join(', ');
        const errorMessage = json.message || json.error || errorMessages || 'Unknown error';
        const errorCode = json.errors?.[0]?.error_code || json.errorCode || json.code || 'N/A';

        throw new Error(
          `Failed to reject content. HTTP Status: ${response.status()}, Error Code: ${errorCode}, Message: ${errorMessage}, Full Response: ${JSON.stringify(json)}`
        );
      }

      log.debug(`Successfully rejected content: ${contentId}`);
      return json;
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

      log.debug(`Successfully unfeatured site: ${siteId}`);
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
    return await test.step(`Making user ${userId} a ${permission} for site ${siteId}`, async () => {
      const payload: any = {
        userId: userId,
        action: action.toString(), // Convert enum to string
      };

      // Include permission for ADD and SET_PERMISSION operations, not for REMOVE
      if (action === SiteMembershipAction.ADD || action === SiteMembershipAction.SET_PERMISSION) {
        payload.permission = permission.toString(); // Convert enum to string
      }

      if (action === SiteMembershipAction.SET_PERMISSION) {
        const siteMembershipList = await this.getSiteMembershipList(siteId);
        const userMembership = siteMembershipList.result?.listOfItems?.find(
          (member: any) => member.peopleId === userId
        );
        if (SitePermission.OWNER === permission && userMembership?.isOwner) {
          return {
            status: 'success',
            message: `User ${userId} is already an owner of site ${siteId}`,
            result: { userId, siteId, permission, action },
          };
        }
        if (SitePermission.MANAGER === permission && userMembership?.isManager) {
          return {
            status: 'success',
            message: `User ${userId} is already a manager of site ${siteId}`,
            result: { userId, siteId, permission, action },
          };
        }
        if (SitePermission.MEMBER === permission && userMembership?.isMember) {
          return {
            status: 'success',
            message: `User ${userId} is already a member of site ${siteId}`,
            result: { userId, siteId, permission, action },
          };
        }
        if (SitePermission.CONTENT_MANAGER === permission && userMembership?.isContentManager) {
          return {
            status: 'success',
            message: `User ${userId} is already a content manager of site ${siteId}`,
            result: { userId, siteId, permission, action },
          };
        }
      }

      const response = await this.httpClient.post(API_ENDPOINTS.site.manageMembers(siteId), {
        data: payload,
      });

      const json = await response.json();

      if (!response.ok()) {
        throw new Error(
          `Failed to make user ${permission} for site ${siteId}. Status: ${response.status()}, Response: ${JSON.stringify(json)}`
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
          log.debug(`Category "${categoryName}" deleted successfully via API`);
        } else {
          log.debug(`Category deletion response status: ${response.status()}`);
        }
      } catch (error) {
        log.error(`Failed to delete category "${categoryName}" via API`, error);
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
        size: 100,
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
        throw new Error(
          `Failed to get site details for ${siteId}. Status: ${response.status()} and body: ${JSON.stringify(responseBody)}`
        );
      }

      return responseBody;
    });
  }

  /**
   * Searches for sites using the search API
   * @param options - Search options
   * @param options.q - Search query string
   * @param options.canManage - Filter sites that can be managed (default: true)
   * @param options.filter - Filter by site status (default: 'all')
   * @param options.includeDeactivated - Include deactivated sites (default: true)
   * @returns Promise containing the search results
   */
  async searchSites(
    siteName: string,
    options: {
      canManage?: boolean;
      filter?: string;
      includeDeactivated?: boolean;
    }
  ): Promise<SearchSitesResponse> {
    return await test.step(`Searching sites with query: ${siteName}`, async () => {
      const payload = {
        q: siteName,
        canManage: options.canManage !== undefined ? options.canManage : true,
        filter: options.filter || 'all',
        includeDeactivated: options.includeDeactivated !== undefined ? options.includeDeactivated : true,
      };

      const response = await this.httpClient.post(API_ENDPOINTS.search.sites, {
        data: payload,
      });

      const responseBody = await response.json();

      if (!response.ok()) {
        throw new Error(
          `Failed to search sites. Status: ${response.status()}, Response: ${JSON.stringify(responseBody)}`
        );
      }

      return responseBody;
    });
  }

  /**
   * Gets user sites access information for given site IDs
   * @param siteIds - Array of site IDs to check access for
   * @returns Promise containing the user sites access response with status and result array
   */
  async getUserSitesAccess(siteIds: string[]): Promise<{
    status: string;
    result: Array<{ siteId: string; hasAccess: boolean }>;
  }> {
    return await test.step(`Getting user sites access for sites: ${siteIds.join(', ')}`, async () => {
      const payload = {
        siteIds: siteIds,
      };

      const response = await this.httpClient.post(API_ENDPOINTS.site.userSitesAccess, {
        data: payload,
      });

      const responseBody = await response.json();

      if (!response.ok()) {
        throw new Error(
          `Failed to get user sites access. Status: ${response.status()}, Response: ${JSON.stringify(responseBody)}`
        );
      }

      return responseBody;
    });
  }

  /**
   * Gets bulk users sites access information for given site IDs and user IDs
   * @param siteIds - Array of site IDs to check access for
   * @param userIds - Array of user IDs to check access for
   * @returns Promise containing the bulk users sites access response
   */

  async getBulkUsersSitesAccess(
    siteIds: string[],
    userIds: string[]
  ): Promise<{
    status: string;
    result: Array<{ userId: string; siteId: string; hasAccess: boolean }>;
  }> {
    return await test.step(`Getting bulk users sites access for ${siteIds.length} sites and ${userIds.length} users`, async () => {
      // Get orgId and internalApiBaseUrl from content config
      const tenantConfig = getContentTenantConfigFromCache();
      const orgId = tenantConfig.orgId;
      const internalApiBaseUrl = tenantConfig.internalApiBaseUrl;

      // Create a separate HttpClient for internal APIs (similar to B2B service)
      const internalApiClient = new HttpClient(this.httpClient.context, internalApiBaseUrl);

      const headers: Record<string, string> = {};
      headers['x-smtip-tid'] = orgId;

      const payload = {
        siteIds: siteIds,
        userIds: userIds,
      };

      const response = await internalApiClient.post(API_ENDPOINTS.site.bulkUsersSitesAccess, {
        data: payload,
        headers: headers,
      });

      const responseBody = await response.json();

      if (!response.ok()) {
        throw new Error(
          `Failed to get bulk users sites access. Status: ${response.status()}, Response: ${JSON.stringify(responseBody)}`
        );
      }

      return responseBody;
    });
  }

  /**
   * Gets segments config to retrieve segment IDs
   * @returns Promise containing the segments config response
   */
  async getSegmentsConfig(): Promise<any> {
    return await test.step('Getting segments config', async () => {
      const response = await this.httpClient.get(API_ENDPOINTS.segments.configs);

      const responseBody = await response.json();

      if (!response.ok()) {
        throw new Error(
          `Failed to get segments config. Status: ${response.status()}, Response: ${JSON.stringify(responseBody)}`
        );
      }

      // Log the full response for debugging
      log.info(`Segments config response: ${JSON.stringify(responseBody)}`);

      return responseBody;
    });
  }

  /**
   * Gets the default segment ID from segments config
   * @returns Promise containing the default segment ID
   */
  async getDefaultSegmentId(): Promise<string> {
    return await test.step('Getting default segment ID', async () => {
      const segmentsConfig = await this.getSegmentsConfig();

      // Log full response for debugging
      log.info(`Full segments config: ${JSON.stringify(segmentsConfig, null, 2)}`);

      // Validate response structure
      if (!segmentsConfig?.result) {
        throw new Error(
          `Invalid segments config response: result is missing. Full response: ${JSON.stringify(segmentsConfig)}`
        );
      }

      // Check if segments exist in result
      const segments = segmentsConfig.result.segments;
      if (!segments) {
        // Log the actual result structure to help debug
        log.error(`Segments array is missing. Result keys: ${Object.keys(segmentsConfig.result).join(', ')}`);
        throw new Error(
          `Segments array is missing in response. Available keys in result: ${Object.keys(segmentsConfig.result).join(', ')}. Full result: ${JSON.stringify(segmentsConfig.result)}`
        );
      }

      if (!Array.isArray(segments) || segments.length === 0) {
        throw new Error(`No segments found in segments config. Segments: ${JSON.stringify(segments)}`);
      }

      // Find default segment, or use the first segment if no default exists
      const defaultSegment = segments.find((segment: any) => segment.isDefault === true);
      const segmentToUse = defaultSegment || segments[0];

      if (!segmentToUse?.segmentId) {
        throw new Error(`Invalid segment structure. Segment: ${JSON.stringify(segmentToUse)}`);
      }

      log.info(`Using segment ID: ${segmentToUse.segmentId} (default: ${!!defaultSegment})`);
      return segmentToUse.segmentId;
    });
  }

  /**
   * Gets list of people using v2/identity/people API
   * @param options - Options for the people list request
   * @returns Promise containing the people list response
   */
  async getListOfPeopleV2(options?: {
    size?: number;
    sortBy?: string[];
    includePendingActivation?: boolean;
    includeTotal?: boolean;
    q?: string;
    limitToSegment?: boolean;
  }): Promise<any> {
    return await test.step('Getting list of people using v2 API', async () => {
      const limitToSegment = options?.limitToSegment !== undefined ? options.limitToSegment : true;
      let segmentId: string | undefined;
      const headers: Record<string, string> = {};

      // Only get segment ID if limitToSegment is true
      if (limitToSegment) {
        try {
          segmentId = await this.getDefaultSegmentId();
          if (segmentId) {
            headers['x-smtip-segment-id'] = segmentId;
          }
        } catch (error) {
          log.warn(`Failed to get segment ID, proceeding without segment header. Error: ${error}`);
          // If we can't get segment ID and limitToSegment is true, set it to false
          // to avoid API errors
        }
      }

      const payload = {
        sortBy: options?.sortBy || ['user_name', 'asc'],
        size: options?.size || 16,
        includePendingActivation:
          options?.includePendingActivation !== undefined ? options.includePendingActivation : true,
        includeTotal: options?.includeTotal !== undefined ? options.includeTotal : true,
        q: options?.q || '',
        limitToSegment: segmentId ? limitToSegment : false,
      };

      const requestOptions: any = {
        data: payload,
      };

      // Only add headers if we have a segment ID
      if (Object.keys(headers).length > 0) {
        requestOptions.headers = headers;
      }

      const response = await this.httpClient.post(API_ENDPOINTS.identity.people, requestOptions);

      const responseBody = await response.json();

      if (!response.ok()) {
        throw new Error(
          `Failed to get list of people. Status: ${response.status()}, Response: ${JSON.stringify(responseBody)}`
        );
      }

      return responseBody;
    });
  }
}
