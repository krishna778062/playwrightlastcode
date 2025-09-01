import { expect, Page } from '@playwright/test';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { TIMEOUTS } from '@core/constants/timeouts';

type WaitOpts = { timeoutMs?: number; pollIntervalMs?: number };

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

// Minimal, tenant-aligned list call used in tests
async function listHomeAppTiles(page: Page): Promise<any[]> {
  const res = await page.request.post('/v1/content/tiles/list', {
    data: { siteId: null, dashboardId: 'home' },
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });
  if (!res.ok()) return [];
  const json: any = await res.json().catch(() => ({}));
  const items: any[] = Array.isArray(json?.result?.listOfItems) ? json.result.listOfItems : [];
  return items;
}

function extractTitleFromItem(item: any): string {
  return (item?.tileInstanceName || item?.name || item?.title || '').toString();
}

export async function waitUntilTilePresentInApi(page: Page, title: string, opts: WaitOpts = {}): Promise<boolean> {
  const timeout = opts.timeoutMs ?? 20_000;
  const intervals = opts.pollIntervalMs ? [opts.pollIntervalMs] : [500, 1_000, 1_500];
  const target = normalize(title);

  try {
    const { expect } = await import('@playwright/test');
    await expect
      .poll(
        async () => {
          const list = await listHomeAppTiles(page);
          return list.some(it => normalize(extractTitleFromItem(it)) === target);
        },
        { timeout, intervals }
      )
      .toBe(true);
    return true;
  } catch {
    return false;
  }
}

export async function waitForTileDeletion(page: Page, title: string, opts: WaitOpts = {}): Promise<void> {
  const timeout = opts.timeoutMs ?? 10_000;
  const intervals = opts.pollIntervalMs ? [opts.pollIntervalMs] : [500, 1_000, 2_000, 3_000, 5_000];
  const target = normalize(title);
  await expect
    .poll(
      async () => {
        const list = await listHomeAppTiles(page);
        const found = list.some(it => normalize(extractTitleFromItem(it)) === target);
        return !found;
      },
      { timeout, intervals }
    )
    .toBe(true);
}

export async function waitUntilTileAbsentInApi(page: Page, title: string, opts: WaitOpts = {}): Promise<void> {
  const timeout = opts.timeoutMs ?? 20_000;
  const intervals = opts.pollIntervalMs ? [opts.pollIntervalMs] : [500, 1_000, 1_500];
  const target = normalize(title);

  await expect
    .poll(
      async () => {
        const list = await listHomeAppTiles(page);
        const found = list.some(it => normalize(extractTitleFromItem(it)) === target);
        return !found;
      },
      { timeout, intervals }
    )
    .toBe(true);
}

// Helper functions for tile deletion
async function fetchHomeContentTiles(api: AppManagerApiClient, headers: any): Promise<any[]> {
  const res = await api.post('/v1/content/tiles/list', {
    data: { siteId: null, dashboardId: 'home' },
    headers,
    timeout: TIMEOUTS.LONG,
  });
  if (!res.ok()) return [];
  const json: any = await res.json().catch(() => ({}));
  return Array.isArray(json?.result?.listOfItems) ? json.result.listOfItems : [];
}

function extractContentTileId(tile: any): string | undefined {
  return tile?.contentTileId || tile?.id || tile?.tileId;
}

function extractTileInstanceId(tile: any): string | undefined {
  return tile?.tileInstanceId || tile?.instanceId || tile?.id;
}

