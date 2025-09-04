import {
  SiteCreationPayload,
  SiteMembershipAction,
  SiteMembershipResponse,
  SitePermission,
} from '@core/types/siteManagement.types';

export interface ISiteManagementOperations {
  addNewSite(payload?: Partial<SiteCreationPayload>): Promise<any>;
  deactivateSite(siteId: string): Promise<any>;
  getCategoryId(category: string): Promise<any>;
  makeUserSiteMembership(
    siteId: string,
    userId: string,
    permission: string,
    action: string
  ): Promise<SiteMembershipResponse>;
}
