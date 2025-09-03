/**
 * Tile API Helpers
 *
 * This module provides essential API-based tile management functionality for integration tests.
 * It includes functions for creating tiles and basic verification utilities.
 *
 * Note: Most tile deletion and management operations now use TileManagementHelper from core.
 *
 * @author Integration Test Team
 * @version 2.0
 */

import { Page } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { TIMEOUTS } from '@core/constants/timeouts';
import { TileCreationArgs, TileCreationResult, WaitOpts } from '@core/types/tile.type';
import { getEnvConfig } from '@core/utils/getEnvConfig';

/**
 * Normalizes text by removing extra whitespace and converting to lowercase
 * Used for consistent string comparison across different tile title formats
 *
 * @param text - The text to normalize
 * @returns Normalized text string
 */
function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Extracts the display title from a tile item object
 * Handles different property names that might contain the tile title
 *
 * @param item - The tile item object
 * @returns The extracted title string
 */
function extractTitleFromItem(item: any): string {
  return (item?.tileInstanceName || item?.name || item?.title || '').toString();
}

/**
 * Builds common headers for API requests
 * Includes authentication, tenant, and user context information
 *
 * @param page - Playwright page object for extracting user context
 * @param frontendBaseUrl - The frontend base URL for headers
 * @returns Headers object for API requests
 */
export async function buildCommonHeaders(page: Page, frontendBaseUrl: string): Promise<Record<string, string>> {
  // Extract user context from the page
  const { uid, tid } = await page
    .evaluate(() => {
      const w: any = window as any;
      return {
        uid: w?.Simpplr?.CurrentUser?.uid,
        tid: w?.Simpplr?.Settings?.accountId,
      };
    })
    .catch(() => ({ uid: undefined, tid: undefined }));

  // Get role ID from environment variables with fallback
  const roleId =
    process.env.TENANT_USER_ROLE_ID || process.env.QA_TENANT_USER_ROLE_ID || '3c774e6c-02b6-4b61-9d7d-03d083540136';

  // Extract host from frontend URL
  let frontendHost = frontendBaseUrl;
  try {
    frontendHost = new URL(frontendBaseUrl).host;
  } catch {
    // Use original URL if parsing fails
  }

  // Build headers object with required fields
  const headers: Record<string, string> = {
    Origin: frontendBaseUrl,
    Referer: frontendBaseUrl,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-smtip-f-host': frontendHost,
  };

  // Add optional headers if available
  if (uid) headers['x-smtip-uid'] = uid;
  if (tid) headers['x-smtip-tid'] = tid;
  if (roleId) headers['x-smtip-tenant-user-role'] = roleId;

  return headers;
}

/**
 * Creates an authenticated API client using page cookies
 *
 * @param page - Playwright page object
 * @returns Configured AppManagerApiClient instance
 */
async function createAuthenticatedApiClient(page: Page): Promise<AppManagerApiClient> {
  const { apiBaseUrl } = getEnvConfig();
  return await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'cookies',
    page,
    baseUrl: apiBaseUrl,
  });
}

/**
 * Fetches home dashboard app tiles via API
 * Uses minimal, tenant-aligned list call for test operations
 *
 * @param page - Playwright page object
 * @returns Array of tile objects
 */
