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
  }

  /**
   * Cleans up all categories created by this helper instance.
   * This should be called in test cleanup to ensure proper resource management.
   */
  async cleanup() {
    await test.step('Cleaning up audience categories and audiences', async () => {
      // Clean up categories
      for (const { categoryId, categoryName: _categoryName } of this.categories) {
        try {
          await this.identityService.deleteCategoryById(categoryId, { forceDelete: true });
        } catch {}
      }
      // Clear the tracking arrays
      this.categories = [];
    });
  }

  /**
   * Creates an audience with IS_NOT operator via API
   * @param audienceName - Name of the audience
   * @param categoryId - Parent category ID
   * @param attribute - Attribute type (e.g., 'security', 'OKTA_GROUP', 'BUILT_IN')
   * @param value - Operator value (group ID or value to match against)
   * @param fieldType - Field type ('adGroup', 'oktaGroup', 'regular')
   * @param sourceType - Source type ('app_managed', 'user_managed', etc.)
   * @returns The created audience ID
   */
  async createAudienceWithIsNotOperator(
    audienceName: string,
    categoryId: string,
    attribute: string,
    value: string,
    fieldType: string = 'adGroup',
    sourceType: string = 'app_managed'
  ): Promise<string> {
    return await test.step(`Creating audience with IS_NOT operator: ${audienceName}`, async () => {
      const createAudienceParams = {
        audienceName,
        categoryId,
        attribute,
        operator: 'IS_NOT',
        value,
      };
      const options = {
        type: 'mixed',
        fieldType,
        sourceType,
      };
      const audienceId = await this.identityService.createAudience(createAudienceParams, options);
      return audienceId;
    });
  }

  /**
   * Creates an audience with IS operator via API
   * @param audienceName - Name of the audience
   * @param categoryId - Parent category ID
   * @param attribute - Attribute type (e.g., 'security', 'OKTA_GROUP', 'BUILT_IN')
   * @param value - Operator value (group ID or value to match against)
   * @param fieldType - Field type ('adGroup', 'oktaGroup', 'regular')
   * @param sourceType - Source type ('app_managed', 'user_managed', etc.)
   * @returns The created audience ID
   */
  async createAudienceWithIsOperator(
    audienceName: string,
    categoryId: string,
    attribute: string,
    value: string,
    fieldType: string = 'adGroup',
    sourceType: string = 'app_managed'
  ): Promise<string> {
    return await test.step(`Creating audience with IS operator: ${audienceName}`, async () => {
      const createAudienceParams = {
        audienceName,
        categoryId,
        attribute,
        operator: 'IS',
        value,
      };
      const options = {
        type: 'mixed',
        fieldType,
        sourceType,
      };
      const audienceId = await this.identityService.createAudience(createAudienceParams, options);
      return audienceId;
    });
  }

  /**
   * Creates an audience with ALL operator via API
   * @param audienceName - Name of the audience
   * @param categoryId - Parent category ID
   * @param attribute - Attribute type (e.g., 'security', 'OKTA_GROUP', 'BUILT_IN')
   * @param value - Operator value (group ID or value to match against)
   * @param fieldType - Field type ('adGroup', 'oktaGroup', 'regular')
   * @param sourceType - Source type ('app_managed', 'user_managed', etc.)
   * @returns The created audience ID
   */
  async createAudienceWithAllOperator(
    audienceName: string,
    categoryId: string,
    attribute: string,
    value: string,
    fieldType: string = 'adGroup',
    sourceType: string = 'app_managed'
  ): Promise<string> {
    return await test.step(`Creating audience with ALL operator: ${audienceName}`, async () => {
      const createAudienceParams = {
        audienceName,
        categoryId,
        attribute,
        operator: 'ALL',
        value,
      };
      const options = {
        type: 'mixed',
        fieldType,
        sourceType,
      };
      const audienceId = await this.identityService.createAudience(createAudienceParams, options);
      return audienceId;
    });
  }

  /**
   * Creates an audience with CONTAINS operator via API
   * @param audienceName - Name of the audience
   * @param categoryId - Parent category ID
   * @param attribute - Attribute type (e.g., 'COUNTRY')
   * @param value - Operator value
   * @returns The created audience ID
   */
  async createAudienceWithContainsOperator(
    audienceName: string,
    categoryId: string,
    attribute: string = 'COUNTRY',
    value: string = 'India'
  ): Promise<string> {
    return await test.step(`Creating audience with CONTAINS operator: ${audienceName}`, async () => {
      const createAudienceParams = {
        audienceName,
        categoryId,
        attribute,
        operator: 'CONTAINS',
        value,
      };
      const options = {
        type: 'mixed',
        fieldType: 'regular',
      };
      const audienceId = await this.identityService.createAudience(createAudienceParams, options);
      return audienceId;
    });
  }

  /**
   * Creates an audience with ENDS_WITH operator via API
   * @param audienceName - Name of the audience
   * @param categoryId - Parent category ID
   * @param attribute - Attribute type (e.g., 'COUNTRY')
   * @param value - Operator value
   * @returns The created audience ID
   */
  async createAudienceWithEndsWithOperator(
    audienceName: string,
    categoryId: string,
    attribute: string = 'COUNTRY',
    value: string = 'a'
  ): Promise<string> {
    return await test.step(`Creating audience with ENDS_WITH operator: ${audienceName}`, async () => {
      const createAudienceParams = {
        audienceName,
        categoryId,
        attribute,
        operator: 'ENDS_WITH',
        value,
      };
      const options = {
        type: 'mixed',
        fieldType: 'regular',
      };
      const audienceId = await this.identityService.createAudience(createAudienceParams, options);
      return audienceId;
    });
  }
}
