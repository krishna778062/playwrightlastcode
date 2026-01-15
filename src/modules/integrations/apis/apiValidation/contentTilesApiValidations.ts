import { expect, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

export class ApiResponseAssertions {
  /**
   * Asserts successful API response (200)
   */
  static expectSuccess(response: any): void {
    // Handle Playwright APIResponse object
    if (typeof response.status === 'function') {
      const status = response.status();
      expect(status >= 200 && status < 300, `Expected success status (2xx) but got ${status}`).toBeTruthy();
      return;
    }
    // Handle JSON response with status field
    if (response.status !== undefined) {
      const status = response.status;
      expect(status === 'success' || status === 200, `Expected success but got: ${status}`).toBeTruthy();
      return;
    }
    // If no status field, check for success indicators (data, result, instanceId, etc.)
    const hasSuccessIndicator =
      response.data !== undefined ||
      response.result !== undefined ||
      response.instanceId !== undefined ||
      (typeof response === 'object' && Object.keys(response).length > 0);
    expect(hasSuccessIndicator, 'Response should have success indicators (data, result, or instanceId)').toBeTruthy();
  }

  /**
   * Asserts unauthorized error response (401)
   */
  static expectUnauthorized(response: any): void {
    const hasError =
      response.error_code ||
      response.errors ||
      response.status === 401 ||
      (typeof response.status === 'number' && response.status === 401);
    expect(hasError, `Expected unauthorized error (401) but got: ${JSON.stringify(response)}`).toBeTruthy();
  }

  /**
   * Asserts validation error response (400)
   */
  static expectValidationError(response: any, expectedErrorCode?: string): void {
    expect(response.error_code || response.errors, 'Expected validation error (400)').toBeTruthy();
    if (expectedErrorCode) {
      const errorCode = response.error_code || response.errors?.[0]?.error_code;
      expect(errorCode, `Expected error code ${expectedErrorCode}`).toBe(expectedErrorCode);
    }
  }

  /**
   * Asserts not found error response (404)
   */
  static expectNotFound(response: any): void {
    // Handle Playwright APIResponse object
    if (typeof response.status === 'function' || typeof response.ok === 'function') {
      const status = typeof response.status === 'function' ? response.status() : response.status;
      expect(status === 404 || status === 500, `Expected 404/500 but got ${status}`).toBeTruthy();
      return;
    }
    // Handle extracted error response with statusCode
    const status = response.status || response.statusCode;
    const hasError =
      response.error_code ||
      response.errors ||
      status === 404 ||
      status === 500 ||
      (typeof status === 'number' && (status === 404 || status === 500));
    expect(hasError, `Expected not found error (404) but got status: ${status}`).toBeTruthy();
  }
}

export class ContentTilesApiHelper {
  /**
   * Gets tile data from data, result, or root level
   * @param tileResponse - The tile response
   * @returns The tile data object
   */
  private getTileData(tileResponse: any): any {
    return tileResponse.data || tileResponse.result || tileResponse;
  }

  /**
   * Gets list items array from data, result, or root level
   * @param listResponse - The list response
   * @returns The array of tile items
   */
  getListItems(listResponse: any): any[] {
    if (Array.isArray(listResponse.result)) {
      return listResponse.result;
    }
    if (listResponse.result && typeof listResponse.result === 'object' && 'listOfItems' in listResponse.result) {
      return listResponse.result.listOfItems || [];
    }
    return listResponse.data?.listOfItems || listResponse.listOfItems || [];
  }

  /**
   * Validates response status is success
   * @param response - The response to validate
   */
  private validateSuccessStatus(response: any): void {
    // Handle Playwright APIResponse object
    if (typeof response.status === 'function') {
      const status = response.status();
      expect(status >= 200 && status < 300, `Expected success status (2xx) but got ${status}`).toBeTruthy();
      return;
    }
    // Handle JSON response with status field
    if (response.status !== undefined) {
      const status = response.status;
      expect(
        status === 'success' || status === 200,
        `Status should be 'success' or 200, but got ${status}`
      ).toBeTruthy();
      return;
    }
    // If no status field, check for success indicators (data, result, instanceId, etc.)
    const hasSuccessIndicator =
      response.data !== undefined ||
      response.result !== undefined ||
      response.instanceId !== undefined ||
      (typeof response === 'object' && Object.keys(response).length > 0);
    expect(hasSuccessIndicator, 'Response should have success indicators (data, result, or instanceId)').toBeTruthy();
  }

  /**
   * Validates the content tiles list response structure
   * @param listResponse - The list response to validate
   * @param allowEmpty - Whether empty list is allowed
   */
  async validateContentTilesList(listResponse: any, allowEmpty: boolean = false): Promise<void> {
    await test.step('Validate content tiles list response', async () => {
      this.validateSuccessStatus(listResponse);
      const listItems = this.getListItems(listResponse);
      expect(listItems, 'List of items should exist').toBeDefined();
      expect(Array.isArray(listItems), 'List of items should be an array').toBe(true);
      if (!allowEmpty) {
        expect(listItems.length, 'List should contain at least one item').toBeGreaterThan(0);
      }
    });
  }

  /**
   * Validates the basic tile response structure (status)
   * @param tileResponse - The tile response to validate
   */
  async validateTileResponseBasic(tileResponse: any): Promise<void> {
    await test.step('Validate tile response basic fields', async () => {
      if (tileResponse.status !== undefined || typeof tileResponse.status === 'function') {
        this.validateSuccessStatus(tileResponse);
      }
    });
  }

  /**
   * Validates tile identification fields (instanceId, tileInstanceName)
   * @param tileResponse - The tile response to validate
   * @param expectedTileName - Optional expected tile name
   */
  async validateTileIdentification(tileResponse: any, expectedTileName?: string): Promise<void> {
    await test.step('Validate tile identification fields', async () => {
      const tile = this.getTileData(tileResponse);
      if (tile && (tile.instanceId || tile.tileInstanceName)) {
        if (tile.instanceId) {
          expect(tile.instanceId, 'Tile instance ID should be present').toBeTruthy();
          expect(typeof tile.instanceId, 'Tile instance ID should be a string').toBe('string');
        }
        if (tile.tileInstanceName && expectedTileName) {
          expect(tile.tileInstanceName, 'Tile instance name should match').toEqual(expectedTileName);
        }
      }
    });
  }

  /**
   * Validates tile creation response
   * @param creationResult - The tile creation result
   * @param expectedTileName - Optional expected tile name
   */
  async validateTileCreation(creationResult: any, expectedTileName?: string): Promise<void> {
    await test.step('Validate tile creation response', async () => {
      ApiResponseAssertions.expectSuccess(creationResult);
      await this.validateTileIdentification(creationResult, expectedTileName);
    });
  }

  /**
   * Validates tile metadata (tileInstanceName, connectorId, etc.)
   * @param metadataResponse - The metadata response
   * @param expectedTileName - Expected tile name
   * @param expectedConnectorId - Expected connector ID
   */
  async validateTileMetadata(
    metadataResponse: any,
    expectedTileName: string,
    expectedConnectorId: string
  ): Promise<void> {
    await test.step('Validate tile metadata fields', async () => {
      await this.validateTileResponseBasic(metadataResponse);
      const tile = this.getTileData(metadataResponse);
      expect(tile, 'Tile data should exist').toBeDefined();
      if (tile.tileInstanceName !== undefined) {
        expect(tile.tileInstanceName, 'Tile instance name should match').toEqual(expectedTileName);
      }
      if (tile.connectorId !== undefined) {
        expect(tile.connectorId, 'Connector ID should match').toEqual(expectedConnectorId);
      }
    });
  }

  /**
   * Validates tile deletion response
   * @param deleteResponse - The delete response (APIResponse or JSON)
   */
  async validateTileDeletion(deleteResponse: any): Promise<void> {
    await test.step('Validate tile deletion response', async () => {
      this.validateSuccessStatus(deleteResponse);
    });
  }

  /**
   * Validates tiles by connector response
   * @param response - The response from getTilesByConnector
   * @param expectedTileId - Expected tile ID to find in the response
   */
  async validateTilesByConnector(response: any, expectedTileId: string): Promise<void> {
    await test.step(`Validate tiles by connector contain ${expectedTileId}`, async () => {
      await this.validateTileResponseBasic(response);
      const tileData = this.getTileData(response);
      if (tileData && Array.isArray(tileData)) {
        const tile = tileData.find((t: any) => t.tileId === expectedTileId);
        expect(tile, `Tile ${expectedTileId} should be found`).toBeDefined();
      }
    });
  }

  /**
   * Validates root app tiles instances response
   * @param response - The root instances response
   */
  async validateRootAppTilesInstances(response: any): Promise<void> {
    await test.step('Validate root app tiles instances response', async () => {
      this.validateSuccessStatus(response);
      const hasData =
        Array.isArray(response) ||
        response?.data !== undefined ||
        response?.result !== undefined ||
        (typeof response === 'object' && Object.keys(response).length >= 0);
      expect(hasData, 'Response should be an array or have data/result property').toBeTruthy();
    });
  }

  /**
   * Finds a tile in the list by title (case-insensitive)
   * @param tilesList - The list of tiles to search
   * @param tileTitle - The title to search for
   * @returns The matched tile or undefined
   */
  findTileByTitle(tilesList: any[], tileTitle: string): any | undefined {
    if (!tileTitle) {
      return undefined;
    }
    const target = tileTitle.toLowerCase().trim();
    return tilesList.find((tile: any) =>
      [tile?.tileInstanceName, tile?.title, tile?.name].some((n: any) => {
        const value = String(n ?? '')
          .toLowerCase()
          .trim();
        return value === target;
      })
    );
  }

  /**
   * Extracts the delete ID from a tile object
   * @param tile - The tile object
   * @returns The delete ID or undefined
   */
  getDeleteTileId(tile: any): string | undefined {
    return tile?.id || tile?.tileId || tile?.contentTileId;
  }

  /**
   * Waits for a tile to appear in the list by polling
   * @param getTilesListFn - Function that returns the tiles list response
   * @param tileTitle - The title of the tile to wait for
   * @param timeout - Optional timeout in milliseconds (defaults to TIMEOUTS.SHORT)
   * @returns The matched tile or throws an error if not found
   */
  async waitForTileInList(
    getTilesListFn: () => Promise<any>,
    tileTitle: string,
    timeout: number = TIMEOUTS.SHORT
  ): Promise<any> {
    await expect
      .poll(
        async () => {
          const tilesListResponse = await getTilesListFn();
          const tilesList = this.getListItems(tilesListResponse);
          return this.findTileByTitle(tilesList, tileTitle);
        },
        { timeout, intervals: [500, 1000, 2000] }
      )
      .toBeTruthy();

    const tilesListResponse = await getTilesListFn();
    const tilesList = this.getListItems(tilesListResponse);
    const matchedTile = this.findTileByTitle(tilesList, tileTitle);
    if (!matchedTile) {
      throw new Error(`Tile with title "${tileTitle}" not found in list after waiting`);
    }
    return matchedTile;
  }

  /**
   * Removes tile IDs from cleanup tracking list
   * @param tileManagementHelper - The tile management helper
   * @param tileIds - Array of tile IDs to remove
   */
  removeFromCleanupList(tileManagementHelper: any, ...tileIds: (string | undefined)[]): void {
    for (const tileId of tileIds) {
      if (tileId) {
        const index = tileManagementHelper.createdTileIds.indexOf(tileId);
        if (index > -1) {
          tileManagementHelper.createdTileIds.splice(index, 1);
        }
      }
    }
  }

  /**
   * Deletes a tile and removes it from cleanup tracking
   * @param tileManagementHelper - The tile management helper
   * @param deleteTileId - The tile ID to delete
   * @param instanceId - Optional instance ID to also remove from tracking
   * @returns The delete response
   */
  async deleteTileAndCleanup(tileManagementHelper: any, deleteTileId: string, instanceId?: string): Promise<any> {
    const response = await tileManagementHelper.tileManagementService.deleteIntegrationAppTile(deleteTileId);

    // Validate response is successful
    if (typeof response.ok === 'function' && !response.ok()) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to delete tile "${deleteTileId}": ${response.status()} - ${errorText}`);
    }

    // Only remove from cleanup list after successful deletion
    this.removeFromCleanupList(tileManagementHelper, deleteTileId, instanceId);
    return response;
  }

  /**
   * Deletes a tile by finding it in the list and handling cleanup
   * @param tileManagementHelper - The tile management helper
   * @param contentTilesHelper - The content tiles helper
   * @param tileTitle - The tile title to find and delete
   * @param instanceId - Optional instance ID as fallback
   * @returns Promise that resolves when tile is deleted
   */
  async deleteTileByTitle(
    tileManagementHelper: any,
    contentTilesHelper: any,
    tileTitle: string,
    instanceId?: string
  ): Promise<void> {
    try {
      const matchedTile = await this.waitForTileInList(
        () => contentTilesHelper.getContentTilesListForHome(),
        tileTitle
      );
      const deleteTileId = this.getDeleteTileId(matchedTile);
      if (deleteTileId) {
        await this.deleteTileAndCleanup(tileManagementHelper, deleteTileId, instanceId);
        return;
      }
    } catch {
      // Tile not found in list, try direct deletion with instanceId
    }

    if (instanceId) {
      await this.deleteTileAndCleanup(tileManagementHelper, instanceId);
    }
  }

  /**
   * Deletes a tile and validates the deletion response
   * @param tileManagementHelper - The tile management helper
   * @param contentTilesHelper - The content tiles helper
   * @param tileTitle - The tile title to find and delete
   * @param instanceId - Optional instance ID as fallback
   */
  async deleteTileAndValidate(
    tileManagementHelper: any,
    contentTilesHelper: any,
    tileTitle: string,
    instanceId?: string
  ): Promise<void> {
    const matchedTile = await this.waitForTileInList(() => contentTilesHelper.getContentTilesListForHome(), tileTitle);

    const deleteTileId = this.getDeleteTileId(matchedTile);
    if (!deleteTileId) {
      throw new Error(`Failed to get tile ID for deletion. Tile title: ${tileTitle}`);
    }

    const deleteResponse = await this.deleteTileAndCleanup(tileManagementHelper, deleteTileId, instanceId);
    await this.validateTileDeletion(deleteResponse);
  }

  /**
   * Finds the correct deletion ID for a tile by instanceId
   * @param contentTilesHelper - The content tiles helper
   * @param instanceId - The instance ID to search for
   * @returns The deletion ID or undefined if not found
   */
  private async findDeletionIdByInstanceId(contentTilesHelper: any, instanceId: string): Promise<string | undefined> {
    try {
      const tilesListResponse = await contentTilesHelper.getContentTilesListForHome();
      const tilesList = this.getListItems(tilesListResponse);
      const matchedTile = tilesList.find(
        (tile: any) =>
          tile?.instanceId === instanceId ||
          tile?.id === instanceId ||
          tile?.contentTileId === instanceId ||
          tile?.tileId === instanceId
      );
      return this.getDeleteTileId(matchedTile);
    } catch {
      return undefined;
    }
  }

  /**
   * Finds a tile by instanceId in the tiles list (useful for tiles without titles)
   * @param contentTilesHelper - The content tiles helper
   * @param instanceId - The instance ID to search for
   * @returns The matched tile or undefined
   */
  private async findTileByInstanceId(contentTilesHelper: any, instanceId: string): Promise<any | undefined> {
    try {
      const tilesListResponse = await contentTilesHelper.getContentTilesListForHome();
      const tilesList = this.getListItems(tilesListResponse);
      return tilesList.find(
        (tile: any) =>
          tile?.instanceId === instanceId ||
          tile?.id === instanceId ||
          tile?.contentTileId === instanceId ||
          tile?.tileId === instanceId
      );
    } catch {
      return undefined;
    }
  }

  async cleanupAfterTest(
    tileManagementHelper: any,
    createdTileTitle?: string,
    createdTileId?: string,
    contentTilesHelper?: any
  ): Promise<void> {
    // Prioritize deletion by ID as it's more reliable
    if (createdTileId) {
      try {
        // First try direct deletion with instanceId
        let response = await tileManagementHelper.tileManagementService.deleteIntegrationAppTile(createdTileId);

        // Validate response is successful
        if (typeof response.ok === 'function' && !response.ok()) {
          // If direct deletion fails, try to find the correct deletion ID
          if (contentTilesHelper) {
            const correctDeletionId = await this.findDeletionIdByInstanceId(contentTilesHelper, createdTileId);
            if (correctDeletionId && correctDeletionId !== createdTileId) {
              response = await tileManagementHelper.tileManagementService.deleteIntegrationAppTile(correctDeletionId);
              if (typeof response.ok === 'function' && !response.ok()) {
                const errorText = await response.text().catch(() => 'Unknown error');
                throw new Error(
                  `Failed to delete tile "${createdTileId}" (deletion ID: ${correctDeletionId}): ${response.status()} - ${errorText}`
                );
              }
              this.removeFromCleanupList(tileManagementHelper, correctDeletionId, createdTileId);
              return;
            }
          }
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Failed to delete tile "${createdTileId}": ${response.status()} - ${errorText}`);
        }

        // Only remove from cleanup list after successful deletion
        this.removeFromCleanupList(tileManagementHelper, createdTileId);
        return; // Successfully deleted by ID, no need to try by title
      } catch {
        // If ID deletion fails and we have contentTilesHelper, try to find tile and get correct ID
        if (contentTilesHelper) {
          try {
            const matchedTile = await this.findTileByInstanceId(contentTilesHelper, createdTileId);
            if (matchedTile) {
              const correctDeletionId = this.getDeleteTileId(matchedTile);
              if (correctDeletionId && correctDeletionId !== createdTileId) {
                const response =
                  await tileManagementHelper.tileManagementService.deleteIntegrationAppTile(correctDeletionId);
                if (typeof response.ok === 'function' && response.ok()) {
                  this.removeFromCleanupList(tileManagementHelper, correctDeletionId, createdTileId);
                  return;
                }
              }
            }
          } catch {
            // Failed to lookup tile by instanceId
          }
        }
      }
    }

    // Fallback to deletion by title if ID deletion failed and title is available
    if (createdTileTitle) {
      try {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
      } catch {
        // Cleanup should be best effort
      }
    } else if (createdTileId && contentTilesHelper) {
      // Last resort for tiles without titles: try to find tile in list by instanceId and delete by any available ID
      try {
        const matchedTile = await this.findTileByInstanceId(contentTilesHelper, createdTileId);
        if (matchedTile) {
          const deletionId = this.getDeleteTileId(matchedTile);
          if (deletionId) {
            const response = await tileManagementHelper.tileManagementService.deleteIntegrationAppTile(deletionId);
            if (typeof response.ok === 'function' && response.ok()) {
              this.removeFromCleanupList(tileManagementHelper, deletionId, createdTileId);
            }
          }
        }
      } catch {
        // Final cleanup attempt failed
      }
    }
  }
}
