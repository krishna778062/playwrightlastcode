import { APIRequestContext, expect, test } from '@playwright/test';

import { Roles } from '@core/constants/roles';
import { TIMEOUTS } from '@core/constants/timeouts';
import { AddUserResponse } from '@core/types/group.type';
import {
  IdentityUserInfoResponse,
  IdentityUserSearchResponse,
  IdentityValidateResponse,
  SearchUserResponse,
  User,
  UserWithLicenseAndDepartment,
} from '@core/types/user.type';

import { IdentityService } from './IdentityService';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { getInternalBackendUrl } from '@/src/core/utils/urlUtils';
import { IUserManagementOperations } from '@/src/modules/platforms/apis/interfaces/IUserManagementOperations';
import { PLATFORM_API_ENDPOINTS as API_ENDPOINTS } from '@/src/modules/platforms/apis/platformApiEndpoints';

export class UserManagementService implements IUserManagementOperations {
  public httpClient: HttpClient;
  public identityService: IdentityService;

  private defaultSize: number = 16;
  private defaultName: string = 'full_name';
  private defaultOrder: string = 'ASC';
  private defaultTimezoneId: number = 17;
  private defaultLanguageId: number = 1;
  private defaultLocaleId: number = 1;
  private defaultDepartment: string = 'Product';

  constructor(
    context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
    this.identityService = new IdentityService(context, baseUrl);
  }

  /**
   * Get ORG_ID dynamically from frontline config if available, otherwise fall back to process.env
   * This allows tenant-specific ORG_ID without manual process.env updates
   */
  private getOrgId(): string {
    // Try to get ORG_ID from frontline config (if module is frontline)
    try {
      // Dynamic import to avoid circular dependencies
      const frontlineConfigPath = '@/src/modules/frontline/config/frontlineConfig';

      const { getFrontlineTenantConfigFromCache } = require(frontlineConfigPath);
      const config = getFrontlineTenantConfigFromCache();
      if (config?.orgId) {
        console.log(`🔧 Using ORG_ID from frontline config: ${config.orgId}`);
        return config.orgId;
      }
    } catch (error) {
      // Frontline config not available (other modules) - fall back to process.env
    }

    // Fall back to process.env for other modules
    if (!process.env.ORG_ID) {
      throw new Error('ORG_ID not found in frontline config or process.env');
    }
    console.log(`🔧 Using ORG_ID from process.env: ${process.env.ORG_ID}`);
    return process.env.ORG_ID;
  }

