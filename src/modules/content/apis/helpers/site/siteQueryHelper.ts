import { faker } from '@faker-js/faker';
import { APIRequestContext, test } from '@playwright/test';

import { log } from '@core/utils/logger';

import { SiteCreationHelper } from './siteCreationHelper';
import { SiteMembershipHelper } from './siteMembershipHelper';

import { SiteCreationPayload, SiteMembershipAction, SitePermission } from '@/src/core/types/siteManagement.types';
import { ContentManagementService } from '@/src/modules/content/apis/services/ContentManagementService';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';
import { IdentityService } from '@/src/modules/platforms/apis/services/IdentityService';

// Constants
const DEFAULT_PAGE_SIZE = 1000;
const LARGE_PAGE_SIZE = 5000;

/**
 * Helper class for site query operations.
 * Handles fetching and searching for sites based on various criteria.
 */
export class SiteQueryHelper {
  constructor(
    private readonly siteManagementService: SiteManagementService,
    private readonly contentManagementService: ContentManagementService,
    private readonly identityService: IdentityService,
    private readonly apiRequestContext: APIRequestContext,
    private readonly baseUrl: string,
    private readonly creationHelper: SiteCreationHelper,
    private readonly membershipHelper: SiteMembershipHelper
  ) {}

  /**
   * Gets the list of sites with optional filters.
   */
  async getListOfSites(options?: { size?: number; filter?: string; sortBy?: string }) {
    const defaultOptions = {
      size: options?.size || DEFAULT_PAGE_SIZE,
      filter: options?.filter || 'active',
      sortBy: options?.sortBy || 'createdNewest',
      ...options,
    };

    return await this.siteManagementService.getListOfSites(defaultOptions);
  }

  /**
   * Gets a site by name from the sites list, or creates a new one if not found.
   */
  async getSiteIdWithName(
    siteName: string,
    options?: {
      category?: { name: string; categoryId: string };
      overrides?: Partial<SiteCreationPayload>;
      accessType?: SITE_TYPES;
    }
  ): Promise<string> {
    const sitesResponse = await this.siteManagementService.getListOfSites({
      size: LARGE_PAGE_SIZE,
      canManage: true,
      sortBy: 'alphabetical',
    });

    const existingSite = sitesResponse.result.listOfItems.find(
      site => site.name.toLowerCase() === siteName.toLowerCase()
    );

    if (existingSite) {
      log.debug(`Found existing site: ${existingSite.name} with ID: ${existingSite.siteId}`);
      return existingSite.siteId;
    }

    log.debug(`Site "${siteName}" not found. Creating a new site...`);

    const accessType = options?.accessType || SITE_TYPES.PUBLIC;
    const createdSite = await this.creationHelper.createSiteByAccessType(accessType, siteName, options);
    return createdSite.siteId;
  }

  /**
   * Gets a site with manage site option (isManager, isOwner, and isActive all true).
   */
  async getSiteWithManageSiteOption(sitesResponse: any): Promise<{ siteId: string; siteName: string }> {
    return await test.step('Getting site with manage site option', async () => {
      const sites = sitesResponse.result?.listOfItems || [];

      if (sites.length === 0) {
        throw new Error('No sites found in the response');
      }

      for (const site of sites) {
        try {
          const siteDetails = await this.siteManagementService.getSiteDetails(site.siteId);
          if (
            siteDetails.result.isManager === true &&
            siteDetails.result.isOwner === true &&
            siteDetails.result.isActive === true
          ) {
            return {
              siteId: siteDetails.result.siteId,
              siteName: siteDetails.result.name || siteDetails.result.siteName,
            };
          }
        } catch (error: any) {
          log.debug(`Skipping site ${site.siteId} due to error: ${error.message}`);
          continue;
        }
      }

      throw new Error('No site found with manage site option (isManager, isOwner, and isActive all true)');
    });
  }

