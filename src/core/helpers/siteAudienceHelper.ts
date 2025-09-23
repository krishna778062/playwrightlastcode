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
   * Get or create an audience name for site creation.
   * Business logic: Create audience when there are no audience, else use existing.
   */
  async getOrCreateAudienceName(): Promise<string> {
    try {
      // Try to find existing audience first
      const existingAudience = await this.findFirstAvailableAudience();
      if (existingAudience) {
        return existingAudience;
      }

      // Create new audience if none exist
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
      console.error('Error getting or creating audience name:', error);
      throw new Error(`Failed to get or create audience: ${error}`);
    }
  }
}
