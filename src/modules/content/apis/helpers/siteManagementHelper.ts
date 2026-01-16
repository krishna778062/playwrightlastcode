import { APIRequestContext, test } from '@playwright/test';

import {
  SiteCreationPayload,
  SiteMembershipAction,
  SiteMembershipResponse,
  SitePermission,
} from '@core/types/siteManagement.types';
import { log } from '@core/utils/logger';

import { SiteDetailsResponse } from '@/src/modules/content/apis/apiValidation/siteApiHelper';
import { SiteCreationHelper, SiteMembershipHelper, SiteQueryHelper } from '@/src/modules/content/apis/helpers/site';
import { ContentManagementService } from '@/src/modules/content/apis/services/ContentManagementService';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { IdentityService } from '@/src/modules/platforms/apis/services/IdentityService';

interface Site {
  siteId: string;
  siteName: string;
  accessType?: string;
  isMember?: boolean;
  isActive?: boolean;
  name?: string;
  [key: string]: any;
}

/**
 * Facade class for site management operations.
 * Delegates to specialized helpers for creation, membership, and query operations.
 *
 * This class maintains backward compatibility while providing a cleaner internal architecture.
 */
export class SiteManagementHelper {
  readonly siteManagementService: SiteManagementService;
  private contentManagementService: ContentManagementService;
  private identityService: IdentityService;

  // Delegate helpers
  private creationHelper: SiteCreationHelper;
  private membershipHelper: SiteMembershipHelper;
  private queryHelper: SiteQueryHelper;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.siteManagementService = new SiteManagementService(apiRequestContext, baseUrl);
    this.contentManagementService = new ContentManagementService(apiRequestContext, baseUrl);
    this.identityService = new IdentityService(apiRequestContext, baseUrl);

