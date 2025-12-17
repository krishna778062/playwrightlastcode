import { APIRequestContext, test } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import {
  ExpertiseCreateResponse,
  ExpertiseEndorseResponse,
  ExpertiseUnendorseResponse,
} from '@/src/core/types/expertise.type';
import { IExpertiseManagementOperations } from '@/src/modules/platforms/apis/interfaces/IExpertiseManagementOperations';
import { PLATFORM_API_ENDPOINTS as API_ENDPOINTS } from '@/src/modules/platforms/apis/platformApiEndpoints';

/**
 * Service for managing expertise operations
 */
export class ExpertiseManagementService implements IExpertiseManagementOperations {
  public httpClient: HttpClient;

  constructor(
    context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Creates a new expertise
   * @param name - The name of the expertise to create
   * @returns Promise with the created expertise response
   */
  async createExpertise(name: string): Promise<ExpertiseCreateResponse> {
    return await test.step(`Creating expertise: ${name}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.identity.expertises, {
        data: {
          name: name,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseJson = await this.httpClient.parseResponse<ExpertiseCreateResponse>(response);

      if (!response.ok()) {
        throw new Error(`Failed to create expertise: ${responseJson.message}`);
      }

      console.log(`Expertise created successfully: ${name} with ID: ${responseJson.result.uuid}`);
      return responseJson;
    });
  }

  /**
   * Endorses a user with a specific expertise
   * @param userId - The ID of the user to endorse
   * @param expertiseId - The ID of the expertise to endorse the user with
   * @returns Promise with the endorsement response
   */
  async endorseUserWithExpertise(userId: string, expertiseId: string): Promise<ExpertiseEndorseResponse> {
    return await test.step(`Endorsing user ${userId} with expertise ${expertiseId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.identity.endorseUser(userId), {
        data: {
          expertiseId: expertiseId,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseJson = await this.httpClient.parseResponse<ExpertiseEndorseResponse>(response);

      if (!response.ok()) {
        throw new Error(`Failed to endorse user: ${responseJson.message}`);
      }

      console.log(`User ${userId} endorsed with expertise ${expertiseId} successfully`);
      return responseJson;
    });
  }

  /**
   * Unendorses a user from a specific expertise
   * @param userId - The ID of the user to unendorse
   * @param expertiseId - The ID of the expertise to unendorse the user from
   * @returns Promise with the unendorsement response
   */
  async unendorseUserFromExpertise(userId: string, expertiseId: string): Promise<ExpertiseUnendorseResponse> {
    return await test.step(`Unendorsing user ${userId} from expertise ${expertiseId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.identity.unendorseUser(userId), {
        data: {
          expertiseId: expertiseId,
          isRemoveExpertiseFromProfile: true,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseJson = await this.httpClient.parseResponse<ExpertiseUnendorseResponse>(response);

      if (!response.ok()) {
        throw new Error(`Failed to unendorse user: ${responseJson.message}`);
      }

      console.log(`User ${userId} unendorsed from expertise ${expertiseId} successfully`);
      return responseJson;
    });
  }
}
