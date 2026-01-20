import { test } from '@playwright/test';

import { log } from '@core/utils/logger';

import { SiteMembershipAction, SiteMembershipResponse, SitePermission } from '@/src/core/types/siteManagement.types';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';
import { IdentityService } from '@/src/modules/platforms/apis/services/IdentityService';

// Constants
const DEFAULT_PAGE_SIZE = 1000;
const ROLE_PROPAGATION_DELAY_MS = 1000;
const SHORT_DELAY_MS = 500;

interface SiteMember {
  siteId: string;
  userEmail: string;
}

/**
 * Helper class for site membership operations.
 * Handles adding/removing members, role management, and membership queries.
 */
export class SiteMembershipHelper {
  private siteMembers: SiteMember[] = [];

  constructor(
    private readonly siteManagementService: SiteManagementService,
    private readonly identityService: IdentityService
  ) {}

  /**
   * Makes a user a site member with the specified permission.
   */
  async makeUserSiteMembership(
    siteId: string,
    userId: string,
    permission: SitePermission,
    action: SiteMembershipAction
  ): Promise<SiteMembershipResponse> {
    // Only check membership for ADD operations
    if (action === SiteMembershipAction.ADD) {
      const membershipList = await this.getSiteMembershipList(siteId);
      const existingMember = membershipList.result?.listOfItems?.find((member: any) => member.peopleId === userId);

      if (existingMember) {
        log.debug(`User ${userId} is already a member of site ${siteId}`);
        return {
          status: 'success',
          message: 'User is already a member',
          result: { userId, siteId, permission, action },
        };
      }
    }
    if (action === SiteMembershipAction.REMOVE) {
      const membershipList = await this.getSiteMembershipList(siteId);
      const existingMember = membershipList.result?.listOfItems?.find((member: any) => member.peopleId === userId);
      if (!existingMember) {
        log.debug(`User ${userId} is not a member of site ${siteId}`);
        return {
          status: 'success',
          message: 'User is not a member',
          result: { userId, siteId, permission, action },
        };
      }
    }

    const result = await this.siteManagementService.makeUserSiteMembership(siteId, userId, permission, action);

    if (action === SiteMembershipAction.ADD) {
      this.siteMembers.push({ siteId, userEmail: userId });
    }

    return result;
  }

  /**
   * Gets the membership list for a site.
   */
  async getSiteMembershipList(siteId: string, options?: { size?: number; type?: string }): Promise<any> {
    return await this.siteManagementService.getSiteMembershipList(siteId, options);
  }

  /**
   * Gets member names from the site membership list.
   */
  async getMembersNameFromList(
    siteId: string,
    options?: { size?: number; type?: string }
  ): Promise<{ membersName: string[] }> {
    return await test.step(`Getting member names from site ${siteId}`, async () => {
      const membersResponse = await this.getSiteMembershipList(siteId, options);
      const members = membersResponse.result?.listOfItems || [];
      const membersName = members.map((member: any) => member.name || member.displayName || member.email);
      return { membersName };
    });
  }

  /**
   * Helper method to determine the current role from SiteMember boolean flags.
   */
  getCurrentRoleFromMember(member: any): SitePermission | null {
    if (!member) return null;

    if (member.isOwner === true) return SitePermission.OWNER;
    if (member.isManager === true) return SitePermission.MANAGER;
    if (member.isContentManager === true) return SitePermission.CONTENT_MANAGER;
    if (member.isMember === true) return SitePermission.MEMBER;

    return null;
  }

  /**
   * Verifies that the user has the correct role after assignment.
   */
  async verifyRoleAssignment(siteId: string, userId: string, expectedRole: SitePermission): Promise<boolean> {
    const membershipList = await this.getSiteMembershipList(siteId);
    const userMembership = membershipList.result?.listOfItems?.find((member: any) => member.peopleId === userId);

    if (!userMembership) {
      log.debug(`User ${userId} not found in membership list`);
      return false;
    }

    const currentRole = this.getCurrentRoleFromMember(userMembership);
    const hasCorrectRole = currentRole === expectedRole;

    if (hasCorrectRole) {
      log.debug(`✓ Role verification successful: User ${userId} has role ${expectedRole}`);
      return true;
    }

    return false;
  }

