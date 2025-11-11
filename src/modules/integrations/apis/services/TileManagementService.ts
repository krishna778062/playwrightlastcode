import { APIRequestContext, APIResponse } from '@playwright/test';

import { HttpClient } from '@core/api/clients/httpClient';

import { API_ENDPOINTS, API_QUERY_PARAMS } from '@/src/core/constants/apiEndpoints';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { ITileManagementOperations } from '@/src/modules/integrations/apis/interfaces/ITileManagementOperations';
import {
  LinkTilePayload,
  LinkTileResponse,
  TileCreationResult,
  TileLink,
} from '@/src/modules/integrations/apis/types/tile.type';

export class TileManagementService implements ITileManagementOperations {
  private httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  // Get root tiles instances
  async getRootAppTilesInstances(): Promise<any> {
    const { frontendBaseUrl } = getEnvConfig();
    const response = await this.httpClient.get(
      `${API_ENDPOINTS.integrations.tilesRootInstances}?${API_QUERY_PARAMS.TYPE_APP}`,
      {
        headers: { Origin: frontendBaseUrl, Referer: frontendBaseUrl, Accept: 'application/json' },
      }
    );
    return response.json();
  }

  // Get instance metadata
  async fetchInstanceMetadata(instanceId: string): Promise<any> {
    const { frontendBaseUrl } = getEnvConfig();
    const res = await this.httpClient.get(
      `${API_ENDPOINTS.integrations.tilesRootInstances}/${instanceId}/metadata?type=app`,
      {
        headers: { Origin: frontendBaseUrl, Referer: frontendBaseUrl, Accept: 'application/json' },
      }
    );
    return res.json();
  }

