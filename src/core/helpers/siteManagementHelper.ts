import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { test } from '@playwright/test';

interface CreatedSiteRecord {
  siteId: string;
}

/**
 * SiteManagementHelper centralizes common site lifecycle operations used across helpers/tests.
 * - Creates sites via API with given name/category/options
 * - Waits for site to be indexed in enterprise search
 * - Tracks created sites for reliable cleanup (deactivation)
 */
export class SiteManagementHelper {
  private createdSites: CreatedSiteRecord[] = [];

  constructor(private appManagerApiClient: AppManagerApiClient) {}

  /**
   * Generates a unique site name with a consistent prefix.
   * @param prefix - Optional prefix for the generated name
   */
  generateUniqueSiteName(prefix: string = 'AutomateUI_Test'): string {
    const randomNum = Math.floor(Math.random() * 1_000_000 + 1);
    return `${prefix}_${randomNum}`;
  }

  /**
   * Looks up a site category object by its name via API.
   * @param categoryName - Category name to look up
   */
  async getCategoryByName(categoryName: string): Promise<{ name: string; categoryId: string }> {
    return await this.appManagerApiClient.getSiteManagementService().getCategoryId(categoryName);
  }

  /**
   * Creates a site and waits until it's searchable.
   * @param siteName - Desired site name
   * @param category - Category object containing name and categoryId
   * @param options - Optional access settings
   * @returns Object containing the created siteId and siteName
   */
  async createSite(
    siteName: string,
    category: { name: string; categoryId: string },
    options?: { access?: 'public' | 'private' | 'unlisted' }
  ): Promise<{ siteId: string; siteName: string }> {
    const siteResult = await this.appManagerApiClient.getSiteManagementService().addNewSite({
      access: options?.access ?? 'public',
      name: siteName,
      category: {
        categoryId: category.categoryId,
        name: category.name,
      },
    });
    const siteId = siteResult.siteId;
    this.createdSites.push({ siteId });

    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
      this.appManagerApiClient,
      siteName,
      siteName,
      'site'
    );

    return { siteId, siteName };
  }

  /**
   * Convenience method to create a site using a category name.
   * Optionally accepts a siteName; if omitted, a unique name is generated.
   */
  async createSiteWithCategoryName(
    categoryName: string,
    options?: { access?: 'public' | 'private' | 'unlisted' },
    siteName?: string
  ): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Create site with category "${categoryName}"`, async () => {
      const resolvedSiteName = siteName ?? this.generateUniqueSiteName();
      const category = await test.step(`Lookup category id for "${categoryName}"`, async () => {
        return await this.getCategoryByName(categoryName);
      });
      return await this.createSite(resolvedSiteName, category, options);
    });
  }

  /**
   * Deactivates all sites created through this helper instance.
   */
  async cleanup() {
    for (const { siteId } of this.createdSites) {
      if (siteId) {
        await this.appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
      }
    }
    this.createdSites = [];
  }
}
