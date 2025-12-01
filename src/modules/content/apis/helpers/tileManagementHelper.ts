/**
 * Tile Management Helper
 *
 * This class provides comprehensive tile management functionality for integration tests.
 * It handles tile deletion and cleanup operations through API calls.
 * @author Integration Test Team
 * @version 2.0
 */

import { APIRequestContext, test } from '@playwright/test';

import { TileManagementService } from '../services/TileManagementService';

import { HttpClient } from '@/src/core/api/clients/httpClient';

export class TileManagementHelper {
  readonly httpClient: HttpClient;
  readonly tileManagementService: TileManagementService;
  constructor(
    readonly appManagerApiContext: APIRequestContext,
    readonly baseUrl: string,
    readonly frontendBaseUrl: string
  ) {
    this.httpClient = new HttpClient(appManagerApiContext, baseUrl);
    this.tileManagementService = new TileManagementService(appManagerApiContext, baseUrl, frontendBaseUrl);
  }

  /**
   * Delete a content tile by ID
   * @param tileId - The ID of the tile to delete
   */
  async deleteContentTile(tileId: string): Promise<void> {
    await test.step(`Delete content tile: ${tileId}`, async () => {
      const response = await this.tileManagementService.deleteContentTile(tileId);

      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(`Failed to delete content tile "${tileId}": ${response.status()} - ${errorText}`);
      }
    });
  }

  /**
   * Create a home dashboard tile
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
    return await test.step('Create home dashboard tile', async () => {
      return await this.tileManagementService.createHomeDashboardTile(tilePayload);
    });
  }

  /**
   * List tiles for a dashboard
   * @param dashboardId - The dashboard ID ('home' or 'site')
   * @param siteId - Optional site ID (null for home dashboard)
   * @returns Promise with the tiles list response
   */
  async listTiles(dashboardId: string, siteId?: string | null): Promise<any> {
    return await test.step(`List tiles for dashboard: ${dashboardId}`, async () => {
      return await this.tileManagementService.listTiles(dashboardId, siteId);
    });
  }

  /**
   * Delete a home dashboard tile
   * @param tileId - The tile ID to delete
   * @returns Promise with the delete response
   */
  async deleteHomeDashboardTile(tileId: string): Promise<void> {
    return await test.step(`Delete home dashboard tile: ${tileId}`, async () => {
      const response = await this.tileManagementService.deleteHomeDashboardTile(tileId);
      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(`Failed to delete home dashboard tile "${tileId}": ${response.status()} - ${errorText}`);
      }
    });
  }

  async cleanup(): Promise<void> {}
}