  /**
   * Delete a integration app tile id (preferred for this tenant)
   */
  async deleteIntegrationAppTile(integrationAppTileId: string): Promise<APIResponse> {
    const { frontendBaseUrl } = getEnvConfig();
    return await this.httpClient.delete(
      `${API_ENDPOINTS.integrations.contentTiles}/${integrationAppTileId}?${API_QUERY_PARAMS.HIDE_TILE_FALSE}`,
      {
        headers: {
          Origin: frontendBaseUrl,
          Referer: frontendBaseUrl,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  /**
   * Create app tile via API using authenticated client
   */
  async createIntegrationAppTile(args: {
    tileInstanceName: string;
    tileId: string;
    connectorId: string;
  }): Promise<TileCreationResult> {
    // Get the template to get proper request schema
    const templateRes = await this.httpClient.get(API_ENDPOINTS.integrations.tilesByConnector(args.connectorId));
    const templates = (await templateRes.json()).data || [];
    const template = templates.find((t: any) => t.tileId === args.tileId);

    if (!template) {
      throw new Error(`Template not found for tileId: ${args.tileId}`);
    }
    const rawSchema = template.inputConfig?.requestSchema || { parameters: [] };

    // Sanitize schema by removing UI-specific fields that cause validation errors
    const requestSchema = {
      ...rawSchema,
      parameters:
        rawSchema.parameters?.map((p: any) => {
          const clean = { ...p };
          delete clean.definedBy;
          return clean;
        }) || [],
    };

    const response = await this.httpClient.post(API_ENDPOINTS.integrations.createTileInstance(args.tileId), {
      data: {
        dashboard: 'home',
        tileInstanceName: args.tileInstanceName,
        type: 'app',
        connectorId: args.connectorId,
        connectionType: 'user',
        inputConfig: {
          requestSchema,
          parameters: {},
          personalization: { enabled: false },
        },
      },
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Failed to create tile "${args.tileInstanceName}": ${response.status()} - ${errorText}`);
    }

    const body = await response.json();

    const instanceId = body?.result?.instanceId || body?.data?.tileInstanceId;

    if (!instanceId) {
      throw new Error(`No instance ID returned for tile "${args.tileInstanceName}". Response: ${JSON.stringify(body)}`);
    }

    return { instanceId, templateTileId: args.tileId, tileInstanceName: args.tileInstanceName };
  }

  /**
   * Create app tile via API with configured settings (e.g., UKG WFM with schedule URL, UKG Pro with instance URL)
   */
  async createIntegrationAppTileWithSettings(args: {
    tileInstanceName: string;
    tileId: string;
    connectorId: string;
    scheduleUrl?: string;
    timePeriod?: string;
    instanceUrl?: string;
    boardId?: string;
  }): Promise<TileCreationResult> {
    // Get the template to get proper request schema
    const templateRes = await this.httpClient.get(API_ENDPOINTS.integrations.tilesByConnector(args.connectorId));
    const templates = (await templateRes.json()).data || [];
    const template = templates.find((t: any) => t.tileId === args.tileId);

    if (!template) {
      throw new Error(`Template not found for tileId: ${args.tileId}`);
    }

    const rawSchema = template.inputConfig?.requestSchema || { parameters: [] };

    // Sanitize schema by removing UI-only fields that cause validation errors
    const sanitizedSchema = {
      ...rawSchema,
      parameters:
        rawSchema.parameters?.map((param: any) => {
          const clean = { ...param };
          // Remove UI-only fields that cause validation errors
          delete clean.definedBy;
          delete clean.ui;
          delete clean.uiSchema;
          delete clean.controlType;
          return clean;
        }) || [],
    };

    // Update the request schema to set definedBy to "author" for app manager defined
    const updatedRequestSchema = {
      ...sanitizedSchema,
      body:
        // Handle Monday.com board ID parameter (body array)
        rawSchema.body?.map((param: any) => {
          const isBoardParameter =
            param.name?.toLowerCase().includes('board') ||
            param.id?.toLowerCase().includes('board') ||
            param.name?.toLowerCase() === 'board';

          if (args.boardId && isBoardParameter) {
            return {
              ...param,
              definedBy: 'author',
              presetValue: args.boardId,
              value: args.boardId,
            };
          }
          return param;
        }) || [],
      parameters:
        sanitizedSchema.parameters?.map((param: any) => {
          // Handle UKG WFM schedule URL parameter
          if (
            args.scheduleUrl &&
            (param.name?.toLowerCase().includes('schedule') ||
              param.id?.toLowerCase().includes('schedule') ||
              param.name?.toLowerCase().includes('url'))
          ) {
            return {
              ...param,
              definedBy: 'author',
              presetValue: args.scheduleUrl,
              value: args.scheduleUrl,
            };
          }

          // Handle ServiceNow time period parameter
          if (
            args.timePeriod &&
            (param.name?.toLowerCase().includes('time') ||
              param.id?.toLowerCase().includes('time') ||
              param.name?.toLowerCase().includes('period'))
          ) {
            return {
              ...param,
              definedBy: 'author',
              presetValue: args.timePeriod,
              value: args.timePeriod,
            };
          }

          // Handle UKG Pro instance URL parameter
          if (
            args.instanceUrl &&
            (param.name?.toLowerCase().includes('instance') ||
              param.id?.toLowerCase().includes('instance') ||
              param.name?.toLowerCase().includes('url'))
          ) {
            return {
              ...param,
              definedBy: 'author',
              presetValue: args.instanceUrl,
              value: args.instanceUrl,
            };
          }

          return param;
        }) || [],
    };

    const response = await this.httpClient.post(API_ENDPOINTS.integrations.createTileInstance(template.tileId), {
      data: {
        dashboard: 'home',
        tileInstanceName: args.tileInstanceName,
        type: 'app',
        connectorId: args.connectorId,
        connectionType: 'user',
        inputConfig: {
          requestSchema: updatedRequestSchema,
          parameters: {},
          personalization: { enabled: false },
        },
      },
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Failed to create tile "${args.tileInstanceName}": ${response.status()} - ${errorText}`);
    }

    const body = await response.json();

    const instanceId = body?.result?.instanceId || body?.data?.tileInstanceId;

    if (!instanceId) {
      throw new Error(`No instance ID returned for tile "${args.tileInstanceName}". Response: ${JSON.stringify(body)}`);
    }

    return { instanceId, templateTileId: args.tileId, tileInstanceName: args.tileInstanceName };
  }

  /**
   * Create a link tile via API
   */
  async createTile(siteId: string, title: string, numberOfLinks: number, links: TileLink[]): Promise<LinkTileResponse> {
    const { frontendBaseUrl } = getEnvConfig();

    // Ensure we don't exceed the provided links count
    const actualLinksCount = Math.min(numberOfLinks, links.length);
    const selectedLinks = links.slice(0, actualLinksCount);

    const payload: LinkTilePayload = {
      siteId: siteId,
      dashboardId: 'site',
      tile: {
        title: title,
        options: {
          layout: 'standard',
          links: selectedLinks,
        },
        pushToAllHomeDashboards: false,
        items: [],
        type: 'links',
        variant: 'custom',
      },
      isNewTiptap: false,
    };

    const response = await this.httpClient.post(API_ENDPOINTS.linkTile.create(siteId), {
      data: payload,
      headers: {
        Origin: frontendBaseUrl,
        Referer: frontendBaseUrl,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Failed to create link tile "${title}": ${response.status()} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Delete a content tile via API
   */
  async deleteContentTile(tileId: string): Promise<APIResponse> {
    const { frontendBaseUrl } = getEnvConfig();

    return await this.httpClient.delete(
      `${API_ENDPOINTS.integrations.contentTiles}/${tileId}?${API_QUERY_PARAMS.HIDE_TILE_FALSE}`,
      {
        headers: {
          Origin: frontendBaseUrl,
          Referer: frontendBaseUrl,
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  /**
   * Delete a link tile via API
   */
  async deleteTile(siteId: string, tileId: string): Promise<APIResponse> {
    const { frontendBaseUrl } = getEnvConfig();

    return await this.httpClient.delete(API_ENDPOINTS.linkTile.delete(siteId, tileId), {
      headers: {
        Origin: frontendBaseUrl,
        Referer: frontendBaseUrl,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }
}
