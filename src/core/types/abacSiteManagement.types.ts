import { SiteCreationPayload } from './siteManagement.types';

export interface ABACSiteSubscription {
  audienceId: string;
  accessType: 'member' | 'follower';
  isMandatory: boolean;
}

export interface ABACSiteCreationPayload extends Omit<SiteCreationPayload, 'access'> {
  access: 'public' | 'private';
  targetAudience?: string[]; // Array of audience IDs
  subscription?: ABACSiteSubscription[]; // Array of subscription configurations
}

export interface ABACSiteCreationResponse {
  status: string;
  result: {
    siteId: string;
    name: string;
    title: string;
    access: string;
    isPrivate: boolean;
    targetAudience?: Array<{
      entityAudienceId: string;
      audienceId: string;
    }>;
    subscription?: Array<{
      entityAudienceId: string;
      audienceId: string;
      accessType: string;
      isMandatory: boolean;
      status: string;
    }>;
    [key: string]: any;
  };
}
