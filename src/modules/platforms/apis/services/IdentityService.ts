// external imports
import { APIRequestContext, expect, test } from '@playwright/test';

// @core imports
import { Roles } from '@core/constants/roles';
import {
  audienceCreationResponse,
  IdentityAudienceSearchResponse,
  ListAudiencesResponse,
} from '@core/types/audience.type';
import { PeopleListResponse } from '@core/types/people.type';
import { IdentityUserSearchResponse } from '@core/types/user.type';

import { HttpClient } from '@/src/core/api/clients/httpClient';
// @/src imports
import { audienceCreationParams } from '@/src/core/types/audience.type';
import { IIdentityAdminOperations } from '@/src/modules/platforms/apis/interfaces/IIdentityOperations';
import { PLATFORM_API_ENDPOINTS as API_ENDPOINTS } from '@/src/modules/platforms/apis/platformApiEndpoints';
import { ACGCreationAPI, ACGCreationResponse } from '@/src/modules/platforms/apis/types/acg';

interface ListRolesResponse {
  status: number;
  message: string;
  result: Array<{
    role_id: number;
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

interface ListOfRolesResponse {
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

export class IdentityService implements IIdentityAdminOperations {
  private httpClient: HttpClient;

  constructor(context: APIRequestContext, baseUrl: string) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  async getListOfAudiences(): Promise<ListAudiencesResponse> {
    let listOfAudiences: ListAudiencesResponse;
    await test.step(`Getting list of audiences`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.listOfAudiences, {
        data: { size: 16, term: '' },
      });
      listOfAudiences = await this.httpClient.parseResponse<ListAudiencesResponse>(response);
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
    const response = await this.httpClient.post(API_ENDPOINTS.appManagement.roles.list);
    const responseJson = await this.httpClient.parseResponse<ListRolesResponse>(response);

    const roleData = responseJson.result.find(r => r.name === role);
    if (!roleData) {
      throw new Error(`Role ${role} not found in fetched list of roles`);
    }

    return roleData.role_id;
  }

  /**
   * Gets the list of roles from identity service
   * @returns Promise<ListRolesResponse> - The roles list response
   */
  async getListOfRoles(): Promise<ListOfRolesResponse> {
    return await test.step('Getting list of roles from identity service', async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.identity.roles, {
        data: {},
      });
      return await this.httpClient.parseResponse<ListOfRolesResponse>(response);
    });
  }

  /**
   * Updates user information in identity service
   * @param userId - The ID of the user to update
   * @param userData - The user data to update
   * @returns Promise<UpdateUserResponse> - The update response
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<UpdateUserResponse> {
    return await test.step(`Updating user ${userId}`, async () => {
      const response = await this.httpClient.put(
        `${API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserId(userId)}`,
        {
          data: userData,
        }
      );
      return await this.httpClient.parseResponse<UpdateUserResponse>(response);
    });
  }

  /**
   * Updates user information with parameterized values
   * @param userId - The ID of the user to update
   * @param firstName - User's first name
   * @param lastName - User's last name
   * @param email - User's email
   * @param department - User's department
   * @param roleId - Primary role ID
   * @param additionalRoleIds - Array of additional role IDs
   * @param timezoneId - Timezone ID (default: 328)
   * @param languageId - Language ID (default: 1)
   * @param localeId - Locale ID (default: 1)
   * @param licenseType - License type (default: "Corporate")
   * @param startDate - Start date (default: "2024-07-22")
   * @returns Promise<UpdateUserResponse> - The update response
   */
  async updateUserWithParams(
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    department: string,
    roleId: string,
    additionalRoleIds: string[] = [],
    timezoneId: number = 328,
    languageId: number = 1,
    localeId: number = 1,
    licenseType: string = 'Corporate',
    startDate: string = '2024-07-22'
  ): Promise<UpdateUserResponse> {
    const userData: UpdateUserRequest = {
      personal_info: {
        first_name: firstName,
        last_name: lastName,
        timezone_id: timezoneId,
        language_id: languageId,
        locale_id: localeId,
        email: email,
        license_type: licenseType,
      },
      work_info: {
        department: department,
        start_date: startDate,
      },
      role_id: roleId,
      additional_role_id: [...additionalRoleIds],
    };

    return await this.updateUser(userId, userData);
  }

  /**
   * Gets user information by user ID
   * @param userId - The ID of the user to retrieve
   * @param parseCustomFields - Whether to parse custom fields (default: true)
   * @returns Promise<GetUserByIdResponse> - The user information response
   */
  async getUserById(userId: string, parseCustomFields: boolean = true): Promise<GetUserByIdResponse> {
    return await test.step(`Getting user by ID: ${userId}`, async () => {
      const response = await this.httpClient.get(
        `${API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersUserId(userId)}?parseCustomFields=${parseCustomFields}`
      );
      return await this.httpClient.parseResponse<GetUserByIdResponse>(response);
    });
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
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersList, {
        data: {
          size: 16,
          sort_by: {
            name: 'created_on',
            order: 'ASC',
          },
          searchTerm: `${firstName} ${lastName}`,
        },
      });
      const responseJson = await this.httpClient.parseResponse<IdentityUserSearchResponse>(response);
      expect(
        responseJson.result.listOfItems.length,
        `Expecting user ${firstName} ${lastName} to be found`
      ).toBeGreaterThan(0);
      userId = responseJson.result.listOfItems[0].user_id;
    });
    return userId;
  }

  /**
   * Creates category with the given name
   * @param name - Name of the category to be created
   * @param options - optional attributes
   */
  async createCategory(name: string, options?: { description: string }): Promise<string> {
    let categoryId = '';
    await test.step(`API Create category: ${name} if not created`, async () => {
      const findCategoryStatus: boolean = await this.findCategory(name, 10000);
      if (!findCategoryStatus) {
        const data: { name: string; description?: string } = {
          name: `${name}`,
        };

        // Only include description if it's provided and not empty
        if (options?.description && options.description.trim() !== '') {
          data.description = options.description;
        }

        const response = await this.httpClient.post(
          API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesCategories,
          {
            data,
          }
        );
        expect(response.status(), `Category created successfully`).toEqual(201);

        // Parse response to get category ID
        const responseJson = await response.json();
        if (responseJson.result?.id) {
          categoryId = responseJson.result.id;
        } else {
          // If ID not in response, fetch it directly
          categoryId = await this.getCategoryId(name, 10000);
        }
      } else {
        categoryId = await this.getCategoryId(name, 10000);
      }
    });
    return categoryId;
  }

  /**
   * Checks wether given category is already present in the tenant
   * @param name - Name of the category
   * @param size - Size of the list to be retrieved
   * @param options - optional attributes
   * @returns - Return boolean value according to the presence/absence of the category
   */
  async findCategory(name: string, size: number, options?: { nextPageToken: number; term: string }): Promise<boolean> {
    const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
      data: {
        nextPageToken: options?.nextPageToken || 0,
        type: 'category',
        size: size,
        term: options?.term || '',
      },
    });
    const responseJson = await this.httpClient.parseResponse<IdentityAudienceSearchResponse>(response);
    let i: number;
    for (i = 0; i < responseJson.result.listOfItems.length; i++) {
      if (responseJson.result.listOfItems[i].data.name == name) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets the category ID for a given category name
   * @param name - Name of the category
   * @param size - Size of the list to be retrieved
   * @param options - optional attributes
   * @returns - Returns the category ID for the given category name
   */
  async getCategoryId(name: string, size: number, options?: { nextPageToken: number; term: string }): Promise<string> {
    let categoryId: string = '';
    await test.step(`Getting category id for ${name}`, async () => {
      let nextPageToken = options?.nextPageToken || 0;
      const maxPages = 20; // Limit to prevent infinite loops
      let currentPage = 0;

      while (currentPage < maxPages) {
        const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
          data: {
            nextPageToken: nextPageToken,
            type: 'category',
            size: size,
            selectedFields: [], // Add this field to match the working curl request
            term: options?.term || '',
          },
        });
        const responseJson = await this.httpClient.parseResponse<IdentityAudienceSearchResponse>(response);

        // Search for the category in current page
        for (let i = 0; i < responseJson.result.listOfItems.length; i++) {
          if (responseJson.result.listOfItems[i].data.name == name) {
            categoryId = responseJson.result.listOfItems[i].data.id;
            return categoryId;
          }
        }

        // Check if there are more pages - increment nextPageToken by size to get next page
        if (responseJson.result.listOfItems.length === size) {
          nextPageToken += size;
          currentPage++;
        } else {
          break;
        }
      }

      if (!categoryId) {
        throw new Error(
          `Category ${name} not found in fetched list of categories after searching ${currentPage + 1} pages`
        );
      }
    });
    return categoryId;
  }

  /**
   * Gets the audience ID for a given audience name
   * @param name - Name of the audience
   * @param size - Size of the list to be retrieved
   * @param categoryid - Parent category id under which audience need to found
   * @returns - Return boolean value according to the presence/absence of the audience under the given category
   */
  async isAudienceCreated(name: string, size: number, categoryid: string): Promise<boolean> {
    await test.step(`Checking if audience ${name} is created under category ${categoryid}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
        data: {
          type: 'category',
          size: size,
          term: name,
          parentCategoryId: categoryid,
        },
      });
      const responseJson = await this.httpClient.parseResponse<IdentityAudienceSearchResponse>(response);
      try {
        //if the list is not empty, check if the audience is present in the list or children list
        for (let i = 0; i < responseJson.result.listOfItems.length; i++) {
          if (responseJson.result.listOfItems[i].data.name == name) {
            return true;
          }
          //if the item has children, check if the audience is present in the children list
          if (responseJson.result.listOfItems[i].children.length > 0) {
            for (let j = 0; j < responseJson.result.listOfItems[i].children.length; j++) {
              if (responseJson.result.listOfItems[i].children[j].data.name == name) {
                return true;
              }
            }
          }
        }
        //if the audience is not present in the list or children list, return false
        return false;
      } catch (error) {
        throw new Error(`Error in finding audience API call for ${name} under category ${categoryid}: ${error}`);
      }
    });
    return false;
  }

  /**
   * Gets the appropriate fieldType for a given attribute
   * @param attribute - The attribute name
   * @returns - The appropriate fieldType
   */
  private getFieldTypeForAttribute(attribute: string): string {
    // Okta group attributes
    if (attribute === 'OKTA_GROUP' || attribute === 'okta_group') {
      return 'oktaGroup';
    }
    // AD group attributes
    if (attribute === 'AD_GROUP' || attribute === 'ad_group') {
      return 'adGroup';
    }
    // Regular attributes (first_name, last_name, country_name, etc.)
    return 'regular';
  }

  /**
   * Creates audience under the given category name
   * @param createAudienceParams - Object containing the audience name, category id, attribute, operator and value
   * @param options - Optional attributes
   * @returns - Return boolean value according to the presence/absence of the audience under the given category
   */
  async createAudience(
    createAudienceParams: audienceCreationParams,
    options?: { type: string; fieldType: string; sourceType?: string }
  ): Promise<string> {
    const isAudienceCreated = await this.isAudienceCreated(
      createAudienceParams.audienceName,
      10000,
      createAudienceParams.categoryId
    );
    if (!isAudienceCreated) {
      let audienceId = '';
      await test.step(`Creating audience ${createAudienceParams.audienceName} under category ${createAudienceParams.categoryId}`, async () => {
        const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiences, {
          data: {
            name: createAudienceParams.audienceName,
            type: options?.type || 'mixed',
            audienceRule: {
              AND: [
                {
                  AND: [
                    {
                      values: [
                        {
                          value: createAudienceParams.value,
                        },
                      ],
                      attribute: createAudienceParams.attribute,
                      operator: createAudienceParams.operator,
                      fieldType: options?.fieldType || this.getFieldTypeForAttribute(createAudienceParams.attribute),
                    },
                  ],
                },
              ],
            },
            sourceType: options?.sourceType || 'app_managed',
            categoryId: createAudienceParams.categoryId,
          },
        });
        expect(response.status(), `Audience created successfully`).toEqual(201);
        const responseJson = await this.httpClient.parseResponse<audienceCreationResponse>(response);
        audienceId = responseJson.result.audienceId;
      });
      return audienceId;
    } else {
      return '';
    }
  }

  /**
   * Deletes a category with the given categoryId
   * Checks for attached audiences and handles them appropriately
   * @param categoryId - Category ID for the category to be deleted
   * @param options - Optional parameters for deletion behavior
   */
  async deleteCategoryById(categoryId: string, options?: { forceDelete?: boolean }): Promise<void> {
    await test.step(`Deleting category with category ID: ${categoryId}`, async () => {
      // First, check if category has any audiences attached
      const hasAttachedAudiences = await this.checkCategoryHasAudiences(categoryId);

      if (hasAttachedAudiences && !options?.forceDelete) {
        return;
      }

      if (hasAttachedAudiences && options?.forceDelete) {
      }

      const response = await this.httpClient.delete(
        API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesCategories + '/' + categoryId
      );
      expect(response.status(), 'Category deleted successfully').toEqual(200);
    });
  }

  /**
   * Checks if a category has any audiences attached to it
   * @param categoryId - Category ID to check
   * @returns Promise<boolean> - true if category has audiences, false otherwise
   */
  private async checkCategoryHasAudiences(categoryId: string): Promise<boolean> {
    try {
      // Query hierarchy endpoint to get category list with hasAudience flag
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
        data: {
          nextPageToken: 0,
          type: 'category',
          size: 100, // Get enough categories to find ours
          term: '',
        },
      });

      const responseJson = await this.httpClient.parseResponse<IdentityAudienceSearchResponse>(response);

      // Find the specific category by ID and check its hasAudience flag
      const category = responseJson.result.listOfItems.find(
        item => item.type === 'category' && item.data.id === categoryId
      );

      if (category) {
        return category.hasAudience || false;
      }

      // If category not found in first page, it might be on subsequent pages
      // For now, assume safe to delete if not found
      return false;
    } catch {
      // If we can't check, assume it's safe to delete (fallback behavior)
      return false;
    }
  }

  /**
   * Polls the delete API for the audience with the given audienceId until we get 200 response
   * @param audienceId - Audience Id for the audience which will be deleted
   */
  async deleteAudience(audienceId: string): Promise<void> {
    await test.step(`Deleting audience with audience Id: ${audienceId}`, async () => {
      await expect(async () => {
        const response = await this.httpClient.delete(
          API_ENDPOINTS.appManagement.identity.v2IdentityAudiences + '/' + audienceId
        );
        expect(response.status(), 'Audience deleted successfully').toEqual(200);
      }, `Polling delete API for audience with audienceId: ${audienceId} until we get 200 response`).toPass({
        timeout: 10000,
        intervals: [1000, 4000, 7000, 10000],
      });
    });
  }

  /**
   * Deletes an ACG with the given name
   * @param acgName - Name of the ACG to be deleted
   */
  async deleteACGByName(acgName: string): Promise<void> {
    await test.step(`Deleting ACG with name: ${acgName}`, async () => {
      //first get the acg id
      const acgId = await this.getACGId(acgName);
      const response = await this.httpClient.delete(
        API_ENDPOINTS.appManagement.identity.deleteAccessControlGroup(acgId)
      );
      expect(response.status(), 'ACG deleted successfully').toEqual(200);
    });
  }

  /**
   * Deletes an ACG with the given id
   * @param acgId - Id of the ACG to be deleted
   */
  async deleteACGById(acgId: string): Promise<void> {
    await test.step(`Deleting ACG with id: ${acgId}`, async () => {
      const response = await this.httpClient.delete(
        API_ENDPOINTS.appManagement.identity.deleteAccessControlGroup(acgId)
      );
      expect(response.status(), 'ACG deleted successfully').toEqual(200);
    });
  }

  /**
   * Gets the ACG id for a given ACG name
   * @param acgName - Name of the ACG
   * @returns - Returns the ACG id for the given ACG name
   */
  async getACGId(acgName: string): Promise<string> {
    const listOfACGResponse = await this.getListOfACGs(acgName);
    const listOfACGsJson = await listOfACGResponse.json();
    expect(listOfACGsJson.status, `Expecting status to be successful`).toBe('success');
    expect(listOfACGsJson.result.listOfItems.length, `Expecting list of ACGs to be non-empty`).toBe(1);
    const acgId = listOfACGsJson.result.listOfItems[0].data.id;
    expect(acgId, `Expecting ACG id to be non-empty`).not.toBe('');
    return acgId;
  }

  async getListOfACGs(acgName: string) {
    const payloadToGetListOfACGs = {
      sortBy: 'modified_on',
      sortOrder: 'DESC',
      nextPageToken: '0',
      size: '16',
      term: acgName,
    };
    const listOfACGResponse = await this.httpClient.post(
      API_ENDPOINTS.appManagement.identity.listOfAccessControlGroups,
      {
        data: payloadToGetListOfACGs,
      }
    );
    return listOfACGResponse;
  }
  /**
   * Waits until the ACG is synced
   * @param acgName - Name of the ACG
   */
  async waitUntilACGIsSynced(acgName: string): Promise<void> {
    await test.step(`Waiting for ACG to be synced`, async () => {
      await expect(async () => {
        const listOfACGResponse = await this.getListOfACGs(acgName);
        const listOfACGsJson = await listOfACGResponse.json();
        expect(listOfACGsJson.status, `Expecting status to be successful`).toBe('success');
        expect(listOfACGsJson.result.listOfItems.length, `Expecting list of ACGs to be non-empty`).toBe(1);
        //now check if the acg is synced
        const acgSyncStatus = listOfACGsJson.result.listOfItems[0].data.syncStatus;
        expect(acgSyncStatus, `Expecting ACG sync status to be Synced`).toBe('Synced');
      }, `Polling get list of ACGs API for ACG ${acgName} until we get Synced status`).toPass({
        timeout: 120_000,
        intervals: [
          1000, 4000, 7000, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 110000, 120000,
        ],
      });
    });
  }

  /**
   * Enables loginIdentifiers in the tenant
   * @param identifiers - All the loginIdentifiers that needs to be enabled (for ex. email, mobile, employee number)
   * @param options - Optional parameters for account verification questions. By default department will be set.
   */
  async enableLoginIdentifiers(
    identifiers: string[],
    options?: { accountVerificationQuestion: string[] }
  ): Promise<void> {
    await test.step(`Enabling login identifiers ${identifiers}`, async () => {
      try {
        await expect(
          await this.httpClient.post(API_ENDPOINTS.appManagement.identity.v1AccountSecurityIdpInternal, {
            data: {
              loginIdentifiers: identifiers,
              accountVerificationFields: options?.accountVerificationQuestion || ['department'],
            },
          })
        ).toBeOK();
      } catch (error) {
        // Check if this is a duplicate identifiers error (which means they're likely already enabled)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('duplicate values in selected identifiers')) {
          console.log(
            `Info: Login identifiers ${identifiers.join(', ')} may already be enabled or have duplicate values. Continuing...`
          );
          // Don't throw - this is expected when identifiers are already enabled
          return;
        }
        // Re-throw any other errors
        throw error;
      }
    });
  }

  /**
   * Get all categories using hierarchy API
   * Returns legacy format for backward compatibility with content-abac module
   */
  async getCategories(): Promise<Array<{ type: string; data: { id: string; name: string; description?: string } }>> {
    const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
      data: {
        nextPageToken: 0,
        type: 'category',
        size: 10,
        selectedFields: [],
        term: '',
      },
    });

    const json = await response.json();
    const items = json?.result?.listOfItems || [];

    return items.map((item: any) => ({
      type: 'category',
      data: {
        id: item.id,
        name: item.name,
        description: item.description,
      },
    }));
  }

  /**
   * Get audiences in a specific category using hierarchy API
   * Returns legacy format for backward compatibility with content-abac module
   */
  async getAudiencesInCategory(
    categoryId: string
  ): Promise<Array<{ type: string; data: { id: string; name: string; description?: string } }>> {
    const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
      data: {
        nextPageToken: 0,
        type: 'audience',
        parentCategoryId: categoryId,
        size: 10,
        selectedFields: [],
        term: '',
      },
    });

    const json = await response.json();
    const items = json?.result?.listOfItems || [];

    return items.map((item: any) => ({
      type: 'audience',
      data: {
        id: item.id,
        name: item.name,
        description: item.description,
      },
    }));
  }

  /**
   * Gets the list of people with optional email filtering
   * @param emailId - Optional email address to filter by
   * @returns The people list response
   */
  async getListOfPeople(emailId?: string): Promise<PeopleListResponse> {
    return await test.step(`Getting list of people${emailId ? ` for email: ${emailId}` : ''}`, async () => {
      const requestData = {
        size: 100,
        ...(emailId && { searchTerm: emailId }),
      };

      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersList, {
        data: requestData,
      });
      return await this.httpClient.parseResponse<PeopleListResponse>(response);
    });
  }

  /**
   * Creates ACG with different parameters
   * @param acgCreationParams - ACG creation parameters which contains acgname, feature, target audience, manager audience, admin audience, manager user, admin user, acg status
   * @returns The ACG creation response
   */
  async createACG(acgCreationParams: ACGCreationAPI): Promise<ACGCreationResponse> {
    return await test.step(`Creating ACG with name: ${acgCreationParams.acgName}`, async () => {
      const payloadToCreateACG = {
        controlGroups: [
          {
            admins: {
              audiences: acgCreationParams.adminAudience ?? [],
              users: acgCreationParams.adminUser ?? [],
            },
            managers: {
              audiences: acgCreationParams.managerAudience ?? [],
              users: acgCreationParams.managerUser ?? [],
            },
            targets: {
              audiences: acgCreationParams.targetAudience,
              users: [],
            },
            featureCode: acgCreationParams.feature,
            type: 'Custom',
            name: acgCreationParams.acgName,
            status: acgCreationParams.acgStatus ?? 'Active',
          },
        ],
      };

      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.identity.createAccessControlGroup, {
        data: payloadToCreateACG,
      });
      expect(response.status(), 'ACG created successfully').toBe(201);
      return await this.httpClient.parseResponse<ACGCreationResponse>(response);
    });
  }
}
