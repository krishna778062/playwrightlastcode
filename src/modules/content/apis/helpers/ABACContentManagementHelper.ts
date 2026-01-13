import { APIRequestContext, test } from '@playwright/test';

import { ContentManagementHelper } from '@/src/modules/content/apis/helpers/contentManagementHelper';
import { ABACContentManagementService } from '@/src/modules/content/apis/services/ABACContentManagementService';

/**
 * ABAC-specific content management helper
 * Extends ContentManagementHelper with ABAC-specific functionality
 */
export class ABACContentManagementHelper extends ContentManagementHelper {
  public abacContentManagementService: ABACContentManagementService;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    super(apiRequestContext, baseUrl);
    this.abacContentManagementService = new ABACContentManagementService(apiRequestContext, baseUrl);
  }

  /**
   * Gets ABAC content list for a site
   * @param siteId - Site ID
   * @param options - Optional parameters
   * @returns Promise with content list
   */
  async getABACContentList(siteId: string, options?: { size?: number; status?: string }): Promise<any> {
    return await test.step('Getting ABAC content list', async () => {
      return await this.abacContentManagementService.getABACContentList(siteId, options);
    });
  }

  /**
   * Placeholder for additional ABAC-specific content management methods
   * Can be extended with ABAC-specific content operations
   */
}
