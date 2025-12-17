import { APIRequestContext, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import {
  Audience,
  AudienceListResponse,
  CreateAudienceRequest,
  CreateAudienceResponse,
} from '@core/types/audience.types';

import { HttpClient } from '@/src/core';

export class AudienceManagementService {
  private httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Gets list of audiences
   * @param request - Request parameters including size
   * @returns Promise<AudienceListResponse>
   */
  async getAudienceList(size: number = 16): Promise<AudienceListResponse> {
    return await test.step(`Getting audience list with size: ${size}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.listOfAudiences, {
        data: { size: size },
      });
      return (await response.json()) as AudienceListResponse;
    });
  }

  /**
   * Finds an audience by name
   * @param audienceName - Name of the audience to find
   * @param size - Number of audiences to fetch (default: 16)
   * @returns Promise<Audience | null>
   */
  async findAudienceByName(audienceName: string, size: number = 16): Promise<Audience | null> {
    return await test.step(`Finding audience by name: ${audienceName}`, async () => {
      const response = await this.getAudienceList(size);
      const audience = response.result.listOfItems.find(
        audience => audience.name === audienceName || audience.displayName === audienceName
      );
      return audience || null;
    });
  }

  /**
   * Gets audience ID by name
   * @param audienceName - Name of the audience
   * @param size - Number of audiences to fetch (default: 16)
   * @returns Promise<string> - Audience ID
   * @throws Error if audience not found
   */
  async getAudienceIdByName(audienceName: string, size: number = 16): Promise<string> {
    return await test.step(`Getting audience ID for: ${audienceName}`, async () => {
      const audience = await this.findAudienceByName(audienceName, size);
      if (!audience) {
        throw new Error(`Audience "${audienceName}" not found`);
      }
      return audience.audienceId;
    });
  }

  /**
   * Creates a new audience
   * @param request - Audience creation request data
   * @returns Promise<CreateAudienceResponse>
   */
  async createAudience(request: CreateAudienceRequest): Promise<CreateAudienceResponse> {
    return await test.step(`Creating audience: ${request.name}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiences, {
        data: request,
      });
      const responseData = (await response.json()) as CreateAudienceResponse;
      console.log('CreateAudienceResponse', JSON.stringify(responseData));
      return responseData;
    });
  }

  /**
   * Updates an existing audience
   * @param audienceId - ID of the audience to update
   * @param request - Audience update request data
   * @returns Promise<CreateAudienceResponse>
   */
  async updateAudience(audienceId: string, request: CreateAudienceRequest): Promise<CreateAudienceResponse> {
    return await test.step(`Updating audience: ${audienceId}`, async () => {
      const response = await this.httpClient.put(
        `${API_ENDPOINTS.appManagement.identity.v2IdentityAudiences}/${audienceId}`,
        {
          data: request,
        }
      );
      return (await response.json()) as CreateAudienceResponse;
    });
  }

  /**
   * Creates a test audience for social campaigns
   * @param name - Name of the audience (optional, defaults to "Test Social Campaign Audience")
   * @param description - Description of the audience (optional)
   * @param country - Country to filter by (optional, defaults to "India")
   * @returns Promise<CreateAudienceResponse>
   */
  async createTestAudience(
    name: string = 'Test Social Campaign Audience',
    description: string = 'Test audience created for social campaign testing',
    country: string = 'India'
  ): Promise<CreateAudienceResponse> {
    return await test.step(`Creating test audience: ${name}`, async () => {
      const request: CreateAudienceRequest = {
        name,
        description,
        type: 'mixed',
        audienceRule: {
          AND: [
            {
              AND: [
                {
                  values: [{ value: country }],
                  attribute: 'country_name',
                  operator: 'IS',
                  fieldType: 'regular',
                },
              ],
            },
          ],
        },
      };

      return await this.createAudience(request);
    });
  }
}
