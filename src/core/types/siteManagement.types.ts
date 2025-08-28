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

export interface SiteListOptions {
  size?: number;
  canManage?: boolean;
  filter?: string;
}

export interface Site {
  siteId: string;
  name: string;
  access: string;
  status: string;
  category: SiteCategory;
  hasPages: boolean;
  hasEvents: boolean;
  hasAlbums: boolean;
  hasDashboard: boolean;
  landingPage: string;
  isContentFeedEnabled: boolean;
  isContentSubmissionsEnabled: boolean;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteListResponse {
  status: string;
  message: string;
  result: {
    listOfItems: Site[];
    totalCount: number;
    hasMore: boolean;
  };
}
