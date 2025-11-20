import { expect, test } from '@playwright/test';

/**
 * Site details response structure from getSiteDetails API
 */
export interface SiteDetailsResponse {
  status: string;
  result: {
    title: string;
    teams: boolean;
    storageProvider: string;
    siteId: string;
    name: string;
    description: string | null;
    members: number;
    managerCount: number;
    followerCount: number;
    landingPage: string;
    isPrivate: boolean;
    isOwner: boolean;
    isMember: boolean;
    isFollower: boolean;
    isManager: boolean;
    isListed: boolean;
    isInMandatorySubscription: boolean;
    isFeatured: boolean;
    isFavorited: boolean;
    isContentSubmissionsEnabled: boolean;
    isContentManager: boolean;
    isContentFeedEnabled: boolean;
    isActive: boolean;
    id: string;
    hasDashboard: boolean;
    hasContent: boolean;
    dashboardLayout: string;
    category: {
      name: string;
      id: string;
    };
    canMention: boolean;
    canEdit: boolean;
    canActivateDeactivate: boolean;
    canManage: boolean;
    access: string;
    isMembershipAutoApproved: boolean;
    isAlertEnabled: boolean;
    isQuestionAnswerEnabled: boolean;
    systemAudience: any[];
  };
}

export class SiteApiHelper {
  /**
   * Validates the basic site response structure (status)
   * @param siteResponse - The site response to validate
   */
  async validateSiteResponseBasic(siteResponse: SiteDetailsResponse): Promise<void> {
    await test.step('Validate site response basic fields', async () => {
      expect(siteResponse.status, 'status should be "success"').toBe('success');
      expect(siteResponse.result, 'result should exist').toBeDefined();
    });
  }

  /**
   * Validates site identification fields (siteId, id, name, title)
   * @param siteResponse - The site response to validate
   */
  async validateSiteIdentification(siteResponse: SiteDetailsResponse): Promise<void> {
    await test.step('Validate site identification fields', async () => {
      expect(siteResponse.result.siteId, 'siteId should be a non-empty string').toBeTruthy();
      expect(typeof siteResponse.result.siteId, 'siteId should be a string').toBe('string');
      expect(siteResponse.result.id, 'id should be a non-empty string').toBeTruthy();
      expect(typeof siteResponse.result.id, 'id should be a string').toBe('string');
      expect(siteResponse.result.siteId, 'siteId should match id').toBe(siteResponse.result.id);
      expect(siteResponse.result.name, 'name should be a non-empty string').toBeTruthy();
      expect(typeof siteResponse.result.name, 'name should be a string').toBe('string');
      expect(siteResponse.result.title, 'title should be a non-empty string').toBeTruthy();
      expect(typeof siteResponse.result.title, 'title should be a string').toBe('string');
    });
  }

  /**
   * Validates site access and visibility settings
   * @param siteResponse - The site response to validate
   * @param expectedAccess - Expected access type (e.g., "Public", "Private", "Unlisted")
   */
  async validateSiteAccessAndVisibility(
    siteResponse: SiteDetailsResponse,
    expectedAccess: string = 'Public'
  ): Promise<void> {
    await test.step('Validate site access and visibility fields', async () => {
      expect(siteResponse.result.access, `access should be "${expectedAccess}"`).toBe(expectedAccess);
      expect(typeof siteResponse.result.isPrivate, 'isPrivate should be a boolean').toBe('boolean');

      // isPrivate should be true only for Private sites
      const expectedIsPrivate = expectedAccess === 'Private';
      expect(siteResponse.result.isPrivate, `isPrivate should be ${expectedIsPrivate} for ${expectedAccess} site`).toBe(
        expectedIsPrivate
      );

      expect(typeof siteResponse.result.isListed, 'isListed should be a boolean').toBe('boolean');
      // isListed should be true for Public and Private sites, false for Unlisted sites
      if (expectedAccess === 'Public' || expectedAccess === 'Private') {
        expect(siteResponse.result.isListed, `isListed should be true for ${expectedAccess} sites`).toBe(true);
      } else if (expectedAccess === 'Unlisted') {
        expect(siteResponse.result.isListed, 'isListed should be false for Unlisted sites').toBe(false);
      }
    });
  }

