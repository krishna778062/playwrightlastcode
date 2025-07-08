import { LinkTileResponse, TileLink } from '@/src/core/types/tile.type';

export interface ITileManagementOperations {
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
}
