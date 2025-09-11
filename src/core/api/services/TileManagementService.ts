import { APIRequestContext } from '@playwright/test';

import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { LinkTilePayload, LinkTileResponse, TileLink } from '../../types/tile.type';
import { getEnvConfig } from '../../utils/getEnvConfig';

import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';
import { ITileManagementOperations } from '@/src/core/api/interfaces/ITileManagementOperations';

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

  /**
   * Fetch root tiles instances for app tiles
   */
  async getRootAppTilesInstances(): Promise<any> {
    const { frontendBaseUrl } = getEnvConfig();
    const response = await this.get('/v1/tiles/root/instances?type=app', {
      headers: {
        Origin: frontendBaseUrl,
        Referer: frontendBaseUrl,
        Accept: 'application/json',
      },
    });
    return response.json();
  }

  /**
   * Fetch metadata for a specific root instance (type=app)
   */
  async fetchInstanceMetadata(instanceId: string): Promise<any> {
    const { frontendBaseUrl } = getEnvConfig();
    const res = await this.get(`/v1/tiles/root/instances/${instanceId}/metadata?type=app`, {
      headers: {
        Origin: frontendBaseUrl,
        Referer: frontendBaseUrl,
        Accept: 'application/json',
      },
    });
    return res.json();
  }
  async createTile({
    siteId,
    tileTitle,
    numberOfLinks,
    predefinedLinks,
  }: {
    siteId: string;
    tileTitle: string;
    numberOfLinks: number;
    predefinedLinks: TileLink[];
  }): Promise<LinkTileResponse> {
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

  /**
   * Delete a content tile id (preferred for this tenant)
   */
  async deleteContentTile(contentTileId: string): Promise<number> {
    const { frontendBaseUrl } = getEnvConfig();
    const res = await this.delete(`/v1/content/tiles/${contentTileId}?hideTile=false`, {
      headers: {
        Origin: frontendBaseUrl,
        Referer: frontendBaseUrl,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return res.status();
  }
}
