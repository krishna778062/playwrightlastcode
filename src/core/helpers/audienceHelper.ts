// Owned by site and content team dont make any changes to this file

import { IdentityService } from '@/src/core/api/services/IdentityService';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';

export class AudienceHelper {
  /**
   * Fetch category IDs from hierarchy (type='category'), skipping system category 'Site'.
   */
  static async fetchCategoryIds(
    identity: IdentityService,
    options?: { size?: number; term?: string }
  ): Promise<string[]> {
    const size = options?.size ?? 10;
    const term = (options?.term ?? '').trim();

    // Fire the hierarchy call for categories
    const res = await identity.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
      data: {
        nextPageToken: 0,
        type: 'category',
        size,
        selectedFields: [],
        term,
      },
    });

    let json: any;
    try {
      json = await res.json();
    } catch {
      return [];
    }

    const list: any[] = json?.result?.listOfItems ?? [];
    const categoryIds: string[] = [];

    for (const item of list) {
      if (item?.type === 'category' && item?.data?.id) {
        const name = (item?.data?.name ?? '').trim();
        if (name.toLowerCase() === 'site') continue; // skip system category
        categoryIds.push(item.data.id);
      }
    }

    return categoryIds;
  }

  /**
   * Parses hierarchy type='audience' response and returns audience ids/names and category names (last breadcrumb).
   */
  private static parseHierarchyAudiences(responseJson: any): {
    audienceIds: string[];
    audienceNames: string[];
    categoryNames: string[];
  } {
    const audienceIds: string[] = [];
    const audienceNames: string[] = [];
    const categoryNames: string[] = [];

    const list: any[] = responseJson?.result?.listOfItems || [];
    for (const item of list) {
      if (item?.type === 'audience' && item?.data?.id) {
        audienceIds.push(item.data.id);
        audienceNames.push(item.data.name);
      }
      if (Array.isArray(item?.breadcrumb) && item.breadcrumb.length > 0) {
        const last = item.breadcrumb[item.breadcrumb.length - 1];
        if (last?.name) categoryNames.push(last.name);
      }
    }

    return { audienceIds, audienceNames, categoryNames };
  }

  /**
   * Iterates over the provided categoryIds and returns the first audience found under a category
   * using hierarchy payload:
   * {
   *   nextPageToken: 0,
   *   type: 'audience',
   *   parentCategoryId: <categoryId>,
   *   size: 10,
   *   selectedFields: [],
   *   term: ''
   * }
   * Returns { audienceId, audienceName, categoryIdFound } or null if none present.
   */
  static async findFirstAudience(
    identity: IdentityService,
    categoryIds: string[],
    options?: { size?: number; term?: string }
  ): Promise<{ audienceId: string; audienceName: string; categoryIdFound: string } | null> {
    const size = options?.size ?? 10;
    const term = options?.term ?? '';

    for (const categoryId of categoryIds) {
      const res = await identity.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesHierarchy, {
        data: {
          nextPageToken: 0,
          type: 'audience',
          parentCategoryId: categoryId,
          size,
          selectedFields: [],
          term,
        },
      });
      let json: any;
      try {
        json = await res.json();
      } catch {
        continue;
      }

      const { audienceIds, audienceNames } = this.parseHierarchyAudiences(json);
      if (audienceIds.length > 0) {
        return { audienceId: audienceIds[0], audienceName: audienceNames[0], categoryIdFound: categoryId };
      }
    }

    return null;
  }

  /**
   * Creates a new audience category with a timestamp-based name (Postman pre-script parity).
   * Uses direct API call to bypass findCategory check that causes auth issues.
   * Returns the created categoryId and the generated categoryName.
   */
  static async createRandomCategory(identity: IdentityService): Promise<{ categoryId: string; categoryName: string }> {
    const categoryName = `Category_${Date.now()}`;

    console.log(`🔄 Making direct API call to create category: ${categoryName}`);

    const response = await identity.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiencesCategories, {
      data: {
        name: categoryName,
        description: '',
      },
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
      },
    });

    if (response.status() !== 201) {
      const errorText = await response.text();
      throw new Error(`Category creation failed with status ${response.status()}: ${errorText}`);
    }

    const json = await response.json();
    const categoryId = json?.result?.audienceCategoryId;
    if (!categoryId) {
      throw new Error('Category ID not found in response');
    }

    console.log(`✅ Category created successfully: ${categoryName} (ID: ${categoryId})`);
    return { categoryId, categoryName };
  }

  /**
   * Creates an audience under an existing category.
   * Returns { audienceId, audienceName }.
   */
  static async createRandomAudience(
    identity: IdentityService,
    categoryId: string,
    options?: { attribute?: string; operator?: string; value?: string; type?: string; fieldType?: string }
  ): Promise<{ audienceId: string; audienceName: string }> {
    const audienceName = `Audience_${Date.now()}`;
    const attribute = options?.attribute ?? 'first_name';
    const operator = options?.operator ?? 'CONTAINS';
    const value = options?.value ?? 'e';
    const type = options?.type ?? 'mixed';
    const fieldType = options?.fieldType ?? 'regular';

    const response = await identity.post(API_ENDPOINTS.appManagement.identity.v2IdentityAudiences, {
      data: {
        name: audienceName,
        type,
        audienceRule: {
          AND: [
            {
              AND: [
                {
                  values: [{ value }],
                  attribute,
                  operator,
                  fieldType,
                },
              ],
            },
          ],
        },
        sourceType: 'app_managed',
        categoryId,
      },
    });

    if (response.status() !== 201) {
      throw new Error(`Audience creation failed with status ${response.status()}`);
    }

    const json = await response.json();
    const audienceId = json?.result?.audienceId;
    if (!audienceId) {
      throw new Error('Created audience ID is missing in the response');
    }

    return { audienceId, audienceName };
  }

  /**
   * Mimics the Postman "fetch audi" logic: automatically iterates through categories
   * to find the first available audience. This matches the Postman collection's
   * auto-retry behavior with sequential category checking.
   */
  static async findFirstAudienceWithAutoRetry(
    identity: IdentityService,
    options?: { size?: number; term?: string }
  ): Promise<{ audienceId: string; audienceName: string; categoryIdFound: string } | null> {
    // Step 1: Fetch all category IDs (matching Postman "Fetch category" logic)
    const categoryIds = await this.fetchCategoryIds(identity, options);

    if (categoryIds.length === 0) {
      return null;
    }

    // Step 2: Iterate through categories to find first audience (matching Postman "fetch audi" logic)
    return await this.findFirstAudience(identity, categoryIds, options);
  }

  /**
   * Get or create an audience name for site creation - reuses existing audiences or creates new ones if none exist
   * Returns just the audience name, letting the caller handle UI interactions
   */
  static async getOrCreateAudienceName(identity: IdentityService): Promise<string> {
    const found = await this.findFirstAudienceWithAutoRetry(identity);

    if (found?.audienceName) {
      // Use existing audience
      return found.audienceName;
    } else {
      // Create new audience if none exist
      const { categoryId } = await this.createRandomCategory(identity);
      const created = await this.createRandomAudience(identity, categoryId);
      return created.audienceName;
    }
  }

  /**
   * Setup specific audience for site creation - reuses existing audiences or creates new ones if none exist
   * This method handles the complete flow of finding/creating audiences and setting them up in the UI
   */
  static async setupSpecificAudienceForSite(
    identity: IdentityService,
    siteCreationPage: any,
    appManagerHomePage: any,
    page: any,
    siteDetails: { name: string; category: string; isPrivate: boolean }
  ): Promise<void> {
    const found = await this.findFirstAudienceWithAutoRetry(identity);

    if (found?.audienceName) {
      // Use existing audience
      await siteCreationPage.form.setupSpecificAudience(found.audienceName);
    } else {
      // Create new audience if none exist
      const { categoryId } = await this.createRandomCategory(identity);
      const created = await this.createRandomAudience(identity, categoryId);

      // Wait for UI propagation and refresh form
      await page.waitForTimeout(5000);
      await page.reload();
      await page.waitForTimeout(3000);
      await appManagerHomePage.actions.openSiteCreationForm();
      await siteCreationPage.form.fillSiteDetails(siteDetails);

      // Select the newly created audience
      await siteCreationPage.form.setupSpecificAudience(created.audienceName);
    }
  }
}
