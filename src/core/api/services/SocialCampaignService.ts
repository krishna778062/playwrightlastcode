import { APIRequestContext, test } from '@playwright/test';

import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';

export interface SocialCampaign {
  campaignId: string;
  recipient: string;
  audienceId?: string;
  recipientId?: string;
  status: 'active' | 'inactive' | 'draft' | 'expired';
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
  networks: string[];
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
  action: 'expire' | 'activate' | 'deactivate';
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

export class SocialCampaignService extends BaseApiClient {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }

  /**
   * Creates a new social campaign
   * @param campaignData - The campaign data to create
   * @returns Promise<SocialCampaignApiResponse>
   */
  async createCampaign(campaignData: CreateSocialCampaignRequest): Promise<SocialCampaignApiResponse> {
    return await test.step(`Creating social campaign: ${campaignData.message}`, async () => {
      const response = await this.post(API_ENDPOINTS.socialCampaign.create, { data: campaignData });
      return (await response.json()) as SocialCampaignApiResponse;
    });
  }

  /**
   * Gets all social campaigns
   * @returns Promise<SocialCampaign[]>
   */
  async getAllCampaigns(): Promise<SocialCampaign[]> {
    return await test.step('Getting all social campaigns', async () => {
      const response = await this.post(API_ENDPOINTS.socialCampaign.list, {
        data: {
          nextPageToken: 0,
          size: 12,
          filter: 'latest',
        },
      });
      const result = (await response.json()) as SocialCampaignListResponse;
      return result.result?.listOfItems || [];
    });
  }

  /**
   * Gets a specific social campaign by ID
   * @param campaignId - The campaign ID
   * @returns Promise<SocialCampaign>
   */
  async getCampaignById(campaignId: string): Promise<SocialCampaign> {
    return await test.step(`Getting social campaign by ID: ${campaignId}`, async () => {
      const response = await this.get(API_ENDPOINTS.socialCampaign.get(campaignId));
      const result = await response.json();
      return result.result;
    });
  }

  /**
   * Updates an existing social campaign
   * @param campaignId - The campaign ID
   * @param campaignData - The updated campaign data
   * @returns Promise<SocialCampaignApiResponse>
   */
  async updateCampaign(
    campaignId: string,
    campaignData: Partial<CreateSocialCampaignRequest>
  ): Promise<SocialCampaignApiResponse> {
    return await test.step(`Updating social campaign: ${campaignId}`, async () => {
      const response = await this.put(API_ENDPOINTS.socialCampaign.update(campaignId), { data: campaignData });
      return (await response.json()) as SocialCampaignApiResponse;
    });
  }

  /**
   * Deletes a social campaign
   * @param campaignId - The campaign ID
   * @returns Promise<SocialCampaignDeleteResponse>
   */
  async deleteCampaign(campaignId: string): Promise<SocialCampaignDeleteResponse> {
    return await test.step(`Deleting social campaign: ${campaignId}`, async () => {
      const response = await this.delete(API_ENDPOINTS.socialCampaign.delete(campaignId));
      return (await response.json()) as SocialCampaignDeleteResponse;
    });
  }

  /**
   * Updates the status of a social campaign
   * @param campaignId - The campaign ID
   * @param action - The action to perform ('expire', 'activate', 'deactivate')
   * @returns Promise<SocialCampaignStatusUpdateResponse>
   */
  async updateCampaignStatus(
    campaignId: string,
    action: 'expire' | 'activate' | 'deactivate'
  ): Promise<SocialCampaignStatusUpdateResponse> {
    return await test.step(`Updating social campaign status: ${campaignId} to ${action}`, async () => {
      const response = await this.put(API_ENDPOINTS.socialCampaign.updateStatus(campaignId), { data: { action } });
      return (await response.json()) as SocialCampaignStatusUpdateResponse;
    });
  }

  /**
   * Expires a social campaign
   * @param campaignId - The campaign ID
   * @returns Promise<SocialCampaignStatusUpdateResponse>
   */
  async expireCampaign(campaignId: string): Promise<SocialCampaignStatusUpdateResponse> {
    return await test.step(`Expiring social campaign: ${campaignId}`, async () => {
      return this.updateCampaignStatus(campaignId, 'expire');
    });
  }

  /**
   * Activates a social campaign
   * @param campaignId - The campaign ID
   * @returns Promise<SocialCampaignStatusUpdateResponse>
   */
  async activateCampaign(campaignId: string): Promise<SocialCampaignStatusUpdateResponse> {
    return await test.step(`Activating social campaign: ${campaignId}`, async () => {
      return this.updateCampaignStatus(campaignId, 'activate');
    });
  }

  /**
   * Deactivates a social campaign
   * @param campaignId - The campaign ID
   * @returns Promise<SocialCampaignStatusUpdateResponse>
   */
  async deactivateCampaign(campaignId: string): Promise<SocialCampaignStatusUpdateResponse> {
    return await test.step(`Deactivating social campaign: ${campaignId}`, async () => {
      return this.updateCampaignStatus(campaignId, 'deactivate');
    });
  }
}
