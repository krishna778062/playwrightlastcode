import { Page, test } from '@playwright/test';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { EnterpriseSearchHelper } from '@core/helpers/enterpriseSearchHelper';
import { SEARCH_RESULT_ITEM } from '@/src/modules/global-search/constants/siteTypes';

export type CreateSiteOptions = {
  name?: string;
  categoryName?: string;
  access?: string;
};

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
    const res = await client.post(API_ENDPOINTS.site.category, {
      data: { size: 16, sortBy: 'alphabetical' },
    });
    const json = await res.json();
    const first = json?.result?.listOfItems?.[0];
    if (first) categoryObj = { categoryId: first.categoryId, name: first.name };
  }

  if (!categoryObj) {
    throw new Error('No site categories found. Please create at least one category.');
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

export const siteFixture = test.extend<{ siteId: string }>({
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
