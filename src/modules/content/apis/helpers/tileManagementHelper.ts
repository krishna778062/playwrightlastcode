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
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(appManagerApiContext, baseUrl);
    this.tileManagementService = new TileManagementService(appManagerApiContext, baseUrl);
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

  async cleanup(): Promise<void> {}
}
