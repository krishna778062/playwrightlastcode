import { APIRequestContext } from '@playwright/test';

import { Audience, AudienceRule, CreateAudienceRequest, CreateAudienceResponse } from '@core/types/audience.types';

import { AudienceManagementService } from '@/src/modules/content/apis/services/AudienceManagementService';

export class AudienceManagementHelper {
  private readonly audienceManagementService: AudienceManagementService;
  constructor(
    readonly appManagerApiContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.audienceManagementService = new AudienceManagementService(appManagerApiContext, baseUrl);
  }

  /**
   * Gets all audiences with default size
   * @param size - Number of audiences to fetch (default: 16)
   * @returns Promise<AudienceListResponse>
   */
  async getAllAudiences(size: number = 16) {
    return await this.audienceManagementService.getAudienceList(size);
  }

  /**
   * Finds an audience by name
   * @param audienceName - Name of the audience to find
   * @param size - Number of audiences to fetch (default: 16)
   * @returns Promise<Audience | null>
   */
  async findAudienceByName(audienceName: string, size: number = 16): Promise<Audience | null> {
    return await this.audienceManagementService.findAudienceByName(audienceName, size);
  }

  /**
   * Gets audience ID by name
   * @param audienceName - Name of the audience
   * @param size - Number of audiences to fetch (default: 16)
   * @returns Promise<string> - Audience ID
   * @throws Error if audience not found
   */
  async getAudienceIdByName(audienceName: string, size: number = 16): Promise<string> {
    return await this.audienceManagementService.getAudienceIdByName(audienceName, size);
  }

  /**
   * Gets a random audience ID for testing purposes
   * @param size - Number of audiences to fetch (default: 16)
   * @returns Promise<string> - Random audience ID
   * @throws Error if no audiences found
   */
  async getRandomAudienceId(size: number = 16): Promise<{
    audienceId: string;
    name: string;
    count: string | number;
    description: string;
    audienceRule: AudienceRule;
    type: string;
  }> {
    const response = await this.getAllAudiences(size);
    if (response.result.listOfItems.length === 0) {
      const newAudience = await this.createAudience({
        name: `Test Audience ${Math.random().toString(36).substring(2, 12)}`,
        description: `Test Audience Description ${Math.random().toString(36).substring(2, 12)}`,
        type: 'mixed',
        audienceRule: { AND: [] },
      });
      return {
        audienceId: newAudience.result.audienceId,
        name: newAudience.result.name,
        count: newAudience.result.audienceMemberCount,
        description: newAudience.result.description,
        audienceRule: newAudience.result.audienceRule,
        type: newAudience.result.type,
      };
    }

    const randomIndex = Math.floor(Math.random() * response.result.listOfItems.length);
    return {
      audienceId: response.result.listOfItems[randomIndex].audienceId,
      name: response.result.listOfItems[randomIndex].name,
      count: response.result.listOfItems[randomIndex].audienceCount || 0,
      description: response.result.listOfItems[randomIndex].description || '',
      audienceRule: response.result.listOfItems[randomIndex].audienceRule || { AND: [] },
      type: response.result.listOfItems[randomIndex].type || 'mixed',
    };
  }

  /**
   * Gets the first available audience ID
   * @param size - Number of audiences to fetch (default: 16)
   * @returns Promise<string | null> - First audience ID or null if no audiences found
   */
  async getFirstAudienceId(size: number = 16): Promise<string | null> {
    const response = await this.getAllAudiences(size);
    if (response.result.listOfItems.length === 0) {
      return null;
    }

    return response.result.listOfItems[0].audienceId;
  }

  /**
   * Creates a new audience
   * @param request - Audience creation request data
   * @returns Promise<CreateAudienceResponse>
   */
  async createAudience(request: CreateAudienceRequest): Promise<CreateAudienceResponse> {
    return await this.audienceManagementService.createAudience(request);
  }

  /**
   * Updates an existing audience
   * @param audienceId - ID of the audience to update
   * @param request - Audience update request data
   * @returns Promise<CreateAudienceResponse>
   */
  async updateAudience(audienceId: string, request: CreateAudienceRequest): Promise<CreateAudienceResponse> {
    return await this.audienceManagementService.updateAudience(audienceId, request);
  }

  /**
   * Deletes an audience by ID
   * @param audienceId - ID of the audience to delete
   * @returns Promise<void>
   */
  async deleteAudience(audienceId: string): Promise<void> {
    // Note: This would need to be implemented in AudienceManagementService
    // For now, we'll just log that cleanup is needed
    console.log(`Audience ${audienceId} cleanup needed - delete method not implemented yet`);
  }

  /**
   * Gets an audience name that has no description
   * @returns Promise<string> - Audience name
   */
  async getAudienceWithDescription(): Promise<{
    name: string;
    description: string;
    audienceId: string;
    audienceCount: string | number;
  }> {
    const response = await this.audienceManagementService.getAudienceList();
    const audience = response.result.listOfItems.find(audience => audience.description !== null);
    if (!audience) {
      throw new Error('No audience with no description found');
    }
    return {
      name: audience.name,
      description: audience.description || '',
      audienceId: audience.audienceId,
      audienceCount: audience.audienceCount || 0,
    };
  }

  /**
   * Gets an audience name that has no description
   * @returns Promise<string> - Audience name
   */
  async getAudienceWithNoDescription(): Promise<{
    name: string;
    description: string;
    audienceId: string;
    audienceCount: string | number;
  }> {
    const response = await this.audienceManagementService.getAudienceList();
    const audience = response.result.listOfItems.find(audience => audience.description === null);
    if (!audience) {
      throw new Error('No audience with description found');
    }
    return {
      name: audience.name,
      description: audience.description || '',
      audienceId: audience.audienceId,
      audienceCount: audience.audienceCount || 0,
    };
  }
}
