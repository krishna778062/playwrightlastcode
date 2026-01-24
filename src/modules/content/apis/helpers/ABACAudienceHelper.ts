import { APIRequestContext } from '@playwright/test';

import { AudienceRule } from '@/src/core/types/audience.types';
import { AudienceManagementService } from '@/src/modules/content/apis/services/AudienceManagementService';
import { IdentityService } from '@/src/modules/platforms/apis/services';

export class ABACAudienceHelper {
  readonly identity: IdentityService;
  private readonly audienceManagementService: AudienceManagementService;
  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.identity = new IdentityService(apiRequestContext, baseUrl);
    this.audienceManagementService = new AudienceManagementService(apiRequestContext, baseUrl);
  }

  /**
   * Find first available audience from any category (excluding 'Site' category)
   */
  async findFirstAvailableAudience(): Promise<{ audienceName: string; categoryName: string; audienceId: string }> {
    try {
      const categories = await this.identity.getCategories();

      for (const category of categories) {
        if (category?.type === 'category' && category?.data?.id) {
          const categoryId = category.data.id;
          const categoryName = category.data.name;

          // Skip system category 'Site'
          if (categoryName.toLowerCase() === 'site') continue;

          const audiences = await this.identity.getAudiencesInCategory(categoryId);
          if (audiences.length > 0) {
            return {
              audienceName: audiences[0].data.name,
              categoryName: categoryName,
              audienceId: audiences[0].data.id,
            };
          }
        }
      }
    } catch (error) {
      console.error('Error finding first available audience:', error);
      throw new Error('No audience found');
    }
    return await this.createAudienceName();
  }

  /**
   * Create a new audience for site creation.
   * Creates a new category and audience with default attributes.
   */
  async createAudienceName(): Promise<{ audienceName: string; categoryName: string; audienceId: string }> {
    try {
      const categoryName = `Category_${Date.now()}`;
      const audienceName = `Audience_${Date.now()}`;

      const categoryId = await this.identity.createCategory(categoryName);
      await this.identity.createAudience({
        audienceName,
        categoryId,
        attribute: 'first_name',
        operator: 'CONTAINS',
        value: 'e',
      });

      return { audienceName: audienceName, categoryName: categoryName, audienceId: categoryId };
    } catch (error) {
      console.error('Error creating audience name:', error);
      throw new Error(`Failed to create audience: ${error}`);
    }
  }

  async getAudienceDetails(audienceId: string): Promise<any> {
    try {
      // Search for the audience in the list by ID
      const listResponse = await this.identity.getListOfAudiences();
      const audience = listResponse.listOfItems.find(item => item.id === audienceId);
      if (audience) {
        return { result: audience };
      }
      // If not found, return minimal structure
      return { result: { id: audienceId } };
    } catch (error: any) {
      console.error('Error getting audience details:', error);
      throw new Error(`Failed to get audience details: ${error.message}`);
    }
  }
  /**
   * Gets a random audience ID for testing purposes
   * @param size - Number of audiences to fetch (default: 16)
   * @returns Promise<string> - Random audience ID
   * @throws Error if no audiences found
   */
  async getRandomAudienceIdABAC(_size: number = 16): Promise<{
    audienceId: string;
    name: string;
    count: string | number;
    description: string;
    audienceRule: AudienceRule;
    type: string;
  }> {
    const response = await this.audienceManagementService.getAudienceListLarge();
    if (response.result.listOfItems.length === 0) {
      // Create a category first, then create audience
      const categoryName = `Test Category ${Math.random().toString(36).substring(2, 12)}`;
      const categoryId = await this.identity.createCategory(categoryName);

      // Create audience using IdentityService
      const audienceName = `Test Audience ${Math.random().toString(36).substring(2, 12)}`;
      const audienceId = await this.identity.createAudience(
        {
          audienceName: audienceName,
          categoryId: categoryId,
          attribute: 'first_name',
          operator: 'CONTAINS',
          value: 'A',
        },
        {
          type: 'mixed',
          fieldType: 'regular',
        }
      );

      // Get the created audience details
      const audienceDetails = await this.getAudienceDetails(audienceId);
      const usersCount = Array.isArray(audienceDetails?.result?.users)
        ? audienceDetails.result.users.length
        : typeof audienceDetails?.result?.users === 'number'
          ? audienceDetails.result.users
          : 0;
      return {
        audienceId: audienceId,
        name: audienceName,
        count: usersCount,
        description: audienceDetails?.result?.description || '',
        audienceRule: { AND: [] },
        type: audienceDetails?.result?.type || 'mixed',
      };
    }

    // Get a random audience from the list
    const randomIndex = Math.floor(Math.random() * response.result.listOfItems.length);
    const audience = response.result.listOfItems[randomIndex];

    const usersCount = audience.audienceCount || 0;
    return {
      audienceId: audience.audienceId,
      name: audience.name,
      count: usersCount,
      description: audience.description || '',
      audienceRule: { AND: [] },
      type: audience.type || 'mixed',
    };
  }
}