/** Delete an app tile by its displayed title via API */
export async function deleteTileByTitleViaApi(page: Page, args: { tileInstanceName: string }): Promise<boolean> {
  const { apiBaseUrl, frontendBaseUrl } = getEnvConfig();
  const api = await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'cookies',
    page,
    baseUrl: apiBaseUrl,
  });

  const headers = await buildCommonHeaders(page, frontendBaseUrl);

  const normalize = (s: any) =>
    String(s ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  const target = normalize(args.tileInstanceName);

  // Step 1: Prefer content tiles list (post-edit title reflects here reliably)
  let contentTileId: string | undefined;
  try {
    const tiles = await fetchHomeContentTiles(api, headers);
    const t = tiles.find(it => [it?.tileInstanceName, it?.title, it?.name].some((n: any) => normalize(n) === target));
    contentTileId = extractContentTileId(t);
  } catch {}

  // Step 2: Fallback – find instance then fetch metadata for contentTileId
  if (!contentTileId) {
    const listRes = await api.get(`/v1/tiles/root/instances?type=app`, { headers, timeout: TIMEOUTS.LONG });
    const listJson: any = listRes.ok() ? await listRes.json().catch(() => ({})) : {};
    const candidates = listJson?.data || listJson?.result?.listOfItems || listJson?.items || [];
    const match = candidates.find((i: any) =>
      [i?.tileInstanceName, i?.title, i?.name].some(n => normalize(n) === target)
    );
    const instanceId: string | undefined = match?.instanceId || match?.id;
    if (instanceId) {
      const metaRes = await api.get(`/v1/tiles/root/instances/${instanceId}/metadata?type=app`, {
        headers,
        timeout: TIMEOUTS.LONG,
      });
      const meta: any = metaRes.ok() ? await metaRes.json().catch(() => ({})) : {};
      contentTileId = meta?.contentTileId || meta?.data?.contentTileId || meta?.tile?.contentTileId;
    }
  }

  if (!contentTileId) return false;

  // Step 3: delete content tile (treat 200 and 404 as success/idempotent)
  const delRes = await api.delete(`/v1/content/tiles/${contentTileId}?hideTile=false`, {
    headers,
    timeout: TIMEOUTS.LONG,
  });
  return delRes.ok() || delRes.status() === 404;
}

/** Delete an app tile by instanceId via API (metadata → contentTileId → delete) */
export async function deleteTileByInstanceIdViaApi(page: Page, args: { instanceId: string }): Promise<boolean> {
  const { apiBaseUrl, frontendBaseUrl } = getEnvConfig();
  const api = await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'cookies',
    page,
    baseUrl: apiBaseUrl,
  });

  const headers = await buildCommonHeaders(page, frontendBaseUrl);

  // First try: content tiles list → match by tileInstanceId
  try {
    const tiles = await fetchHomeContentTiles(api, headers);
    const t = tiles.find(it => extractTileInstanceId(it) === args.instanceId);
    const contentId = extractContentTileId(t);
    if (contentId) {
      const delRes = await api.delete(`/v1/content/tiles/${contentId}?hideTile=false`, {
        headers,
        timeout: TIMEOUTS.LONG,
      });
      return delRes.ok() || delRes.status() === 404;
    }
  } catch {}

  // Fallback: metadata → contentTileId (if exposed in this tenant)
  try {
    const metaRes = await api.get(`/v1/tiles/root/instances/${args.instanceId}/metadata?type=app`, {
      headers,
      timeout: TIMEOUTS.LONG,
    });
    if (metaRes.ok()) {
      const meta: any = await metaRes.json().catch(() => ({}));
      const contentTileId = meta?.contentTileId || meta?.data?.contentTileId || meta?.tile?.contentTileId;
      if (contentTileId) {
        const delRes = await api.delete(`/v1/content/tiles/${contentTileId}?hideTile=false`, {
          headers,
          timeout: TIMEOUTS.LONG,
        });
        return delRes.ok() || delRes.status() === 404;
      }
    }
  } catch {}

  return false;
}

/** Check if a tile exists by title via API */
export async function tileExistsInApi(page: Page, title: string): Promise<boolean> {
  try {
    const list = await listHomeAppTiles(page);
    const normalizedTitle = normalize(title);
    return list.some(it => normalize(extractTitleFromItem(it)) === normalizedTitle);
  } catch {
    return false;
  }
}

/** Fetch root app tiles instances via API */
export async function apiFetchRootAppTiles(page: Page): Promise<any> {
  // Try to read through existing page session cookies
  try {
    const response = await page.request.get('/v1/tiles/root/instances?type=app');
    if (response.ok()) {
      return response.json();
    }
  } catch {}

  // Fallback to authenticated API client via factory if needed
  try {
    const { frontendBaseUrl, appManagerEmail, appManagerPassword, apiBaseUrl } = getEnvConfig();

    const client = await ApiClientFactory.createClient(AppManagerApiClient, {
      type: 'credentials',
      credentials: { username: appManagerEmail, password: appManagerPassword },
      baseUrl: apiBaseUrl || frontendBaseUrl,
    });
    const res = await client.get('/v1/tiles/root/instances?type=app');
    return res.json();
  } catch (e) {
    throw new Error(`Failed to fetch tiles instances via API: ${String(e)}`);
  }
}

