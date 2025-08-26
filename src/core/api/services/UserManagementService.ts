import { APIRequestContext, expect, test } from '@playwright/test';

import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { IUserManagementOperations } from '@core/api/interfaces/IUserManagementOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { Roles } from '@core/constants/roles';
import { TIMEOUTS } from '@core/constants/timeouts';
import { AddUserResponse } from '@core/types/group.type';
import { IdentityUserInfoResponse, IdentityUserSearchResponse, SearchUserResponse, User } from '@core/types/user.type';

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
   * Adds a user to the system
   * @param user - The user to add
   * @param role - The role of the user
   * @returns The response from the API
   */
  async addUserIfNotAddedAlready(user: User, role: Roles): Promise<void> {
    let data: any;
    let loginIdentifier: any;
    const defaultTimezoneId: number = 17;
    const defaultLanguageId: number = 1;
    const defaultLocaleId: number = 1;
    const roleId = await this.identityService.fetchRoleId(role);
    const personal_info: any = {
      first_name: user.first_name,
      last_name: user.last_name,
      timezone_id: user.timezone_id || defaultTimezoneId,
      language_id: user.language_id || defaultLanguageId,
      locale_id: user.locale_id || defaultLocaleId,
    };

    if (user.email && !user.mobile && !user.emp) {
      loginIdentifier = personal_info.email = user.email;

      data = {
        personal_info: personal_info,
        role_id: roleId,
        silent_upload: false,
      };
    } else if (!user.email && user.mobile && !user.emp) {
      loginIdentifier = personal_info.mobile = user.mobile;

      await this.identityService.enableLoginIdentifiers(['email', 'mobile', 'employee_number']);

      data = {
        personal_info: personal_info,
        role_id: roleId,
        silent_upload: false,
      };
    } else if (!user.email && !user.mobile && user.emp) {
      await this.identityService.enableLoginIdentifiers(['email', 'mobile', 'employee_number']);
      loginIdentifier = user.emp;

      data = {
        personal_info: personal_info,
        role_id: roleId,
        silent_upload: false,
        work_info: {
          employee_number: user.emp,
        },
      };
    } else if (!user.email && !user.mobile && !user.emp) {
      throw new Error('User must have valid login identifier: email, mobile and employee number');
    }

    if (!(await this.checkUserPresence(loginIdentifier))) {
      await this.post(API_ENDPOINTS.appManagement.users.add, {
        data: data,
      });
    } else {
      console.log(`User with loginIdentifier ${loginIdentifier} already exist in the tenant`);
    }
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
      const response = await this.get(API_ENDPOINTS.appManagement.users.getUserId(firstName, lastName));
      const responseJson = await this.parseResponse<SearchUserResponse>(response);
      expect(responseJson.result.records.length, `Expecting user ${firstName} ${lastName} to be found`).toBeGreaterThan(
        0
      );
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
        const response = await this.get(API_ENDPOINTS.appManagement.users.getUserId(firstName, lastName));
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
  async activateUser(firstName: string, lastName: string, password = 'Simpplr@2025'): Promise<void> {
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

  /**
   * Checks user presence in the tenant
   * @param searchValue - The searchValue
   */
  async checkUserPresence(searchValue: string, options?: { name: string; order: string }): Promise<boolean> {
    let flag: boolean = false;
    await test.step(`Search for user having ${searchValue} as one of the login identifiers`, async () => {
      const response = await this.post(API_ENDPOINTS.appManagement.users.list, {
        data: {
          size: 100,
          sort_by: {
            name: options?.name || 'full_name',
            order: options?.order || 'ASC',
          },
          searchTerm: searchValue,
        },
      });
      const responseJson = await this.parseResponse<IdentityUserSearchResponse>(response);
      if (responseJson.result.totalCount == 0) {
        console.log(`No user found for search value: ${searchValue}`);
        flag = false;
      } else if (responseJson.result.totalCount == 1) {
        console.log(`One user found for search value: ${searchValue}`);
        flag = true;
      } else if (responseJson.result.totalCount > 1) {
        console.log(`Multiple users found for search value: ${searchValue}`);
        flag = false;
      }
    });
    return flag;
  }

  /**
   * Updates the primary role of the user
   * @param loginIdentifier - LoginIdentifier of the user whose primary role needs to be changed
   * @param newprimaryRole - New primary role that need to be assigned
   */
  async updatePrimaryRole(loginIdentifier: string, newPrimaryRole: string, options?: { abac: boolean }): Promise<void> {
    await test.step(`Updating primary role for the user with login identifier ${loginIdentifier} as ${newPrimaryRole}`, async () => {
      const userId: string = await this.getUserId(loginIdentifier);
      const userInfoResponseJson: IdentityUserInfoResponse = await this.getUserInfo(userId);
      delete userInfoResponseJson.work_info.work_info_id;
      if (options?.abac == true) {
        delete userInfoResponseJson.additional_role_id;
      }
      userInfoResponseJson.role_id = newPrimaryRole;
      await expect(
        await this.put(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserId(userId), {
          data: userInfoResponseJson,
        })
      ).toBeOK();
    });
  }

  /**
   * Gets user id
   * @param loginIdentifier - LoginIdentifier of the user whose primary role needs to be changed
   */
  async getUserId(loginIdentifier: string, options?: { name: string; order: string }): Promise<string> {
    let result: string = '';
    const defaultName: string = 'full_name';
    const defaultOrder: string = 'ASC';
    await test.step(`Getting userId for the user with login identifier ${loginIdentifier}`, async () => {
      const response = await this.post(API_ENDPOINTS.appManagement.users.list, {
        data: {
          size: 100,
          sort_by: {
            name: options?.name || defaultName,
            order: options?.order || defaultOrder,
          },
          searchTerm: loginIdentifier,
        },
      });
      const responseJson = await this.parseResponse<IdentityUserSearchResponse>(response);
      if (responseJson.result.totalCount == 1) {
        result = responseJson.result.listOfItems[0].user_id;
      } else {
        throw Error(`Didn't get single result for searchValue ${loginIdentifier}`);
      }
    });
    return result;
  }

  /**
   * Gets user details for the user with given login identifier from user search list
   * @param loginIdentifier - LoginIdentifier of the user whose primary role needs to be changed
   */
  async getUserDetailsFromUserSearchList(
    loginIdentifier: string,
    options?: { name: string; order: string }
  ): Promise<IdentityUserSearchResponse> {
    let responseJson: any;
    await test.step(`Getting user details from user search list for search value: ${loginIdentifier}`, async () => {
      const response = await this.post(API_ENDPOINTS.appManagement.users.list, {
        data: {
          size: 100,
          sort_by: {
            name: options?.name || 'full_name',
            order: options?.order || 'ASC',
          },
          searchTerm: loginIdentifier,
        },
      });
      responseJson = await this.parseResponse<IdentityUserSearchResponse>(response);
    });
    return responseJson;
  }

  /**
   * Gets user info
   * @param userId - UserId of the user whose information need to be retrieved
   */
  async getUserInfo(userId: string): Promise<IdentityUserInfoResponse> {
    let responseJson: any;
    await test.step(`Getting user information for the user with userId: ${userId}`, async () => {
      const response = await this.get(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserId(userId));
      responseJson = await this.parseResponse<IdentityUserInfoResponse>(response);
    });
    return responseJson;
  }

  /**
   * Gets user info
   * @param userId - UserId of the user whose information need to be retrieved
   * @param newStatus - New status to te updated for the user
   */
  async updateUserStatus(userId: string, newStatus: string): Promise<void> {
    await test.step(`Updating user status for the user with userId: ${userId}`, async () => {
      await this.put(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserIdStatus(userId), {
        data: {
          status: newStatus,
        },
      });
    });
  }
}
