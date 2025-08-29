import { faker } from '@faker-js/faker';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { SiteCreationPayload } from '@/src/core/types/siteManagement.types';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

interface Site {
  siteId: string;
  siteName: string;
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
   * @param waitForSearchIndex - Optional flag to wait for site to appear in search results. Defaults to true.
   * @returns An object containing details of the created site.
   */
  async _createSiteBaseMethod(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    waitForSearchIndex?: boolean;
  }) {
    const { siteName, category, overrides, waitForSearchIndex = true } = params;
    const randomNum = Math.floor(Math.random() * 1000000 + 1);
    const finalSiteName = siteName ?? `Automate_Site_name_${faker.commerce.department()}`;

    // Get category if not provided
    let categoryObj = category;
    if (!categoryObj) {
      categoryObj = await this.appManagerApiClient.getSiteManagementService().getCategoryId('General');
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
    if (waitForSearchIndex) {
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
   * @param waitForSearchIndex - Optional flag to wait for site to appear in search results. Defaults to true.
   * @returns An object containing details of the created site.
   */
  async createPublicSite(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
    waitForSearchIndex?: boolean;
  }) {
    const { siteName, category, overrides, waitForSearchIndex } = params;
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
   * @param waitForSearchIndex - Optional flag to wait for site to appear in search results. Defaults to true.
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
   * @param waitForSearchIndex - Optional flag to wait for site to appear in search results. Defaults to true.
   * @returns An object containing details of the created site.
   */
  async createUnlistedSite(params: {
    siteName?: string;
    category?: { name: string; categoryId: string };
    overrides?: Partial<SiteCreationPayload>;
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
  async getSiteFromSiteList(
    siteName: string,
    options?: {
      category?: { name: string; categoryId: string };
      overrides?: Partial<SiteCreationPayload>;
      accessType?: 'public' | 'private' | 'unlisted';
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

    const accessType = options?.accessType || 'public';
    let createdSite;

    switch (accessType) {
      case 'private':
        createdSite = await this.createPrivateSite({
          siteName,
          category: options?.category,
          overrides: options?.overrides,
        });
        break;
      case 'unlisted':
        createdSite = await this.createUnlistedSite({
          siteName,
          category: options?.category,
          overrides: options?.overrides,
        });
        break;
      default:
        createdSite = await this.createPublicSite({
          siteName,
          category: options?.category,
          overrides: options?.overrides,
        });
    }

    console.log(`Created new site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);
    return createdSite.siteId;
  }

  /**
   * Adds a member to an existing site
   * @param siteId - The ID of the site to add member to
   * @param userId - The ID of the user to add as member
   * @param permission - The permission level for the member (default: 'member')
   * @returns Promise resolving to the API response
   */
  async addMemberToSite(siteId: string, userId: string, permission: string = 'member'): Promise<any> {
    const response = await this.appManagerApiClient
      .getSiteManagementService()
      .siteAddMember(siteId, userId, permission);

    // Track the member for potential cleanup
    this.siteMembers.push({
      siteId,
      userEmail: userId, // Using userId as userEmail for tracking purposes
    });

    console.log(`Added member ${userId} to site ${siteId} with permission: ${permission}`);
    return response;
  }
}
