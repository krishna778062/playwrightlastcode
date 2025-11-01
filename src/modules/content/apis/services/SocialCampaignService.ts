import { APIRequestContext, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import {
  CreateSocialCampaignRequest,
  SocialCampaign,
  SocialCampaignAction,
  SocialCampaignApiResponse,
  SocialCampaignDeleteResponse,
  SocialCampaignFilter,
  SocialCampaignListResponse,
  SocialCampaignShareRequest,
  SocialCampaignShareResponse,
  SocialCampaignStatusUpdateResponse,
} from '@core/types/social-campaign.types';

import { HttpClient } from '@/src/core';

export class SocialCampaignService {
  public httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Creates a new social campaign
   * @param campaignData - The campaign data to create
   * @returns Promise<SocialCampaignApiResponse>
   */
  async createCampaign(campaignData: CreateSocialCampaignRequest): Promise<SocialCampaignApiResponse> {
    return await test.step(`Creating social campaign: ${campaignData.message}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.socialCampaign.create, { data: campaignData });
      return (await response.json()) as SocialCampaignApiResponse;
    });
  }

  /**
   * Gets all social campaigns
   * @param filter - Filter type (latest, expired, popular)
   * @returns Promise<SocialCampaign[]>
   */
  async getAllCampaigns(filter: SocialCampaignFilter = SocialCampaignFilter.LATEST): Promise<SocialCampaign[]> {
    return await test.step(`Getting all social campaigns with filter: ${filter}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.socialCampaign.list, {
        data: {
          nextPageToken: 0,
          size: 1000,
          filter: filter,
        },
      });
      const result = (await response.json()) as SocialCampaignListResponse;
      return result.result?.listOfItems || [];
    });
  }

  /**
   * Gets campaign list via GET request with query parameters
   * @param params - Query parameters for filtering campaigns
   * @returns Promise<SocialCampaignListResponse>
   */
  async getCampaignList(params?: {
    size?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    includeData?: 'full' | 'summary';
    includeCount?: boolean;
    status?: 'active' | 'inactive' | 'draft' | 'expired';
  }): Promise<SocialCampaignListResponse> {
    return await test.step(`Getting campaign list with params: ${JSON.stringify(params)}`, async () => {
      const queryParams = new URLSearchParams();
      if (params?.size) queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.order) queryParams.append('order', params.order);
      if (params?.includeData) queryParams.append('includeData', params.includeData);
      if (params?.includeCount !== undefined) queryParams.append('includeCount', params.includeCount.toString());
      if (params?.status) queryParams.append('status', params.status);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.socialCampaign.listGet}?${queryString}`
        : API_ENDPOINTS.socialCampaign.listGet;
      const response = await this.httpClient.get(endpoint);
      return (await response.json()) as SocialCampaignListResponse;
    });
  }

  /**
   * Gets a specific social campaign by ID
   * @param campaignId - The campaign ID
   * @returns Promise<SocialCampaign>
   */
  async getCampaignById(campaignId: string): Promise<SocialCampaign> {
    return await test.step(`Getting social campaign by ID: ${campaignId}`, async () => {
      const response = await this.httpClient.get(API_ENDPOINTS.socialCampaign.get(campaignId));
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
      const response = await this.httpClient.put(API_ENDPOINTS.socialCampaign.update(campaignId), {
        data: campaignData,
      });
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
      const response = await this.httpClient.delete(API_ENDPOINTS.socialCampaign.delete(campaignId));
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
    action: SocialCampaignAction
  ): Promise<SocialCampaignStatusUpdateResponse> {
    return await test.step(`Updating social campaign status: ${campaignId} to ${action}`, async () => {
      const response = await this.httpClient.put(API_ENDPOINTS.socialCampaign.updateStatus(campaignId), {
        data: { action },
      });
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
      return this.updateCampaignStatus(campaignId, SocialCampaignAction.EXPIRE);
    });
  }

  /**
   * Activates a social campaign
   * @param campaignId - The campaign ID
   * @returns Promise<SocialCampaignStatusUpdateResponse>
   */
  async activateCampaign(campaignId: string): Promise<SocialCampaignStatusUpdateResponse> {
    return await test.step(`Activating social campaign: ${campaignId}`, async () => {
      return this.updateCampaignStatus(campaignId, SocialCampaignAction.ACTIVATE);
    });
  }

  /**
   * Deactivates a social campaign
   * @param campaignId - The campaign ID
   * @returns Promise<SocialCampaignStatusUpdateResponse>
   */
  async deactivateCampaign(campaignId: string): Promise<SocialCampaignStatusUpdateResponse> {
    return await test.step(`Deactivating social campaign: ${campaignId}`, async () => {
      return this.updateCampaignStatus(campaignId, SocialCampaignAction.DEACTIVATE);
    });
  }

  /**
   * Shares a social campaign to feed
   * @param campaignId - The campaign ID
   * @param shareData - The share data including text, HTML, and sharedWith parameter
   * @returns Promise<SocialCampaignShareResponse>
   */
  async shareCampaignToFeed(
    campaignId: string,
    shareData: SocialCampaignShareRequest
  ): Promise<SocialCampaignShareResponse> {
    return await test.step(`Sharing social campaign to feed: ${campaignId}`, async () => {
      const response = await this.httpClient.post(
        API_ENDPOINTS.socialCampaign.shareToFeed(campaignId, shareData.sharedWith),
        {
          data: shareData,
        }
      );
      return (await response.json()) as SocialCampaignShareResponse;
    });
  }
}