  /**
   * Adds a user to the system
   * @param user - The user to add
   * @param role - The role of the user
   * @returns The response from the API
   */
  async addUser(user: User, role: Roles): Promise<AddUserResponse> {
    const roleId = await this.identityService.fetchRoleId(role);

    const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.add, {
      data: {
        personal_info: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          timezone_id: user.timezone_id || this.defaultTimezoneId,
          language_id: user.language_id || this.defaultLanguageId,
          locale_id: user.locale_id || this.defaultLocaleId,
        },
        role_id: roleId,
        silent_upload: false,
      },
    });

    return await this.httpClient.parseResponse<AddUserResponse>(response);
  }

  async addUserWithEmail(user: UserWithLicenseAndDepartment, role: Roles): Promise<AddUserResponse> {
    const roleId = await this.identityService.fetchRoleId(role);

    // Build personal_info object, only including email/mobile if they're not empty
    const personal_info: any = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      timezone_id: user.timezone_id || this.defaultTimezoneId,
      language_id: user.language_id || this.defaultLanguageId,
      locale_id: user.locale_id || this.defaultLocaleId,
      license_type: user.license_type || 'Corporate',
    };

    // Only add mobile if it's not 0
    if (user.mobile && user.mobile !== 0) {
      personal_info.mobile = user.mobile;
    }

    // Build the request data
    const data: any = {
      personal_info,
      role_id: roleId,
      silent_upload: false,
    };

    if (user.emp && user.emp.trim() !== '') {
      data.work_info = {
        employee_number: user.emp,
        department: user.department || this.defaultDepartment,
      };
    }

    const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.add, {
      data,
    });

    return await this.httpClient.parseResponse<AddUserResponse>(response);
  }

  async addUserWithEmpIdAndDepartment(user: UserWithLicenseAndDepartment, role: Roles): Promise<AddUserResponse> {
    const roleId = await this.identityService.fetchRoleId(role);

    // Build personal_info object, only including email/mobile if they're not empty
    const personal_info: any = {
      first_name: user.first_name,
      last_name: user.last_name,
      timezone_id: user.timezone_id || this.defaultTimezoneId,
      language_id: user.language_id || this.defaultLanguageId,
      locale_id: user.locale_id || this.defaultLocaleId,
      license_type: user.license_type || 'Corporate',
    };

    // Only add email if it's not empty (API rejects empty strings)
    if (user.email && user.email.trim() !== '') {
      personal_info.email = user.email;
    }

    // Only add mobile if it's not 0
    if (user.mobile && user.mobile !== 0) {
      personal_info.mobile = user.mobile;
    }

    // Build the request data
    const data: any = {
      personal_info,
      role_id: roleId,
      silent_upload: false,
    };

    // Add work_info if employee number is provided
    if (user.emp && user.emp.trim() !== '') {
      data.work_info = {
        employee_number: user.emp,
        department: user.department || this.defaultDepartment,
      };
    }

    const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.add, {
      data,
    });

    return await this.httpClient.parseResponse<AddUserResponse>(response);
  }

  /**
   * Adds a user to the system
   * @param user - The user to add
   * @param role - The role of the user
   * @param options - department - The department of the user
   */
  async addUserIfNotAddedAlready(user: User, role: Roles, options?: { department: string }): Promise<string> {
    let data: any;
    let loginIdentifier: any;
    const roleId = await this.identityService.fetchRoleId(role);
    const personal_info: any = {
      first_name: user.first_name,
      last_name: user.last_name,
      timezone_id: user.timezone_id || this.defaultTimezoneId,
      language_id: user.language_id || this.defaultLanguageId,
      locale_id: user.locale_id || this.defaultLocaleId,
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
          department: options?.department || this.defaultDepartment,
        },
      };
    } else if (!user.email && !user.mobile && !user.emp) {
      throw new Error('User must have valid login identifier: email, mobile and employee number');
    }

    if (!(await this.checkUserPresence(loginIdentifier))) {
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.add, {
        data: data,
      });
      const responseJson = await this.httpClient.parseResponse<AddUserResponse>(response);
      return responseJson.user_id;
    } else {
      console.log(`User with loginIdentifier ${loginIdentifier} already exist in the tenant`);
      return '';
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
      const response = await this.httpClient.get(API_ENDPOINTS.appManagement.users.getUserId(firstName, lastName));
      const responseJson = await this.httpClient.parseResponse<SearchUserResponse>(response);
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
        const response = await this.httpClient.get(API_ENDPOINTS.appManagement.users.getUserId(firstName, lastName));
        const responseJson = await this.httpClient.parseResponse<SearchUserResponse>(response);
        expect(
          responseJson.result.records.length,
          `Expecting user ${firstName} ${lastName} to be added`
        ).toBeGreaterThan(0);
      }).toPass({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Waits for the user with the given first name and last name to be added to the system
   * @param searchTerm - Search value to be used
   */
  async waitForUserToBeAddedInIdentity(
    searchTerm: string,
    options?: { size: number; name: string; order: string }
  ): Promise<void> {
    await test.step(`Wait for user with login identifier ${searchTerm} to be added in identity`, async () => {
      await expect(async () => {
        const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersList, {
          data: {
            size: options?.size || this.defaultSize,
            sort_by: {
              name: options?.name || this.defaultName,
              order: options?.order || this.defaultOrder,
            },
            searchTerm: searchTerm,
          },
        });
        const responseJson = await this.httpClient.parseResponse<IdentityUserSearchResponse>(response);
        expect(
          responseJson.result.listOfItems.length,
          `Expecting user with login identidfier ${searchTerm} to be added`
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
      const internalBackendUrl = getInternalBackendUrl(this.baseUrl);
      console.log('Info: To activate user, we are using the internal backend url: ', internalBackendUrl);
      const response = await this.httpClient.post(
        `${internalBackendUrl}/v1/identity/internal/accounts/users/${userId}/password`,
        {
          data: {
            password: password,
          },
          headers: {
            'x-smtip-tid': this.getOrgId(),
            'x-smtip-uid': userId,
            'x-smtip-tenant-user-role': roleId.toString(),
          },
          timeout: 50_000,
        }
      );
      await this.httpClient.validateResponse(response);
    });
  }

  async activateUserWithEmpIdAndDepartment(
    firstName: string,
    lastName: string,
    password = 'Simpplr@2025'
  ): Promise<void> {
    const userId = await this.identityService.getIdentityUserId(firstName, lastName);
    const roleId = await this.identityService.fetchRoleId(Roles.END_USER);

    await test.step(`Activate user ${firstName} ${lastName}`, async () => {
      const internalBackendUrl = getInternalBackendUrl(this.baseUrl);
      console.log('Info: To activate user, we are using the internal backend url: ', internalBackendUrl);
      const response = await this.httpClient.post(
        `${internalBackendUrl}/v1/identity/internal/accounts/users/${userId}/password`,
        {
          data: {
            password: password,
          },
          headers: {
            'x-smtip-tid': this.getOrgId(),
            'x-smtip-uid': userId,
            'x-smtip-tenant-user-role': roleId.toString(),
          },
          timeout: 50_000,
        }
      );
      await this.httpClient.validateResponse(response);
    });
  }

  /**
   * Checks user presence in the tenant
   * @param searchValue - The searchValue
   */
  async checkUserPresence(searchValue: string, options?: { name: string; order: string }): Promise<boolean> {
    let flag: boolean = false;
    await test.step(`Search for user having ${searchValue} as one of the login identifiers`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersList, {
        data: {
          size: 100,
          sort_by: {
            name: options?.name || this.defaultName,
            order: options?.order || this.defaultOrder,
          },
          searchTerm: searchValue,
        },
      });
      const responseJson = await this.httpClient.parseResponse<IdentityUserSearchResponse>(response);
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

      // Remove work_info_id from the work_info object
      if (userInfoResponseJson.work_info?.work_info_id) {
        delete userInfoResponseJson.work_info.work_info_id;
      }
      if (options?.abac == true) {
        delete userInfoResponseJson.additional_role_id;
      }
      userInfoResponseJson.role_id = newPrimaryRole;
      await expect(
        await this.httpClient.put(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserId(userId), {
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
    await test.step(`Getting userId for the user with login identifier ${loginIdentifier}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersList, {
        data: {
          size: 100,
          sort_by: {
            name: options?.name || this.defaultName,
            order: options?.order || this.defaultOrder,
          },
          searchTerm: loginIdentifier,
        },
      });
      const responseJson = await this.httpClient.parseResponse<IdentityUserSearchResponse>(response);
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
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersList, {
        data: {
          size: 100,
          sort_by: {
            name: options?.name || this.defaultName,
            order: options?.order || this.defaultOrder,
          },
          searchTerm: loginIdentifier,
        },
      });
      responseJson = await this.httpClient.parseResponse<IdentityUserSearchResponse>(response);
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
      const response = await this.httpClient.get(
        API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserId(userId)
      );
      responseJson = await this.httpClient.parseResponse<IdentityUserInfoResponse>(response);
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
      await this.httpClient.put(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserIdStatus(userId), {
        data: {
          status: newStatus,
        },
      });
    });
  }

  /**
   * Registers the user in the system with taking default verification question field as department and value as Product.
   * @param loginIdentifier - LoginIdentifier of the user to be registered
   * @param password - password to be set for the user
   * @param options - options to be used for the registration
   */
  async registerUser(
    loginIdentifier: string,
    options?: { verificationQuestionField: string; verificationQuestionValue: string; password: string }
  ): Promise<void> {
    await test.step(`Registering the user with login identifier: ${loginIdentifier}`, async () => {
      const validateResponse = await this.validateUser(loginIdentifier);
      expect(
        validateResponse.status(),
        `Validate api with login identifier ${loginIdentifier} successfully executed`
      ).toBe(200);
      const validateResponseJson = await this.httpClient.parseResponse<IdentityValidateResponse>(validateResponse);
      let token = validateResponseJson.result.token;
      const isFirstLogin = validateResponseJson.result.firstLogin;
      const isSSO = validateResponseJson.result.sso;
      const identifierType = validateResponseJson.result.identifierType;

      // If the user is non sso user and logging in for the first time then only we need to register the user and set the password
      if (isFirstLogin && !isSSO) {
        // If the identifier type is alternate then we need to verify the profile questions
        if (identifierType === 'alternate') {
          // Answer the verification question
          const profileQuestionsVerifyResponse = await this.answerProfileQuestionsDuringRegistration(token, {
            verificationQuestionField: options?.verificationQuestionField || '',
            verificationQuestionValue: options?.verificationQuestionValue || '',
          });
          expect(
            profileQuestionsVerifyResponse.status(),
            `Verification questions for user with login identifier ${loginIdentifier} has been set`
          ).toBe(200);
        }
        const setPasswordResponse = await this.setPasswordDuringRegistration(token);
        expect(setPasswordResponse.status(), `Password has been set for the user`).toBe(201);
        token = await this.getToken(setPasswordResponse);
        const csrfid = await this.getCsrfid(setPasswordResponse);

        const securityQuestionsResponse = await this.setSecurityQuestionsAfterRegistration(
          `token=${token}; csrfid=${csrfid}`,
          csrfid
        );
        expect(securityQuestionsResponse.status(), `Security questions have been set for the user`).toBe(201);
      }
    });
  }

  /**
   * Validates the user with given login identifier
   * @param loginIdentifier - Given login identifiet for the user to be validated
   * @returns Response of the API
   */
  async validateUser(loginIdentifier: string): Promise<any> {
    return await test.step(`Validating the user with login identifier: ${loginIdentifier}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.identity.validate, {
        data: {
          loginIdentifier: loginIdentifier,
        },
      });
      return response;
    });
  }

  /**
   * Sets security questions for the user after registration
   * @param cookie - Cookie of the user
   * @param csrfid - Csrfid of the user
   * @returns Response of the API
   */
  async setSecurityQuestionsAfterRegistration(cookie: string, csrfid: string): Promise<any> {
    return await test.step(`Setting security questions for the user`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.identity.v2IdentityUsersRegisterProfile, {
        headers: {
          Cookie: cookie,
          'x-smtip-csrfid': csrfid,
        },
        data: {
          answers: [
            {
              questionId: 24409,
              answer: 'monty',
            },
            {
              questionId: 24410,
              answer: 'monty',
            },
            {
              questionId: 24411,
              answer: 'monty',
            },
          ],
        },
      });
      return response;
    });
  }

  /**
   * Sets password for the user during registration
   * @param token - Token of the user
   * @param options - password - Password to be set for the user. Default password is Simp@1234.
   * @returns Response of the API
   */
  async setPasswordDuringRegistration(token: string, options?: { password: string }): Promise<any> {
    const defaultPassword: string = 'Simp@1234';
    return await test.step(`Setting password for the user with token: ${token} and password: ${options?.password || defaultPassword}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.identity.v2IdentityUsersSetPassword, {
        headers: {
          'x-smtip-tsid': token,
        },
        data: {
          password: options?.password || defaultPassword,
        },
      });
      return response;
    });
  }

  /**
   * Answers the user's profile questions during registration
   * @param token - Token of the user
   * @param options - verificationQuestionField - Verification question field which the user needs to answer
   * @param options - verificationQuestionValue - Value of the verification question field which the user needs to answer
   * @returns Response of the API
   */
  async answerProfileQuestionsDuringRegistration(
    token: string,
    options?: {
      verificationQuestionField: string;
      verificationQuestionValue: string;
    }
  ): Promise<any> {
    const defaultVerificationQuestionField: string = 'department';
    const defaultVerificationQuestionValue: string = 'Product';
    return await test.step(`Answering user's profile question for ${options?.verificationQuestionField || defaultVerificationQuestionField} as ${options?.verificationQuestionValue || defaultVerificationQuestionValue}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.identity.v2IdentityProfileQuestionsVerify, {
        headers: {
          'x-smtip-tsid': token,
        },
        data: {
          fields: [
            {
              fieldName: options?.verificationQuestionField || defaultVerificationQuestionField,
              answer: options?.verificationQuestionValue || defaultVerificationQuestionValue,
            },
          ],
        },
      });
      return response;
    });
  }

  /**
   * Gets Token from the response.
   * @param response - Response of API from which token needs to be extracted
   */
  async getToken(response: any): Promise<string> {
    return response.headers()['set-cookie'].split(';')[0].replace('token=', '');
  }

  /**
   * Gets Csrfid from the response.
   * @param response - Response of API from which csrfid needs to be extracted
   */
  async getCsrfid(response: any): Promise<string> {
    return response.headers()['set-cookie'].split('csrfid=')[1].split(';')[0];
  }

  /**
   * Waits for the user with the given first name and last name to be added to the system
   * @param searchTerm - Search value to be used
   */
  async waitForUserRoleToSync(loginIdentifier: string, roleId: string): Promise<void> {
    await test.step(`Wait for user with login identifier ${loginIdentifier} to have role ${roleId} synced`, async () => {
      await expect(async () => {
        const responseJson = await this.getUserInfo(await this.getUserId(loginIdentifier));
        expect(
          responseJson.role_id,
          `Expecting user with login identidfier ${loginIdentifier} to have role ${roleId}`
        ).toEqual(roleId);
      }).toPass({ timeout: TIMEOUTS.MEDIUM });
    });
  }
}
