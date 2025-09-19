import { APIResponse } from '@playwright/test';

import { LinkTileResponse, TileCreationResult, TileLink } from '@core/types/tile.type';

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
  createTile(siteId: string, title: string, numberOfLinks: number, links: TileLink[]): Promise<LinkTileResponse>;
  deleteTile(siteId: string, tileId: string): Promise<APIResponse>;
}
