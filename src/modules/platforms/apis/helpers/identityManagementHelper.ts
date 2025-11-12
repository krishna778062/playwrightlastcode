import { APIRequestContext } from '@playwright/test';

import { Roles } from '../../../../core/constants/roles';

import { Person } from '@/src/core/types/people.type';
import { IdentityService } from '@/src/modules/platforms/apis/services/IdentityService';

interface ListRolesResponse {
  status: number;
  message: string;
  result: Array<{
    role_id: string;
    name: string;
    description: string;
    type: string;
    is_editable: boolean;
    scope: string | null;
    is_applicable: boolean;
    assignment_type: string;
    account_id: string;
    metadata: any;
    created_on: string;
    modified_on: string | null;
    count: string;
  }>;
}

interface UpdateUserRequest {
  personal_info: {
    first_name: string;
    last_name: string;
    timezone_id: number;
    language_id: number;
    locale_id: number;
    email: string;
    license_type: string;
  };
  work_info: {
    department: string;
    start_date: string;
  };
  role_id: string;
  additional_role_id: string[];
}

interface UpdateUserResponse {
  result: {
    user_id: string;
  };
  message: string;
}

interface GetUserByIdResponse {
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    timezone_id: number;
    language_id: number;
    locale_id: number;
    license_type: string;
  };
  work_info: {
    work_info_id: string;
    department: string;
    start_date: string;
  };
  role_id: string;
  additional_role_id: string[];
}

export class IdentityManagementHelper {
  public identityService: IdentityService;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.identityService = new IdentityService(apiRequestContext, baseUrl);
  }

  /**
   * Gets the list of people (alias for getListOfPeople)
   * @param searchTerm - Optional search term to filter by
   * @returns The people list response
   */
  async getPeopleList(searchTerm?: string) {
    return await this.identityService.getListOfPeople(searchTerm);
  }

  /**
   * Gets complete user information by email address (optimized single API call)
   * @param email - The email address to search for
   * @returns Promise<{userId: string, fullName: string, user: Person}> - Complete user info
   */
  async getUserInfoByEmail(email: string): Promise<{ userId: string; fullName: string; user: Person }> {
    const peopleListResponse = await this.identityService.getListOfPeople(email);
    const user = peopleListResponse.result.listOfItems.find(item => item.email === email);
    if (!user) {
      throw new Error(`Failed to get user info for email: ${email}`);
    }
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return {
      userId: user.user_id,
      fullName,
      user,
    };
  }

  /**
   * Gets the list of roles from identity service
   * @returns Promise<ListRolesResponse> - The roles list response
   */
  async getListOfRoles(roleName: Roles): Promise<string> {
    console.log('Getting list of roles from identity service');
    const rolesResponse = await this.identityService.getListOfRoles();
    const endUserRoleId = rolesResponse.result.find(role => role.name === roleName)?.role_id;
    if (!endUserRoleId) {
      throw new Error(`Role ${Roles.UNLISTED_SITES_MANAGER} not found in fetched list of roles`);
    }
    return endUserRoleId;
  }

  /**
   * Updates user information in identity service
   * @param userId - The ID of the user to update
   * @param userData - The user data to update
   * @returns Promise<UpdateUserResponse> - The update response
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<UpdateUserResponse> {
    return await this.identityService.updateUser(userId, userData);
  }

  /**
   * Gets user information by user ID
   * @param userId - The ID of the user to retrieve
   * @param parseCustomFields - Whether to parse custom fields (default: true)
   * @returns Promise<GetUserByIdResponse> - The user information response
   */
  async getUserById(userId: string, parseCustomFields: boolean = true): Promise<GetUserByIdResponse> {
    return await this.identityService.getUserById(userId, parseCustomFields);
  }

  /**
   * Updates user with additional roles by getting current user data first
   * @param userId - The ID of the user to update
   * @param additionalRoleIds - Array of additional role IDs to add or remove
   * @param addRole - Flag to add (true) or remove (false) roles from additional roles
   * @returns Promise<UpdateUserResponse> - The update response
   */
  async updateUserWithAdditionalRoles(
    userId: string,
    additionalRoleIds: string[],
    addRole: boolean = true
  ): Promise<UpdateUserResponse> {
    // First get the current user data
    const userData = await this.getUserById(userId);

    // Add or remove roles based on the flag
    if (addRole) {
      // Add existing additional role IDs to the new ones
      additionalRoleIds = [...userData.additional_role_id, ...additionalRoleIds];
    } else {
      // Remove the specified role IDs from existing additional roles
      additionalRoleIds = userData.additional_role_id.filter(roleId => !additionalRoleIds.includes(roleId));
    }

    // Create update payload with existing data and combined additional roles
    const updatePayload: UpdateUserRequest = {
      personal_info: {
        first_name: userData.personal_info.first_name,
        last_name: userData.personal_info.last_name,
        timezone_id: userData.personal_info.timezone_id,
        language_id: userData.personal_info.language_id,
        locale_id: userData.personal_info.locale_id,
        email: userData.personal_info.email,
        license_type: userData.personal_info.license_type,
      },
      work_info: {
        department: userData.work_info.department,
        start_date: userData.work_info.start_date,
      },
      role_id: userData.role_id,
      additional_role_id: additionalRoleIds,
    };

    // Update the user with the new additional roles
    return await this.updateUser(userId, updatePayload);
  }
}