  /**
   * Validates site category information
   * @param siteResponse - The site response to validate
   */
  async validateSiteCategory(siteResponse: SiteDetailsResponse): Promise<void> {
    await test.step('Validate site category fields', async () => {
      expect(siteResponse.result.category, 'category should exist').toBeDefined();
      expect(siteResponse.result.category.id, 'category.id should be a non-empty string').toBeTruthy();
      expect(typeof siteResponse.result.category.id, 'category.id should be a string').toBe('string');
      expect(siteResponse.result.category.name, 'category.name should be a non-empty string').toBeTruthy();
      expect(typeof siteResponse.result.category.name, 'category.name should be a string').toBe('string');
    });
  }

  /**
   * Validates site membership and role information
   * @param siteResponse - The site response to validate
   */
  async validateSiteMembershipAndRoles(siteResponse: SiteDetailsResponse): Promise<void> {
    await test.step('Validate site membership and roles', async () => {
      expect(typeof siteResponse.result.members, 'members should be a number').toBe('number');
      expect(siteResponse.result.members, 'members should be >= 0').toBeGreaterThanOrEqual(0);
      expect(typeof siteResponse.result.managerCount, 'managerCount should be a number').toBe('number');
      expect(siteResponse.result.managerCount, 'managerCount should be >= 0').toBeGreaterThanOrEqual(0);
      expect(typeof siteResponse.result.followerCount, 'followerCount should be a number').toBe('number');
      expect(siteResponse.result.followerCount, 'followerCount should be >= 0').toBeGreaterThanOrEqual(0);
      expect(typeof siteResponse.result.isOwner, 'isOwner should be a boolean').toBe('boolean');
      expect(siteResponse.result.isOwner, 'isOwner should be true for site creator').toBe(true);
      expect(typeof siteResponse.result.isMember, 'isMember should be a boolean').toBe('boolean');
      expect(siteResponse.result.isMember, 'isMember should be true for site creator').toBe(true);
      expect(typeof siteResponse.result.isFollower, 'isFollower should be a boolean').toBe('boolean');
      expect(typeof siteResponse.result.isManager, 'isManager should be a boolean').toBe('boolean');
      expect(siteResponse.result.isManager, 'isManager should be true for site owner').toBe(true);
      expect(typeof siteResponse.result.isContentManager, 'isContentManager should be a boolean').toBe('boolean');
      expect(siteResponse.result.isContentManager, 'isContentManager should be true for site owner').toBe(true);
    });
  }

  /**
   * Validates site configuration and settings
   * @param siteResponse - The site response to validate
   */
  async validateSiteConfiguration(siteResponse: SiteDetailsResponse): Promise<void> {
    await test.step('Validate site configuration fields', async () => {
      // storageProvider can be a string or an object depending on the API response
      expect(
        typeof siteResponse.result.storageProvider === 'string' ||
          typeof siteResponse.result.storageProvider === 'object',
        'storageProvider should be a string or object'
      ).toBe(true);
      expect(siteResponse.result.storageProvider, 'storageProvider should exist').toBeTruthy();
      expect(typeof siteResponse.result.landingPage, 'landingPage should be a string').toBe('string');
      expect(siteResponse.result.landingPage, 'landingPage should be a non-empty string').toBeTruthy();
      expect(typeof siteResponse.result.dashboardLayout, 'dashboardLayout should be a string').toBe('string');
      expect(typeof siteResponse.result.teams, 'teams should be a boolean').toBe('boolean');
      expect(typeof siteResponse.result.hasDashboard, 'hasDashboard should be a boolean').toBe('boolean');
      expect(typeof siteResponse.result.hasContent, 'hasContent should be a boolean').toBe('boolean');
    });
  }