  /**
   * Gets a site by access type (e.g., 'public', 'private').
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
    if (typeof accessType !== 'string') {
      throw new Error(
        `Expected accessType to be a string, but received: ${typeof accessType}. Value: ${JSON.stringify(accessType)}`
      );
    }

    const siteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });

    const requiredHasPages = options?.hasPages;
    const requiredHasEvents = options?.hasEvents;
    const requiredHasAlbums = options?.hasAlbums;

    log.debug(
      `Looking for site with hasPages: ${requiredHasPages}, hasEvents: ${requiredHasEvents}, hasAlbums: ${requiredHasAlbums}`
    );

    for (const site of siteListResponse.result.listOfItems) {
      if (!site.isActive) continue;
      // Only filter by properties that are explicitly specified (not undefined)
      const matchesHasPages = requiredHasPages === undefined || site.hasPages === requiredHasPages;
      const matchesHasEvents = requiredHasEvents === undefined || site.hasEvents === requiredHasEvents;
      const matchesHasAlbums = requiredHasAlbums === undefined || site.hasAlbums === requiredHasAlbums;

      const matchesRequirements = matchesHasPages && matchesHasEvents && matchesHasAlbums;

      if (matchesRequirements) {
        log.debug(`Found matching site: ${site.name} (${site.siteId})`);
        // Filter to only include active sites in the response
        const activeSites = siteListResponse.result.listOfItems.filter((s: any) => s.isActive === true);
        return { siteId: site.siteId, name: site.name, siteListResponse: activeSites };
      } else {
        log.debug(`Site ${site.name} doesn't match requirements`);
      }
    }

    const createdSite = await this.creationHelper.createSiteByAccessType(accessType, undefined, {
      ...options,
      waitForSearchIndex: options?.waitForSearchIndex,
    });
    // Fetch the site list to include in the response for consistency
    const updatedSiteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
    // Filter to only include active sites in the response
    const activeSites = updatedSiteListResponse.result.listOfItems.filter((s: any) => s.isActive === true);
    return {
      siteId: createdSite.siteId,
      name: createdSite.siteName,
      siteListResponse: activeSites,
    };
  }

  /**
   * Gets a site from the provided list where the current user is NOT a member, owner, or manager.
   */
  async getSitesWhereUserIsNotMemberOrOwner(
    sitesList: any[] = [],
    options?: { allowIsMemberAbsent?: boolean }
  ): Promise<{ siteId: string; name: string }> {
    const allowIsMemberAbsent = options?.allowIsMemberAbsent ?? false;
    return await test.step(`Finding site where user is not a member, owner, or manager`, async () => {
      if (sitesList.length === 0) {
        throw new Error('No sites provided to check');
      }

      for (const site of sitesList) {
        if (!site.siteId || !site.isActive) continue;

        try {
          const siteDetailsResponse = await this.siteManagementService.getSiteDetails(site.siteId);
          const siteDetails = siteDetailsResponse.result;

          log.debug(`Checking site: ${siteDetails.name} (${site.siteId})`);

          const isMemberCondition =
            siteDetails.isMember === false ||
            siteDetails.isMember === undefined ||
            (allowIsMemberAbsent && !('isMember' in siteDetails));

          const isOwnerCondition =
            siteDetails.isOwner === false ||
            siteDetails.isOwner === undefined ||
            (allowIsMemberAbsent && !('isOwner' in siteDetails));

          const isManagerCondition =
            siteDetails.isManager === false ||
            siteDetails.isManager === undefined ||
            (allowIsMemberAbsent && !('isManager' in siteDetails));

          if (
            siteDetails &&
            siteDetails.isActive === true &&
            isMemberCondition &&
            isOwnerCondition &&
            isManagerCondition
          ) {
            log.debug(`✓ Found site where user is not a member/owner/manager: ${siteDetails.name}`);
            return { siteId: siteDetails.siteId, name: siteDetails.name };
          }
        } catch (error) {
          log.warn(`Failed to check site ${site.siteId}`, error);
          continue;
        }
      }

      throw new Error(
        `No site found where user is not a member, owner, or manager after checking ${sitesList.length} sites`
      );
    });
  }

