import { APIRequestContext, expect, test } from '@playwright/test';
import { BaseApiClient } from '../baseApiClient';
import { IUserManagementOperations } from '../interfaces/IUserManagementOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { User, SearchUserResponse } from '@core/types/user.type';
import { AddUserResponse, ChatGroup } from '@core/types/group.type';
import { Roles } from '@core/constants/roles';
import { TIMEOUTS } from '@core/constants/timeouts';
import { IdentityService } from './IdentityService';

export class UserManagementService extends BaseApiClient implements IUserManagementOperations {
  private identityService: IdentityService;

  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
    this.identityService = new IdentityService(context, baseUrl);
  }

  /**
   * Adds a user to the system
   * @param user - The user to add
   * @param role - The role of the user
   * @returns The response from the API
   */
  async addUser(user: User, role: Roles): Promise<AddUserResponse> {
    const roleId = await this.identityService.fetchRoleId(role);

    const response = await this.post(API_ENDPOINTS.appManagement.users.add, {
      data: {
        personal_info: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          timezone_id: user.timezone_id || 17,
          language_id: user.language_id || 1,
          locale_id: user.locale_id || 1,
        },
        role_id: roleId,
        silent_upload: false,
      },
    });

    return await this.parseResponse<AddUserResponse>(response);
  }

  /**
   * Fetches the user id for chat functionality
   * @param firstName - The first name of the user
   * @param lastName - The last name of the user
   * @returns The user id for chat
   */
  async getChatUserId(firstName: string, lastName: string): Promise<string> {
    let userId: string = '';
    await test.step(`Fetch the chat user id of the user ${firstName} ${lastName}`, async () => {
      const response = await this.get(
        API_ENDPOINTS.appManagement.users.getUserId(firstName, lastName)
      );
      const responseJson = await this.parseResponse<SearchUserResponse>(response);
      expect(
        responseJson.result.records.length,
        `Expecting user ${firstName} ${lastName} to be found`
      ).toBeGreaterThan(0);
      userId = responseJson.result.records[0].id;
    });
    return userId;
  }

  /**
   * Waits for the user with the given first name and last name to be added to the system
   * @param firstName - The first name of the user
   * @param lastName - The last name of the user
   */
  async waitForUserToBeAdded(firstName: string, lastName: string): Promise<void> {
    await test.step(`Wait for user ${firstName} ${lastName} to be added to the system`, async () => {
      await expect(async () => {
        const response = await this.get(
          API_ENDPOINTS.appManagement.users.getUserId(firstName, lastName)
        );
        const responseJson = await this.parseResponse<SearchUserResponse>(response);
        expect(
          responseJson.result.records.length,
          `Expecting user ${firstName} ${lastName} to be added`
        ).toBeGreaterThan(0);
      }).toPass({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Activates a user by setting their password
   * @param firstName - The first name of the user
   * @param lastName - The last name of the user
   * @returns Promise<void>
   */
  async activateUser(
    firstName: string,
    lastName: string,
    password = 'Simpplr@2025'
  ): Promise<void> {
    await this.waitForUserToBeAdded(firstName, lastName);
    const userId = await this.identityService.getIdentityUserId(firstName, lastName);
    const roleId = await this.identityService.fetchRoleId(Roles.END_USER);

    await test.step(`Activate user ${firstName} ${lastName}`, async () => {
      const response = await this.post(`/v1/identity/internal/accounts/users/${userId}/password`, {
        data: {
          password: password,
        },
        headers: {
          'x-smtip-tid': process.env.ORG_ID!,
          'x-smtip-uid': userId,
          'x-smtip-tenant-user-role': roleId.toString(),
        },
        useInternalBackendUrl: true,
        timeout: 50_000,
      });
      await this.validateResponse(response);
    });
  }
}
