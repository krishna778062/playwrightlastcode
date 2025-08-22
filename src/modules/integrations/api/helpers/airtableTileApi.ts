import { Page } from '@playwright/test';
import { AIRTABLE_TILE_DATA, CONNECTOR_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { createTileViaApi } from './tileApiHelpers';

/** Create Airtable tile via API using the generic tile creation function */
export async function createAirtableTileViaApi(
  page: Page,
  args: { tileInstanceName: string; connectorId?: string }
): Promise<{ tileInstanceName: string; instanceId?: string; templateTileId?: string }> {
  const connectorId = args.connectorId ?? CONNECTOR_IDS.AIRTABLE;
  const baseId = AIRTABLE_TILE_DATA.API_BASE_ID ?? process.env.AIRTABLE_BASE_ID ?? AIRTABLE_TILE_DATA.BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID ?? AIRTABLE_TILE_DATA.TABLE_ID;

  return createTileViaApi(page, {
    tileInstanceName: args.tileInstanceName,
    connectorId,
    baseId,
    tableId,
    baseName: AIRTABLE_TILE_DATA.BASE_NAME,
  });
}

/** Verify ascending order through API response data for Airtable tiles */
export async function verifyAscendingOrderThroughAPI(page: Page): Promise<void> {
  const { test } = await import('@playwright/test');
  const { expect } = await import('@playwright/test');
  const { apiFetchRootAppTiles } = await import('./tileApiHelpers');

  await test.step('Verify Airtable items are in ascending order via API', async () => {
    // 1. Fetch tiles data
    const payload = await apiFetchRootAppTiles(page);

    // Helper to unwrap nested `.data`
    const unwrap = (obj: any) => obj?.data ?? obj;

    // 2. Root response object/array
    const rootData = unwrap(payload);

    // 3. Locate the Airtable tile block
    const airtableTile =
      (Array.isArray(rootData) &&
        rootData.find((t: any) => t?.connectorLabel === 'airtable' || t?.connectionType === 'airtable')) ||
      rootData;

    // 4. Extract records
    const records =
      unwrap(unwrap(airtableTile?.externalData)?.data) ?? airtableTile?.results ?? airtableTile?.records ?? [];

    // 5. Ensure we have an array
    expect(Array.isArray(records)).toBeTruthy();

    // 6. Collect all record names/titles
    const titles = records
      .map((rec: any) => (rec?.fields?.Name ?? rec?.title ?? rec?.name ?? '').trim())
      .filter(Boolean);

    // 7. Create a sorted copy
    const sortedTitles = [...titles].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
    );

    // 8. Compare actual vs expected
    await expect(titles).toEqual(sortedTitles);
  });
}
