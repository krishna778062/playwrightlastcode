export enum SitePermission {
  MEMBER = 'member',
  CONTENT_MANAGER = 'contentManager',
  MANAGER = 'manager',
  OWNER = 'owner',
}

export enum SiteMembershipAction {
  ADD = 'addPeople',
  SET_PERMISSION = 'setPeoplePermission',
  REMOVE = 'removePeople',
}

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
  filter?: string;
  sortBy?: string;
  canManage?: boolean;
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
  isActive: boolean;
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

export interface FileOwner {
  name: string;
  id?: string;
}

export interface FileItem {
  id: string;
  fileId: string;
  title: string;
  owner: FileOwner;
  createdAt?: string;
  updatedAt?: string;
  size?: number;
  type?: string;
}

export interface FileListResponse {
  status: string;
  message: string;
  result: {
    listOfItems: FileItem[];
    totalCount: number;
    hasMore: boolean;
  };
}

export interface CategoryResponse {
  categoryId: string;
  name: string;
}

export interface SiteCreationResponse {
  status: string;
  message: string;
  result: {
    siteId: string;
    name: string;
  };
}

export interface SiteDeactivationResponse {
  status: string;
  message: string;
  result?: any; // Can be more specific based on actual API response
}

export interface SiteMembershipResult {
  userId: string;
  siteId: string;
  permission: SitePermission;
  action: string;
  membershipId?: string;
  addedAt?: string;
  updatedAt?: string;
}

export interface SiteMembershipResponse {
  status: string;
  message: string;
  result: SiteMembershipResult;
  errors?: string[];
}