// Common/generic functions moved from airtableTileApi
/** Build common headers for API requests */
export async function buildCommonHeaders(page: Page, frontendBaseUrl: string): Promise<Record<string, string>> {
  const { uid, tid } = await page
    .evaluate(() => {
      const w: any = window as any;
      return {
        uid: w?.Simpplr?.CurrentUser?.uid,
        tid: w?.Simpplr?.Settings?.accountId,
      };
    })
    .catch(() => ({ uid: undefined, tid: undefined }));

  const roleId =
    process.env.TENANT_USER_ROLE_ID || process.env.QA_TENANT_USER_ROLE_ID || '3c774e6c-02b6-4b61-9d7d-03d083540136';
  let frontendHost = frontendBaseUrl;
  try {
    frontendHost = new URL(frontendBaseUrl).host;
  } catch {}

  const headers: Record<string, string> = {
    Origin: frontendBaseUrl,
    Referer: frontendBaseUrl,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-smtip-f-host': frontendHost,
  };
  if (uid) headers['x-smtip-uid'] = uid;
  if (tid) headers['x-smtip-tid'] = tid;
  if (roleId) headers['x-smtip-tenant-user-role'] = roleId;
  return headers;
}

/** Fetch first template for app tiles */
async function getFirstTemplate(
  api: AppManagerApiClient,
  connectorId: string,
  headers: Record<string, string>
): Promise<any> {
  const res = await api.get(`/v1/tiles?type=app&connectorId=${connectorId}`, { headers, timeout: TIMEOUTS.LONG });
  if (!res.ok()) throw new Error(`Failed to get templates: ${res.status()}`);
  const templates = (await res.json()).data ?? [];
  return templates[0];
}

/** Derive parameters from schema for any connector */
function deriveParametersFromSchema(schema: any, baseId?: string, tableId?: string): Record<string, string> {
  const params = schema?.parameters ?? [];
  const parameters: Record<string, string> = {};
  for (const p of params) {
    const key = (p?.id || p?.name || '').toString();
    if (/(base|baseid|base_id)/i.test(key) && baseId) parameters[key] = baseId;
    if (/(table|tableid|table_id)/i.test(key) && tableId) parameters[key] = tableId;
  }
  return parameters;
}

/** Sanitize request schema by removing UI-specific fields */
function sanitizeRequestSchema(schema: any): any {
  const raw = schema ?? { parameters: [] };
  const uiFields = [
    'definedBy',
    'ui',
    'uiSchema',
    'controlType',
    'optionsSchema',
    'tooltip',
    'helpText',
    'displayName',
  ];
  return {
    ...raw,
    parameters: Array.isArray(raw?.parameters)
      ? raw.parameters.map((p: any) => {
          const clean = { ...p };
          uiFields.forEach(field => delete clean[field]);
          return clean;
        })
      : [],
  };
}

