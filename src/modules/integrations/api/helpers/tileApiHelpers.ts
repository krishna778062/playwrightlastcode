/**
 * API-first utilities for creating and verifying tiles in integration tests.
 * Creation uses connector templates and supports light schema sanitation.
 */

import { AIRTABLE_TILE, CONNECTOR_IDS } from '@integrations/test-data/app-tiles.test-data';
import { expect, Page } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { TileCreationArgs, TileCreationResult, WaitOpts } from '@core/types/tile.type';
import { getEnvConfig } from '@core/utils/getEnvConfig';

// Local minimal types to avoid pervasive `any` usage
type RequestSchemaParameter = {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
};

type RequestSchema = {
  parameters: RequestSchemaParameter[];
  [key: string]: unknown;
};

type TileTemplate = {
  connectorId: string;
  tileId: string;
  inputConfig?: { requestSchema?: RequestSchema };
};

const BASE_KEY_PATTERN = /(base|baseid|base_id)/i;
const TABLE_KEY_PATTERN = /(table|tableid|table_id)/i;
const UI_ONLY_FIELDS = new Set<string>([
  'definedBy',
  'ui',
  'uiSchema',
  'controlType',
  'optionsSchema',
  'tooltip',
  'helpText',
  'displayName',
]);

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

/**
 * Generic tile creation via API for any connector
 *
 * @param page - Playwright page object
 * @param args - Tile creation arguments
 * @returns Promise resolving to tile creation result
 */
export async function createTileViaApi(page: Page, args: TileCreationArgs): Promise<TileCreationResult> {
  const api = await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'cookies',
    page,
    baseUrl: getEnvConfig().apiBaseUrl,
  });

  // Get first template for connector
  const templateResponse = await api.get(API_ENDPOINTS.integrations.tilesByConnector(args.connectorId));
  if (!templateResponse.ok()) {
    const message = await templateResponse.text().catch(() => '');
    throw new Error(
      `Failed to fetch templates for connector ${args.connectorId}: ${templateResponse.status()} ${message}`
    );
  }
  const templatesPayload = (await templateResponse.json().catch(() => ({}))) as { data?: TileTemplate[] };
  const templates = Array.isArray(templatesPayload?.data) ? templatesPayload.data : [];
  const template = templates[0];
  if (!template) throw new Error(`No template found for connector: ${args.connectorId}`);

  // Helper: sanitize schema by removing UI-only fields
  const sanitizeRequestSchema = (schema: unknown): RequestSchema => {
    const raw = (schema ?? { parameters: [] }) as RequestSchema;
    const parameters = Array.isArray((raw as any)?.parameters) ? raw.parameters : [];
    const cleaned = parameters.map(param => {
      const copy: Record<string, unknown> = { ...param };
      UI_ONLY_FIELDS.forEach(field => {
        delete (copy as any)[field];
      });
      return copy as RequestSchemaParameter;
    });
    return { ...(raw as object), parameters: cleaned } as RequestSchema;
  };

  // Helper: derive parameter key names from schema and map provided values
  const deriveParametersFromSchema = (
    schema: RequestSchema,
    baseId?: string,
    tableId?: string
  ): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const def of schema?.parameters ?? []) {
      const key = ((def?.id as string) || (def?.name as string) || '').toString();
      if (BASE_KEY_PATTERN.test(key) && baseId) out[key] = baseId;
      if (TABLE_KEY_PATTERN.test(key) && tableId) out[key] = tableId;
    }
    return out;
  };

  // Build schemas and parameters
  const rawRequestSchema = template?.inputConfig?.requestSchema ?? { parameters: [] };
  const sanitizedRequestSchema = sanitizeRequestSchema(rawRequestSchema);
  const parameters = deriveParametersFromSchema(sanitizedRequestSchema, args.baseId, args.tableId);

  // Enrich schema parameters with values when present (helps certain tenants)
  const enrichedRequestSchema: RequestSchema = {
    ...sanitizedRequestSchema,
    parameters:
      sanitizedRequestSchema.parameters?.map((paramDef: RequestSchemaParameter) => {
        const idOrName = ((paramDef?.id as string) || (paramDef?.name as string) || '').toString();
        const keyLower = idOrName.toLowerCase();
        const next: Record<string, unknown> = { ...paramDef };
        if (BASE_KEY_PATTERN.test(keyLower) && args.baseId) {
          Object.assign(next, {
            persistedValue: args.baseId,
            default: args.baseId,
            value: args.baseId,
            presetValue: args.baseId,
            selectedOption: args.baseName ? { label: args.baseName, value: args.baseId } : undefined,
          });
        }
        if (TABLE_KEY_PATTERN.test(keyLower) && args.tableId) {
          Object.assign(next, {
            persistedValue: args.tableId,
            default: args.tableId,
            value: args.tableId,
            presetValue: args.tableId,
          });
        }
        return next as RequestSchemaParameter;
      }) ?? [],
  };

  const buildData = (requestSchema: RequestSchema) => ({
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

  // Use enriched schema only (no fallback)
  const createResponse = await api.post(API_ENDPOINTS.integrations.createTileInstance(template.tileId), {
    data: buildData(enrichedRequestSchema),
    timeout: TIMEOUTS.VERY_LONG,
  });

  if (!createResponse.ok()) {
    const errorText = await createResponse.text().catch(() => '');
    throw new Error(`Tile creation failed: ${createResponse.status()} - ${errorText}`);
  }

  const body = await createResponse.json().catch(() => ({}));
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

  // If instanceId missing, try to locate it via list API
  if (!instanceId) {
    const listResponse = await api.get(`${API_ENDPOINTS.integrations.tilesRootInstances}?type=app`);
    if (listResponse.ok()) {
      const jsonPayload = await listResponse.json().catch(() => ({}) as any);
      const candidates: any[] =
        (Array.isArray(jsonPayload?.data) && jsonPayload.data) ||
        (Array.isArray(jsonPayload?.result?.listOfItems) && jsonPayload.result.listOfItems) ||
        (Array.isArray(jsonPayload?.items) && jsonPayload.items) ||
        [];
      const match = candidates.find(
        (i: any) => i?.tileInstanceName === args.tileInstanceName || i?.name === args.tileInstanceName
      );
      instanceId = match?.instanceId || match?.id || match?.tileInstanceId;
    }
  }

  return {
    tileInstanceName: args.tileInstanceName,
    instanceId: instanceId || 'unknown',
    templateTileId: template?.tileId,
  };
}

// Wait for tile to appear in API
export async function waitUntilTilePresentInApi(page: Page, title: string, opts: WaitOpts = {}): Promise<boolean> {
  const timeout = opts.timeoutMs ?? 20_000;
  const intervals = opts.pollIntervalMs ? [opts.pollIntervalMs] : [500, 1_000, 1_500];
  const target = title.replace(/\s+/g, ' ').trim().toLowerCase();

  try {
    await expect
      .poll(
        async () => {
          const response = await page.request.post(API_ENDPOINTS.integrations.contentTilesList, {
            data: { siteId: null, dashboardId: 'home' },
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          });

          if (!response.ok()) return false;

          const payload = await response.json().catch(() => ({}));
          const tiles = payload?.result?.listOfItems || [];

          return tiles.some((tile: any) => {
            const tileTitle = (tile?.tileInstanceName || tile?.name || tile?.title || '').toString();
            return tileTitle.replace(/\s+/g, ' ').trim().toLowerCase() === target;
          });
        },
        { timeout, intervals }
      )
      .toBe(true);
    return true;
  } catch {
    return false;
  }
}