  /**
   * Gets a site with members meeting the expected count.
   */
  async getSiteWithMembers(
    accessType: string,
    expectedMemberCount?: number,
    options?: { size?: number; type?: string; maxAttempts?: number; excludeUserEmail?: string }
  ): Promise<{ site: any; members: any }> {
    return await test.step(
      expectedMemberCount ? `Getting site with ${expectedMemberCount} members` : `Getting site with its members`,
      async () => {
        const sitesResponse = await this.getListOfSites({ filter: accessType.toLowerCase(), size: DEFAULT_PAGE_SIZE });
        log.debug(`Found ${sitesResponse.result.listOfItems.length} sites`);
        const sites = sitesResponse.result.listOfItems.filter((site: any) => site.isActive === true);

        log.debug(`Filtered to ${sites.length} active site(s) to check`);

        if (sites.length === 0) {
          throw new Error(`No sites found matching criteria: accessType=${accessType}, isActive=true`);
        }

        if (expectedMemberCount === undefined) {
          const siteInfo = sites[0];
          const siteDetails = await this.siteManagementService.getSiteDetails(siteInfo.siteId);
          const membersResponse = await this.membershipHelper.getSiteMembershipList(siteInfo.siteId, options);
          return { site: siteDetails.result, members: membersResponse.result };
        }

        log.debug(`Expected: ${expectedMemberCount} members`);

        for (let i = 0; i < sites.length; i++) {
          const siteInfo = sites[i];
          const siteId = siteInfo.siteId;

          log.debug(`Checking site ${i + 1}/${sites.length}: ${siteInfo.name} (${siteId})`);

          const siteDetails = await this.siteManagementService.getSiteDetails(siteId);
          const membersResponse = await this.membershipHelper.getSiteMembershipList(siteId, options);
          const memberCount = membersResponse.result?.listOfItems?.length || 0;

          log.debug(`Site ${siteInfo.name} (${siteId}) has ${memberCount} members`);

          if (memberCount >= expectedMemberCount) {
            log.debug(`✓ Found site with ${memberCount} members`);

            let filteredMembers = membersResponse.result;
            if (options?.excludeUserEmail) {
              try {
                const identityHelper = new IdentityManagementHelper(this.apiRequestContext, this.baseUrl);
                const userInfo = await identityHelper.getUserInfoByEmail(options.excludeUserEmail);
                const excludedUserName = userInfo.fullName;
                const excludedUserId = userInfo.userId;

                log.debug(`Excluding user: ${excludedUserName} (${options.excludeUserEmail}) from members list`);

                const originalMembers = membersResponse.result?.listOfItems || [];
                const filteredMembersList = originalMembers.filter((member: any) => {
                  const memberName = member.name || member.displayName || '';
                  const memberEmail = member.email || '';
                  const memberPeopleId = member.peopleId || member.userId || '';
                  return (
                    memberName !== excludedUserName &&
                    memberEmail !== options.excludeUserEmail &&
                    memberPeopleId !== excludedUserId
                  );
                });

                filteredMembers = { ...membersResponse.result, listOfItems: filteredMembersList };

                if (filteredMembersList.length < expectedMemberCount) {
                  log.debug(`After filtering, site has ${filteredMembersList.length} members, continuing...`);
                  continue;
                }
              } catch (error) {
                log.warn(`Warning: Failed to get user info for exclusion`, error);
                filteredMembers = membersResponse.result;
              }
            }

            return { site: siteDetails.result, members: filteredMembers };
          }
        }

        throw new Error(`Failed to find a site with at least ${expectedMemberCount} members`);
      }
    );
  }

