import { test } from '@playwright/test';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { SocialCampaignService } from '@/src/core/api/services/SocialCampaignService';
import {
  CreateSocialCampaignRequest,
  SocialCampaign,
  SocialCampaignAction,
  SocialCampaignFilter,
  SocialCampaignNetwork,
  SocialCampaignRecipient,
} from '@/src/core/types/social-campaign.types';
import { SOCIAL_CAMPAIGN_TEST_DATA } from '@/src/modules/content/test-data/social-campaign.test-data';

interface Campaign {
  campaignId: string;
  message: string;
  recipient: string;
  networks: string[];
  url: string;
}

export class SocialCampaignHelper {
  private campaigns: Campaign[] = [];

  constructor(private appManagerApiClient: AppManagerApiClient) {}

  /**
   * Gets the social campaign service from the API client
   * @returns SocialCampaignService instance
   */
  private getSocialCampaignService(): SocialCampaignService {
    return this.appManagerApiClient.getSocialCampaignService();
  }

  /**
   * Creates a new social campaign with default settings
   * @param params - Campaign creation parameters
   * @returns Promise<SocialCampaign> - The created campaign
   */
  async createCampaign(params: {
    message?: string;
    url?: string;
    recipient?: SocialCampaignRecipient;
    networks?: SocialCampaignNetwork[];
    audienceId?: string;
    overrides?: Partial<CreateSocialCampaignRequest>;
  }): Promise<SocialCampaign> {
    const { message, url, recipient, networks, audienceId, overrides } = params;

    const timestamp = Date.now().toString().slice(-4);
    const randomId = Math.random().toString(36).substring(2, 6);

    const campaignData: CreateSocialCampaignRequest = {
      message: message ?? `Test Campaign ${timestamp}_${randomId}`,
      url: url ?? SOCIAL_CAMPAIGN_TEST_DATA.URLS.YOUTUBE,
      recipient: recipient ?? SocialCampaignRecipient.EVERYONE,
      networks: networks ?? [
        SocialCampaignNetwork.FACEBOOK,
        SocialCampaignNetwork.LINKEDIN,
        SocialCampaignNetwork.TWITTER,
      ],
      ...(audienceId && { audienceId }),
      ...overrides,
    };

    console.log(`Creating social campaign: ${campaignData.message}`);
    const response = await this.getSocialCampaignService().createCampaign(campaignData);

    const createdCampaign = response.result;

    // Track the campaign for cleanup
    this.campaigns.push({
      campaignId: createdCampaign.campaignId,
      message: createdCampaign.message,
      recipient: createdCampaign.recipient,
      networks: networks ?? [
        SocialCampaignNetwork.FACEBOOK,
        SocialCampaignNetwork.LINKEDIN,
        SocialCampaignNetwork.TWITTER,
      ],
      url: createdCampaign.campaignUrl || campaignData.url,
    });

    return createdCampaign;
  }

  /**
   * Creates a social campaign for everyone
   * @param params - Campaign creation parameters
   * @returns Promise<SocialCampaign> - The created campaign
   */
  async createCampaignForEveryone(params: {
    message?: string;
    url?: string;
    networks?: SocialCampaignNetwork[];
    overrides?: Partial<CreateSocialCampaignRequest>;
  }): Promise<SocialCampaign> {
    return await this.createCampaign({
      ...params,
      recipient: SocialCampaignRecipient.EVERYONE,
    });
  }

  /**
   * Creates a social campaign for a specific audience
   * @param params - Campaign creation parameters
   * @returns Promise<SocialCampaign> - The created campaign
   */
  async createCampaignForAudience(params: {
    message?: string;
    url?: string;
    networks?: SocialCampaignNetwork[];
    audienceId?: string;
    overrides?: Partial<CreateSocialCampaignRequest>;
  }): Promise<SocialCampaign> {
    return await this.createCampaign({
      ...params,
      recipient: SocialCampaignRecipient.AUDIENCE,
      overrides: {
        ...params.overrides,
        ...(params.audienceId && { audienceId: params.audienceId }),
      },
    });
  }

  /**
   * Creates multiple campaigns for testing
   * @param count - Number of campaigns to create
   * @param params - Campaign creation parameters
   * @returns Promise<SocialCampaign[]> - Array of created campaigns
   */
  async createCampaignsForTesting(
    count: number = 3,
    params?: {
      message?: string;
      url?: string;
      recipient?: SocialCampaignRecipient;
      networks?: SocialCampaignNetwork[];
    }
  ): Promise<SocialCampaign[]> {
    const campaigns: SocialCampaign[] = [];

    for (let i = 0; i < count; i++) {
      const campaign = await this.createCampaign({
        ...params,
        message: params?.message ? `${params.message} ${i + 1}` : undefined,
      });
      campaigns.push(campaign);
    }

    return campaigns;
  }

  /**
   * Gets all campaigns created by this helper
   * @returns Campaign[] - Array of tracked campaigns
   */
  getAllCampaigns(): Campaign[] {
    return [...this.campaigns];
  }

  /**
   * Gets a random campaign from the created campaigns
   * @returns Campaign | null - Random campaign or null if none exist
   */
  getRandomCampaign(): Campaign | null {
    if (this.campaigns.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.campaigns.length);
    return this.campaigns[randomIndex];
  }

  /**
   * Gets campaign count
   * @returns number - Number of campaigns created
   */
  getCampaignCount(): number {
    return this.campaigns.length;
  }

  /**
   * Gets all social campaigns from the API
   * @returns Promise<SocialCampaign[]> - All campaigns from API
   */
  async getAllCampaignsFromAPI(): Promise<SocialCampaign[]> {
    return await this.getSocialCampaignService().getAllCampaigns();
  }

