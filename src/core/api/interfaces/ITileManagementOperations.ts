import { APIResponse } from '@playwright/test';

import { TileCreationResult } from '@core/types/tile.type';

// Operations for all Tile Management (used by TileManagementService)
export interface ITileManagementOperations {
  getRootAppTilesInstances(): Promise<any>;
  fetchInstanceMetadata(instanceId: string): Promise<any>;
  deleteIntegrationAppTile(integrationAppTileId: string): Promise<APIResponse>;
  createIntegrationAppTile(args: {
    tileInstanceName: string;
    tileId: string;
    connectorId: string;
  }): Promise<TileCreationResult>;
}
