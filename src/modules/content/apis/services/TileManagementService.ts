import { APIRequestContext, APIResponse } from '@playwright/test';

import { HttpClient } from '@core/api/clients/httpClient';

import { API_ENDPOINTS, API_QUERY_PARAMS } from '@/src/core/constants/apiEndpoints';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';
import { LinkTilePayload, LinkTileResponse, TileLink } from '@/src/modules/integrations/apis/types/tile.type';

export class TileManagementService {
  private httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
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