  /**
   * Gets a specific campaign by ID
   * @param campaignId - The campaign ID
   * @returns Promise<SocialCampaign> - The campaign details
   */
  async getCampaignById(campaignId: string): Promise<SocialCampaign> {
    return await this.getSocialCampaignService().getCampaignById(campaignId);
  }

  /**
   * Updates a campaign's status
   * @param campaignId - The campaign ID
   * @param action - The action to perform ('expire', 'activate', 'deactivate')
   * @returns Promise<any> - The update response
   */
  async updateCampaignStatus(campaignId: string, action: SocialCampaignAction): Promise<any> {
    return await this.getSocialCampaignService().updateCampaignStatus(campaignId, action);
  }

  /**
   * Expires a campaign
   * @param campaignId - The campaign ID
   * @returns Promise<any> - The expire response
   */
  async expireCampaign(campaignId: string): Promise<any> {
    return await this.getSocialCampaignService().expireCampaign(campaignId);
  }

  /**
   * Activates a campaign
   * @param campaignId - The campaign ID
   * @returns Promise<any> - The activate response
   */
  async activateCampaign(campaignId: string): Promise<any> {
    return await this.getSocialCampaignService().activateCampaign(campaignId);
  }

  /**
   * Deactivates a campaign
   * @param campaignId - The campaign ID
   * @returns Promise<any> - The deactivate response
   */
  async deactivateCampaign(campaignId: string): Promise<any> {
    return await this.getSocialCampaignService().deactivateCampaign(campaignId);
  }

  /**
   * Updates a campaign
   * @param campaignId - The campaign ID
   * @param campaignData - The updated campaign data
   * @returns Promise<any> - The update response
   */
  async updateCampaign(campaignId: string, campaignData: Partial<CreateSocialCampaignRequest>): Promise<any> {
    return await this.getSocialCampaignService().updateCampaign(campaignId, campaignData);
  }

  /**
   * Deletes a campaign
   * @param campaignId - The campaign ID
   * @returns Promise<any> - The delete response
   */
  async deleteCampaign(campaignId: string): Promise<any> {
    const response = await this.getSocialCampaignService().deleteCampaign(campaignId);

    // Remove from tracking
    this.campaigns = this.campaigns.filter(campaign => campaign.campaignId !== campaignId);

    return response;
  }

  /**
   * Gets campaigns by status
   * @param status - The status to filter by
   * @returns Promise<SocialCampaign[]> - Campaigns with the specified status
   */
  async getCampaignsByStatus(status: 'active' | 'inactive' | 'draft' | 'expired'): Promise<SocialCampaign[]> {
    const allCampaigns = await this.getAllCampaignsFromAPI();
    return allCampaigns.filter(campaign => campaign.status === status);
  }

  /**
   * Gets campaigns by recipient type
   * @param recipient - The recipient type ('everyone' or 'audience')
   * @returns Promise<SocialCampaign[]> - Campaigns with the specified recipient type
   */
  async getCampaignsByRecipient(recipient: 'everyone' | 'audience'): Promise<SocialCampaign[]> {
    const allCampaigns = await this.getAllCampaignsFromAPI();
    return allCampaigns.filter(campaign => campaign.recipient === recipient);
  }

  /**
   * Gets campaigns by network
   * @param network - The network to filter by ('fb', 'ln', 'tw')
   * @returns Promise<SocialCampaign[]> - Campaigns that include the specified network
   */
  async getCampaignsByNetwork(network: SocialCampaignNetwork): Promise<SocialCampaign[]> {
    const allCampaigns = await this.getAllCampaignsFromAPI();
    return allCampaigns.filter(campaign => campaign.networks && campaign.networks[network] !== undefined);
  }

  /**
   * Cleans up all campaigns created by this helper instance
   * This should be called in test cleanup to ensure proper resource management
   */
  async cleanup(): Promise<void> {
    console.log(`Cleaning up ${this.campaigns.length} social campaigns...`);

    for (const { campaignId, message } of this.campaigns) {
      try {
        await this.deleteCampaign(campaignId);
        console.log(`Deleted campaign: ${message} (${campaignId})`);
      } catch (error) {
        console.warn(`Failed to delete campaign ${message} (${campaignId}):`, error);
      }
    }

    // Clear the tracking array
    this.campaigns = [];
  }

  /**
   * Deletes all campaigns from the system (not just tracked ones)
   * Use with caution - this will delete ALL campaigns
   * @returns Promise<any[]> - Array of delete responses
   */
  async deleteAllCampaigns(filter?: SocialCampaignFilter): Promise<void> {
    const allCampaigns = await this.getSocialCampaignService().getAllCampaigns(filter);
    console.log(`Deleting ${allCampaigns.length} campaigns`);
    for (const campaign of allCampaigns) {
      console.log(`Deleting campaign: ${campaign.message} (${campaign.campaignId})`);
      await this.deleteCampaign(campaign.campaignId);
    }
  }

  /**
   * Gets campaigns that are added to carousel
   * @returns Promise<SocialCampaign[]> - Campaigns added to carousel
   */
  async getCampaignsAddedToCarousel(): Promise<SocialCampaign[]> {
    const allCampaigns = await this.getAllCampaignsFromAPI();
    return allCampaigns.filter(campaign => campaign.addedToCarousel === true);
  }

  /**
   * Gets campaigns that can be shared to home carousel
   * @returns Promise<SocialCampaign[]> - Campaigns that can be shared to home carousel
   */
  async getCampaignsCanShareToHomeCarousel(): Promise<SocialCampaign[]> {
    const allCampaigns = await this.getAllCampaignsFromAPI();
    return allCampaigns.filter(campaign => campaign.canShareToHomeCarousel === true);
  }
}
