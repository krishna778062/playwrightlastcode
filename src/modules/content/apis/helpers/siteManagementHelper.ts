import { APIRequestContext, test } from '@playwright/test';

import {
  SiteCreationPayload,
  SiteMembershipAction,
  SiteMembershipResponse,
  SitePermission,
} from '@/src/core/types/siteManagement.types';
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
    const timestamp = Date.now().toString().slice(-4);
    const randomId = Math.random().toString(36).substring(2, 6);
    const finalSiteName = siteName ?? `Automate_Site_${timestamp}_${randomId}`;

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
    // Default waitForSearchIndex to false if not explicitly provided
    const waitForSearchIndex = options.waitForSearchIndex ?? false;
    switch (options.accessType) {
      case SITE_TYPES.PUBLIC:
        return await this.createPublicSite({
          siteName: options.siteName,
          category: options.category,
          overrides: options.overrides,
          waitForSearchIndex: waitForSearchIndex,
        });
      case SITE_TYPES.PRIVATE:
        return await this.createPrivateSite({
          siteName: options.siteName,
          category: options.category,
          overrides: options.overrides,
          waitForSearchIndex: waitForSearchIndex,
        });
      case SITE_TYPES.UNLISTED:
        return await this.createUnlistedSite({
          siteName: options.siteName,
          category: options.category,
          overrides: options.overrides,
          waitForSearchIndex: waitForSearchIndex,
        });
      default:
        throw new Error(`Invalid access type: ${options.accessType}`);
    }
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
      filter: 'all',
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
      //check the status of the site if active then return the siteId
      if (!existingSite.isActive) {
        //activate the site
        await this.siteManagementService.activateSite(existingSite.siteId);
        console.log(`Activated site ${existingSite.name} (${existingSite.siteId})`);
      }
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
      size: options?.size || 16,
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

    // Default waitForSearchIndex to false if not explicitly provided
    const waitForSearchIndex = options?.waitForSearchIndex ?? false;

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
          waitForSearchIndex: waitForSearchIndex,
        });
        break;
      case SITE_TYPES.UNLISTED:
        createdSite = await this.createUnlistedSite({
          siteName,
          category: options?.category,
          overrides,
          waitForSearchIndex: waitForSearchIndex,
        });
        break;
      default:
        createdSite = await this.createPublicSite({
          siteName,
          category: options?.category,
          overrides,
          waitForSearchIndex: waitForSearchIndex,
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
      hasPages?: boolean;
      hasEvents?: boolean;
      hasAlbums?: boolean;
      hasDashboard?: boolean;
      landingPage?: string;
      isOwner?: boolean;
      isMembershipAutoApproved?: boolean;
      isBroadcast?: boolean;
      waitForSearchIndex?: boolean;
    }
  ): Promise<{ siteId: string; name: string }> {
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
        (options?.hasPages === undefined || siteDetails.hasPages === options.hasPages) &&
        (options?.hasEvents === undefined || siteDetails.hasEvents === options.hasEvents) &&
        (options?.hasAlbums === undefined || siteDetails.hasAlbums === options.hasAlbums);

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

    return { siteId, name: siteName };
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
  /**
   * Checks if a site has a valid coverImage
   * @param site - Site object to check
   * @returns Boolean indicating if the site has a valid coverImage
   */
  /**
   * Ensures user is a member of the site with the specified role
   * First checks if user is already a member, if not adds them, then assigns the role
   * @param params - Object containing siteId, userId, and role
   * @returns Promise<SiteMembershipResponse> - The membership response
   */
  async updateUserSiteMembershipWithRole(params: {
    siteId: string;
    userId: string;
    role: SitePermission;
  }): Promise<SiteMembershipResponse> {
    const { siteId, userId, role } = params;
    // First, check if user is already a member of the site
    const membershipList = await this.getSiteMembershipList(siteId);
    const userMembership = membershipList.result?.listOfItems?.find((member: any) => member.peopleId === userId);
    const isUserMember = !!userMembership;
    const hasCorrectRole = userMembership?.permission === role;

    // If user is not a member, add them as member first, then set the desired role
    if (!isUserMember) {
      console.log(`User ${userId} is not a member of site ${siteId}, adding as member first`);
      await this.makeUserSiteMembership(siteId, userId, SitePermission.MEMBER, SiteMembershipAction.ADD);

      // If the desired role is not member, set it separately
      if (role !== SitePermission.MEMBER) {
        console.log(`Setting user ${userId} role to ${role}`);
        return await this.makeUserSiteMembership(siteId, userId, role, SiteMembershipAction.SET_PERMISSION);
      }
      return {
        status: 'success',
        message: 'User added successfully',
        result: { userId, siteId, permission: role, action: SiteMembershipAction.ADD },
      };
    } else if (!hasCorrectRole) {
      console.log(`User ${userId} is a member but has wrong role, updating to ${role}`);
      // Try SET_PERMISSION first, if it fails, fall back to remove and re-add
      try {
        return await this.makeUserSiteMembership(siteId, userId, role, SiteMembershipAction.SET_PERMISSION);
      } catch {
        console.log(`SET_PERMISSION failed, falling back to remove and re-add approach`);
        await this.makeUserSiteMembership(siteId, userId, SitePermission.MEMBER, SiteMembershipAction.REMOVE);
        await this.makeUserSiteMembership(siteId, userId, SitePermission.MEMBER, SiteMembershipAction.ADD);
        if (role !== SitePermission.MEMBER) {
          return await this.makeUserSiteMembership(siteId, userId, role, SiteMembershipAction.SET_PERMISSION);
        }
        return {
          status: 'success',
          message: 'User added successfully',
          result: { userId, siteId, permission: role, action: SiteMembershipAction.ADD },
        };
      }
    } else {
      console.log(`User ${userId} already has the correct role ${role} in site ${siteId}`);
      return userMembership;
    }
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
   * Gets a site with its members
   * @param siteId - The site ID
   * @param options - Optional parameters for the membership list request
   * @returns Promise containing the site details and its members
   */

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
          return {
            siteId: site.siteId,
            siteName: site.name,
          };
        }
      }
      // If no site found where user is owner, create a new one
      return await this.createSiteWithUserAsOwner(userId);
    } else {
      return await this.createSiteWithUserAsOwner(userId);
    }
  }

  async getSiteInUserIsNotMemberOrOwner(
    userId: string[],
    accessType: SITE_TYPES
  ): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Getting site in user is not a member or owner: ${userId}`, async () => {
      const siteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
      const activeSites = siteListResponse.result.listOfItems.filter(site => site.isActive === true);
      if (activeSites.length) {
        // Iterate through each site and check membership
        for (const site of activeSites) {
          const memberListResponse = await this.siteManagementService.getSiteMembershipList(site.siteId);

          console.log('memberListResponse', memberListResponse.result.listOfItems);

          // Check if all users are neither members nor owners
          const memberPeopleIds = memberListResponse.result.listOfItems.map((member: any) => member.peopleId);
          const allUsersNotMembers = userId.every(userId => !memberPeopleIds.includes(userId));

          if (allUsersNotMembers) {
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
