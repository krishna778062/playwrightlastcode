import { SiteManagementHelper } from '@/src/modules/content/apis/helpers/siteManagementHelper';

/**
 * Helper function to get test site by name, handling deactivated sites
 * Uses getSiteIdWithName which already handles finding and reactivating deactivated sites
 * @param siteManagementHelper - The site management helper instance
 * @param testSiteName - The name of the test site to find
 * @returns The site object with siteId and other properties
 */
export async function getTestSiteByName(
  siteManagementHelper: SiteManagementHelper,
  testSiteName: string
): Promise<{ siteId: string; name: string; isActive: boolean; [key: string]: any }> {
  // Use getSiteIdWithName which handles deactivated sites and reactivates them automatically
  const siteId = await siteManagementHelper.getSiteIdWithName(testSiteName);

  // Get full site details
  const siteDetails = await siteManagementHelper.siteManagementService.getSiteDetails(siteId);

  return {
    siteId: siteDetails.result.siteId,
    name: siteDetails.result.name,
    isActive: siteDetails.result.isActive,
    ...siteDetails.result,
  };
}