/** Generic tile creation via API for any connector */
export async function createTileViaApi(
  page: Page,
  args: {
    tileInstanceName: string;
    connectorId: string;
    baseId?: string;
    tableId?: string;
    baseName?: string;
  }
): Promise<{ tileInstanceName: string; instanceId?: string; templateTileId?: string }> {
  const { apiBaseUrl, frontendBaseUrl } = getEnvConfig();
  const api = await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'cookies',
    page,
    baseUrl: apiBaseUrl,
  });
  const headers = await buildCommonHeaders(page, frontendBaseUrl);

  // Get template
  const template = await getFirstTemplate(api, args.connectorId, headers);

  // Build parameters only for keys that exist in schema
  const rawRequestSchema = template?.inputConfig?.requestSchema ?? { parameters: [] };
  const parameters = deriveParametersFromSchema(rawRequestSchema, args.baseId, args.tableId);
  const sanitizedRequestSchema = sanitizeRequestSchema(rawRequestSchema);

  // Schema for tenants requiring values in schema
  const enrichedRequestSchema = {
    ...sanitizedRequestSchema,
    parameters:
      sanitizedRequestSchema.parameters?.map((p: any) => {
        const out = { ...p };
        const key = (p?.id || p?.name || '').toString().toLowerCase();
        if (/(base|baseid|base_id)/.test(key) && args.baseId) {
          Object.assign(out, {
            persistedValue: args.baseId,
            default: args.baseId,
            value: args.baseId,
            presetValue: args.baseId,
            selectedOption: { label: args.baseName ?? args.baseId, value: args.baseId },
          });
        }
        if (/(table|tableid|table_id)/.test(key) && args.tableId) {
          Object.assign(out, {
            persistedValue: args.tableId,
            default: args.tableId,
            value: args.tableId,
            presetValue: args.tableId,
          });
        }
        return out;
      }) ?? [],
  };

  const buildData = (requestSchema: any) => ({
    dashboard: 'home',
    tileInstanceName: args.tileInstanceName,
    type: 'app',
    connectorId: template.connectorId,
    connectionType: 'user',
    inputConfig: {
      requestSchema,
      parameters,
      personalization: { enabled: false },
    },
  });

  let createRes = await api.post(`/v1/tiles/${template.tileId}/instances`, {
    data: buildData(enrichedRequestSchema),
    headers,
    timeout: TIMEOUTS.VERY_LONG,
  });

  if (!createRes.ok()) {
    createRes = await api.post(`/v1/tiles/${template.tileId}/instances`, {
      data: buildData(rawRequestSchema),
      headers,
      timeout: TIMEOUTS.VERY_LONG,
    });
  }

  if (!createRes.ok()) throw new Error(`Create failed: ${createRes.status()} ${await createRes.text()}`);

  const body = await createRes.json().catch(() => ({}));
  let instanceId: string | undefined =
    body?.result?.instanceId ||
    body?.data?.instanceId ||
    body?.instanceId ||
    body?.result?.id ||
    body?.data?.id ||
    body?.id ||
    body?.result?.tileInstanceId ||
    body?.data?.tileInstanceId ||
    body?.tileInstanceId;
  if (!instanceId) {
    const listRes = await api.get(`/v1/tiles/root/instances?type=app`, {
      headers,
      timeout: TIMEOUTS.LONG,
    });
    if (listRes.ok()) {
      const json = await listRes.json().catch(() => ({}));
      const candidates = json?.data || json?.result?.listOfItems || json?.items || [];
      const match = candidates.find(
        (i: any) => i?.tileInstanceName === args.tileInstanceName || i?.name === args.tileInstanceName
      );
      instanceId = match?.instanceId || match?.id || match?.tileInstanceId;
    }
  }
  return { tileInstanceName: args.tileInstanceName, instanceId, templateTileId: template?.tileId };
}

/**
 * Create app tile via API for any connector type
 * This is a simplified wrapper around createTileViaApi for basic app tiles
 * that only need a tile name and connector ID
 */
export async function createAppTileViaApi(
  page: Page,
  args: { tileInstanceName: string; connectorId: string }
): Promise<{ tileInstanceName: string; instanceId?: string; templateTileId?: string }> {
  const result = await createTileViaApi(page, {
    tileInstanceName: args.tileInstanceName,
    connectorId: args.connectorId,
  });
  if (!result.instanceId) {
    throw new Error(`Tile creation failed: No instance ID returned for tile "${args.tileInstanceName}"`);
  }
  return result;
}

/** Create Airtable tile via API using the generic tile creation function */
export async function createAirtableTileViaApi(
  page: Page,
  args: { tileInstanceName: string; connectorId?: string }
): Promise<{ tileInstanceName: string; instanceId?: string; templateTileId?: string }> {
  const { AIRTABLE_TILE, CONNECTOR_IDS } = await import('@integrations/test-data/app-tiles.test-data');
  const connectorId = args.connectorId ?? CONNECTOR_IDS.AIRTABLE;
  const baseId = AIRTABLE_TILE.API_BASE_ID ?? process.env.AIRTABLE_BASE_ID ?? AIRTABLE_TILE.BASE_ID;
  const tableId = process.env.AIRTABLE_TILE_ID ?? AIRTABLE_TILE.TABLE_ID;

  return createTileViaApi(page, {
    tileInstanceName: args.tileInstanceName,
    connectorId,
    baseId,
    tableId,
    baseName: AIRTABLE_TILE.BASE_NAME,
  });
}

/** Verify ascending order through API response data for Airtable tiles */
export async function verifyAscendingOrderThroughAPI(page: Page, tileTitle: string): Promise<void> {
  const { test, expect } = await import('@playwright/test');
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
