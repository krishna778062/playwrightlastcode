import { APIRequestContext, APIResponse } from '@playwright/test';

import { HttpClient } from '@core/api/clients/httpClient';

import { API_ENDPOINTS, API_QUERY_PARAMS } from '@/src/core/constants/apiEndpoints';
import { LinkTilePayload, LinkTileResponse, TileLink } from '@/src/modules/integrations/apis/types/tile.type';

export class TileManagementService {
  private httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string,
    readonly frontendBaseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Create a link tile via API
   */
  async createTile(siteId: string, title: string, numberOfLinks: number, links: TileLink[]): Promise<LinkTileResponse> {
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
        Origin: this.frontendBaseUrl,
        Referer: this.frontendBaseUrl,
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
    return await this.httpClient.delete(
      `${API_ENDPOINTS.integrations.contentTiles}/${tileId}?${API_QUERY_PARAMS.HIDE_TILE_FALSE}`,
      {
        headers: {
          Origin: this.frontendBaseUrl,
          Referer: this.frontendBaseUrl,
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
    return await this.httpClient.delete(API_ENDPOINTS.linkTile.delete(siteId, tileId), {
      headers: {
        Origin: this.frontendBaseUrl,
        Referer: this.frontendBaseUrl,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a home dashboard tile via API
   * @param tilePayload - The tile payload
   * @returns Promise with the tile creation response
   */
  async createHomeDashboardTile(tilePayload: {
    siteId?: string | null;
    dashboardId: string;
    tile: {
      title?: string | null;
      options?: any;
      pushToAllHomeDashboards?: boolean;
      items?: any[];
      type: string;
      variant: string;
    };
    isNewTiptap?: boolean;
  }): Promise<any> {
    const response = await this.httpClient.post(API_ENDPOINTS.tile.create, {
      data: tilePayload,
      headers: {
        Origin: this.frontendBaseUrl,
        Referer: this.frontendBaseUrl,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const responseBody = await response.json();
    if (!response.ok() || responseBody.status !== 'success') {
      const errorMessage = responseBody.message || responseBody.error || JSON.stringify(responseBody);
      throw new Error(`Failed to create home dashboard tile. Status: ${response.status()}, Error: ${errorMessage}`);
    }

    return responseBody;
  }

  /**
   * List tiles for a dashboard
   * @param dashboardId - The dashboard ID ('home' or 'site')
   * @param siteId - Optional site ID (null for home dashboard)
   * @returns Promise with the tiles list response
   */
  async listTiles(dashboardId: string, siteId?: string | null): Promise<any> {
    const payload: any = {
      dashboardId,
    };
    if (siteId !== undefined) {
      payload.siteId = siteId;
    }

    const response = await this.httpClient.post(API_ENDPOINTS.integrations.contentTilesList, {
      data: payload,
      headers: {
        Origin: this.frontendBaseUrl,
        Referer: this.frontendBaseUrl,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const responseBody = await response.json();
    if (!response.ok() || responseBody.status !== 'success') {
      throw new Error(`Failed to list tiles. Status: ${response.status()}`);
    }

    return responseBody;
  }

  /**
   * Delete a home dashboard tile via API
   * @param tileId - The tile ID to delete
   * @returns Promise with the delete response
   */
  async deleteHomeDashboardTile(tileId: string): Promise<APIResponse> {
    return await this.httpClient.delete(`${API_ENDPOINTS.tile.create}/${tileId}`, {
      headers: {
        Origin: this.frontendBaseUrl,
        Referer: this.frontendBaseUrl,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }
}
