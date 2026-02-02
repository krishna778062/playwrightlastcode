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

export interface ACGSubjectStatsAudienceInfo {
  audienceCount: number;
  combinedUserCount: number | string;
}

export interface ACGSubjectStatsUserInfo {
  count: number;
}

export interface ACGSubjectStatsAdminManager {
  totalUsers: number | string;
  audiences: ACGSubjectStatsAudienceInfo;
  users: ACGSubjectStatsUserInfo;
}

export interface ACGSubjectStatsTargets {
  totalUsers: number | string;
  audiences: ACGSubjectStatsAudienceInfo;
}

export interface ACGSubjectStats {
  admins: ACGSubjectStatsAdminManager;
  managers: ACGSubjectStatsAdminManager;
  targets: ACGSubjectStatsTargets;
}

export interface ACGSubjectStatsResult {
  acgs: Record<string, ACGSubjectStats>;
}

export interface ACGSubjectStatsResponse {
  status: string;
  message: string;
  result: ACGSubjectStatsResult;
  apiName: string;
}

/**
 * Payload for updating an existing ACG
 */
export interface ACGUpdatePayload {
  id: string;
  managers?: {
    audiences?: string[];
    users?: string[];
  };
  admins?: {
    audiences?: string[];
    users?: string[];
  };
  targets?: {
    audiences?: string[];
  };
}

/**
 * Response from updating an ACG
 */
export interface ACGUpdateResponse {
  status: string;
  message: string;
  result: AcgListResult;
  responseTimeStamp: number;
  apiName: string;
}

/**
 * Payload for updating Feature Owners of ACGs
 */
export interface FeatureOwnerUpdatePayload {
  featureCodes: string[];
  usersToAdd: string[];
  usersToRemove: string[];
}

/**
 * Response from updating Feature Owners
 */
export interface FeatureOwnerUpdateResponse {
  status: string;
  message: string;
  result: {
    addedUsers: string[];
    removedUsers: string[];
  };
  responseTimeStamp: number;
  apiName: string;
}
