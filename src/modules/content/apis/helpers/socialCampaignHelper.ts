import { APIRequestContext, test } from '@playwright/test';

import {
  CreateSocialCampaignRequest,
  SocialCampaign,
  SocialCampaignAction,
  SocialCampaignFilter,
  SocialCampaignListResponse,
  SocialCampaignNetwork,
  SocialCampaignRecipient,
  SocialCampaignSharedWith,
  SocialCampaignShareRequest,
} from '@/src/core/types/social-campaign.types';
import { FeedManagementService } from '@/src/modules/content/apis/services/FeedManagementService';
import { SocialCampaignService } from '@/src/modules/content/apis/services/SocialCampaignService';
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
  readonly socialCampaignService: SocialCampaignService;
  private feedManagementService: FeedManagementService;
  constructor(
    readonly appManagerApiContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.socialCampaignService = new SocialCampaignService(appManagerApiContext, baseUrl);
    this.feedManagementService = new FeedManagementService(appManagerApiContext, baseUrl);
  }

  /**
   * Gets the social campaign service from the API client
   * @returns SocialCampaignService instance
   */
  private getSocialCampaignService(): SocialCampaignService {
    return this.socialCampaignService;
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
    shouldWaitForSearchIndex?: boolean;
    overrides?: Partial<CreateSocialCampaignRequest>;
  }): Promise<SocialCampaign> {
    const { message, url, recipient, networks, audienceId, shouldWaitForSearchIndex, overrides } = params;

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
   * Gets campaign list via GET API with query parameters
   * @param params - Query parameters for filtering campaigns
   * @returns Promise<SocialCampaignListResponse> - Campaign list response
   */
  async getCampaignList(params?: {
    size?: number;
    sortBy?: string;
    filter?: string;
  }): Promise<SocialCampaignListResponse> {
    return await this.getSocialCampaignService().getCampaignList(params);
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
    return allCampaigns.filter(campaign => campaign.networks?.[network] !== undefined);
  }

  /**
   * Cleans up all campaigns created by this helper instance
   * This should be called in test cleanup to ensure proper resource management
   * Uses API calls to delete campaigns, similar to site and content helpers
   * Deletes campaigns in parallel for better performance
   */
  async cleanup(): Promise<void> {
    // Early return if no campaigns to clean up - avoid unnecessary test step
    if (this.campaigns.length === 0) {
      return;
    }

    return await test.step('SocialCampaignHelper Cleanup', async () => {
      // Create a copy of campaigns array to avoid issues if campaigns array is modified during deletion
      const campaignsToDelete = [...this.campaigns];

      // Delete campaigns in parallel for better performance
      const deletePromises = campaignsToDelete.map(async ({ campaignId, message }) => {
        try {
          // Use the service directly to ensure API call happens even if tracking fails
          await this.socialCampaignService.deleteCampaign(campaignId);
          console.log(`✅ Deleted campaign: ${message} (${campaignId})`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete campaign ${message} (${campaignId}):`, error);
          // Continue with next campaign even if one fails
        }
      });

      await Promise.all(deletePromises);

      // Clear the tracking array after cleanup attempts
      this.campaigns = [];
    });
  }

  /**
   * Deletes all campaigns from the system (not just tracked ones)
   * Use with caution - this will delete ALL campaigns
   * Deletes campaigns in parallel for better performance
   * @returns Promise<void>
   */
  async deleteAllCampaigns(filter?: SocialCampaignFilter): Promise<void> {
    return await test.step(`Deleting all campaigns with filter: ${filter || 'none'}`, async () => {
      const allCampaigns = await this.getSocialCampaignService().getAllCampaigns(filter);
      console.log(`Deleting ${allCampaigns.length} campaigns`);

      if (allCampaigns.length === 0) {
        return;
      }

      // Delete campaigns in parallel for better performance
      const deletePromises = allCampaigns.map(async campaign => {
        try {
          await this.deleteCampaign(campaign.campaignId);
          console.log(`✅ Deleted campaign: ${campaign.message} (${campaign.campaignId})`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete campaign ${campaign.message} (${campaign.campaignId}):`, error);
        }
      });

      await Promise.all(deletePromises);
    });
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

  /**
   * Shares a social campaign to feed
   * @param campaignId - The campaign ID
   * @param shareData - The share data including text, HTML, and sharedWith parameter
   * @returns Promise<any> - The share response
   */
  async shareCampaignToFeed(campaignId: string, shareData: SocialCampaignShareRequest): Promise<any> {
    return await test.step(`Sharing social campaign to feed: ${campaignId}`, async () => {
      console.log(`Sharing campaign ${campaignId} to ${shareData.sharedWith}`);
      const response = await this.getSocialCampaignService().shareCampaignToFeed(campaignId, shareData);
      return response;
    });
  }

  /**
   * Shares a social campaign to followers feed
   * @param campaignId - The campaign ID
   * @param description - The description text to post
   * @param siteId - Optional site ID for site-specific sharing
   * @returns Promise<any> - The share response
   */
  async shareCampaignToFollowersFeed(campaignId: string, description: string): Promise<any> {
    const textToPost = `{"type":"doc","content":[{"type":"paragraph","attrs":{"className":"","data-sw-sid":null},"content":[{"type":"text","text":"${description}"}]}]}`;
    const bodyHtml = `<p>${description}</p>`;

    const shareData: SocialCampaignShareRequest = {
      textToPost,
      bodyHtml,
      isNewTiptap: true,
      sharedWith: SocialCampaignSharedWith.FOLLOWERS,
    };
    return this.shareCampaignToFeed(campaignId, shareData);
  }

  /**
   * Shares a social campaign to site feed
   * @param campaignId - The campaign ID
   * @param description - The description text to post
   * @param siteId - Site ID for site-specific sharing
   * @returns Promise<any> - The share response
   */
  async shareCampaignToSiteFeed(campaignId: string, description: string, siteId: string): Promise<any> {
    const textToPost = `{"type":"doc","content":[{"type":"paragraph","attrs":{"className":"","data-sw-sid":null},"content":[{"type":"text","text":"${description}"}]}]}`;
    const bodyHtml = `<p>${description}</p>`;

    const shareData: SocialCampaignShareRequest = {
      textToPost,
      bodyHtml,
      isNewTiptap: true,
      sharedWith: SocialCampaignSharedWith.SITE,
      siteId,
    };
    return this.shareCampaignToFeed(campaignId, shareData);
  }

  /**
   * Enables social campaign integrations (Facebook, LinkedIn, Twitter)
   * Checks app config first - if all are true, does nothing
   * If any are false, enables them accordingly
   * @param settings - Optional settings to override defaults (all enabled by default)
   * @returns Promise<any> - The response from the API
   */
  async enableSocialCampaign(settings?: {
    facebookIntegrationEnabled?: boolean;
    linkedinIntegrationEnabled?: boolean;
    twitterIntegrationEnabled?: boolean;
  }): Promise<any> {
    return await test.step('Enabling social campaign integrations', async () => {
      // Get current app config to check existing social campaign settings
      const appConfig = await this.feedManagementService.getAppConfig();
      const currentSettings = appConfig.result?.socialCampaignsSettings;

      // Default settings - all enabled
      const defaultSettings = {
        facebookIntegrationEnabled: true,
        linkedinIntegrationEnabled: true,
        twitterIntegrationEnabled: true,
      };

      // Use provided settings or defaults
      const requestedSettings = settings || defaultSettings;

      // If settings are provided in the request, use them
      // Otherwise, check current settings from app config
      let settingsToApply = requestedSettings;

      if (currentSettings && !settings) {
        // Check if all current settings are true
        const allEnabled =
          currentSettings.facebookIntegrationEnabled === true &&
          currentSettings.linkedinIntegrationEnabled === true &&
          currentSettings.twitterIntegrationEnabled === true;

        if (allEnabled) {
          console.log('All social campaign integrations are already enabled. Skipping update.');
          return { result: currentSettings };
        }

        // If any are false, enable all (use defaults)
        settingsToApply = defaultSettings;
      } else if (currentSettings && settings) {
        // If settings are provided, check if they match current settings
        const isSame =
          currentSettings.facebookIntegrationEnabled === requestedSettings.facebookIntegrationEnabled &&
          currentSettings.linkedinIntegrationEnabled === requestedSettings.linkedinIntegrationEnabled &&
          currentSettings.twitterIntegrationEnabled === requestedSettings.twitterIntegrationEnabled;

        if (isSame) {
          console.log('Social campaign settings are already configured as requested. Skipping update.');
          return { result: currentSettings };
        }

        // Use requested settings
        settingsToApply = requestedSettings;
      }

      // Enable social campaign with the determined settings
      return await this.getSocialCampaignService().enableSocialCampaign(settingsToApply);
    });
  }
}
