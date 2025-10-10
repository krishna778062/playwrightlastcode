import { APIRequestContext, test } from '@playwright/test';

import { IdentityService } from '../services/IdentityService';

interface CreatedCategory {
  categoryId: string;
  categoryName: string;
}

/**
 * Helper class for managing audience categories through API operations.
 * Provides methods for creating categories and automatic cleanup.
 */
export class AudienceCategoryManagementHelper {
  private categories: CreatedCategory[] = [];
  public identityService: IdentityService;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.identityService = new IdentityService(apiRequestContext, baseUrl);
  }

  /**
   * Creates a new audience category via API and tracks it for cleanup.
   * @param categoryName - Name of the category to create
   * @param options - Optional category attributes
   * @returns The created category details
   */
  async createCategory(categoryName: string, options?: { description?: string }) {
    return await test.step(`Creating audience category: ${categoryName}`, async () => {
      // Create the category via API and get the ID directly
      // If no options provided, don't pass any description (for "Add description" button to show)
      // If options provided but description is undefined, use default description
      // If options provided with description (even empty), use that description
      const createOptions = !options
        ? undefined
        : {
            description:
              options.description !== undefined
                ? options.description
                : `Test category ${categoryName} created at ${new Date().toISOString()}`,
          };

      const categoryId = await this.identityService.createCategory(categoryName, createOptions);

      const createdCategory = {
        categoryId,
        categoryName,
        description: options?.description,
      };

      // Track for cleanup
      this.categories.push({ categoryId, categoryName });

      console.log(`Category created: ${categoryName} (ID: ${categoryId})`);
      return createdCategory;
    });
  }

  /**
   * Gets all categories created by this helper instance.
   * @returns Array of created categories
   */
  getAllCreatedCategories(): CreatedCategory[] {
    return [...this.categories];
  }

  /**
   * Gets the count of categories created by this helper.
   * @returns The number of categories created
   */
  getCategoryCount(): number {
    return this.categories.length;
  }

  /**
   * Registers an existing category for cleanup without creating it.
   * Use this when a category was created through UI interactions rather than API.
   * @param categoryId - ID of the existing category
   * @param categoryName - Name of the existing category
   */
  registerCategoryForCleanup(categoryId: string, categoryName: string): void {
    this.categories.push({ categoryId, categoryName });
    console.log(`Category registered for cleanup: ${categoryName} (ID: ${categoryId})`);
  }

  /**
   * Cleans up all categories created by this helper instance.
   * This should be called in test cleanup to ensure proper resource management.
   */
  async cleanup() {
    await test.step('Cleaning up audience categories', async () => {
      for (const { categoryId, categoryName } of this.categories) {
        try {
          await this.identityService.deleteCategoryById(categoryId);
          console.log(`Deleted category ${categoryName} (${categoryId})`);
        } catch (error) {
          console.warn(`Failed to delete category ${categoryName} (${categoryId}):`, error);
        }
      }

      // Clear the tracking array
      this.categories = [];
    });
  }
}
