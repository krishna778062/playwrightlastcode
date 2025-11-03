export interface AudienceListRequest {
  size: number;
}

export interface Audience {
  id: string;
  name: string;
  displayName: string;
  isDeleted: boolean;
  audienceId: string;
  description?: string | null;
  type?: string;
  audienceCount?: number;
  createdAt?: string;
  createdBy?: {
    name: string;
    id: string;
  };
  modifiedAt?: string;
  modifiedBy?: {
    name: string;
    id: string;
  };
  audienceRule?: AudienceRule;
  status?: string | null;
  usage?: {
    subscriptionCount: number | string;
  };
}

export interface AudienceListResponse {
  success: boolean;
  status: number;
  textStatus: string;
  message: string;
  responseTimeStamp: number;
  result: {
    listOfItems: Audience[];
    totalCount: number;
  };
  errors: any[];
}

export interface AudienceRuleValue {
  value: string;
}

export interface AudienceRuleCondition {
  values: AudienceRuleValue[];
  attribute: string;
  operator: string;
  fieldType: string;
}

export interface AudienceRule {
  AND: (AudienceRuleCondition | { AND: AudienceRuleCondition[] })[];
}

export interface CreateAudienceRequest {
  name: string;
  description: string;
  type: string;
  audienceRule: AudienceRule;
}

export interface CreateAudienceResponse {
  success: boolean;
  status: number;
  textStatus: string;
  message: string;
  responseTimeStamp: number;
  result: {
    audienceId: string;
    name: string;
    description: string;
    type: string;
    audienceRule: AudienceRule;
    audienceMemberCount: number;
  };
  errors: any[];
}
