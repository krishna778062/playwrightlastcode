import { APIRequestContext } from '@playwright/test';

import { Audience, AudienceRule, CreateAudienceRequest, CreateAudienceResponse } from '@core/types/audience.types';
import { log } from '@core/utils/logger';

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
        audienceRule: {
          AND: [
            {
              AND: [
                {
                  values: [{ value: 'A' }],
                  attribute: 'first_name',
                  operator: 'CONTAINS',
                  fieldType: 'regular',
                },
              ],
            },
          ],
        },
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

    // Find an audience with a valid count (> 0)
    const validAudiences = response.result.listOfItems.filter(
      audience => audience.audienceCount && audience.audienceCount > 0
    );

    if (validAudiences.length === 0) {
      throw new Error('No audiences with valid count found');
    }

    const randomIndex = Math.floor(Math.random() * validAudiences.length);
    const selectedAudience = validAudiences[randomIndex];

    return {
      audienceId: selectedAudience.audienceId,
      name: selectedAudience.name,
      count: selectedAudience.audienceCount!,
      description: selectedAudience.description || '',
      audienceRule: selectedAudience.audienceRule || { AND: [] },
      type: selectedAudience.type || 'mixed',
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
    log.debug('createAudience request', { request: JSON.stringify(request) });
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
    log.debug(`Audience ${audienceId} cleanup needed - delete method not implemented yet`);
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

    log.debug('response', { response: JSON.stringify(response.result.listOfItems) });
    const audience = response.result.listOfItems.find(
      audience =>
        audience.description !== null &&
        audience.description !== '' &&
        audience.audienceCount &&
        audience.audienceCount > 0
    );

    log.debug('audience', { audience: JSON.stringify(audience) });
    log.debug('audience description', { description: JSON.stringify(audience?.description) });
    if (!audience) {
      //create audience with description
      const newAudience = await this.createAudience({
        name: `Test Audience ${Math.random().toString(36).substring(2, 12)}`,
        description: `Test Audience Description ${Math.random().toString(36).substring(2, 12)}`,
        type: 'mixed',
        audienceRule: {
          AND: [
            {
              AND: [
                {
                  values: [{ value: 'A' }],
                  attribute: 'first_name',
                  operator: 'CONTAINS',
                  fieldType: 'regular',
                },
              ],
            },
          ],
        },
      });
      return {
        name: newAudience.result.name,
        description: newAudience.result.description,
        audienceId: newAudience.result.audienceId,
        audienceCount: newAudience.result.audienceMemberCount,
      };
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
