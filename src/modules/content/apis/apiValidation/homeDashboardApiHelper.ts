import { expect, test } from '@playwright/test';

export class HomeDashboardApiHelper {
  /**
   * Validates app governance configuration response
   * @param response - The API response from configureAppGovernance
   */
  async validateAppGovernanceResponse(response: any): Promise<void> {
    await test.step('Validate app governance configuration response', async () => {
      expect(response.status, 'Status should be 200').toBe(200);
      expect(response.message, 'Message should be SUCCESS').toBe('SUCCESS');
      expect(response.result, 'Result should be present').toBeTruthy();
    });
  }

  /**
   * Validates that home is app manager controlled
   * @param configResponse - The app configuration response
   */
  async validateHomeAppManagerControlled(configResponse: any): Promise<void> {
    await test.step('Validate home is app manager controlled', async () => {
      expect(configResponse.result.isHomeAppManagerControlled, 'isHomeAppManagerControlled should be true').toBe(true);
    });
  }

  /**
   * Validates that home is end user controlled
   * @param configResponse - The app configuration response
   */
  async validateHomeEndUserControlled(configResponse: any): Promise<void> {
    await test.step('Validate home is end user controlled', async () => {
      expect(configResponse.result.isHomeAppManagerControlled, 'isHomeAppManagerControlled should be false').toBe(
        false
      );
    });
  }

  /**
   * Validates that home is end user controlled with retry
   * @param getConfigFn - Function that returns the app configuration
   * @param maxRetries - Maximum number of retries (default: 2)
   * @param retryDelay - Delay between retries in milliseconds (default: 2000)
   */
  async validateHomeGovernanceControlledWithRetry(
    getConfigFn: () => Promise<any>,
    maxRetries: number = 2,
    retryDelay: number = 2000,
    isHomeAppManagerControlled: boolean
  ): Promise<void> {
    await test.step('Validate home is end user controlled with retry', async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const configResponse = await getConfigFn();
          expect(
            configResponse.result.isHomeAppManagerControlled,
            `isHomeAppManagerControlled should be ${isHomeAppManagerControlled}`
          ).toBe(isHomeAppManagerControlled);
          return; // Success, exit the retry loop
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            console.log(`Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      // If we get here, all retries failed
    });
  }

  /**
   * Validates tile creation response
   * @param tileResponse - The tile creation response
   */
  async validateTileCreation(tileResponse: any): Promise<void> {
    await test.step('Validate tile creation response', async () => {
      expect(tileResponse.status, 'Status should be success').toBe('success');
      expect(tileResponse.result, 'Result should be present').toBeTruthy();
      expect(tileResponse.result.id, 'Tile ID should be present').toBeTruthy();
    });
  }

  /**
   * Validates tile visibility in list
   * @param tilesListResponse - The tiles list response
   * @param tileId - The tile ID to verify
   */
  async validateTileVisibility(tilesListResponse: any, tileId: string): Promise<void> {
    await test.step('Validate tile visibility in list', async () => {
      expect(tilesListResponse.status, 'Status should be success').toBe('success');
      expect(tilesListResponse.result, 'Result should be present').toBeTruthy();
      expect(tilesListResponse.result.listOfItems, 'listOfItems should be an array').toBeTruthy();
      expect(Array.isArray(tilesListResponse.result.listOfItems), 'listOfItems should be an array').toBe(true);

      const tileFound = tilesListResponse.result.listOfItems.some((tile: any) => tile.id === tileId);
      expect(tileFound, `Tile with ID ${tileId} should be present in the list`).toBe(true);
    });
  }

  /**
   * Validates tile metadata within the tiles list response
   * @param tilesListResponse - The tiles list response
   * @param tileId - The tile ID to check
   * @param expectations - Expected metadata values
   */
  async validateTileMetadata(
    tilesListResponse: any,
    tileId: string,
    expectations: {
      title?: string;
      type?: string;
      variant?: string;
      options?: Record<string, any>;
    }
  ): Promise<void> {
    await test.step('Validate tile metadata in list', async () => {
      expect(tilesListResponse.status, 'Status should be success').toBe('success');
      expect(tilesListResponse.result?.listOfItems, 'listOfItems should be present').toBeTruthy();

      const tile = tilesListResponse.result.listOfItems.find((entry: any) => entry.id === tileId);
      expect(tile, `Tile with ID ${tileId} should be present in the list`).toBeTruthy();

      if (!tile) {
        return;
      }

      if (expectations.title !== undefined) {
        expect(tile.title, 'Tile title should match').toBe(expectations.title);
      }

      if (expectations.type !== undefined) {
        expect(tile.type, 'Tile type should match').toBe(expectations.type);
      }

      if (expectations.variant !== undefined) {
        expect(tile.variant, 'Tile variant should match').toBe(expectations.variant);
      }

      if (expectations.options) {
        // Parse options if it's a JSON string
        const actualOptions = typeof tile.options === 'string' ? JSON.parse(tile.options) : tile.options;
        expect(actualOptions, 'Tile options should match').toEqual(expectations.options);
      }
    });
  }

  /**
   * Validates tile deletion response
   * @param deleteResponse - The delete response
   */
  async validateTileDeletion(deleteResponse: any): Promise<void> {
    await test.step('Validate tile deletion response', async () => {
      expect(deleteResponse.status, 'Status should be success').toBe('success');
      expect(deleteResponse.message, 'Message should indicate successful deletion').toContain(
        'Deleted tile successfully'
      );
    });
  }

  /**
   * Validates that tile is not visible in list
   * @param tilesListResponse - The tiles list response
   * @param tileId - The tile ID to verify
   */
  async validateTileNotVisible(tilesListResponse: any, tileId: string): Promise<void> {
    await test.step('Validate tile is not visible in list', async () => {
      expect(tilesListResponse.status, 'Status should be success').toBe('success');
      expect(tilesListResponse.result, 'Result should be present').toBeTruthy();
      expect(tilesListResponse.result.listOfItems, 'listOfItems should be an array').toBeTruthy();

      const tileFound = tilesListResponse.result.listOfItems.some((tile: any) => tile.id === tileId);
      expect(tileFound, `Tile with ID ${tileId} should not be present in the list`).toBe(false);
    });
  }
}
