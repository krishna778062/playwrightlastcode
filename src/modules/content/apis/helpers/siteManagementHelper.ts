import { APIRequestContext, test } from '@playwright/test';

import {
  SiteCreationPayload,
  SiteMembershipAction,
  SiteMembershipResponse,
  SitePermission,
} from '@/src/core/types/siteManagement.types';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { SiteDetailsResponse } from '@/src/modules/content/apis/apiValidation/siteApiHelper';
import { ContentManagementService } from '@/src/modules/content/apis/services/ContentManagementService';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { SITE_TEST_DATA } from '@/src/modules/content/test-data/sites-create.test-data';
import { EnterpriseSearchHelper } from '@/src/modules/global-search/apis/helpers/enterpriseSearchHelper';

interface Site {
  siteId: string;
  siteName: string;
  accessType?: string;
  isMember?: boolean;
  isActive?: boolean;
  name?: string;
  [key: string]: any; // Allow additional properties
}

interface SiteMember {
  siteId: string;
  userEmail: string;
}

export class SiteManagementHelper {
  private sites: Site[] = [];
  private siteMembers: SiteMember[] = [];
  readonly siteManagementService: SiteManagementService;
  private contentManagementService: ContentManagementService;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.siteManagementService = new SiteManagementService(apiRequestContext, baseUrl);
    this.contentManagementService = new ContentManagementService(apiRequestContext, baseUrl);
  }

  /**
   * Creates a new public site with default settings.
   * @param siteName - Optional custom site name. If not provided, generates a random name.
   * @param category - The site category object, containing name and categoryId.
   * @param overrides - Optional overrides for site creation payload.
   * @param waitForSearchIndex - Optional flag to wait for site to appear in search results. Defaults to the helper's default setting.
   * @returns An object containing details of the created site.
   */
  async _createSiteBaseMethod(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    waitForSearchIndex?: boolean;
  }) {
    const { siteName, category, overrides, waitForSearchIndex } = params;
    const shouldWaitForSearchIndex = waitForSearchIndex !== undefined ? waitForSearchIndex : false;
    const randomString = TestDataGenerator.generateRandomString('Test');
    const finalSiteName = siteName ?? `${randomString}`;

    // Get category if not provided
    let categoryObj = category;
    if (!categoryObj) {
      categoryObj = await this.siteManagementService.getCategoryId(SITE_TEST_DATA[0].category);
    }

    const siteResult = await this.siteManagementService.addNewSite({
      access: 'public',
      name: finalSiteName,
      category: {
        categoryId: categoryObj.categoryId,
        name: categoryObj.name,
      },
      ...overrides,
    });

    const siteId = siteResult.siteId;

    // Wait for site to appear in search results (optional)
    if (shouldWaitForSearchIndex) {
      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
        apiClient: this.siteManagementService.httpClient,
        searchTerm: finalSiteName,
        objectType: 'site',
      });
    }

    const createdSite = {
      siteId,
      siteName: finalSiteName,
      categoryId: categoryObj.categoryId,
      categoryName: categoryObj.name,
      access: 'public',
    };

    this.sites.push({ siteId, siteName: finalSiteName });
    return createdSite;
  }

  /**
   * Creates a new public site with default settings.
   * @param siteName - Optional custom site name. If not provided, generates a random name.
   * @param category - The site category object, containing name and categoryId.
   * @param overrides - Optional overrides for site creation payload.
   * @param waitForSearchIndex - Optional flag to wait for site to appear in search results. Defaults to the helper's default setting.
   * @returns An object containing details of the created site.
   */
  async createPublicSite(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    waitForSearchIndex?: boolean;
  }) {
    const { siteName, category, overrides, waitForSearchIndex } = params;
    console.log(`Creating public site: ${siteName}`);
    return await this._createSiteBaseMethod({
      siteName,
      category,
      overrides: { ...overrides, access: 'public' },
      waitForSearchIndex,
    });
  }
  /**
   * Creates a new private site with default settings.
   * @param siteName - Optional custom site name. If not provided, generates a random name.
   * @param category - The site category object, containing name and categoryId.
   * @param overrides - Optional overrides for site creation payload.
   * @param waitForSearchIndex - Optional flag to wait for site to appear in search results. Defaults to the helper's default setting.
   * @returns An object containing details of the created site.
   */
  async createPrivateSite(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    waitForSearchIndex?: boolean;
  }) {
    const { siteName, category, overrides, waitForSearchIndex } = params;
    return await this._createSiteBaseMethod({
      siteName,
      category,
      overrides: { ...overrides, access: 'private' },
      waitForSearchIndex,
    });
  }

  /**
   * Creates a new unlisted site with default settings.
   * @param siteName - Optional custom site name. If not provided, generates a random name.
   * @param category - The site category object, containing name and categoryId.
   * @param overrides - Optional overrides for site creation payload.
   * @param waitForSearchIndex - Optional flag to wait for site to appear in search results. Defaults to the helper's default setting.
   * @returns An object containing details of the created site.
   */
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
    const { siteName, category, overrides, waitForSearchIndex } = params;
    return await this._createSiteBaseMethod({
      siteName,
      category,
      overrides: { ...overrides, access: 'unlisted' },
      waitForSearchIndex,
    });
  }

  async acceptMembershipRequest(siteId: string, requestId: string): Promise<void> {
    await this.siteManagementService.acceptMembershipRequest(siteId, requestId);
  }

  /**
   * Wrapper method to create a site with a specific access type.
   *
   * @param siteName - Optional custom site name. If not provided, generates a random name.
   * @param category - The site category object, containing name and categoryId.
   * @param overrides - Optional overrides for site creation payload.
   * @param accessType - The access type of the site (default: 'public').
   * @returns An object containing details of the created site.
   */
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
        });
      case SITE_TYPES.PRIVATE:
        return await this.createPrivateSite({
          siteName: options.siteName,
          category: options.category,
          overrides: options.overrides,
        });
      case SITE_TYPES.UNLISTED:
        return await this.createUnlistedSite({
          siteName: options.siteName,
          category: options.category,
          overrides: options.overrides,
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
    return await test.step('Creating site and getting complete response', async () => {
      const { siteName, category, overrides, accessType = SITE_TYPES.PUBLIC, waitForSearchIndex } = params;

      // Create the site using existing method
      const createdSite = await this.createSite({
        siteName,
        category,
        overrides,
        accessType,
        waitForSearchIndex,
      });

      // Get complete site details
      const siteDetailsResponse = await this.siteManagementService.getSiteDetails(createdSite.siteId);

      // Ensure the site is tracked for cleanup (already done in createSite, but ensuring here)
      if (!this.sites.find(s => s.siteId === createdSite.siteId)) {
        this.sites.push({ siteId: createdSite.siteId, siteName: createdSite.siteName });
      }

      return siteDetailsResponse as SiteDetailsResponse;
    });
  }

  /**
   * Creates multiple sites with different access levels for testing.
   * @param count - Number of sites to create for each access type.
   * @param category - The site category object, containing name and categoryId.
   * @returns An object containing arrays of created sites by access type.
   */
  async createSitesForTesting(count: number = 1, category?: { name: string; categoryId: string }) {
    const publicSites = [];
    const privateSites = [];
    const unlistedSites = [];

    for (let i = 0; i < count; i++) {
      const [publicSite, privateSite, unlistedSite] = await Promise.all([
        this.createPublicSite({ category }),
        this.createPrivateSite({ category }),
        this.createUnlistedSite({ category }),
      ]);

      publicSites.push(publicSite);
      privateSites.push(privateSite);
      unlistedSites.push(unlistedSite);
    }

    return {
      publicSites,
      privateSites,
      unlistedSites,
      allSites: [...publicSites, ...privateSites, ...unlistedSites],
    };
  }

  /**
   * Creates a site with a specific member for testing member access scenarios.
   * @param memberEmail - The email of the user to add as a member.
   * @param siteName - Optional custom site name.
   * @param category - The site category object.
   * @param siteAccess - The access level of the site (default: 'private').
   * @returns An object containing site details and member information.
   */
  async createSiteWithMember(
    memberEmail: string,
    siteName?: string,
    category?: { name: string; categoryId: string },
    siteAccess: 'public' | 'private' | 'unlisted' = 'public'
  ) {
    // Create the site based on access type
    let site;
    switch (siteAccess) {
      case 'private':
        site = await this.createPrivateSite({ siteName, category });
        break;
      case 'unlisted':
        site = await this.createUnlistedSite({ siteName, category });
        break;
      default:
        site = await this._createSiteBaseMethod({ siteName, category });
    }

    return {
      ...site,
      memberEmail,
      memberRole: 'member',
    };
  }

  /**
   * Creates a site and adds a specific user as a member
   * @param memberEmail - The email of the user to add as a member
   * @param siteName - Optional custom site name
   * @param category - The site category object
   * @param siteAccess - The access level of the site (default: 'public')
   * @returns An object containing site details and member information
   */
  async createSiteAndAddMember(
    memberEmail: string,
    siteName?: string,
    category?: { name: string; categoryId: string },
    siteAccess: 'public' | 'private' | 'unlisted' = 'public'
  ) {
    // Create the site based on access type
    let site;
    switch (siteAccess) {
      case 'private':
        site = await this.createPrivateSite({ siteName, category });
        break;
      case 'unlisted':
        site = await this.createUnlistedSite({ siteName, category });
        break;
      default:
        site = await this._createSiteBaseMethod({ siteName, category });
    }

    // Add the user as a member to the site
    try {
      await this.makeUserSiteMembership(site.siteId, memberEmail, SitePermission.MEMBER, SiteMembershipAction.ADD);
      console.log(`Successfully added ${memberEmail} as member to site ${site.siteName}`);
    } catch (error) {
      console.warn(`Failed to add ${memberEmail} as member to site ${site.siteName}:`, error);
    }

    return {
      ...site,
      memberEmail,
      memberRole: 'member',
    };
  }

  async getFollowersAndFollowingList(userId: string, size: number = 6): Promise<any> {
    return await this.siteManagementService.getFollowersAndFollowingList(userId, size);
  }
  /**
   * Gets a random site from the created sites.
   * @returns A random site from the sites created by this helper, or null if no sites exist.
   */
  getRandomSite(): Site | null {
    if (this.sites.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.sites.length);
    return this.sites[randomIndex];
  }

  /**
   * Gets all sites created by this helper.
   * @returns An array of all sites created by this helper.
   */
  getAllSites(): Site[] {
    return [...this.sites];
  }

  /**
   * Cleans up all sites and site members created by this helper instance.
   * This should be called in test cleanup to ensure proper resource management.
   */
  async cleanup() {
    // Deactivate all sites
    for (const { siteId, siteName } of this.sites) {
      try {
        await this.siteManagementService.deactivateSite(siteId);
        console.log(`Deactivated site ${siteName} (${siteId})`);
      } catch (error) {
        console.warn(`Failed to deactivate site ${siteName} (${siteId}):`, error);
      }
    }

    // Clear the tracking arrays
    this.sites = [];
    this.siteMembers = [];
  }

  /**
   * Gets the count of sites created by this helper.
   * @returns The number of sites created.
   */
  getSiteCount(): number {
    return this.sites.length;
  }

  async getRandomCategoryId(): Promise<{ categoryId: string; name: string }> {
    const categoryResponse = await this.siteManagementService.getListOfCategories();
    const categoryList = categoryResponse.result.listOfItems;
    const randomIndex = Math.floor(Math.random() * categoryList.length);
    return categoryList[randomIndex];
  }

  /**
   * Gets the count of site members managed by this helper.
   * @returns The number of site members.
   */
  getMemberCount(): number {
    return this.siteMembers.length;
  }

  /**
   * Gets a site by name from the sites list, or creates a new one if not found.
   * @param siteName - The name of the site to find or create
   * @param options - Optional configuration for site creation if needed
   * @param options.category - The site category object, containing name and categoryId
   * @param options.overrides - Optional overrides for site creation payload
   * @param options.accessType - The access type of the site (default: 'public')
   * @returns The siteId of the found or created site
   */
  async getSiteIdWithName(
    siteName: string,
    options?: {
      category?: { name: string; categoryId: string };
      overrides?: Partial<SiteCreationPayload>;
      accessType?: SITE_TYPES;
    }
  ): Promise<string> {
    // Get the list of sites
    const sitesResponse = await this.siteManagementService.getListOfSites({
      size: 5000, // Get a large number to ensure we find the site if it exists
      canManage: true,
      sortBy: 'alphabetical',
    });

    for (const site of sitesResponse.result.listOfItems) {
      console.log(
        `Site name: ${site.name} isActive: ${site.isActive} accessType: ${site.access} siteId: ${site.siteId}`
      );
    }

    // Search for the site by name
    const existingSite = sitesResponse.result.listOfItems.find(
      site => site.name.toLowerCase() === siteName.toLowerCase()
    );

    if (existingSite) {
      console.log(`Found existing site: ${existingSite.name} with ID: ${existingSite.siteId}`);
      return existingSite.siteId;
    }

    // Site not found, create a new one
    console.log(`Site "${siteName}" not found. Creating a new site...`);

    const accessType = options?.accessType || SITE_TYPES.PUBLIC;
    const createdSite = await this.createSiteByAccessType(accessType, siteName, options);
    return createdSite.siteId;
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
    permission: SitePermission,
    action: SiteMembershipAction
  ): Promise<SiteMembershipResponse> {
    // Only check membership for ADD operations, not for SET_PERMISSION or REMOVE
    if (action === SiteMembershipAction.ADD) {
      const membershipList = await this.getSiteMembershipList(siteId);
      const existingMember = membershipList.result?.listOfItems?.find((member: any) => member.peopleId === userId);

      if (existingMember) {
        console.log(`User ${userId} is already a member of site ${siteId}`);
        return {
          status: 'success',
          message: 'User is already a member',
          result: { userId, siteId, permission, action },
        };
      }
    }

    // Call the API for ADD, SET_PERMISSION, or REMOVE operations
    const result = await this.siteManagementService.makeUserSiteMembership(siteId, userId, permission, action);

    // Track new members for potential cleanup (only for ADD operations)
    if (action === SiteMembershipAction.ADD) {
      this.siteMembers.push({
        siteId,
        userEmail: userId, // Using userId as identifier since we don't have email here
      });
    }

    return result;
  }

  /**
   * Gets the list of sites
   * @param options - Optional parameters for filtering sites
   * @returns Promise containing the sites response
   */
  async getListOfSites(options?: { size?: number; filter?: string; sortBy?: string }) {
    const defaultOptions = {
      size: options?.size || 1000,
      filter: options?.filter || 'active',
      sortBy: options?.sortBy || 'createdNewest',
      ...options,
    };

    return await this.siteManagementService.getListOfSites(defaultOptions);
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

  /**
   * Gets 2 sites that are not in the featured sites list
   * @param count - Number of non-featured sites to return (default: 2)
   * @returns Promise containing non-featured sites
   */
  async getUnFeaturedSites(count: number = 2): Promise<{ siteId: string; name: string }[]> {
    return await test.step(`Getting ${count} non-featured sites`, async () => {
      // Fetch both lists in parallel for better performance
      const [allSitesResponse, featuredSitesResponse] = await Promise.all([
        this.getListOfSites({ filter: 'active', size: 1000 }),
        this.getListOfSites({ filter: 'featured', size: 1000 }),
      ]);

      // Early validation
      if (!allSitesResponse.result.listOfItems.length) {
        throw new Error('No active sites found');
      }

      // Create Set for O(1) lookup performance
      const featuredSiteIds = new Set(featuredSitesResponse.result.listOfItems.map((site: any) => site.siteId));

      // Single pass filtering and mapping for better performance
      const nonFeaturedSites: { siteId: string; name: string }[] = [];

      for (const site of allSitesResponse.result.listOfItems) {
        if (!featuredSiteIds.has(site.siteId)) {
          nonFeaturedSites.push({
            siteId: site.siteId,
            name: site.name,
          });

          // Early exit if we have enough sites
          if (nonFeaturedSites.length >= count) {
            break;
          }
        }
      }

      if (nonFeaturedSites.length < count) {
        throw new Error(`Not enough non-featured sites found. Found: ${nonFeaturedSites.length}, Required: ${count}`);
      }

      console.log(
        `Selected ${nonFeaturedSites.length} non-featured sites: ${nonFeaturedSites.map(s => s.name).join(', ')}`
      );
      return nonFeaturedSites;
    });
  }

  /**
   * Unfeatures a site (removes it from featured sites)
   * @param siteId - The ID of the site to unfeature
   * @returns Promise containing the response
   */
  async makeSiteUnFeatured(siteId: string): Promise<any> {
    return await this.siteManagementService.unfeatureSite(siteId);
  }

  /**
   * Creates a site based on access type
   * @param accessType - The access type to create
   * @param siteName - Optional site name
   * @param options - Optional configuration for site creation
   * @returns Promise<Site> - The created site object
   */
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
    let createdSite;

    // Prepare overrides with optional parameters
    const overrides = {
      ...options?.overrides,
      ...(options?.hasPages !== undefined && { hasPages: options.hasPages }),
      ...(options?.hasEvents !== undefined && { hasEvents: options.hasEvents }),
      ...(options?.hasAlbums !== undefined && { hasAlbums: options.hasAlbums }),
      ...(options?.hasDashboard !== undefined && { hasDashboard: options.hasDashboard }),
      ...(options?.landingPage !== undefined && { landingPage: options.landingPage }),
      ...(options?.isOwner !== undefined && { isOwner: options.isOwner }),
      ...(options?.isMembershipAutoApproved !== undefined && {
        isMembershipAutoApproved: options.isMembershipAutoApproved,
      }),
      ...(options?.isBroadcast !== undefined && { isBroadcast: options.isBroadcast }),
    };

    switch (accessType) {
      case SITE_TYPES.PRIVATE:
        createdSite = await this.createPrivateSite({
          siteName,
          category: options?.category,
          overrides,
          waitForSearchIndex: options?.waitForSearchIndex,
        });
        break;
      case SITE_TYPES.UNLISTED:
        createdSite = await this.createUnlistedSite({
          siteName,
          category: options?.category,
          overrides,
          waitForSearchIndex: options?.waitForSearchIndex,
        });
        break;
      default:
        createdSite = await this.createPublicSite({
          siteName,
          category: options?.category,
          overrides,
          waitForSearchIndex: options?.waitForSearchIndex,
        });
    }

    console.log(`Created new site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);
    return { siteId: createdSite.siteId, siteName: createdSite.siteName };
  }

  /**
   * Gets a site by access type (e.g., 'public', 'private')
   * @param accessType - The access type to search for
   * @returns Promise<Site | null> - The site object if found, null otherwise
   */
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
    // Defensive check to ensure accessType is a string
    if (typeof accessType !== 'string') {
      throw new Error(
        `Expected accessType to be a string, but received: ${typeof accessType}. Value: ${JSON.stringify(accessType)}`
      );
    }
    const siteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
    let siteDetails = siteListResponse.result.listOfItems.find(site => site.isActive === true);
    let siteId: string | undefined, siteName: string | undefined, authorName: string | undefined;

    if (siteDetails) {
      // Check if the existing site matches the required options
      const matchesRequirements =
        (options?.hasPages ?? true) && (options?.hasEvents ?? true) && (options?.hasAlbums ?? true);

      if (matchesRequirements) {
        siteId = siteDetails.siteId;
        siteName = siteDetails.name;
        console.log(`Using existing site: ${siteName} (${siteId}) that matches requirements`);
      } else {
        console.log(`Existing site doesn't match requirements, will create new site`);
        siteDetails = undefined; // Reset to undefined so we create a new site
      }
    }

    if (!siteId) {
      const createdSite = await this.createSiteByAccessType(accessType, undefined, {
        ...options,
        waitForSearchIndex: options?.waitForSearchIndex,
      });
      siteId = createdSite.siteId;
      siteName = createdSite.siteName;
    }

    if (!siteId || !siteName) {
      throw new Error(`No site found or created with access type ${accessType}`);
    }

    return { siteId, name: siteName, siteListResponse: siteListResponse.result.listOfItems };
  }

  /**
   * Gets a site from the provided list where the current user (using this helper's API context) is NOT a member, owner, or manager
   * Loops through sites until finding one where isManager: false, isMember: false, and isOwner: false
   * @param sitesList - Array of sites from app manager to check
   * @param options - Optional parameters to control site selection behavior
   * @param options.allowIsMemberAbsent - If true, allows sites where isMember/isOwner/isManager fields are absent from payload
   * @returns Promise containing the first site where user is not a member, owner, or manager
   */
  async getSitesWhereUserIsNotMemberOrOwner(
    sitesList: any[],
    options?: { allowIsMemberAbsent?: boolean }
  ): Promise<{ siteId: string; name: string }> {
    const allowIsMemberAbsent = options?.allowIsMemberAbsent ?? false;
    return await test.step(`Finding site where user is not a member, owner, or manager`, async () => {
      if (sitesList.length === 0) {
        throw new Error('No sites provided to check');
      }

      // Loop through each site from the app manager's list
      for (const site of sitesList) {
        if (!site.siteId || !site.isActive) {
          continue; // Skip invalid or inactive sites
        }

        try {
          // Check this site using the current user's API context (standard user)
          // This will return site details with membership info from the current user's perspective
          const siteDetailsResponse = await this.siteManagementService.getSiteDetails(site.siteId);
          const siteDetails = siteDetailsResponse.result;

          // Debug logging to check membership values
          console.log(`Checking site: ${siteDetails.name} (${site.siteId})`);
          console.log(
            `  isMember: ${siteDetails.isMember} (${typeof siteDetails.isMember}), present: ${'isMember' in siteDetails}`
          );
          console.log(
            `  isOwner: ${siteDetails.isOwner} (${typeof siteDetails.isOwner}), present: ${'isOwner' in siteDetails}`
          );
          console.log(
            `  isManager: ${siteDetails.isManager} (${typeof siteDetails.isManager}), present: ${'isManager' in siteDetails}`
          );
          console.log(
            `  isFollower: ${siteDetails.isFollower} (${typeof siteDetails.isFollower}), present: ${'isFollower' in siteDetails}`
          );
          console.log(
            `  isAccessRequested: ${siteDetails.isAccessRequested} (${typeof siteDetails.isAccessRequested}), present: ${'isAccessRequested' in siteDetails}`
          );

          // Check if user is NOT a member, owner, or manager
          // Default behavior (allowIsMemberAbsent = false): Only accepts explicit false values (preserves existing behavior)
          // When allowIsMemberAbsent = true: Also accepts sites where these fields are absent from payload
          const isMemberCondition = allowIsMemberAbsent
            ? siteDetails.isMember === false || !('isMember' in siteDetails)
            : siteDetails.isMember === false; // Default: same as original behavior

          const isOwnerCondition = allowIsMemberAbsent
            ? siteDetails.isOwner === false || !('isOwner' in siteDetails)
            : siteDetails.isOwner === false; // Default: same as original behavior

          const isManagerCondition = allowIsMemberAbsent
            ? siteDetails.isManager === false || !('isManager' in siteDetails)
            : siteDetails.isManager === false; // Default: same as original behavior

          const isFollowerCondition = allowIsMemberAbsent
            ? siteDetails.isFollower === false || !('isFollower' in siteDetails)
            : siteDetails.isFollower === false; // Default: same as original behavior

          const isAccessRequestedCondition = allowIsMemberAbsent
            ? siteDetails.isAccessRequested === false || !('isAccessRequested' in siteDetails)
            : siteDetails.isAccessRequested === false; // Default: same as original behavior

          console.log(
            `  Conditions - isMember: ${isMemberCondition}, isOwner: ${isOwnerCondition}, isManager: ${isManagerCondition}, isFollower: ${isFollowerCondition}, isAccessRequested: ${isAccessRequestedCondition}`
          );

          if (
            siteDetails &&
            siteDetails.isActive === true &&
            isMemberCondition &&
            isOwnerCondition &&
            isManagerCondition &&
            isFollowerCondition &&
            isAccessRequestedCondition
          ) {
            const isMemberAbsent = allowIsMemberAbsent && !('isMember' in siteDetails);
            console.log(
              `Found site where user is not a member/owner/manager${isMemberAbsent ? ' (fields absent from payload)' : ''}: ${siteDetails.name} (${siteDetails.siteId})`
            );
            return {
              siteId: siteDetails.siteId,
              name: siteDetails.name,
            };
          }
        } catch (error) {
          console.warn(`Failed to check site ${site.siteId}:`, error);
          // Continue to next site if this one fails
          continue;
        }
      }

      throw new Error(
        `No site found where user is not a member, owner, or manager after checking ${sitesList.length} sites`
      );
    });
  }
  /**
   * Helper method to determine the current role from SiteMember boolean flags
   * @param member - The SiteMember object with boolean flags
   * @returns The current SitePermission role, or null if not a member
   */
  private getCurrentRoleFromMember(member: any): SitePermission | null {
    if (!member) return null;

    // Check role hierarchy: OWNER > MANAGER > CONTENT_MANAGER > MEMBER
    // Note: A user can have multiple flags true, but we return the highest role
    if (member.isOwner === true) return SitePermission.OWNER;
    if (member.isManager === true) return SitePermission.MANAGER;
    if (member.isContentManager === true) return SitePermission.CONTENT_MANAGER;
    if (member.isMember === true) return SitePermission.MEMBER;

    return null;
  }

  /**
   * Verifies that the user has the correct role after assignment
   * @param siteId - The site ID
   * @param userId - The user ID
   * @param expectedRole - The expected role
   * @returns Promise<boolean> - True if role is correct, false otherwise
   */
  private async verifyRoleAssignment(siteId: string, userId: string, expectedRole: SitePermission): Promise<boolean> {
    const membershipList = await this.getSiteMembershipList(siteId);
    const userMembership = membershipList.result?.listOfItems?.find((member: any) => member.peopleId === userId);

    if (!userMembership) {
      console.log(`User ${userId} not found in membership list`);
      return false;
    }

    const currentRole = this.getCurrentRoleFromMember(userMembership);
    const hasCorrectRole = currentRole === expectedRole;

    if (hasCorrectRole) {
      console.log(`✓ Role verification successful: User ${userId} has role ${expectedRole}`);
      return true;
    }

    return false;
  }

  /**
   * Finds another user in the site membership to use as temporary owner
   * When demoting an owner, we need to assign another user as owner first
   * Note: There is only ONE owner per site, so we just need to find any other member
   * @param siteId - The site ID
   * @param excludeUserId - The user ID to exclude (the one we're trying to demote)
   * @returns Promise<string | null> - The user ID of another member, or null if none found
   */
  private async findAnotherMemberForTemporaryOwner(siteId: string, excludeUserId: string): Promise<string | null> {
    const membershipList = await this.getSiteMembershipList(siteId);
    const members = membershipList.result?.listOfItems || [];

    // Find any other member (manager, content manager, or regular member)
    const anotherManager = members.find(
      (member: any) => member.peopleId !== excludeUserId && member.isManager === true
    );
    if (anotherManager) {
      console.log(`Found another manager (${anotherManager.peopleId}) to use as temporary owner`);
      return anotherManager.peopleId;
    }

    const anotherContentManager = members.find(
      (member: any) => member.peopleId !== excludeUserId && member.isContentManager === true
    );
    if (anotherContentManager) {
      console.log(`Found another content manager (${anotherContentManager.peopleId}) to use as temporary owner`);
      return anotherContentManager.peopleId;
    }

    const anyOtherMember = members.find((member: any) => member.peopleId !== excludeUserId && member.isMember === true);
    if (anyOtherMember) {
      console.log(`Found another member (${anyOtherMember.peopleId}) to use as temporary owner`);
      return anyOtherMember.peopleId;
    }

    console.warn(`No other members found in site ${siteId} to use as temporary owner`);
    return null;
  }

  /**
   * Handles the special case where user is currently an OWNER and needs role change
   * When a user is an owner, we cannot directly change their role.
   * Solution: Assign another user as owner (which automatically demotes current owner to MANAGER), then assign desired role
   * @param siteId - The site ID
   * @param userId - The user ID to change role for
   * @param desiredRole - The desired role to assign
   * @returns Promise<SiteMembershipResponse> - The membership response
   */
  private async handleOwnerRoleChange(
    siteId: string,
    userId: string,
    desiredRole: SitePermission
  ): Promise<SiteMembershipResponse> {
    console.log(
      `User ${userId} is currently an OWNER. Assigning another user as owner will automatically demote current owner to MANAGER.`
    );

    // Step 1: Find another member to use as temporary owner
    const temporaryOwnerUserId = await this.findAnotherMemberForTemporaryOwner(siteId, userId);

    if (!temporaryOwnerUserId) {
      throw new Error(
        `Cannot change role for user ${userId} who is currently an OWNER. No other members found in site ${siteId} to use as temporary owner. Please ensure there is at least one other member in the site.`
      );
    }

    // Step 2: Get the original role of the temporary owner (to restore later if needed)
    const membershipList = await this.getSiteMembershipList(siteId);
    const temporaryOwnerMember = membershipList.result?.listOfItems?.find(
      (member: any) => member.peopleId === temporaryOwnerUserId
    );
    const temporaryOwnerOriginalRole = this.getCurrentRoleFromMember(temporaryOwnerMember);

    console.log(`Temporary owner ${temporaryOwnerUserId} current role: ${temporaryOwnerOriginalRole || 'MEMBER'}`);

    try {
      // Step 3: Assign temporary owner as OWNER (this automatically demotes current owner to MANAGER)
      console.log(
        `Assigning user ${temporaryOwnerUserId} as OWNER (this will automatically demote current owner ${userId} to MANAGER)`
      );
      await this.makeUserSiteMembership(
        siteId,
        temporaryOwnerUserId,
        SitePermission.OWNER,
        SiteMembershipAction.SET_PERMISSION
      );

      // Wait for the role change to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Verify the original owner was automatically demoted to MANAGER
      const verifyDemoted = await this.verifyRoleAssignment(siteId, userId, SitePermission.MANAGER);
      if (!verifyDemoted) {
        console.warn(
          `Warning: Original owner ${userId} may not have been automatically demoted to MANAGER as expected. Proceeding anyway.`
        );
      }

      // Step 5: Now assign the desired role to the original user (who is now a MANAGER)
      console.log(
        `Assigning desired role ${desiredRole} to user ${userId} (currently MANAGER after automatic demotion)`
      );
      const response = await this.makeUserSiteMembership(
        siteId,
        userId,
        desiredRole,
        SiteMembershipAction.SET_PERMISSION
      );

      // Step 6: Verify the desired role was assigned
      const verified = await this.verifyRoleAssignment(siteId, userId, desiredRole);
      if (!verified) {
        console.warn(
          `Warning: Desired role ${desiredRole} may not have been assigned to user ${userId}. Response: ${JSON.stringify(response)}`
        );
      }

      // Step 7: Restore temporary owner to their original role (unless desired role is OWNER - then keep them as owner)
      if (desiredRole !== SitePermission.OWNER) {
        console.log(
          `Restoring temporary owner ${temporaryOwnerUserId} to original role: ${temporaryOwnerOriginalRole || SitePermission.MANAGER}`
        );
        try {
          const restoreRole = temporaryOwnerOriginalRole || SitePermission.MANAGER;
          await this.makeUserSiteMembership(
            siteId,
            temporaryOwnerUserId,
            restoreRole,
            SiteMembershipAction.SET_PERMISSION
          );
          await this.verifyRoleAssignment(siteId, temporaryOwnerUserId, restoreRole);
          console.log(`✓ Temporary owner ${temporaryOwnerUserId} restored to ${restoreRole}`);
        } catch (restoreError) {
          // Log but don't fail - the main operation succeeded
          console.warn(
            `Warning: Failed to restore temporary owner ${temporaryOwnerUserId} to original role. This is non-critical. Error: ${restoreError}`
          );
        }
      } else {
        console.log(
          `Keeping temporary owner ${temporaryOwnerUserId} as OWNER since desired role for ${userId} is OWNER`
        );
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error during owner role change: ${errorMessage}`);
      throw new Error(`Failed to change role for owner ${userId} to ${desiredRole}. Error: ${errorMessage}`);
    }
  }

  /**
   * Ensures user is a member of the site with the specified role
   * First checks if user is already a member, if not adds them, then assigns the role
   * Verifies the role assignment was successful
   * @param params - Object containing siteId, userId, and role
   * @returns Promise<SiteMembershipResponse> - The membership response
   */
  async updateUserSiteMembershipWithRole(params: {
    siteId: string;
    userId: string;
    role: SitePermission;
  }): Promise<SiteMembershipResponse> {
    const { siteId, userId, role } = params;
    // Step 1: Check current membership status
    const membershipList = await this.getSiteMembershipList(siteId);
    const userMembership = membershipList.result?.listOfItems?.find((member: any) => member.peopleId === userId);
    const isUserMember = !!userMembership;

    console.log('User Membership Status:', JSON.stringify(userMembership, null, 2));

    // Step 2: Determine current role from boolean flags (not from permission field)
    const currentRole = this.getCurrentRoleFromMember(userMembership);
    const hasCorrectRole = currentRole === role;

    console.log(
      `User ${userId} - Current Role: ${currentRole || 'Not a member'}, Desired Role: ${role}, Match: ${hasCorrectRole}`
    );

    // Step 3: If user already has the correct role, return success
    if (hasCorrectRole) {
      console.log(`User ${userId} already has the correct role ${role} in site ${siteId}`);
      return {
        status: 'success',
        message: `User already has role ${role}`,
        result: { userId, siteId, permission: role, action: SiteMembershipAction.SET_PERMISSION },
      };
    }

    // Step 4: If user is not a member, add them first
    if (!isUserMember) {
      console.log(`User ${userId} is not a member of site ${siteId}, adding as member first`);
      await this.makeUserSiteMembership(siteId, userId, SitePermission.MEMBER, SiteMembershipAction.ADD);

      // If the desired role is not member, set it separately
      if (role !== SitePermission.MEMBER) {
        console.log(`Setting user ${userId} role to ${role}`);
        const response = await this.makeUserSiteMembership(siteId, userId, role, SiteMembershipAction.SET_PERMISSION);

        // Verify the role was set correctly
        const verified = await this.verifyRoleAssignment(siteId, userId, role);
        if (!verified) {
          console.warn(
            `Warning: Role assignment may have failed. Expected ${role}, but verification did not confirm. Response: ${JSON.stringify(response)}`
          );
        }

        return response;
      }

      // Verify member role was set
      const verified = await this.verifyRoleAssignment(siteId, userId, SitePermission.MEMBER);
      if (!verified) {
        console.warn(`Warning: Member role assignment may have failed for user ${userId}`);
      }

      return {
        status: 'success',
        message: 'User added successfully',
        result: { userId, siteId, permission: role, action: SiteMembershipAction.ADD },
      };
    }

    // Step 5: User is a member but has wrong role - update it
    console.log(`User ${userId} is a member but has wrong role (${currentRole}), updating to ${role}`);

    // Special handling: If user is currently an OWNER, we need special logic
    if (currentRole === SitePermission.OWNER && role !== SitePermission.OWNER) {
      console.log(`User ${userId} is currently an OWNER. Using special owner demotion flow to assign role ${role}`);
      return await this.handleOwnerRoleChange(siteId, userId, role);
    }

    try {
      const response = await this.makeUserSiteMembership(siteId, userId, role, SiteMembershipAction.SET_PERMISSION);

      // Verify the role was set correctly
      const verified = await this.verifyRoleAssignment(siteId, userId, role);
      if (!verified) {
        console.warn(
          `Warning: Role update may have failed. Expected ${role}, but verification did not confirm. Response: ${JSON.stringify(response)}`
        );
        // Don't throw error, but log warning - API might have succeeded but verification timing issue
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to update role using SET_PERMISSION: ${errorMessage}`);

      // If SET_PERMISSION fails, try a more aggressive approach:
      // Remove user and re-add with correct role
      console.log(`Attempting fallback: Remove and re-add user with correct role`);
      try {
        // Remove user
        await this.makeUserSiteMembership(siteId, userId, SitePermission.MEMBER, SiteMembershipAction.REMOVE);

        // Re-add as member first
        await this.makeUserSiteMembership(siteId, userId, SitePermission.MEMBER, SiteMembershipAction.ADD);

        // If desired role is not member, set it
        if (role !== SitePermission.MEMBER) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const response = await this.makeUserSiteMembership(siteId, userId, role, SiteMembershipAction.SET_PERMISSION);

          // Verify the role was set correctly
          const verified = await this.verifyRoleAssignment(siteId, userId, role);
          if (!verified) {
            console.error(
              `Error: Fallback role assignment failed. User ${userId} does not have role ${role} after remove/re-add`
            );
            throw new Error(
              `Failed to assign role ${role} to user ${userId} even after remove/re-add. Verification failed.`
            );
          }

          return response;
        }

        // Verify member role
        const verified = await this.verifyRoleAssignment(siteId, userId, SitePermission.MEMBER);
        if (!verified) {
          throw new Error(`Failed to re-add user ${userId} as member. Verification failed.`);
        }

        return {
          status: 'success',
          message: 'User re-added successfully',
          result: { userId, siteId, permission: role, action: SiteMembershipAction.ADD },
        };
      } catch (fallbackError) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error(`Fallback approach also failed: ${fallbackErrorMessage}`);
        throw new Error(
          `Failed to update user ${userId} role to ${role} in site ${siteId}. SET_PERMISSION failed: ${errorMessage}. Fallback failed: ${fallbackErrorMessage}`
        );
      }
    }
  }

  async getSiteAuthorNameAndEventStartDate(): Promise<{
    siteId: string;
    authorName?: string;
    startsAt?: string;
    eventName?: string;
    siteName?: string;
  }> {
    const siteListResponse = await this.getListOfSites();

    for (const _site of siteListResponse.result.listOfItems) {
      // Get individual site details to check for coverImage and hasEvents
      const response = await this.contentManagementService.getContentList();
      const content = response.result.listOfItems.find((item: any) => item.authoredBy?.name !== undefined);
      const siteName = response.result.listOfItems.find((item: any) => item.site?.name !== undefined);
      const startsAt = response.result.listOfItems.find((item: any) => item.startsAt !== undefined);
      const siteId = siteListResponse.result.listOfItems.find((item: any) => item.siteId !== undefined);

      if (content) {
        return {
          siteId: siteId?.siteId || '',
          authorName: content.authoredBy.name,
          startsAt: startsAt?.startsAt,
          eventName: content.title,
          siteName: siteName?.site.name,
        };
      }
    }

    throw new Error('No site found with cover image and hasEvents: true');
  }

  async getSiteWithMembers(
    accessType: string,
    expectedMemberCount?: number,
    options?: { size?: number; type?: string; maxAttempts?: number }
  ): Promise<{
    site: any;
    members: any;
  }> {
    const maxAttempts = options?.maxAttempts || 10;
    let attempts = 0;

    const seenSiteIds = new Set<string>();

    return await test.step(
      expectedMemberCount ? `Getting site with ${expectedMemberCount} members` : `Getting site with its members`,
      async () => {
        while (attempts < maxAttempts) {
          // Get sites list
          const sitesResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
          const sites = sitesResponse.result.listOfItems.filter(
            (site: any) => site.isActive === true && site.isManager === false && site.isMember === false
          );

          // Filter out seen sites to try different ones
          const unseenSites = sites.filter((site: any) => !seenSiteIds.has(site.siteId));

          if (unseenSites.length === 0) {
            // All sites seen, reset and start over
            seenSiteIds.clear();
            seenSiteIds.add(sites[0]?.siteId);
          }

          // Get first unseen site
          const siteInfo = unseenSites.length > 0 ? unseenSites[0] : sites[0];
          const siteId = siteInfo.siteId;
          seenSiteIds.add(siteId);

          // Get site details
          const siteDetails = await this.siteManagementService.getSiteDetails(siteId);

          // Get site members
          const membersResponse = await this.getSiteMembershipList(siteId, options);
          const memberCount = membersResponse.result?.listOfItems?.length || 0;

          console.log(`Site ${siteInfo.name} (${siteId}) has ${memberCount} members`);

          // If no expected count specified, return immediately
          if (expectedMemberCount === undefined) {
            return {
              site: siteDetails.result,
              members: membersResponse.result,
            };
          }

          console.log(`Expected: ${expectedMemberCount} members`);

          // Check if this site has the expected number of members
          if (memberCount >= expectedMemberCount) {
            console.log(`✓ Found site with ${memberCount} members`);
            return {
              site: siteDetails.result,
              members: membersResponse.result,
            };
          }

          attempts++;
          console.log(`Attempt ${attempts}/${maxAttempts}: Site has ${memberCount} members, trying another site...`);

          // Wait a bit before next attempt to avoid rapid API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        throw new Error(
          `Failed to find a site with at least ${expectedMemberCount} members after ${maxAttempts} attempts`
        );
      }
    );
  }

  /**
   * Gets the membership list for a site
   * @param siteId - The site ID
   * @param options - Optional parameters for the membership list request
   * @returns Promise containing the membership list response
   */
  async getSiteMembershipList(siteId: string, options?: { size?: number; type?: string }): Promise<any> {
    return await this.siteManagementService.getSiteMembershipList(siteId, options);
  }
  /**
   * Gets member names from the site membership list
   * @param siteId - The site ID
   * @param options - Optional parameters for the membership list request
   * @returns Promise containing the member names
   */
  async getMembersNameFromList(
    siteId: string,
    options?: { size?: number; type?: string }
  ): Promise<{
    membersName: string[];
  }> {
    return await test.step(`Getting member names from site ${siteId}`, async () => {
      const membersResponse = await this.getSiteMembershipList(siteId, options);
      const members = membersResponse.result?.listOfItems || [];

      const membersName = members.map((member: any) => member.name || member.displayName || member.email);

      return {
        membersName,
      };
    });
  }

  /**
   * Gets a site by access type with specific content submissions configuration
   * @param accessType - The access type of the site (e.g., SITE_TYPES.UNLISTED)
   * @param isContentSubmissionsEnabled - Whether content submissions should be enabled
   * @returns Promise containing site details with siteName and siteId
   */
  async getSiteByIdWithContentSubmissions(
    accessType: string,
    isContentSubmissionsEnabled: boolean
  ): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Getting site with access type ${accessType} and content submissions ${isContentSubmissionsEnabled ? 'enabled' : 'disabled'}`, async () => {
      // Try to find an existing site with the desired configuration
      const _existingSite = await this.getSiteByAccessType(accessType, {
        waitForSearchIndex: true,
      });

      // If we found an existing site, check if it matches our content submission requirements
      // For now, we'll create a new site with the specific content submission setting
      const createdSite = await this.createSiteByAccessType(accessType, undefined, {
        overrides: {
          isContentSubmissionsEnabled: isContentSubmissionsEnabled,
        },
        waitForSearchIndex: true,
      });

      return {
        siteId: createdSite.siteId,
        siteName: createdSite.siteName,
      };
    });
  }

  /**
   * Gets the list of carousel items for a site and removes them all
   * @param siteId - The site ID to get carousel items from
   * @returns Promise containing the number of items removed
   */
  async getAndRemoveAllCarouselItems(siteId: string): Promise<number> {
    return await test.step(`Getting and removing all carousel items from site: ${siteId}`, async () => {
      // Get the list of carousel items
      const carouselResponse = await this.siteManagementService.getSiteCarouselItems(siteId);

      if (!carouselResponse.result?.listOfItems?.length) {
        console.log(`No carousel items found for site ${siteId}`);
        return 0;
      }

      const carouselItems = carouselResponse.result.listOfItems;
      console.log(`Found ${carouselItems.length} carousel items to remove`);

      let removedCount = 0;

      // Remove each carousel item
      for (const item of carouselItems) {
        try {
          await this.siteManagementService.deleteSiteCarouselItem(siteId, item.carouselItemId);
          console.log(`Successfully removed carousel item: ${item.carouselItemId}`);
          removedCount++;
        } catch (error) {
          console.error(`Failed to remove carousel item ${item.carouselItemId}:`, error);
          // Continue with other items even if one fails
        }
      }

      console.log(`Successfully removed ${removedCount} out of ${carouselItems.length} carousel items`);
      return removedCount;
    });
  }

  /**
   * Gets the list of home carousel items and removes them all
   * @returns Promise containing the number of items removed
   */
  async getAndRemoveAllHomeCarouselItems(): Promise<number> {
    return await test.step('Getting and removing all home carousel items', async () => {
      // Get the list of home carousel items
      const carouselResponse = await this.siteManagementService.getHomeCarouselItems();

      if (!carouselResponse.result?.listOfItems?.length) {
        console.log('No home carousel items found');
        return 0;
      }

      const carouselItems = carouselResponse.result.listOfItems;
      console.log(`Found ${carouselItems.length} home carousel items to remove`);

      let removedCount = 0;

      // Remove each carousel item
      for (const item of carouselItems) {
        try {
          await this.siteManagementService.deleteHomeCarouselItem(item.carouselItemId);
          console.log(`Successfully removed home carousel item: ${item.carouselItemId}`);
          removedCount++;
        } catch (error) {
          console.error(`Failed to remove home carousel item ${item.carouselItemId}:`, error);
          // Continue with other items even if one fails
        }
      }

      console.log(`Successfully removed ${removedCount} out of ${carouselItems.length} home carousel items`);
      return removedCount;
    });
  }

  /**
   * Gets the list of carousel items for a site
   * @param siteId - The site ID to get carousel items from
   * @returns Promise containing the carousel items list
   */
  async getSiteCarouselItems(siteId: string): Promise<any> {
    return await test.step(`Getting carousel items for site: ${siteId}`, async () => {
      return await this.siteManagementService.getSiteCarouselItems(siteId);
    });
  }

  /**
   * Gets the home carousel items list
   * @returns Promise containing the home carousel items response
   */
  async getHomeCarouselItems(): Promise<any> {
    return await test.step('Getting home carousel items', async () => {
      return await this.siteManagementService.getHomeCarouselItems();
    });
  }

  /**
   * Removes a specific carousel item from a site
   * @param siteId - The site ID containing the carousel item
   * @param carouselItemId - The carousel item ID to remove
   * @returns Promise containing the delete response
   */
  async removeCarouselItem(siteId: string, carouselItemId: string): Promise<any> {
    return await test.step(`Removing carousel item ${carouselItemId} from site ${siteId}`, async () => {
      return await this.siteManagementService.deleteSiteCarouselItem(siteId, carouselItemId);
    });
  }

  /**
   * Deletes a carousel item from the home dashboard
   * @param carouselItemId - The carousel item ID to delete
   * @returns Promise containing the delete response
   */
  async deleteHomeCarouselItem(carouselItemId: string): Promise<any> {
    return await test.step(`Deleting home carousel item ${carouselItemId}`, async () => {
      return await this.siteManagementService.deleteHomeCarouselItem(carouselItemId);
    });
  }

  /**
   * Creates a site and assigns the user as owner
   * @param userId - The user ID to make owner
   * @returns Promise with site details
   */
  private async createSiteWithUserAsOwner(userId: string): Promise<{ siteId: string; siteName: string }> {
    const createdSite = await this.createSite({
      accessType: SITE_TYPES.PUBLIC,
      siteName: `Site for ${userId}`,
      category: { name: 'Public', categoryId: 'public' },
      waitForSearchIndex: true,
    });
    await this.makeUserSiteMembership(createdSite.siteId, userId, SitePermission.MEMBER, SiteMembershipAction.ADD);
    await this.makeUserSiteMembership(
      createdSite.siteId,
      userId,
      SitePermission.OWNER,
      SiteMembershipAction.SET_PERMISSION
    );
    return { siteId: createdSite.siteId, siteName: createdSite.siteName };
  }
  async getSiteWithUserAsOwner(userId: string, accessType: SITE_TYPES): Promise<{ siteId: string; siteName: string }> {
    const siteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
    const activeSites = siteListResponse.result.listOfItems.filter(site => site.isActive === true);

    if (activeSites.length) {
      // Iterate through all active sites to find one where the user is an owner
      for (const site of activeSites) {
        const memberListResponse = await this.siteManagementService.getSiteMembershipList(site.siteId);
        const isOwner = memberListResponse.result.listOfItems.find(
          (member: any) => member.peopleId === userId && member.isOwner === true
        );
        if (isOwner) {
          console.log(`Found site ${site.name} (${site.siteId}) where user ${userId} is an owner`);
          return {
            siteId: site.siteId,
            siteName: site.name,
          };
        }
      }
      // If no site found where user is owner, create a new one
      console.log(`No site found where user ${userId} is an owner, creating a new site...`);
      return await this.createSiteWithUserAsOwner(userId);
    } else {
      console.log(`No active sites found, creating a new site...`);
      return await this.createSiteWithUserAsOwner(userId);
    }
  }

  async approveContent(siteId: string, contentId: string): Promise<any> {
    return await this.siteManagementService.approveContent(siteId, contentId);
  }

  async rejectContent(siteId: string, contentId: string, rejectionComment?: string): Promise<any> {
    return await this.siteManagementService.rejectContent(siteId, contentId, rejectionComment);
  }

  async getSiteInUserIsNotMemberOrOwner(
    userId: string[],
    accessType: SITE_TYPES
  ): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Getting site in user is not a member or owner: ${userId}`, async () => {
      const siteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
      const activeSites = siteListResponse.result.listOfItems.filter(
        site => site.isActive === true && site.hasAlbums === true && site.hasEvents === true && site.hasPages === true
      );
      if (activeSites.length) {
        // Iterate through each site and check membership
        for (const site of activeSites) {
          const memberListResponse = await this.siteManagementService.getSiteMembershipList(site.siteId);

          console.log('memberListResponse', memberListResponse.result.listOfItems);

          // Check if all users are neither members nor owners
          const memberPeopleIds = memberListResponse.result.listOfItems.map((member: any) => member.peopleId);
          const allUsersNotMembers = userId.every(userId => !memberPeopleIds.includes(userId));

          if (allUsersNotMembers) {
            console.log('Found site:' + site);
            return { siteId: site.siteId, siteName: site.name };
          }
        }
      }
      // If no site found where all users are not members/owners, create a new site
      return await this.createSite({
        accessType: accessType,
        waitForSearchIndex: false, // Disable search indexing to avoid timeout issues
      });
    });
  }

  /**
   * Gets a private or unlisted site that has content (pages, events, or albums)
   * @param accessType - The access type to search for ('private' or 'unlisted')
   * @returns Promise with site details that has content
   */
  async getSiteWithContent(accessType: string, userId: string[]): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Getting ${accessType} site with content`, async () => {
      const siteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
      const sites = siteListResponse.result.listOfItems.filter((site: any) => site.isActive === true);

      // Check each site to see if it has content and users are not members
      for (const site of sites) {
        const memberListResponse = await this.siteManagementService.getSiteMembershipList(site.siteId);
        const memberPeopleIds = memberListResponse.result.listOfItems.map((member: any) => member.peopleId);
        const allUsersNotMembers = userId.every(user => !memberPeopleIds.includes(user));

        // Check if all users are not members AND site has content
        if (allUsersNotMembers && (site.hasPages || site.hasEvents || site.hasAlbums)) {
          console.log(`Found ${accessType} site with content: ${site.name} (${site.siteId})`);
          return { siteId: site.siteId, siteName: site.name };
        }
      }

      // If no site with content found, create a new one with pages enabled
      console.log(`No ${accessType} site with content found, creating new site...`);
      const createdSite = await this.createSiteByAccessType(accessType, undefined, {
        hasPages: true,
        waitForSearchIndex: true,
      });

      return { siteId: createdSite.siteId, siteName: createdSite.siteName };
    });
  }

  public async getDeactivatedSite(
    accessType: SITE_TYPES,
    options?: { size?: number }
  ): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Getting deactivated site for access type ${accessType}`, async () => {
      const siteListResponse = await this.getListOfSites({ filter: 'deactivated', size: options?.size });
      console.log('Deactivated site list response', siteListResponse);
      const site = siteListResponse.result.listOfItems.find(
        (site: any) => site.access.toLowerCase() === accessType.toLowerCase()
      );
      console.log('Deactivated site', site);
      if (!site) {
        //create a site and make it deactivated
        const createdSite = await this.createSite({
          accessType: accessType,
          waitForSearchIndex: true,
        });
        await this.siteManagementService.deactivateSite(createdSite.siteId);
        return { siteId: createdSite.siteId, siteName: createdSite.siteName };
      } else {
        return { siteId: site.siteId, siteName: site.name };
      }
    });
  }
}