async function listHomeAppTiles(page: Page): Promise<any[]> {
  const res = await page.request.post('/v1/content/tiles/list', {
    data: { siteId: null, dashboardId: 'home' },
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  if (!res.ok()) return [];

  const json: any = await res.json().catch(() => ({}));
  return Array.isArray(json?.result?.listOfItems) ? json.result.listOfItems : [];
}

/**
 * Waits until a tile is present in the API response
 * Uses polling with configurable timeout and intervals
 *
 * @param page - Playwright page object
 * @param title - The tile title to wait for
 * @param opts - Polling configuration options
 * @returns Promise that resolves to true when tile is found
 */
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

/**
 * Fetches the first available template for a given connector
 *
 * @param api - Authenticated API client
 * @param connectorId - The connector ID to get templates for
 * @param headers - Request headers
 * @returns The first template object
 */
async function getFirstTemplate(
  api: AppManagerApiClient,
  connectorId: string,
  headers: Record<string, string>
): Promise<any> {
  const res = await api.get(`/v1/tiles?type=app&connectorId=${connectorId}`, {
    headers,
    timeout: TIMEOUTS.LONG,
  });

  if (!res.ok()) {
    throw new Error(`Failed to get templates: ${res.status()}`);
  }

  const templates = (await res.json()).data ?? [];
  if (templates.length === 0) {
    throw new Error(`No templates found for connector: ${connectorId}`);
  }

  return templates[0];
}

/**
 * Derives parameters from schema for any connector
 * Automatically maps baseId and tableId to appropriate parameter keys
 *
 * @param schema - The request schema object
 * @param baseId - Optional base ID for connectors that need it
 * @param tableId - Optional table ID for connectors that need it
 * @returns Object with derived parameters
 */
function deriveParametersFromSchema(schema: any, baseId?: string, tableId?: string): Record<string, string> {
  const params = schema?.parameters ?? [];
  const parameters: Record<string, string> = {};

  for (const p of params) {
    const key = (p?.id || p?.name || '').toString();

    // Map baseId to appropriate parameter keys
    if (/(base|baseid|base_id)/i.test(key) && baseId) {
      parameters[key] = baseId;
    }

    // Map tableId to appropriate parameter keys
    if (/(table|tableid|table_id)/i.test(key) && tableId) {
      parameters[key] = tableId;
    }
  }

  return parameters;
}

/**
 * Sanitizes request schema by removing UI-specific fields
 * These fields are not needed for API requests and can cause issues
 *
 * @param schema - The raw request schema
 * @returns Sanitized schema without UI fields
 */
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

/**
 * Generic tile creation via API for any connector
 * Supports all connector types with flexible parameter mapping
 *
 * @param page - Playwright page object
 * @param args - Tile creation arguments
 * @returns Promise resolving to tile creation result
 */
export async function createTileViaApi(page: Page, args: TileCreationArgs): Promise<TileCreationResult> {
  const { frontendBaseUrl } = getEnvConfig();
  const api = await createAuthenticatedApiClient(page);
  const headers = await buildCommonHeaders(page, frontendBaseUrl);

  // Get the first available template for the connector
  const template = await getFirstTemplate(api, args.connectorId, headers);

  // Build parameters only for keys that exist in schema
  const rawRequestSchema = template?.inputConfig?.requestSchema ?? { parameters: [] };
  const parameters = deriveParametersFromSchema(rawRequestSchema, args.baseId, args.tableId);
  const sanitizedRequestSchema = sanitizeRequestSchema(rawRequestSchema);

  // Create enriched schema for tenants requiring values in schema
  const enrichedRequestSchema = {
    ...sanitizedRequestSchema,
    parameters:
      sanitizedRequestSchema.parameters?.map((p: any) => {
        const out = { ...p };
        const key = (p?.id || p?.name || '').toString().toLowerCase();

        // Enrich base-related parameters
        if (/(base|baseid|base_id)/.test(key) && args.baseId) {
          Object.assign(out, {
            persistedValue: args.baseId,
            default: args.baseId,
            value: args.baseId,
            presetValue: args.baseId,
            selectedOption: { label: args.baseName ?? args.baseId, value: args.baseId },
          });
        }

        // Enrich table-related parameters
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

  // Build the tile creation payload
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

  // Try creating with enriched schema first
  let createRes = await api.post(`/v1/tiles/${template.tileId}/instances`, {
    data: buildData(enrichedRequestSchema),
    headers,
    timeout: TIMEOUTS.VERY_LONG,
  });

  // Fallback to raw schema if enriched version fails
  if (!createRes.ok()) {
    createRes = await api.post(`/v1/tiles/${template.tileId}/instances`, {
      data: buildData(rawRequestSchema),
      headers,
      timeout: TIMEOUTS.VERY_LONG,
    });
  }

  if (!createRes.ok()) {
    const errorText = await createRes.text();
    throw new Error(`Tile creation failed: ${createRes.status()} ${errorText}`);
  }

  // Extract instance ID from response
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

  // If no instance ID in response, try to find it by listing tiles
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

  return {
    tileInstanceName: args.tileInstanceName,
    instanceId,
    templateTileId: template?.tileId,
  };
}

/**
 * Create app tile via API for any connector type
 * This is a simplified wrapper around createTileViaApi for basic app tiles
 * that only need a tile name and connector ID
 *
 * @param page - Playwright page object
 * @param args - Object containing tileInstanceName and connectorId
 * @returns Promise resolving to tile creation result
 */
export async function createAppTileViaApi(
  page: Page,
  args: { tileInstanceName: string; connectorId: string }
): Promise<TileCreationResult> {
  const result = await createTileViaApi(page, {
    tileInstanceName: args.tileInstanceName,
    connectorId: args.connectorId,
  });

  if (!result.instanceId) {
    throw new Error(`Tile creation failed: No instance ID returned for tile "${args.tileInstanceName}"`);
  }

  return result;
}

/**
 * Create Airtable tile via API using the generic tile creation function
 * Automatically configures Airtable-specific parameters
 *
 * @param page - Playwright page object
 * @param args - Object containing tileInstanceName and optional connectorId
 * @returns Promise resolving to tile creation result
 */
export async function createAirtableTileViaApi(
  page: Page,
  args: { tileInstanceName: string; connectorId?: string }
): Promise<TileCreationResult> {
  const { AIRTABLE_TILE, CONNECTOR_IDS } = await import('@integrations/test-data/app-tiles.test-data');

  const connectorId = args.connectorId ?? CONNECTOR_IDS.AIRTABLE;
  const baseId = AIRTABLE_TILE.API_BASE_ID ?? process.env.AIRTABLE_BASE_ID ?? AIRTABLE_TILE.BASE_ID;
  const tableId = process.env.AIRTABLE_TILE_ID ?? AIRTABLE_TILE.TABLE_ID;

  return createTileViaApi(page, {
    tileInstanceName: args.tileInstanceName,
    connectorId,
    baseId,
    baseName: AIRTABLE_TILE.BASE_NAME,
    tableId,
  });
}
