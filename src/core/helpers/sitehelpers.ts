import { Page, test } from '@playwright/test';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { EnterpriseSearchHelper } from '@core/helpers/enterpriseSearchHelper';
import { SEARCH_RESULT_ITEM } from '@/src/modules/global-search/constants/siteTypes';

export type CreateSiteOptions = {
  /** Optional explicit name for the site. Defaults to a random, unique test-friendly name. */
  name?: string;
  /** Preferred category name to use for the site. Falls back to the first available category if not found. */
  categoryName?: string;
  /** Site access level, e.g. "public". */
  access?: string;
};

/**
 * Creates a site via API and waits until it appears in Enterprise Search results.
 * - Resolves the desired category by name; if unavailable, falls back to the first available category.
 * - Uses cookie-authenticated client bound to the provided Playwright page.
 * - Returns the created site id and name for subsequent navigation.
 */
export async function createSiteAndWaitForSearchResults(
  page: Page,
  options: CreateSiteOptions = {}
): Promise<{ siteId: string; siteName: string }> {
  const client = await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'cookies',
    page,
    baseUrl: getEnvConfig().apiBaseUrl,
  });

  const siteName = options.name ?? `AutomateUI_Test_${Math.floor(Math.random() * 1000000 + 1)}`;
  const desiredCategoryName = options.categoryName ?? process.env.SITE_CATEGORY_NAME ?? 'Corporate';

  let categoryObj: { categoryId: string; name: string } | undefined;
  try {
    categoryObj = await client.getSiteManagementService().getCategoryId(desiredCategoryName);
  } catch {
    try {
      const res = await client.post(API_ENDPOINTS.site.category, {
        data: { size: 16, sortBy: 'alphabetical' },
      });
      const json = await res.json();
      const first = json?.result?.listOfItems?.[0];
      if (first) categoryObj = { categoryId: first.categoryId, name: first.name };
    } catch {}
  }

  if (!categoryObj) {
    throw new Error(
      'No site categories found. Please create at least one category (Admin > Site categories) or set SITE_CATEGORY_NAME to an existing category.'
    );
  }

  const created = await client.getSiteManagementService().addNewSite({
    access: options.access ?? 'public',
    name: siteName,
    category: { categoryId: categoryObj.categoryId, name: categoryObj.name },
  });

  const siteId = created.siteId as string;

  await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(client, siteName, siteName, SEARCH_RESULT_ITEM.SITE);

  return { siteId, siteName };
}

/**
 * Attempts to deactivate a site without failing the test on errors.
 * Useful for finally-blocks and test cleanup.
 */
export async function deactivateSiteSafe(page: Page, siteId: string): Promise<void> {
  try {
    const client = await ApiClientFactory.createClient(AppManagerApiClient, {
      type: 'cookies',
      page,
      baseUrl: getEnvConfig().apiBaseUrl,
    });
    await client.getSiteManagementService().deactivateSite(siteId);
  } catch {}
}

/**
 * Test fixture that provisions an ephemeral site id for the current test.
 * - Honors existing SITE_ID env var to reuse a pre-created site when provided.
 * - Otherwise, creates a site and waits for search results, then cleans up by deactivating it.
 */
export const siteFixture = test.extend<{
  siteId: string;
}>({
  siteId: [
    async ({ page }, use) => {
      const providedSiteId = process.env.SITE_ID;
      if (providedSiteId) {
        await use(providedSiteId);
        return;
      }

      const { siteId: createdSiteId } = await createSiteAndWaitForSearchResults(page);
      try {
        await use(createdSiteId);
      } finally {
        await deactivateSiteSafe(page, createdSiteId);
      }
    },
    { scope: 'test' },
  ],
});
