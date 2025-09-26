/**
 * Tile Management Helper
 *
 * This class provides comprehensive tile management functionality for integration tests.
 * It handles tile deletion and cleanup operations through API calls.
 * @author Integration Test Team
 * @version 2.0
 */

import { test } from '@playwright/test';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { waitUntilTilePresentInApi } from '@/src/modules/integrations/api/helpers/tileApiHelpers';

export class TileManagementHelper {
  constructor(
    private appManagerApiClient: AppManagerApiClient,
    private page?: any
  ) {}

  async removeIntegrationAppTile(tileTitle: string): Promise<void> {
    const contentTiles = await this.getIntegrationTilesList();
    const target = tileTitle.toLowerCase().trim();
    const matchedTile = contentTiles.find((tile: any) =>
      [tile?.tileInstanceName, tile?.title, tile?.name].some(
        (n: any) =>
          String(n ?? '')
            .toLowerCase()
            .trim() === target
      )
    );

    const integrationTileId = matchedTile?.contentTileId || matchedTile?.id || matchedTile?.tileId;
    if (!integrationTileId) {
      throw new Error(`Delete Flow: Failed to get integration app tile id based on title ${tileTitle}`);
    }

    await this.appManagerApiClient.getTileManagementService().deleteIntegrationAppTile(integrationTileId);
  }

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

    const res = await this.appManagerApiClient.post('/v1/content/tiles/list', {
      data: { siteId: null, dashboardId: 'home' },
      headers,
      timeout: 30000,
    });

    if (!res.ok()) return [];

    const json: any = await res.json().catch(() => ({}));
    return Array.isArray(json?.result?.listOfItems) ? json.result.listOfItems : [];
  }

  /**
   * Create an app tile with the given title, ID, and connector ID
   * @param tileTitle - The title of the tile
   * @param tileId - The ID of the tile
   * @param connectorId - The ID of the connector
   */
  async createIntegrationAppTile(tileTitle: string, tileId: string, connectorId: string): Promise<void> {
    await test.step(`Create app tile: ${tileTitle}`, async () => {
      await this.appManagerApiClient.getTileManagementService().createIntegrationAppTile({
        tileInstanceName: tileTitle,
        tileId,
        connectorId,
      });

      // Wait for tile to be available in API before returning
      if (this.page) {
        await waitUntilTilePresentInApi(this.page, tileTitle);
      }
    });
  }

  /**
   * Create an app tile with the given title, ID, connector ID, and configuration parameters
   * @param tileTitle - The title of the tile
   * @param tileId - The ID of the tile
   * @param connectorId - The ID of the connector
   * @param config - Configuration object with scheduleUrl for UKG WFM, timePeriod for ServiceNow, or instanceUrl for UKG Pro
   */
  async createIntegrationAppTileWithSettings(
    tileTitle: string,
    tileId: string,
    connectorId: string,
    config: { scheduleUrl?: string; timePeriod?: string; instanceUrl?: string }
  ): Promise<void> {
    await test.step(`Create app tile with configured settings: ${tileTitle}`, async () => {
      await this.appManagerApiClient.getTileManagementService().createIntegrationAppTileWithSettings({
        tileInstanceName: tileTitle,
        tileId,
        connectorId,
        scheduleUrl: config.scheduleUrl,
        timePeriod: config.timePeriod,
        instanceUrl: config.instanceUrl,
      });

      // Wait for tile to be available in API before returning
      if (this.page) {
        await waitUntilTilePresentInApi(this.page, tileTitle);
      }
    });
  }

  async cleanup(): Promise<void> {}
}
