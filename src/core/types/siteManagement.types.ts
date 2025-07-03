export interface SiteCreationPayload {
  access: string;
  hasPages: boolean;
  hasEvents: boolean;
  hasAlbums: boolean;
  hasDashboard: boolean;
  landingPage: string;
  isContentFeedEnabled: boolean;
  isContentSubmissionsEnabled: boolean;
  isOwner: boolean;
  isMembershipAutoApproved: boolean;
  isBroadcast: boolean;
  name: string;
  category: {
    categoryId: string;
    name: string;
  };
}

export interface SiteCategory {
  categoryId: string;
  name: string;
}
