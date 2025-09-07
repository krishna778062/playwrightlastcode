import { LinkTileResponse, TileLink } from '@/src/core/types/tile.type';

export interface ITileManagementOperations {
  /**
   * Fetch root app tiles instances
   * @returns Promise<any>
   */
  getRootAppTilesInstances(): Promise<any>;
  /**
   * Fetch metadata for a specific root instance
   * @param instanceId - The instance ID
   * @returns Promise<any>
   */
  fetchInstanceMetadata(instanceId: string): Promise<any>;
  /**
   * Create link tile
   * @param siteId - The site ID
   * @param tileTitle - The tile title
   * @param numberOfLinks - The number of links
   * @param predefinedLinks - The predefined links
   * @returns Promise<LinkTileResponse>
   */
  createTile(
    siteId: string,
    tileTitle: string,
    numberOfLinks: number,
    predefinedLinks: TileLink[]
  ): Promise<LinkTileResponse>;
  /**
   * Delete link tile
   * @param siteId - The site ID
   * @param tileId - The tile ID
   * @returns Promise<void>
   */
  deleteTile(siteId: string, tileId: string): Promise<void>;
  /**
   * Delete a content tile
   * @param contentTileId - The content tile ID
   * @returns Promise<number>
   */
  deleteContentTile(contentTileId: string): Promise<number>;
}
