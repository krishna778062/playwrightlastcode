import { APIRequestContext } from '@playwright/test';

import { IdentityService } from '@/src/modules/platforms/apis/services';

export class ABACAudienceHelper {
  readonly identity: IdentityService;
  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.identity = new IdentityService(apiRequestContext, baseUrl);
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
}
