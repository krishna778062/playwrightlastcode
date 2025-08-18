import { Page } from '@playwright/test';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { AIRTABLE_TILE_DATA, CONNECTOR_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

export async function createAirtableTileViaApi(
  page: Page,
  args: { tileInstanceName: string; connectorId?: string }
): Promise<{ tileInstanceName: string; instanceId?: string; templateTileId?: string }> {
  const { apiBaseUrl, frontendBaseUrl } = getEnvConfig();
  const api = await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'cookies',
    page,
    baseUrl: apiBaseUrl,
  });

  const connectorId = args.connectorId ?? CONNECTOR_IDS.AIRTABLE;
  // Prefer API-specific Base ID from test data for backend calls
  const baseId = AIRTABLE_TILE_DATA.API_BASE_ID ?? process.env.AIRTABLE_BASE_ID ?? AIRTABLE_TILE_DATA.BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID ?? AIRTABLE_TILE_DATA.TABLE_ID;

  // Get template
  const templatesRes = await api.get(`/v1/tiles?type=app&connectorId=${connectorId}`);
  if (!templatesRes.ok()) throw new Error(`Failed to get templates: ${templatesRes.status()}`);
  const templates = (await templatesRes.json()).data ?? [];
  const template = templates[0];

  // Derive parameter keys from template schema
  const params: Array<{ id?: string; name?: string }> =
    (template?.inputConfig?.requestSchema?.parameters as Array<{ id?: string; name?: string }>) ?? [];
  const nameOf = (p: { id?: string; name?: string }) => (p.id || p.name || '').toString();
  // Build parameters only for keys that actually exist in the schema
  const parameters: Record<string, string> = {};
  for (const p of params) {
    const key = nameOf(p);
    if (/(base|baseid|base_id)/i.test(key) && baseId) {
      parameters[key] = baseId;
    }
    if (/(table|tableid|table_id)/i.test(key) && tableId) {
      parameters[key] = tableId;
    }
  }
  const rawRequestSchema = (template?.inputConfig?.requestSchema as any) ?? { parameters: [] };
  // Sanitize requestSchema by dropping UI/internal fields only, keep required fields (label, in, description, etc.)
  const sanitizeParam = (p: any) => {
    const s: any = { ...p };
    delete s.definedBy;
    delete s.ui;
    delete s.uiSchema;
    delete s.controlType;
    delete s.optionsSchema;
    delete s.tooltip;
    delete s.helpText;
    delete s.displayName;
    return s;
  };
  const sanitizedRequestSchema = {
    ...rawRequestSchema,
    parameters: Array.isArray(rawRequestSchema?.parameters) ? rawRequestSchema.parameters.map(sanitizeParam) : [],
  };

  const buildData = (requestSchema: any) => ({
    dashboard: 'home',
    tileInstanceName: args.tileInstanceName,
    type: 'app',
    connectorId: template.connectorId,
    connectionType: 'user',
    inputConfig: {
      requestSchema,
      parameters, // may be empty if schema doesn't require base/table
      personalization: { enabled: false },
    },
  });

  // Attempt 1: enriched sanitized schema (populate values in schema too)
  const enrichedRequestSchema = {
    ...sanitizedRequestSchema,
    parameters: Array.isArray(sanitizedRequestSchema?.parameters)
      ? (sanitizedRequestSchema.parameters as any[]).map((p: any) => {
          const out = { ...p };
          const k = nameOf(p as any).toLowerCase();
          if (/(base|baseid|base_id)/.test(k) && baseId) {
            const val = baseId;
            const label = AIRTABLE_TILE_DATA.BASE_NAME ?? val;
            Object.assign(out, {
              persistedValue: val,
              default: val,
              value: val,
              presetValue: val,
              selectedOption: { label, value: val },
            });
          }
          if (/(table|tableid|table_id)/.test(k) && tableId) {
            const val = tableId;
            Object.assign(out, {
              persistedValue: val,
              default: val,
              value: val,
              presetValue: val,
            });
          }
          return out;
        })
      : [],
  };

  let createRes = await api.post(`/v1/tiles/${template.tileId}/instances`, {
    data: buildData(enrichedRequestSchema),
    headers: {
      Origin: frontendBaseUrl,
      Referer: frontendBaseUrl,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Attempt 2: raw schema (some tenants require untouched schema)
  if (!createRes.ok()) {
    createRes = await api.post(`/v1/tiles/${template.tileId}/instances`, {
      data: buildData(rawRequestSchema),
      headers: {
        Origin: frontendBaseUrl,
        Referer: frontendBaseUrl,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  if (!createRes.ok()) throw new Error(`Create failed: ${createRes.status()} ${await createRes.text()}`);

  const body = await createRes.json().catch(() => ({}));
  let instanceId: string | undefined = body?.result?.instanceId || body?.data?.instanceId || body?.instanceId;

  // Fallback 1: Parse Location header if instanceId not present in body
  if (!instanceId) {
    const headers = createRes.headers?.() ?? {};
    const locationHeader = headers['location'] ?? headers['Location'];
    if (locationHeader && typeof locationHeader === 'string') {
      const fromInstancesPath = /\/instances\/([^\/?#]+)/.exec(locationHeader)?.[1];
      const fromTilesPath = /\/tiles\/([^\/?#]+)/.exec(locationHeader)?.[1];
      instanceId = fromInstancesPath || fromTilesPath || instanceId;
    }
  }

  // Fallback 2: List root instances and match by tileInstanceName
  if (!instanceId) {
    const listRes = await api.get(`/v1/tiles/root/instances?type=app`);
    if (listRes.ok()) {
      const json = await listRes.json().catch(() => ({}) as any);
      const candidates: any[] =
        (Array.isArray(json?.data) && json.data) ||
        (Array.isArray(json?.result?.listOfItems) && json.result.listOfItems) ||
        (Array.isArray(json?.result) && json.result) ||
        (Array.isArray(json?.items) && json.items) ||
        [];
      const match = candidates.find(
        (i: any) => i?.tileInstanceName === args.tileInstanceName || i?.name === args.tileInstanceName
      );
      instanceId = match?.instanceId || match?.id || instanceId;
    }
  }

  return { tileInstanceName: args.tileInstanceName, instanceId, templateTileId: template?.tileId };
}

export async function deleteAirtableTileViaApi(
  page: Page,
  args: { tileInstanceName: string; instanceId: string }
): Promise<void> {
  const { apiBaseUrl } = getEnvConfig();
  const api = await ApiClientFactory.createClient(AppManagerApiClient, {
    type: 'cookies',
    page,
    baseUrl: apiBaseUrl,
  });

  // Get content tiles to find the content tile ID
  const tilesRes = await api.get('/v1/content/tiles?dashboard=home&type=app');
  if (!tilesRes.ok()) throw new Error(`Failed to get tiles: ${tilesRes.status()}`);

  const tiles = (await tilesRes.json()).data ?? [];
  const targetTile = tiles.find(
    (tile: any) => tile.tileInstanceName === args.tileInstanceName || tile.instanceId === args.instanceId
  );

  if (!targetTile) throw new Error(`Tile not found: ${args.tileInstanceName}`);

  // Delete the content tile
  const contentTileId = targetTile.id || targetTile.contentTileId;
  const deleteRes = await api.delete(`/v1/content/tiles/${contentTileId}?hideTile=false`);

  if (!deleteRes.ok() && deleteRes.status() !== 404) {
    throw new Error(`Delete failed: ${deleteRes.status()}`);
  }
}
