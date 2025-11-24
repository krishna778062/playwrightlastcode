/**
 * Type definitions for ACG API responses
 */

export interface ACGCreationResponse {
  status: number;
  message: string;
  result: AcgListResult;
  apiName: string;
}

export interface AcgListResult {
  size: 1;
  nextPageToken: 0;
  listOfItems: ACGItem[];
}

export interface ACGItem {
  associatedAs: string;
  data: ACGItemData;
}

export interface ACGItemData {
  managers: ACGItemDataManagers;
  admins: ACGItemDataAdmins;
  targets: ACGItemDataTargets;
  syncStatus: string;
  status: string;
  name: string;
  id: string;
  type: string;
  feature: {
    code: string;
    isAbacSupported: boolean;
  };
  modifiedOn: string;
  createdBy: {
    id: string;
  };
  modifiedBy: {
    id: string;
  };
}

export interface ACGItemDataManagers {
  totalUsers: number;
  audiences: {
    audienceCount: number;
    combinedUserCount: number;
    audienceIds: string[];
  };
  users: {
    count: number;
    userIds: string[];
    userCount: number;
  };
}

export interface ACGItemDataAdmins {
  totalUsers: number;
  audiences: {
    audienceCount: number;
    combinedUserCount: number;
    audienceIds: string[];
  };
  users: {
    count: number;
    userIds: string[];
    userCount: number;
  };
}

export interface ACGItemDataTargets {
  totalUsers: number;
  audiences: {
    audienceCount: number;
    combinedUserCount: number;
    audienceIds: string[];
  };
}

export interface ACGCreationAPI {
  acgName: string;
  feature: string;
  targetAudience: string[];
  managerUser?: string[];
  managerAudience?: string[];
  adminUser?: string[];
  adminAudience?: string[];
  acgStatus?: string;
}