  /**
   * Validates site feature flags
   * @param siteResponse - The site response to validate
   */
  async validateSiteFeatures(siteResponse: SiteDetailsResponse): Promise<void> {
    await test.step('Validate site feature flags', async () => {
      expect(typeof siteResponse.result.isContentFeedEnabled, 'isContentFeedEnabled should be a boolean').toBe(
        'boolean'
      );
      expect(
        typeof siteResponse.result.isContentSubmissionsEnabled,
        'isContentSubmissionsEnabled should be a boolean'
      ).toBe('boolean');
      expect(typeof siteResponse.result.isQuestionAnswerEnabled, 'isQuestionAnswerEnabled should be a boolean').toBe(
        'boolean'
      );
    });
  }

  /**
   * Validates site permissions
   * @param siteResponse - The site response to validate
   */
  async validateSitePermissions(siteResponse: SiteDetailsResponse): Promise<void> {
    await test.step('Validate site permissions', async () => {
      expect(typeof siteResponse.result.canMention, 'canMention should be a boolean').toBe('boolean');
      expect(typeof siteResponse.result.canEdit, 'canEdit should be a boolean').toBe('boolean');
      expect(typeof siteResponse.result.canActivateDeactivate, 'canActivateDeactivate should be a boolean').toBe(
        'boolean'
      );
      expect(typeof siteResponse.result.canManage, 'canManage should be a boolean').toBe('boolean');
    });
  }

  /**
   * Validates site status and membership settings
   * @param siteResponse - The site response to validate
   */
  async validateSiteStatusAndMembership(siteResponse: SiteDetailsResponse): Promise<void> {
    await test.step('Validate site status and membership settings', async () => {
      expect(typeof siteResponse.result.isActive, 'isActive should be a boolean').toBe('boolean');
      expect(siteResponse.result.isActive, 'isActive should be true for newly created sites').toBe(true);
      expect(typeof siteResponse.result.isMembershipAutoApproved, 'isMembershipAutoApproved should be a boolean').toBe(
        'boolean'
      );
      expect(Array.isArray(siteResponse.result.systemAudience), 'systemAudience should be an array').toBe(true);
    });
  }

  /**
   * Validates site description field
   * @param siteResponse - The site response to validate
   */
  async validateSiteDescription(siteResponse: SiteDetailsResponse): Promise<void> {
    await test.step('Validate site description', async () => {
      expect(
        siteResponse.result.description === null || typeof siteResponse.result.description === 'string',
        'description should be null or a string'
      ).toBe(true);
    });
  }

  /**
   * Validates all site response fields comprehensively
   * @param siteResponse - The site response to validate
   * @param expectedAccess - Expected access type (default: "Public")
   */
  async validateSiteResponse(siteResponse: SiteDetailsResponse, accessType: string, siteName: string): Promise<void> {
    await this.validateSiteResponseBasic(siteResponse);
    await this.validateSiteIdentification(siteResponse);
    await this.validateSiteAccessAndVisibility(siteResponse, accessType);
    await this.validateSiteMembershipAndRoles(siteResponse);
    await this.validateSiteConfiguration(siteResponse);
    await this.validateSiteFeatures(siteResponse);
    await this.validateSitePermissions(siteResponse);
    await this.validateSiteStatusAndMembership(siteResponse);
    await this.validateSiteDescription(siteResponse);
    await this.validateSiteName(siteResponse, siteName);
    await this.validateSiteCategory(siteResponse);
  }

  async validateSiteName(siteResponse: SiteDetailsResponse, siteName: string): Promise<void> {
    await test.step('Validate site name', async () => {
      expect(siteResponse.result.name, 'name should match the expected name').toBe(siteName);
    });
  }
}