  /**
   * Gets a site by access type with specific content submissions configuration.
   */
  async getSiteByIdWithContentSubmissions(
    accessType: string,
    isContentSubmissionsEnabled: boolean
  ): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Getting site with access type ${accessType} and content submissions ${isContentSubmissionsEnabled ? 'enabled' : 'disabled'}`, async () => {
      const siteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
      log.debug('siteListResponse', { response: siteListResponse });

      //iterate the site which is active
      const activeSites = siteListResponse.result.listOfItems.filter(site => site.isActive === true);

      for (const site of activeSites) {
        const siteDetails = await this.siteManagementService.getSiteDetails(site.siteId);
        if (siteDetails.result.isContentSubmissionsEnabled === isContentSubmissionsEnabled) {
          return { siteId: site.siteId, siteName: site.name };
        }
      }

      const createdSite = await this.creationHelper.createSiteByAccessType(accessType, undefined, {
        overrides: { isContentSubmissionsEnabled },
        waitForSearchIndex: true,
      });

      return { siteId: createdSite.siteId, siteName: createdSite.siteName };
    });
  }

  /**
   * Gets a site where the user is an owner.
   */
  async getSiteWithUserAsOwner(userId: string, accessType: SITE_TYPES): Promise<{ siteId: string; siteName: string }> {
    const siteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
    const activeSites = siteListResponse.result.listOfItems.filter(site => site.isActive === true);

    if (activeSites.length) {
      for (const site of activeSites) {
        const memberListResponse = await this.siteManagementService.getSiteMembershipList(site.siteId);
        const isOwner = memberListResponse.result.listOfItems.find(
          (member: any) => member.peopleId === userId && member.isOwner === true
        );
        if (isOwner) {
          log.debug(`Found site ${site.name} (${site.siteId}) where user ${userId} is an owner`);
          return { siteId: site.siteId, siteName: site.name };
        }
      }
      log.debug(`No site found where user ${userId} is an owner, creating a new site...`);
      return await this.createSiteWithUserAsOwner(userId, accessType);
    } else {
      log.debug(`No active sites found, creating a new site...`);
      return await this.createSiteWithUserAsOwner(userId, accessType);
    }
  }

  private async createSiteWithUserAsOwner(
    userId: string,
    accessType?: SITE_TYPES
  ): Promise<{ siteId: string; siteName: string }> {
    const siteName = `Site for ${faker.company.buzzNoun()} ${faker.company.buzzAdjective()}`;
    const createdSite = await this.creationHelper.createSite({
      accessType: accessType || SITE_TYPES.PUBLIC,
      siteName: siteName,
      waitForSearchIndex: true,
    });
    await this.membershipHelper.makeUserSiteMembership(
      createdSite.siteId,
      userId,
      SitePermission.MEMBER,
      SiteMembershipAction.ADD
    );
    await this.membershipHelper.makeUserSiteMembership(
      createdSite.siteId,
      userId,
      SitePermission.OWNER,
      SiteMembershipAction.SET_PERMISSION
    );
    return { siteId: createdSite.siteId, siteName: createdSite.siteName };
  }

  /**
   * Gets a site where the user is not a member or owner.
   */
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
        for (const site of activeSites) {
          const memberListResponse = await this.siteManagementService.getSiteMembershipList(site.siteId);

          log.debug('memberListResponse', { members: memberListResponse.result.listOfItems });

          const memberPeopleIds = memberListResponse.result.listOfItems.map((member: any) => member.peopleId);
          const allUsersNotMembers = userId.every(id => !memberPeopleIds.includes(id));

          if (allUsersNotMembers) {
            log.debug('Found site', { site });
            return { siteId: site.siteId, siteName: site.name };
          }
        }
      }

      return await this.creationHelper.createSite({
        accessType: accessType,
        waitForSearchIndex: false,
      });
    });
  }

  /**
   * Gets a site with content (pages, events, or albums).
   */
  async getSiteWithContent(accessType: string, userId: string[]): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Getting ${accessType} site with content`, async () => {
      const siteListResponse = await this.getListOfSites({ filter: accessType.toLowerCase() });
      const sites = siteListResponse.result.listOfItems.filter((site: any) => site.isActive === true);

      for (const site of sites) {
        const memberListResponse = await this.siteManagementService.getSiteMembershipList(site.siteId);
        const memberPeopleIds = memberListResponse.result.listOfItems.map((member: any) => member.peopleId);
        const allUsersNotMembers = userId.every(user => !memberPeopleIds.includes(user));

        if (allUsersNotMembers && (site.hasPages || site.hasEvents || site.hasAlbums)) {
          log.debug(`Found ${accessType} site with content: ${site.name} (${site.siteId})`);
          return { siteId: site.siteId, siteName: site.name };
        }
      }

      log.debug(`No ${accessType} site with content found, creating new site...`);
      const createdSite = await this.creationHelper.createSiteByAccessType(accessType, undefined, {
        hasPages: true,
        waitForSearchIndex: true,
      });

      return { siteId: createdSite.siteId, siteName: createdSite.siteName };
    });
  }

  /**
   * Gets a deactivated site.
   */
  async getDeactivatedSite(
    accessType: SITE_TYPES,
    options?: { size?: number; sortBy?: string }
  ): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Getting deactivated site for access type ${accessType}`, async () => {
      const siteListResponse = await this.getListOfSites({
        filter: 'deactivated',
        size: options?.size,
        sortBy: options?.sortBy,
      });

      // Filter sites by access type and get a random one
      const sitesByAccessType = siteListResponse.result.listOfItems.filter(
        (site: any) => site.access.toLowerCase() === accessType.toLowerCase()
      );

      log.debug('Deactivated site list response', { response: sitesByAccessType });

      let site: any = null;

      if (sitesByAccessType.length === 0) {
        log.debug('No deactivated sites found for access type, will create one');
      } else {
        // Get a random site from the filtered list
        const randomIndex = Math.floor(Math.random() * sitesByAccessType.length);
        site = sitesByAccessType[randomIndex];
        log.debug('Random deactivated site selected', { site, totalMatches: sitesByAccessType.length });
      }

      log.debug('Deactivated site', { site });

      if (!site) {
        log.debug('Not Creating a new site');
        const createdSite = await this.creationHelper.createSite({
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

  /**
   * Gets unfeatured sites.
   */
  async getUnFeaturedSites(count: number = 2): Promise<{ siteId: string; name: string }[]> {
    return await test.step(`Getting ${count} unfeatured sites`, async () => {
      const siteListResponse = await this.siteManagementService.getUnfeaturedSites({
        size: DEFAULT_PAGE_SIZE,
        sortBy: 'alphabetical',
      });

      const shuffledSites = [...siteListResponse.result.listOfItems].sort(() => Math.random() - 0.5);
      if (shuffledSites.length < count) {
        throw new Error(`Not enough unfeatured sites found. Found: ${shuffledSites.length}, Required: ${count}`);
      }

      return shuffledSites.slice(0, count).map((site: any) => ({
        siteId: site.siteId,
        name: site.name,
      }));
    });
  }

  /**
   * Gets site author name and event start date.
   */
  async getSiteAuthorNameAndEventStartDate(): Promise<{
    siteId: string;
    authorName?: string;
    startsAt?: string;
    eventName?: string;
    siteName?: string;
  }> {
    const siteListResponse = await this.getListOfSites();

    for (const _site of siteListResponse.result.listOfItems) {
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
}
