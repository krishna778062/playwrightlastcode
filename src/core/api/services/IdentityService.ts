// external imports
import { APIRequestContext, expect, test } from '@playwright/test';

// @core imports
import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { IIdentityAdminOperations } from '@core/api/interfaces/IIdentityOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { Roles } from '@core/constants/roles';
import {
  audienceCreationResponse,
  IdentityAudienceSearchResponse,
  ListAudiencesResponse,
} from '@core/types/audience.type';
import { PeopleListResponse } from '@core/types/people.type';
import { IdentityUserSearchResponse } from '@core/types/user.type';

// @/src imports
import { audienceCreationParams } from '@/src/core/types/audience.type';

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
      const response = await this.post(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersList, {
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
        const data: any = {
          name: `${name}`,
        };

        // Only include description if it's provided and not empty
        if (options?.description && options.description.trim() !== '') {
          data.description = options.description;
        }

        const response = await this.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesCategories, {
          data,
        });
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
        console.log(`Category ${name} already created!!!`);
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
    const response = await this.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
      data: {
        nextPageToken: options?.nextPageToken || 0,
        type: 'category',
        size: size,
        term: options?.term || '',
      },
    });
    const responseJson = await this.parseResponse<IdentityAudienceSearchResponse>(response);
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
      const response = await this.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
        data: {
          nextPageToken: options?.nextPageToken || 0,
          type: 'category',
          size: size,
          term: options?.term || '',
        },
      });
      const responseJson = await this.parseResponse<IdentityAudienceSearchResponse>(response);
      let i: number;
      for (i = 0; i < responseJson.result.listOfItems.length; i++) {
        if (responseJson.result.listOfItems[i].data.name == name) {
          categoryId = responseJson.result.listOfItems[i].data.id;
        }
      }
      if (!categoryId) {
        throw new Error(`Category ${name} not found in fetched list of categories`);
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
      const response = await this.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
        data: {
          type: 'category',
          size: size,
          term: name,
          selectedFields: [
            {
              key: 'audienceCategory',
              value: [categoryid],
            },
          ],
        },
      });
      const responseJson = await this.parseResponse<IdentityAudienceSearchResponse>(response);
      try {
        //if the list is not empty, check if the audience is present in the list or children list
        if (responseJson.result.listOfItems.length > 0) {
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
        } else {
          return false;
        }
      } catch (error) {
        throw new Error(`Error in finding audience API call for ${name} under category ${categoryid}: ${error}`);
      }
    });
    return false;
  }

  /**
   * Creates audience under the given category name
   * @param createAudienceParams - Object containing the audience name, category id, attribute, operator and value
   * @param options - Optional attributes
   * @returns - Return boolean value according to the presence/absence of the audience under the given category
   */
  async createAudience(
    createAudienceParams: audienceCreationParams,
    options?: { type: string; fieldType: string }
  ): Promise<string> {
    const isAudienceCreated = await this.isAudienceCreated(
      createAudienceParams.audienceName,
      10000,
      createAudienceParams.categoryId
    );
    if (!isAudienceCreated) {
      let audienceId = '';
      await test.step(`Creating audience ${createAudienceParams.audienceName} under category ${createAudienceParams.categoryId}`, async () => {
        const response = await this.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiences, {
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
                      fieldType: options?.fieldType || 'regular',
                    },
                  ],
                },
              ],
            },
            categoryId: createAudienceParams.categoryId,
          },
        });
        expect(response.status(), `Audience created successfully`).toEqual(201);
        const responseJson = await this.parseResponse<audienceCreationResponse>(response);
        console.log(`Audience created: ${createAudienceParams.audienceName}`);
        audienceId = responseJson.result.audienceId;
      });
      return audienceId;
    } else {
      console.log(
        `Audience ${createAudienceParams.audienceName} already created under category ${createAudienceParams.categoryId}!!!`
      );
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
        console.warn(`Category ${categoryId} has audiences attached. Skipping deletion to maintain data integrity.`);
        console.warn(`Use { forceDelete: true } option if you want to delete anyway.`);
        return;
      }

      if (hasAttachedAudiences && options?.forceDelete) {
        console.warn(`Force deleting category ${categoryId} despite having attached audiences.`);
      }

      const response = await this.delete(
        API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesCategories + '/' + categoryId
      );
      expect(response.status(), 'Category deleted successfully').toEqual(200);
      console.log(`Category with categoryId: ${categoryId} is deleted`);
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
      const response = await this.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
        data: {
          nextPageToken: 0,
          type: 'category',
          size: 100, // Get enough categories to find ours
          term: '',
        },
      });

      const responseJson = await this.parseResponse<IdentityAudienceSearchResponse>(response);

      // Find the specific category by ID and check its hasAudience flag
      const category = responseJson.result.listOfItems.find(
        item => item.type === 'category' && item.data.id === categoryId
      );

      if (category) {
        return category.hasAudience || false;
      }

      // If category not found in first page, it might be on subsequent pages
      // For now, assume safe to delete if not found
      console.warn(`Category ${categoryId} not found in hierarchy response. Assuming safe to delete.`);
      return false;
    } catch (error) {
      console.warn(`Could not check audiences for category ${categoryId}:`, error);
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
        const response = await this.delete(API_ENDPOINTS.appManagement.identity.v2IdentityAudiences + '/' + audienceId);
        expect(response.status(), 'Audience deleted successfully').toEqual(200);
        console.log(`Audience with audienceId: ${audienceId} is deleted`);
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
      console.log(`ACG id for ACG ${acgName} is ${acgId}`);
      const response = await this.delete(API_ENDPOINTS.appManagement.identity.deleteAccessControlGroup(acgId));
      expect(response.status(), 'ACG deleted successfully').toEqual(200);
      console.log(`ACG with name: ${acgName} is deleted`);
    });
  }

  /**
   * Deletes an ACG with the given id
   * @param acgId - Id of the ACG to be deleted
   */
  async deleteACGById(acgId: string): Promise<void> {
    await test.step(`Deleting ACG with id: ${acgId}`, async () => {
      const response = await this.delete(API_ENDPOINTS.appManagement.identity.deleteAccessControlGroup(acgId));
      expect(response.status(), 'ACG deleted successfully').toEqual(200);
      console.log(`ACG with id: ${acgId} is deleted`);
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
    const listOfACGResponse = await this.post(API_ENDPOINTS.appManagement.identity.listOfAccessControlGroups, {
      data: payloadToGetListOfACGs,
    });
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
        timeout: 40_000,
        intervals: [1000, 4000, 7000, 10000, 20000, 30000, 40000],
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
      await expect(
        await this.post(API_ENDPOINTS.appManagement.identity.v1AccountSecurityIdpInternal, {
          data: {
            loginIdentifiers: identifiers,
            accountVerificationFields: options?.accountVerificationQuestion || ['department'],
          },
        })
      ).toBeOK();
    });
  }

  /**
   * Get all categories using hierarchy API
   */
  async getCategories(): Promise<any[]> {
    const response = await this.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
      data: {
        nextPageToken: 0,
        type: 'category',
        size: 10,
        selectedFields: [],
        term: '',
      },
    });

    const json = await response.json();
    return json?.result?.listOfItems || [];
  }

  /**
   * Get audiences in a specific category using hierarchy API
   */
  async getAudiencesInCategory(categoryId: string): Promise<any[]> {
    const response = await this.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
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
    return json?.result?.listOfItems || [];
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

      const response = await this.post(API_ENDPOINTS.appManagement.users.v1IdentityAccountsUsersList, {
        data: requestData,
      });
      return await this.parseResponse<PeopleListResponse>(response);
    });
  }

  /**
   * Wait for audience hierarchy API response when performing an action
   */
  async waitForAudienceHierarchyResponse(page: any, action: () => Promise<void>): Promise<void> {
    await test.step('Wait for audience hierarchy API response', async () => {
      const responsePromise = page.waitForResponse(
        (response: any) =>
          response.url().includes(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        { timeout: 10_000 }
      );

      await action();
      await responsePromise;
    });
  }
}
