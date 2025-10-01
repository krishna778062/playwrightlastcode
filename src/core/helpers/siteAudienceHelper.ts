import { test } from '@playwright/test';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { IdentityService } from '@/src/core/api/services/IdentityService';

export class SiteAudienceHelper {
  constructor(private identity: IdentityService) {}

  /**
   * Find first available audience from any category (excluding 'Site' category)
   */
  async findFirstAvailableAudience(): Promise<string | null> {
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
            return audiences[0].data.name;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding first available audience:', error);
      return null;
    }
  }

  /**
   * Get an existing audience name for site creation.
   * Returns the first available audience or null if none exist.
   */
  async getAudienceName(): Promise<string | null> {
    try {
      return await this.findFirstAvailableAudience();
    } catch (error) {
      console.error('Error getting audience name:', error);
      throw new Error(`Failed to get audience: ${error}`);
    }
  }

  /**
   * Create a new audience for site creation.
   * Creates a new category and audience with default attributes.
   */
  async createAudienceName(): Promise<string> {
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

      return audienceName;
    } catch (error) {
      console.error('Error creating audience name:', error);
      throw new Error(`Failed to create audience: ${error}`);
    }
  }
}
