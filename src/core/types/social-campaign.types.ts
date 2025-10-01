export enum SocialCampaignStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  EXPIRED = 'expired',
}

export enum SocialCampaignAction {
  EXPIRE = 'expire',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

export enum SocialCampaignRecipient {
  EVERYONE = 'everyone',
  AUDIENCE = 'audience',
}

export enum SocialCampaignNetwork {
  FACEBOOK = 'fb',
  LINKEDIN = 'ln',
  TWITTER = 'tw',
}

export interface SocialCampaignOptions {
  message: string;
  url: string;
  linkText: string;
  recipient?: SocialCampaignRecipient;
  networks?: SocialCampaignNetwork[];
}

export interface SocialCampaign {
  campaignId: string;
  recipient: string;
  audienceId?: string;
  recipientId?: string;
  status: SocialCampaignStatus;
  message: string;
  campaignUrl?: string;
  urlPreview?: {
    author_name: string;
    author_url: string;
    description: string;
    duration: number;
    height: number;
    html: string;
    provider_name: string;
    provider_url: string;
    thumbnail_height: number;
    thumbnail_url: string;
    thumbnail_width: number;
    title: string;
    type: string;
    url: string;
    version: string;
    width: number;
    author: string;
    cache_age: number;
    options?: any;
  };
  popularityIndex: number;
  expiredBy?: string;
  expireReason?: string;
  createdBy: string;
  modifiedBy?: string;
  createdAt: string;
  modifiedOn: string;
  addedToCarousel: boolean;
  audience?: {
    name: string;
    isDeleted: boolean;
    audienceId: string;
    displayName: string;
  };
  author: {
    name: string;
    email: string;
    userId: string;
  };
  thumbnailAltText?: string;
  canShareToHomeCarousel: boolean;
  networks: {
    fb?: {
      hasShared: boolean;
      shareCount: number;
    };
    ln?: {
      hasShared: boolean;
      shareCount: number;
    };
    tw?: {
      hasShared: boolean;
      shareCount: number;
    };
  };
  odinCampaignId?: string;
  segment?: any;
}

export interface CreateSocialCampaignRequest {
  recipient: string;
  networks: SocialCampaignNetwork[];
  url: string;
  message: string;
}

export interface SocialCampaignListRequest {
  nextPageToken: number;
  size: number;
  filter: string;
}

export interface SocialCampaignListResponse {
  success: boolean;
  status: number;
  textStatus: string;
  message: string;
  responseTimeStamp: number;
  result: {
    nextPageToken: number;
    listOfItems: SocialCampaign[];
  };
  errors: any[];
}

export interface SocialCampaignApiResponse {
  success: boolean;
  status: number;
  textStatus: string;
  message: string;
  responseTimeStamp: number;
  result: SocialCampaign;
  errors: any[];
}

export interface SocialCampaignDeleteResponse {
  success: boolean;
  status: number;
  textStatus: string;
  message: string;
  responseTimeStamp: number;
  result: {};
  errors: any[];
}

export interface SocialCampaignStatusUpdateRequest {
  action: SocialCampaignAction;
}

export interface SocialCampaignStatusUpdateResponse {
  success: boolean;
  status: number;
  textStatus: string;
  message: string;
  responseTimeStamp: number;
  result: {
    data: SocialCampaign;
  };
  errors: any[];
}