  /**
   * Finds another user in the site membership to use as temporary owner.
   */
  private async findAnotherMemberForTemporaryOwner(siteId: string, excludeUserId: string): Promise<string | null> {
    const membershipList = await this.getSiteMembershipList(siteId);
    const members = membershipList.result?.listOfItems || [];

    const anotherManager = members.find(
      (member: any) => member.peopleId !== excludeUserId && member.isManager === true
    );
    if (anotherManager) {
      log.debug(`Found another manager (${anotherManager.peopleId}) to use as temporary owner`);
      return anotherManager.peopleId;
    }

    const anotherContentManager = members.find(
      (member: any) => member.peopleId !== excludeUserId && member.isContentManager === true
    );
    if (anotherContentManager) {
      log.debug(`Found another content manager (${anotherContentManager.peopleId}) to use as temporary owner`);
      return anotherContentManager.peopleId;
    }

    const anyOtherMember = members.find((member: any) => member.peopleId !== excludeUserId && member.isMember === true);
    if (anyOtherMember) {
      log.debug(`Found another member (${anyOtherMember.peopleId}) to use as temporary owner`);
      return anyOtherMember.peopleId;
    }

    log.warn(`No other members found in site ${siteId} to use as temporary owner`);
    return null;
  }

  /**
   * Handles the special case where user is currently an OWNER and needs role change.
   */
  private async handleOwnerRoleChange(
    siteId: string,
    userId: string,
    desiredRole: SitePermission
  ): Promise<SiteMembershipResponse> {
    log.debug(
      `User ${userId} is currently an OWNER. Assigning another user as owner will automatically demote current owner to MANAGER.`
    );

    const temporaryOwnerUserId = await this.findAnotherMemberForTemporaryOwner(siteId, userId);

    if (!temporaryOwnerUserId) {
      throw new Error(
        `Cannot change role for user ${userId} who is currently an OWNER. No other members found in site ${siteId} to use as temporary owner.`
      );
    }

    const membershipList = await this.getSiteMembershipList(siteId);
    const temporaryOwnerMember = membershipList.result?.listOfItems?.find(
      (member: any) => member.peopleId === temporaryOwnerUserId
    );
    const temporaryOwnerOriginalRole = this.getCurrentRoleFromMember(temporaryOwnerMember);

    log.debug(`Temporary owner ${temporaryOwnerUserId} current role: ${temporaryOwnerOriginalRole || 'MEMBER'}`);

    try {
      log.debug(
        `Assigning user ${temporaryOwnerUserId} as OWNER (this will automatically demote current owner ${userId} to MANAGER)`
      );
      await this.makeUserSiteMembership(
        siteId,
        temporaryOwnerUserId,
        SitePermission.OWNER,
        SiteMembershipAction.SET_PERMISSION
      );

      await new Promise(resolve => setTimeout(resolve, ROLE_PROPAGATION_DELAY_MS));

      const verifyDemoted = await this.verifyRoleAssignment(siteId, userId, SitePermission.MANAGER);
      if (!verifyDemoted) {
        log.warn(`Warning: Original owner ${userId} may not have been automatically demoted to MANAGER as expected.`);
      }

      log.debug(`Assigning desired role ${desiredRole} to user ${userId}`);
      const response = await this.makeUserSiteMembership(
        siteId,
        userId,
        desiredRole,
        SiteMembershipAction.SET_PERMISSION
      );

      const verified = await this.verifyRoleAssignment(siteId, userId, desiredRole);
      if (!verified) {
        log.warn(`Warning: Desired role ${desiredRole} may not have been assigned to user ${userId}.`);
      }

      if (desiredRole !== SitePermission.OWNER) {
        log.debug(`Restoring temporary owner ${temporaryOwnerUserId} to original role`);
        try {
          const restoreRole = temporaryOwnerOriginalRole || SitePermission.MANAGER;
          await this.makeUserSiteMembership(
            siteId,
            temporaryOwnerUserId,
            restoreRole,
            SiteMembershipAction.SET_PERMISSION
          );
          await this.verifyRoleAssignment(siteId, temporaryOwnerUserId, restoreRole);
          log.debug(`✓ Temporary owner ${temporaryOwnerUserId} restored to ${restoreRole}`);
        } catch (restoreError) {
          log.warn(`Warning: Failed to restore temporary owner to original role.`, restoreError);
        }
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Error during owner role change: ${errorMessage}`);
      throw new Error(`Failed to change role for owner ${userId} to ${desiredRole}. Error: ${errorMessage}`);
    }
  }

  /**
   * Ensures user is a member of the site with the specified role.
   */
  async updateUserSiteMembershipWithRole(params: {
    siteId: string;
    userId: string;
    role: SitePermission;
  }): Promise<SiteMembershipResponse> {
    const { siteId, userId, role } = params;

    const membershipList = await this.getSiteMembershipList(siteId);
    const userMembership = membershipList.result?.listOfItems?.find((member: any) => member.peopleId === userId);
    const isUserMember = !!userMembership;

    log.debug('User Membership Status', { membership: JSON.stringify(userMembership, null, 2) });

    const currentRole = this.getCurrentRoleFromMember(userMembership);
    const hasCorrectRole = currentRole === role;

    log.debug(
      `User ${userId} - Current Role: ${currentRole || 'Not a member'}, Desired Role: ${role}, Match: ${hasCorrectRole}`
    );

    if (hasCorrectRole) {
      log.debug(`User ${userId} already has the correct role ${role} in site ${siteId}`);
      return {
        status: 'success',
        message: `User already has role ${role}`,
        result: { userId, siteId, permission: role, action: SiteMembershipAction.SET_PERMISSION },
      };
    }

    if (!isUserMember) {
      log.debug(`User ${userId} is not a member of site ${siteId}, adding as member first`);
      await this.makeUserSiteMembership(siteId, userId, SitePermission.MEMBER, SiteMembershipAction.ADD);

      if (role !== SitePermission.MEMBER) {
        log.debug(`Setting user ${userId} role to ${role}`);
        const response = await this.makeUserSiteMembership(siteId, userId, role, SiteMembershipAction.SET_PERMISSION);

        const verified = await this.verifyRoleAssignment(siteId, userId, role);
        if (!verified) {
          log.warn(`Warning: Role assignment may have failed.`, { response: JSON.stringify(response) });
        }

        return response;
      }

      const verified = await this.verifyRoleAssignment(siteId, userId, SitePermission.MEMBER);
      if (!verified) {
        log.warn(`Warning: Member role assignment may have failed for user ${userId}`);
      }

      return {
        status: 'success',
        message: 'User added successfully',
        result: { userId, siteId, permission: role, action: SiteMembershipAction.ADD },
      };
    }

    log.debug(`User ${userId} is a member but has wrong role (${currentRole}), updating to ${role}`);

    if (currentRole === SitePermission.OWNER && role !== SitePermission.OWNER) {
      log.debug(`User ${userId} is currently an OWNER. Using special owner demotion flow.`);
      return await this.handleOwnerRoleChange(siteId, userId, role);
    }

    try {
      const response = await this.makeUserSiteMembership(siteId, userId, role, SiteMembershipAction.SET_PERMISSION);

      const verified = await this.verifyRoleAssignment(siteId, userId, role);
      if (!verified) {
        log.warn(`Warning: Role update may have failed.`, { response: JSON.stringify(response) });
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Failed to update role using SET_PERMISSION: ${errorMessage}`);

      log.debug(`Attempting fallback: Remove and re-add user with correct role`);
      try {
        await this.makeUserSiteMembership(siteId, userId, SitePermission.MEMBER, SiteMembershipAction.REMOVE);
        await this.makeUserSiteMembership(siteId, userId, SitePermission.MEMBER, SiteMembershipAction.ADD);

        if (role !== SitePermission.MEMBER) {
          await new Promise(resolve => setTimeout(resolve, SHORT_DELAY_MS));
          const response = await this.makeUserSiteMembership(siteId, userId, role, SiteMembershipAction.SET_PERMISSION);

          const verified = await this.verifyRoleAssignment(siteId, userId, role);
          if (!verified) {
            log.error(`Error: Fallback role assignment failed.`);
            throw new Error(`Failed to assign role ${role} to user ${userId} even after remove/re-add.`);
          }

          return response;
        }

        const verified = await this.verifyRoleAssignment(siteId, userId, SitePermission.MEMBER);
        if (!verified) {
          throw new Error(`Failed to re-add user ${userId} as member.`);
        }

        return {
          status: 'success',
          message: 'User re-added successfully',
          result: { userId, siteId, permission: role, action: SiteMembershipAction.ADD },
        };
      } catch (fallbackError) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        log.error(`Fallback approach also failed: ${fallbackErrorMessage}`);
        throw new Error(
          `Failed to update user ${userId} role to ${role} in site ${siteId}. SET_PERMISSION failed: ${errorMessage}. Fallback failed: ${fallbackErrorMessage}`
        );
      }
    }
  }

  /**
   * Gets users who are neither members nor followers of a site.
   */
  async getNonMemberUserNames(siteId: string, options?: { minimumCount?: number }): Promise<string[]> {
    return await test.step(`Getting non-member user names for site ${siteId}`, async () => {
      const [getMembersListResponse, getFollowersListResponse] = await Promise.all([
        this.getSiteMembershipList(siteId, { size: DEFAULT_PAGE_SIZE, type: 'members' }).catch(() => ({
          result: { listOfItems: [] },
        })),
        this.getSiteMembershipList(siteId, { size: DEFAULT_PAGE_SIZE, type: 'followers' }).catch(() => ({
          result: { listOfItems: [] },
        })),
      ]);
      const allUsersListResponse = await this.identityService.getListOfPeople();

      const membersPeopleIds = (getMembersListResponse.result.listOfItems || [])
        .map((member: any) => member.peopleId || member.userId || member.user_id)
        .filter((id: string) => id);
      const followersPeopleIds = (getFollowersListResponse.result.listOfItems || [])
        .map((member: any) => member.peopleId || member.userId || member.user_id)
        .filter((id: string) => id);

      const allRelatedPeopleIds = [...new Set([...membersPeopleIds, ...followersPeopleIds])];

      log.debug(
        `Found ${membersPeopleIds.length} members and ${followersPeopleIds.length} followers for site ${siteId}`
      );
      log.debug(`Total unique people with relationship to site: ${allRelatedPeopleIds.length}`);

      const nonMemberUsers = allUsersListResponse.result.listOfItems.filter((user: any) => {
        const userId = user.peopleId || user.user_id;
        if (!userId) return false;
        return !allRelatedPeopleIds.includes(userId);
      });

      const nonMemberNames = nonMemberUsers
        .map((user: any) => `${user.first_name || ''} ${user.last_name || ''}`.trim())
        .filter((name: string) => name.length > 0);

      log.debug(`Found ${nonMemberNames.length} users who are neither members nor followers`);
      if (nonMemberNames.length > 0) {
        log.debug('Available non-member names (first 10):', nonMemberNames.slice(0, 10));
      }

      if (nonMemberNames.length === 0) {
        throw new Error('No non-member users found to add to the site');
      }

      if (options?.minimumCount && nonMemberNames.length < options.minimumCount) {
        throw new Error(
          `Only ${nonMemberNames.length} non-member user(s) found. Need at least ${options.minimumCount} users.`
        );
      }

      return nonMemberNames;
    });
  }

  async acceptMembershipRequest(siteId: string, requestId: string): Promise<void> {
    await this.siteManagementService.acceptMembershipRequest(siteId, requestId);
  }

  // State management
  getTrackedMembers(): SiteMember[] {
    return [...this.siteMembers];
  }

  clearTrackedMembers(): void {
    this.siteMembers = [];
  }

  getMemberCount(): number {
    return this.siteMembers.length;
  }
}
