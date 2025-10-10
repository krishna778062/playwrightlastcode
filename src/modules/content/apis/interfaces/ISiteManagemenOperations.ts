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
    permission?: SitePermission,
    action?: SiteMembershipAction
  ): Promise<SiteMembershipResponse>;
  getSiteMembershipList(siteId: string, options?: { size?: number; type?: string }): Promise<any>;
  getSiteCarouselItems(siteId: string): Promise<any>;
  deleteSiteCarouselItem(siteId: string, carouselItemId: string): Promise<any>;
}
