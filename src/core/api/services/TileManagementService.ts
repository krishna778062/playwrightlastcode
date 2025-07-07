import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';
import { APIRequestContext } from '@playwright/test';
import { ITileManagementOperations } from '@/src/core/api/interfaces/ITileManagementOperations';
import { LinkTilePayload, LinkTileResponse, TileLink } from '../../types/tile.type';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

const defaultTilePayload: LinkTilePayload = {
  siteId: '',
  dashboardId: 'site',
  tile: {
    title: '',
    options: {
      layout: 'standard',
      links: [],
    },
    pushToAllHomeDashboards: false,
    items: [],
    type: 'links',
    variant: 'custom',
  },
  isNewTiptap: false,
};

export class TileManagementService extends BaseApiClient implements ITileManagementOperations {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }
  async createTile(
    siteId: string,
    tileTitle: string,
    numberOfLinks: number,
    predefinedLinks: TileLink[]
  ): Promise<LinkTileResponse> {
    const tile = {
      ...defaultTilePayload,
      siteId,
      tile: {
        ...defaultTilePayload.tile,
        title: tileTitle,
        options: { ...defaultTilePayload.tile.options, links: predefinedLinks.slice(0, numberOfLinks) },
      },
    };
    console.log(`Creating tile with payload: ${JSON.stringify(tile)}`);
    const response = await this.post(API_ENDPOINTS.linkTile.create(tile.siteId), {
      data: tile,
    });
    return response.json();
  }
  async deleteTile(siteId: string, tileId: string): Promise<void> {
    console.log(`Deleting tile ${tileId} from site ${siteId}`);
    const response = await this.delete(API_ENDPOINTS.linkTile.delete(siteId, tileId));
    console.log(`Tile deleted response: ${response.status()}`);
    return response.json();
  }
}
