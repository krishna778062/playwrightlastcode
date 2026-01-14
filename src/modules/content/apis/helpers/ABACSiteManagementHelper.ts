import { APIRequestContext, test } from '@playwright/test';

import { ABACSiteCreationPayload } from '@core/types/abacSiteManagement.types';
import { SiteCategory } from '@core/types/siteManagement.types';
import { log } from '@core/utils/logger';
import { TestDataGenerator } from '@core/utils/testDataGenerator';

import { SiteCreationHelper } from './site/siteCreationHelper';
import { SiteMembershipHelper } from './site/siteMembershipHelper';

import { ABACSiteManagementService } from '@/src/modules/content/apis/services/ABACSiteManagementService';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';
import { IdentityService } from '@/src/modules/platforms/apis/services/IdentityService';

export interface CreatedABACSite {
  siteId: string;
  siteName: string;
  accessType: 'public' | 'private';
  categoryId: string;
  categoryName: string;
}

export class ABACSiteManagementHelper {
  readonly abacSiteManagementService: ABACSiteManagementService;
  readonly siteManagementService: SiteManagementService;
  private creationHelper: SiteCreationHelper;
  private membershipHelper: SiteMembershipHelper;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.abacSiteManagementService = new ABACSiteManagementService(apiRequestContext, baseUrl);
    this.siteManagementService = new SiteManagementService(apiRequestContext, baseUrl);
    this.creationHelper = new SiteCreationHelper(this.siteManagementService);
    this.membershipHelper = new SiteMembershipHelper(
      this.siteManagementService,
      new IdentityService(apiRequestContext, baseUrl)
    );
  }

  /**
   * Creates a site with ABAC audience configuration
   * @param type - Site type: 'public' or 'private'
   * @param options - Site creation options
   * @param options.siteName - Site name (optional, will generate if not provided)
   * @param options.category - Site category
   * @param options.targetAudience - Array of audience IDs for target audience
   * @param options.subscription - Array of subscription configurations
   * @param options.overrides - Additional payload overrides
   * @returns Promise with created site details
   */
  async createSite(
    type: 'public' | 'private',
    options: {
      siteName?: string;
      category: SiteCategory;
      targetAudience: string[];
      subscription?: Array<{
        audienceId: string;
        accessType: 'member' | 'follower';
        isMandatory?: boolean;
      }>;
      overrides?: Partial<ABACSiteCreationPayload>;
    }
  ): Promise<CreatedABACSite> {
    return await test.step(`Creating ${type} site with ABAC audience: ${options.siteName || 'auto-generated'}`, async () => {
      const siteName =
        options.siteName ||
        TestDataGenerator.generateRandomString(type === 'public' ? 'ABACPublicSite' : 'ABACPrivateSite');

      const payload: ABACSiteCreationPayload = {
        access: type,
        hasPages: options.overrides?.hasPages ?? true,
        hasEvents: options.overrides?.hasEvents ?? true,
        hasAlbums: options.overrides?.hasAlbums ?? true,
        hasDashboard: options.overrides?.hasDashboard ?? true,
        landingPage: options.overrides?.landingPage || 'dashboard',
        isContentFeedEnabled: options.overrides?.isContentFeedEnabled ?? true,
        isContentSubmissionsEnabled: options.overrides?.isContentSubmissionsEnabled ?? true,
        isOwner: options.overrides?.isOwner ?? true,
        isMembershipAutoApproved: options.overrides?.isMembershipAutoApproved ?? false,
        isBroadcast: options.overrides?.isBroadcast ?? false,
        name: siteName,
        category: options.category,
        targetAudience: options.targetAudience,
        subscription:
          options.subscription?.map(sub => ({
            audienceId: sub.audienceId,
            accessType: sub.accessType,
            isMandatory: sub.isMandatory ?? false,
          })) || [],
        ...options.overrides,
      };

      const response = await this.abacSiteManagementService.createSite(payload, type);

      return {
        siteId: response.result.siteId,
        siteName: response.result.name,
        accessType: type,
        categoryId: options.category.categoryId,
        categoryName: options.category.name,
      };
    });
  }

  /**
   * Searches for a site by name and activates it if needed
   * @param siteName - Site name to search for
   * @param options - Optional parameters
   * @param options.canManage - Filter by sites user can manage
   * @param options.filter - Filter type ('all', 'active', etc.)
   * @param options.includeDeactivated - Include deactivated sites in search
   * @returns Promise with site ID
   */
  async searchSiteAndActivateIfNeeded(
    siteName: string,
    options?: {
      canManage?: boolean;
      filter?: string;
      includeDeactivated?: boolean;
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

      if (!matchingSite) {
        throw new Error(`Site with name "${siteName}" not found in search results`);
      }

      const siteId = matchingSite.item.id;
      const isActive = matchingSite.item.isActive;

      // If site is not active, activate it
      if (!isActive) {
        log.debug(`Site "${siteName}" (${siteId}) is inactive, activating...`);
        await this.siteManagementService.activateSite(siteId);
      }
      log.debug(`Site "${siteName}" (${siteId}) is active`);
      return siteId;
    });
  }

  /**
   * Gets category ID for a given category name
   * @param categoryName - Category name
   * @returns Promise with category ID and name
   */
  async getCategoryId(categoryName: string): Promise<SiteCategory> {
    return await this.siteManagementService.getCategoryId(categoryName);
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
