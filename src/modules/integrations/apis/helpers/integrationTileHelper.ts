/**
 * Integration Tile Management Helper
 *
 * This class provides integration tile management functionality for integration tests.
 * It handles integration app tile creation and deletion operations through API calls.
 * @author Integration Test Team
 */

import { APIRequestContext, test } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { TileManagementService } from '@/src/modules/integrations/apis/services/TileManagementService';

export class IntegrationTileHelper {
  readonly httpClient: HttpClient;
  readonly tileManagementService: TileManagementService;
  constructor(
    readonly appManagerApiContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(appManagerApiContext, baseUrl);
    this.tileManagementService = new TileManagementService(appManagerApiContext, baseUrl);
  }

  /**
   * Create an app tile with the given title, ID, and connector ID
   * @param tileTitle - The title of the tile
   * @param tileId - The ID of the tile
   * @param connectorId - The ID of the connector
   */
  async createIntegrationAppTile(tileTitle: string, tileId: string, connectorId: string): Promise<void> {
    await test.step(`Create app tile: ${tileTitle}`, async () => {
      await this.tileManagementService.createIntegrationAppTile({
        tileInstanceName: tileTitle,
        tileId,
        connectorId,
      });
    });
  }

  /**
   * Create an app tile with the given title, ID, connector ID, and configuration parameters
   * @param tileTitle - The title of the tile
   * @param tileId - The ID of the tile
   * @param connectorId - The ID of the connector
   * @param config - Configuration object with scheduleUrl for UKG WFM, timePeriod for ServiceNow, instanceUrl for UKG Pro, or boardId for Monday.com
   */
  async createIntegrationAppTileWithSettings(
    tileTitle: string,
    tileId: string,
    connectorId: string,
    config: { scheduleUrl?: string; timePeriod?: string; instanceUrl?: string; boardId?: string }
  ): Promise<void> {
    await test.step(`Create app tile with configured settings: ${tileTitle}`, async () => {
      await this.tileManagementService.createIntegrationAppTileWithSettings({
        tileInstanceName: tileTitle,
        tileId,
        connectorId,
        scheduleUrl: config.scheduleUrl,
        timePeriod: config.timePeriod,
        instanceUrl: config.instanceUrl,
        boardId: config.boardId,
      });
    });
  }

  /**
   * Remove an integration app tile by title
   * @param tileTitle - The title of the tile to remove
   */
  async removeIntegrationAppTile(tileTitle: string): Promise<void> {
    const integrationTiles = await this.getIntegrationTilesList();
    const target = tileTitle.toLowerCase().trim();
    const matchedTile = integrationTiles.find((tile: any) =>
      [tile?.tileInstanceName, tile?.title, tile?.name].some(
        (n: any) =>
          String(n ?? '')
            .toLowerCase()
            .trim() === target
      )
    );

    const integrationTileId = matchedTile?.id || matchedTile?.tileId || matchedTile?.contentTileId;
    if (!integrationTileId) {
      throw new Error(`Delete Flow: Failed to get integration app tile id based on title ${tileTitle}`);
    }

    await this.tileManagementService.deleteIntegrationAppTile(integrationTileId);
  }

  /**
   * Get list of integration tiles
   * @private
   */
  private async getIntegrationTilesList(): Promise<any[]> {
    const { frontendBaseUrl, tenantUserRoleId } = getEnvConfig();
    //if tenantUserRoleId is not set, throw an error
    if (!tenantUserRoleId) {
      throw new Error('Tenant user role ID is not set');
    }
    const frontendHost = new URL(frontendBaseUrl).host;

    const headers: Record<string, string> = {
      Origin: frontendBaseUrl,
      Referer: frontendBaseUrl,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-smtip-f-host': frontendHost,
      'x-smtip-tenant-user-role': tenantUserRoleId,
    };

    const res = await this.httpClient.post(API_ENDPOINTS.integrations.contentTilesList, {
      data: { siteId: null, dashboardId: 'home' },
      headers,
      timeout: 30000,
    });

    if (!res.ok()) return [];

    const json: any = await res.json().catch(() => ({}));
    return Array.isArray(json?.result?.listOfItems) ? json.result.listOfItems : [];
  }

  async cleanup(): Promise<void> {}
}
