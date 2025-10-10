import { test } from '@playwright/test';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { StandardUserApiClient } from '@/src/core/api/clients/standardUserApiClient';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import {
  SiteCreationPayload,
  SiteMembershipAction,
  SiteMembershipResponse,
  SitePermission,
} from '@/src/core/types/siteManagement.types';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

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

  constructor(private appManagerApiClient: AppManagerApiClient) {}

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
      categoryObj = await this.appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
    }

    const siteResult = await this.appManagerApiClient.getSiteManagementService().addNewSite({
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
        apiClient: this.appManagerApiClient,
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
        await this.appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
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
    const categoryResponse = await this.appManagerApiClient.getSiteManagementService().getListOfCategories();
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
    const sitesResponse = await this.appManagerApiClient.getSiteManagementService().getListOfSites({
      size: 1000, // Get a large number to ensure we find the site if it exists
      canManage: true,
      filter: 'active',
    });

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
    const result = await this.appManagerApiClient
      .getSiteManagementService()
      .makeUserSiteMembership(siteId, userId, permission, action);

    // Track the member for potential cleanup (optional)
    this.siteMembers.push({
      siteId,
      userEmail: userId, // Using userId as identifier since we don't have email here
    });

    return result;
  }

  /**
   * Gets the list of sites
   * @param options - Optional parameters for filtering sites
   * @returns Promise containing the sites response
   */
  async getListOfSites(options?: { size?: number; canManage?: boolean; filter?: string; page?: number }) {
    const defaultOptions = {
      size: 1000,
      canManage: true,
      filter: options?.filter || 'active',
      page: 0,
      ...options,
    };

    return await this.appManagerApiClient.getSiteManagementService().getListOfSites(defaultOptions);
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
    return await this.appManagerApiClient.getSiteManagementService().getMemberList(defaultOptions);
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
      if (!allSitesResponse.result?.listOfItems?.length) {
        throw new Error('No active sites found');
      }

      // Create Set for O(1) lookup performance
      const featuredSiteIds = new Set(featuredSitesResponse.result?.listOfItems?.map((site: any) => site.siteId) || []);

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
    return await this.appManagerApiClient.getSiteManagementService().unfeatureSite(siteId);
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
  ): Promise<{ siteId: string; name: string; authorName?: string }> {
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
        siteId = siteDetails?.siteId;
        siteName = siteDetails?.name;
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

    return { siteId, name: siteName, authorName };
  }

  async getSiteAuthorNameAndEventStartDate(): Promise<{
    siteId: string;
    authorName?: string;
    startsAt?: string;
    eventName?: string;
    siteName?: string;
  }> {
    const siteListResponse = await this.getListOfSites();

    for (const site of siteListResponse.result.listOfItems) {
      // Get individual site details to check for coverImage and hasEvents
      const response = await this.appManagerApiClient.getContentManagementService().getContentList();
      const content = await response.result.listOfItems.find(site => site.authoredBy?.name !== undefined);
      const siteName = await response.result.listOfItems.find(site => site.site?.name !== undefined);
      const startsAt = await response.result.listOfItems.find(site => site.startsAt !== undefined);
      if (content) {
        return {
          siteId: site.siteId,
          authorName: content.authoredBy?.name,
          startsAt: startsAt?.startsAt,
          eventName: content.title,
          siteName: siteName?.site?.name,
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
      } catch (error) {
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

  /**
   * Gets the membership list for a site
   * @param siteId - The site ID
   * @param options - Optional parameters for the membership list request
   * @returns Promise containing the membership list response
   */
  async getSiteMembershipList(siteId: string, options?: { size?: number; type?: string }): Promise<any> {
    return await this.appManagerApiClient.getSiteManagementService().getSiteMembershipList(siteId, options);
  }

  async getSiteWhichUserHasAlreadyMember(access: string): Promise<{
    siteId: string;
    name: string;
    access: string;
  }> {
    try {
      const siteResponse = await this.appManagerApiClient.getSiteManagementService().getSiteAsMembers();

      console.log('siteResponse', siteResponse);
      console.log('Looking for accessType:', access.toLowerCase());

      // Debug: log first few sites to understand structure
      const firstFewSites = siteResponse.result.listOfItems.slice(0, 3);
      console.log(
        'First few sites:',
        firstFewSites.map((site: any) => ({
          name: site.name,
          access: site.access,
          isMember: site.isMember,
          isActive: site.isActive,
        }))
      );

      const siteDetails: any = siteResponse.result.listOfItems.find(
        (site: any) =>
          site.isMember === true &&
          site.name !== 'All Employees' &&
          site.access === access.charAt(0).toUpperCase() + access.slice(1).toLowerCase() &&
          site.isActive === true &&
          site.isInMandatorySubscription === false
      );

      console.log(`Found site where user is member: ${siteDetails?.name} (${siteDetails?.siteId})`);

      if (!siteDetails) {
        throw new Error(`No active sites found where user is a member with access type: ${access}`);
      }

      return {
        siteId: siteDetails.siteId,
        name: siteDetails.name,
        access: siteDetails.access,
      };
    } catch (error) {
      console.error(`Error in getSiteWhichUserHasAlreadyMember for access type ${access}:`, error);
      throw error;
    }
  }
  /**
   * Gets a site with its members
   * @param siteId - The site ID
   * @param options - Optional parameters for the membership list request
   * @returns Promise containing the site details and its members
   */
  async getSiteWithMembers(
    siteId: string,
    options?: { size?: number; type?: string }
  ): Promise<{
    site: any;
    members: any;
  }> {
    return await test.step(`Getting site ${siteId} with its members`, async () => {
      // Get site details
      const siteResponse = await this.appManagerApiClient
        .getSiteManagementService()
        .get(`${PAGE_ENDPOINTS.CONTENT_SITES}/${siteId}`);
      const siteDetails = await siteResponse.json();

      // Get site members
      const membersResponse = await this.getSiteMembershipList(siteId, options);

      return {
        site: siteDetails.result,
        members: membersResponse.result,
      };
    });
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
}
