import { APIRequestContext, expect, test } from '@playwright/test';
import { BaseApiClient } from '../baseApiClient';
import { IIdentityAdminOperations } from '../interfaces/IIdentityOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { ListAudiencesResponse } from '@core/types/audience.type';
import { Roles } from '@core/constants/roles';
import { IdentityUserSearchResponse } from '@core/types/user.type';

interface ListRolesResponse {
  result: Array<{
    role_id: number;
    name: string;
    description?: string;
  }>;
}

export class IdentityService extends BaseApiClient implements IIdentityAdminOperations {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }

  async getListOfAudiences(): Promise<ListAudiencesResponse> {
    let listOfAudiences: ListAudiencesResponse;
    await test.step(`Getting list of audiences`, async () => {
      const response = await this.post(API_ENDPOINTS.appManagement.identity.listOfAudiences, {
        data: { size: 16, term: '' },
      });
      listOfAudiences = await this.parseResponse<ListAudiencesResponse>(response);
    });
    return listOfAudiences!;
  }

  async getAudienceId(audienceName: string): Promise<string> {
    const listOfAudiences = await this.getListOfAudiences();
    const audience = listOfAudiences.listOfItems.find(audience => audience.name === audienceName);
    if (!audience) {
      throw new Error(`Audience ${audienceName} not found in fetched list of audiences`);
    }
    return audience.id;
  }

  async fetchRoleId(role: Roles): Promise<number> {
    const response = await this.post(API_ENDPOINTS.appManagement.roles.list);
    const responseJson = await this.parseResponse<ListRolesResponse>(response);

    const roleData = responseJson.result.find(r => r.name === role);
    if (!roleData) {
      throw new Error(`Role ${role} not found in fetched list of roles`);
    }

    return roleData.role_id;
  }

  /**
   * Fetches the user id from the identity service for user activation
   * @param firstName - The first name of the user
   * @param lastName - The last name of the user
   * @returns The user id for activation
   */
  async getIdentityUserId(firstName: string, lastName: string): Promise<string> {
    let userId: string = '';
    await test.step(`Fetch the identity user id of the user ${firstName} ${lastName}`, async () => {
      const response = await this.post(API_ENDPOINTS.appManagement.users.list, {
        data: {
          size: 16,
          sort_by: {
            name: 'created_on',
            order: 'ASC',
          },
          searchTerm: `${firstName} ${lastName}`,
        },
      });
      const responseJson = await this.parseResponse<IdentityUserSearchResponse>(response);
      expect(
        responseJson.result.listOfItems.length,
        `Expecting user ${firstName} ${lastName} to be found`
      ).toBeGreaterThan(0);
      userId = responseJson.result.listOfItems[0].user_id;
    });
    return userId;
  }
}