    // Initialize delegate helpers
    this.creationHelper = new SiteCreationHelper(this.siteManagementService);
    this.membershipHelper = new SiteMembershipHelper(this.siteManagementService, this.identityService);
    this.queryHelper = new SiteQueryHelper(
      this.siteManagementService,
      this.contentManagementService,
      this.identityService,
      apiRequestContext,
      baseUrl,
      this.creationHelper,
      this.membershipHelper
    );
  }

  // ============================================================
  // SITE CREATION METHODS (delegated to SiteCreationHelper)
  // ============================================================

  async createPublicSite(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    waitForSearchIndex?: boolean;
  }) {
    return await this.creationHelper.createPublicSite(params);
  }

  async createPrivateSite(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    waitForSearchIndex?: boolean;
  }) {
    return await this.creationHelper.createPrivateSite(params);
  }

  async createUnlistedSite(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    hasPages?: boolean;
    hasEvents?: boolean;
    hasAlbums?: boolean;
    hasDashboard?: boolean;
    landingPage?: string;
    isContentFeedEnabled?: boolean;
    isContentSubmissionsEnabled?: boolean;
    waitForSearchIndex?: boolean;
  }) {
    return await this.creationHelper.createUnlistedSite(params);
  }

  async createSite(options: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    accessType: SITE_TYPES;
    waitForSearchIndex?: boolean;
  }) {
    switch (options.accessType) {
      case SITE_TYPES.PUBLIC:
        return await this.createPublicSite({
          siteName: options.siteName,
          category: options.category,
          overrides: options.overrides,
          waitForSearchIndex: options.waitForSearchIndex,
        });
      case SITE_TYPES.PRIVATE:
        return await this.createPrivateSite({
          siteName: options.siteName,
          category: options.category,
          overrides: options.overrides,
          waitForSearchIndex: options.waitForSearchIndex,
        });
      case SITE_TYPES.UNLISTED:
        return await this.createUnlistedSite({
          siteName: options.siteName,
          category: options.category,
          overrides: options.overrides,
          waitForSearchIndex: options.waitForSearchIndex,
        });
      default:
        throw new Error(`Invalid access type: ${options.accessType}`);
    }
  }

  /**
   * Creates a site and returns the complete site details response.
   * This method creates a site and then fetches the complete site details using getSiteDetails API.
   * @param params - Site creation parameters
   * @param params.siteName - Optional custom site name. If not provided, generates a random name.
   * @param params.category - The site category object, containing name and categoryId.
   * @param params.overrides - Optional overrides for site creation payload.
   * @param params.accessType - The access type of the site (default: 'public').
   * @param params.waitForSearchIndex - Optional flag to wait for site to appear in search results. Defaults to false.
   * @returns The complete SiteDetailsResponse containing all site details
   *
   * @example
   * const siteResponse = await siteHelper.createSiteWithCompleteResponse({
   *   siteName: 'My Test Site',
   *   accessType: SITE_TYPES.PUBLIC,
   *   category: { name: 'Technology', categoryId: 'tech-123' }
   * });
   * // siteResponse contains full site details including status, result with all fields
   */
  async createSiteWithCompleteResponse(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    accessType?: SITE_TYPES;
    waitForSearchIndex?: boolean;
  }): Promise<SiteDetailsResponse> {
    return await this.creationHelper.createSiteWithCompleteResponse(params);
  }

  async createSitesForTesting(count: number = 1, category?: { name: string; categoryId: string }) {
    return await this.creationHelper.createSitesForTesting(count, category);
  }

  async createSiteByAccessType(
    accessType: string,
    siteName?: string,
    options?: {
      category?: { name: string; categoryId: string };
      overrides?: Partial<SiteCreationPayload>;
      waitForSearchIndex?: boolean;
      hasPages?: boolean;
      hasEvents?: boolean;
      hasAlbums?: boolean;
      hasDashboard?: boolean;
      landingPage?: string;
      isOwner?: boolean;
      isMembershipAutoApproved?: boolean;
      isBroadcast?: boolean;
    }
  ): Promise<{ siteId: string; siteName: string }> {
    return await this.creationHelper.createSiteByAccessType(accessType, siteName, options);
  }

  async createSiteWithMember(
    memberEmail: string,
    siteName?: string,
    category?: { name: string; categoryId: string },
    siteAccess: 'public' | 'private' | 'unlisted' = 'public'
  ) {
    let site;
    switch (siteAccess) {
      case 'private':
        site = await this.createPrivateSite({ siteName, category });
        break;
      case 'unlisted':
        site = await this.createUnlistedSite({ siteName, category });
        break;
      default:
        site = await this.createPublicSite({ siteName, category });
    }

    return { ...site, memberEmail, memberRole: 'member' };
  }

  async createSiteAndAddMember(
    memberEmail: string,
    siteName?: string,
    category?: { name: string; categoryId: string },
    siteAccess: 'public' | 'private' | 'unlisted' = 'public'
  ) {
    let site;
    switch (siteAccess) {
      case 'private':
        site = await this.createPrivateSite({ siteName, category });
        break;
      case 'unlisted':
        site = await this.createUnlistedSite({ siteName, category });
        break;
      default:
        site = await this.createPublicSite({ siteName, category });
    }

    try {
      await this.makeUserSiteMembership(site.siteId, memberEmail, SitePermission.MEMBER, SiteMembershipAction.ADD);
      log.debug(`Successfully added ${memberEmail} as member to site ${site.siteName}`);
    } catch (error) {
      log.warn(`Failed to add ${memberEmail} as member to site ${site.siteName}`, error);
    }

    return { ...site, memberEmail, memberRole: 'member' };
  }

  // ============================================================
  // SITE MEMBERSHIP METHODS (delegated to SiteMembershipHelper)
  // ============================================================

  async makeUserSiteMembership(
    siteId: string,
    userId: string,
    permission: SitePermission,
    action: SiteMembershipAction
  ): Promise<SiteMembershipResponse> {
    return await this.membershipHelper.makeUserSiteMembership(siteId, userId, permission, action);
  }

  async getSiteMembershipList(siteId: string, options?: { size?: number; type?: string }): Promise<any> {
    return await this.membershipHelper.getSiteMembershipList(siteId, options);
  }

  async getMembersNameFromList(
    siteId: string,
    options?: { size?: number; type?: string }
  ): Promise<{ membersName: string[] }> {
    return await this.membershipHelper.getMembersNameFromList(siteId, options);
  }

  async updateUserSiteMembershipWithRole(params: {
    siteId: string;
    userId: string;
    role: SitePermission;
  }): Promise<SiteMembershipResponse> {
    return await this.membershipHelper.updateUserSiteMembershipWithRole(params);
  }

  async getNonMemberUserNames(siteId: string, options?: { minimumCount?: number }): Promise<string[]> {
    return await this.membershipHelper.getNonMemberUserNames(siteId, options);
  }

  async acceptMembershipRequest(siteId: string, requestId: string): Promise<void> {
    return await this.membershipHelper.acceptMembershipRequest(siteId, requestId);
  }

  // ============================================================
  // SITE QUERY METHODS (delegated to SiteQueryHelper)
  // ============================================================

  async getListOfSites(options?: { size?: number; filter?: string; sortBy?: string }) {
    return await this.queryHelper.getListOfSites(options);
  }

  async getSiteIdWithName(
    siteName: string,
    options?: {
      category?: { name: string; categoryId: string };
      overrides?: Partial<SiteCreationPayload>;
      accessType?: SITE_TYPES;
    }
  ): Promise<string> {
    return await this.queryHelper.getSiteIdWithName(siteName, options);
  }

  async getSiteWithManageSiteOption(sitesResponse: any): Promise<{ siteId: string; siteName: string }> {
    return await this.queryHelper.getSiteWithManageSiteOption(sitesResponse);
  }

  async getSiteByAccessType(
    accessType: string,
    options?: {
      hasPages?: boolean | true;
      hasEvents?: boolean | true;
      hasAlbums?: boolean | true;
      hasDashboard?: boolean | true;
      landingPage?: string;
      isOwner?: boolean;
      isMembershipAutoApproved?: boolean;
      isBroadcast?: boolean;
      waitForSearchIndex?: boolean;
    }
  ): Promise<{ siteId: string; name: string; siteListResponse?: any[] }> {
    return await this.queryHelper.getSiteByAccessType(accessType, options);
  }

  async getSitesWhereUserIsNotMemberOrOwner(
    sitesList: any[] = [],
    options?: { allowIsMemberAbsent?: boolean }
  ): Promise<{ siteId: string; name: string }> {
    return await this.queryHelper.getSitesWhereUserIsNotMemberOrOwner(sitesList, options);
  }

  async getSiteWithMembers(
    accessType: string,
    expectedMemberCount?: number,
    options?: { size?: number; type?: string; maxAttempts?: number; excludeUserEmail?: string }
  ): Promise<{ site: any; members: any }> {
    return await this.queryHelper.getSiteWithMembers(accessType, expectedMemberCount, options);
  }

  async getSiteByIdWithContentSubmissions(
    accessType: string,
    isContentSubmissionsEnabled: boolean
  ): Promise<{ siteId: string; siteName: string }> {
    return await this.queryHelper.getSiteByIdWithContentSubmissions(accessType, isContentSubmissionsEnabled);
  }

  async getSiteWithUserAsOwner(userId: string, accessType: SITE_TYPES): Promise<{ siteId: string; siteName: string }> {
    return await this.queryHelper.getSiteWithUserAsOwner(userId, accessType);
  }

  async getSiteInUserIsNotMemberOrOwner(
    userId: string[],
    accessType: SITE_TYPES
  ): Promise<{ siteId: string; siteName: string }> {
    return await this.queryHelper.getSiteInUserIsNotMemberOrOwner(userId, accessType);
  }

  async getSiteWithContent(accessType: string, userId: string[]): Promise<{ siteId: string; siteName: string }> {
    return await this.queryHelper.getSiteWithContent(accessType, userId);
  }

  async getDeactivatedSite(
    accessType: SITE_TYPES,
    options?: { size?: number; sortBy?: string }
  ): Promise<{ siteId: string; siteName: string }> {
    return await this.queryHelper.getDeactivatedSite(accessType, options);
  }

  async getUnFeaturedSites(count: number = 2): Promise<{ siteId: string; name: string }[]> {
    return await this.queryHelper.getUnFeaturedSites(count);
  }

  async getSiteAuthorNameAndEventStartDate(): Promise<{
    siteId: string;
    authorName?: string;
    startsAt?: string;
    eventName?: string;
    siteName?: string;
  }> {
    return await this.queryHelper.getSiteAuthorNameAndEventStartDate();
  }

  // ============================================================
  // SERVICE DELEGATION METHODS
  // ============================================================

  async getFollowersAndFollowingList(userId: string, size: number = 6): Promise<any> {
    return await this.siteManagementService.getFollowersAndFollowingList(userId, size);
  }

  async getSiteDetails(siteId: string): Promise<any> {
    return await this.siteManagementService.getSiteDetails(siteId);
  }

  async activateSite(siteId: string) {
    return await this.siteManagementService.activateSite(siteId);
  }

  async deactivateSite(siteId: string) {
    return await this.siteManagementService.deactivateSite(siteId);
  }

  /**
   * Searches for a site by name, activates it if inactive, and returns the site ID
   * @param siteName - The exact name of the site to search for
   * @param options - Optional search parameters
   * @param options.canManage - Filter sites that can be managed (default: true)
   * @param options.filter - Filter by site status (default: 'all')
   * @param options.includeDeactivated - Include deactivated sites (default: true)
   * @returns Promise with the site ID
   */
  async searchSiteAndActivateIfNeeded(
    siteName: string,
    options?: {
      canManage?: boolean;
      filter?: string;
      includeDeactivated?: boolean;
      accessType?: SITE_TYPES;
      waitForSearchIndex?: boolean;
    }
  ): Promise<string> {
    return await test.step(`Searching for site "${siteName}" and activating if needed`, async () => {
      // Search for the site
      const searchResponse = await this.siteManagementService.searchSites(siteName, {
        canManage: options?.canManage !== undefined ? options.canManage : true,
        filter: options?.filter || 'all',
        includeDeactivated: options?.includeDeactivated !== undefined ? options.includeDeactivated : true,
      });

      // Iterate through the search results to find exact site name match
      const matchingSite = searchResponse.result.listOfItems.find(
        item => item.item.title.toLowerCase() === siteName.toLowerCase()
      );

      let siteId: string;
      let isActive: boolean;

      if (!matchingSite) {
        const createdSite = await this.creationHelper.createSiteByAccessType(
          options?.accessType || SITE_TYPES.PUBLIC,
          siteName,
          {
            waitForSearchIndex: options?.waitForSearchIndex,
          }
        );
        siteId = createdSite.siteId;
        // Newly created sites are active by default
        isActive = true;
      } else {
        siteId = matchingSite.item.id;
        isActive = matchingSite.item.isActive;
      }

      // If site is not active, activate it
      if (!isActive) {
        log.debug(`Site "${siteName}" (${siteId}) is inactive, activating...`);
        await this.siteManagementService.activateSite(siteId);
      }
      log.debug(`Site "${siteName}" (${siteId}) is activate`);
      return siteId;
    });
  }

  async getCategoryList(options: { size?: number; sortBy?: string } = {}): Promise<any> {
    return await test.step('Getting list of categories via API', async () => {
      return await this.siteManagementService.getListOfCategories(options);
    });
  }

  async getRandomCategoryId(): Promise<{ categoryId: string; name: string }> {
    const categoryResponse = await this.siteManagementService.getListOfCategories();
    const categoryList = categoryResponse.result.listOfItems;
    const randomIndex = Math.floor(Math.random() * categoryList.length);
    return categoryList[randomIndex];
  }

  async getAllUsersList(): Promise<any> {
    return await test.step('Getting all users list', async () => {
      return await this.identityService.getListOfPeople();
    });
  }

  async getMemberList(options?: {
    size?: number;
    filter?: string;
    page?: number;
    siteId?: string;
    nextPageToken?: number;
    sortBy?: string;
  }) {
    const defaultOptions = {
      size: 1000,
      filter: options?.filter || 'active',
      page: 0,
      ...options,
    };
    return await this.siteManagementService.getSiteMembershipList(options?.siteId || '', defaultOptions);
  }

  async getListOfPeople(options?: { size?: number; filter?: string }): Promise<any> {
    return await this.siteManagementService.getListOfPeople(options);
  }

  async makeSiteUnFeatured(siteId: string): Promise<any> {
    return await this.siteManagementService.unfeatureSite(siteId);
  }

  async approveContent(siteId: string, contentId: string): Promise<any> {
    return await this.siteManagementService.approveContent(siteId, contentId);
  }
  async getSiteList(options?: {
    size?: number;
    filter?: string;
    sortBy?: string;
  }): Promise<{ siteId: string; siteName: string }[]> {
    const siteListResponse = await this.getListOfSites(options);
    return siteListResponse.result.listOfItems.map((site: any) => ({
      siteId: site.siteId,
      siteName: site.name || site.siteName,
    }));
  }
  async rejectContent(siteId: string, contentId: string, rejectionComment?: string): Promise<any> {
    return await this.siteManagementService.rejectContent(siteId, contentId, rejectionComment);
  }

  // ============================================================
  // STATE MANAGEMENT METHODS
  // ============================================================

  getRandomSite(): Site | null {
    return this.creationHelper.getRandomSite();
  }

  getAllSites(): Site[] {
    return this.creationHelper.getTrackedSites();
  }

  getSiteCount(): number {
    return this.creationHelper.getSiteCount();
  }

  getMemberCount(): number {
    return this.membershipHelper.getMemberCount();
  }

  /**
   * Cleans up all sites and site members created by this helper instance.
   */
  async cleanup() {
    const sites = this.creationHelper.getTrackedSites();
    for (const { siteId, siteName } of sites) {
      try {
        await this.siteManagementService.deactivateSite(siteId);
        log.debug(`Deactivated site ${siteName} (${siteId})`);
      } catch (error) {
        log.warn(`Failed to deactivate site ${siteName} (${siteId})`, error);
      }
    }

    this.creationHelper.clearTrackedSites();
    this.membershipHelper.clearTrackedMembers();
  }
}
