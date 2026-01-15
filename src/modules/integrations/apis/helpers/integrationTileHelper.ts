/**
 * Integration Tile Management Helper
 *
 * This class provides integration tile management functionality for integration tests.
 * It handles integration app tile creation and deletion operations through API calls.
 * @author Integration Test Team
 */

import { APIRequestContext, test } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { TileManagementService } from '@/src/modules/integrations/apis/services/TileManagementService';
import { getTenantConfig } from '@/src/modules/integrations/config/integration.config';

export interface TileCreationPayload {
  tileInstanceName: string;
  tileId: string;
  connectorId: string;
}

export class IntegrationTileHelper {
  readonly httpClient: HttpClient;
  readonly tileManagementService: TileManagementService;
  public createdTileIds: string[] = [];

  constructor(
    readonly appManagerApiContext: APIRequestContext,
    readonly baseUrl: string,
    readonly frontendBaseUrl?: string
  ) {
    this.httpClient = new HttpClient(appManagerApiContext, baseUrl);
    // Use provided frontendBaseUrl or fall back to getTenantConfig for backward compatibility
    let resolvedFrontendBaseUrl = frontendBaseUrl;
    if (!resolvedFrontendBaseUrl) {
      try {
        const tenantConfig = getTenantConfig();
        resolvedFrontendBaseUrl = tenantConfig.frontendBaseUrl;
      } catch {
        // getTenantConfig might not be initialized in all contexts
      }
    }
    if (!resolvedFrontendBaseUrl) {
      throw new Error('frontendBaseUrl is required for IntegrationTileHelper');
    }
    this.tileManagementService = new TileManagementService(appManagerApiContext, baseUrl, resolvedFrontendBaseUrl);
  }

  /**
   * Builds a valid tile creation payload
   * @param overrides - Optional overrides for the payload
   * @returns A valid tile creation payload
   */
  buildValidTilePayload(overrides: Partial<TileCreationPayload> = {}): TileCreationPayload {
    return {
      tileInstanceName: overrides.tileInstanceName || `Test Tile ${Date.now()}`,
      tileId: overrides.tileId || '',
      connectorId: overrides.connectorId || '',
      ...overrides,
    };
  }

  /**
   * Builds an invalid tile creation payload for negative testing
   * @param overrides - Optional overrides for the payload
   * @returns An invalid tile creation payload
   */
  buildInvalidTilePayload(overrides: Partial<TileCreationPayload> = {}): Partial<TileCreationPayload> {
    return {
      tileInstanceName: overrides.tileInstanceName,
      tileId: overrides.tileId,
      connectorId: overrides.connectorId,
      ...overrides,
    };
  }

  /**
   * Create an app tile with the given title, ID, and connector ID
   * @param tileTitle - The title of the tile
   * @param tileId - The ID of the tile
   * @param connectorId - The ID of the connector
   */
  async createIntegrationAppTile(tileTitle: string, tileId: string, connectorId: string): Promise<void> {
    await test.step(`Create app tile: ${tileTitle}`, async () => {
      await this.tileManagementService.createIntegrationAppTile({
        tileInstanceName: tileTitle,
        tileId,
        connectorId,
      });
    });
  }

  /**
   * Creates a tile and returns the creation result with validation
   * @param payload - The tile creation payload
   * @returns Object with tileId, response, and tileInstanceName
   */
  async createAndValidate(payload: TileCreationPayload): Promise<{
    tileId: string;
    response: any;
    tileInstanceName: string;
  }> {
    const result = await this.tileManagementService.createIntegrationAppTile(payload);
    const tileId = result.instanceId;
    if (tileId) {
      this.createdTileIds.push(tileId);
    }
    // Create a response-like object for validation
    const response = {
      instanceId: result.instanceId,
      templateTileId: result.templateTileId,
      tileInstanceName: result.tileInstanceName,
      status: 'success',
    };
    return {
      tileId: tileId || '',
      response,
      tileInstanceName: payload.tileInstanceName,
    };
  }

  /**
   * Creates a tile and returns only the tile ID
   * @param payload - The tile creation payload
   * @returns The tile instance ID
   */
  async createAndGetId(payload: TileCreationPayload): Promise<string> {
    const result = await this.tileManagementService.createIntegrationAppTile(payload);
    const tileId = result.instanceId;
    if (!tileId) {
      throw new Error(`Failed to create tile - instanceId is undefined`);
    }
    this.createdTileIds.push(tileId);
    return tileId;
  }

  /**
   * Create an app tile with the given title, ID, connector ID, and configuration parameters
   * @param tileTitle - The title of the tile
   * @param tileId - The ID of the tile
   * @param connectorId - The ID of the connector
   * @param config - Configuration object with scheduleUrl for UKG WFM, timePeriod for ServiceNow, instanceUrl for UKG Pro, or boardId for Monday.com
   */
  async createIntegrationAppTileWithSettings(
    tileTitle: string,
    tileId: string,
    connectorId: string,
    config: { scheduleUrl?: string; timePeriod?: string; instanceUrl?: string; boardId?: string }
  ): Promise<void> {
    await test.step(`Create app tile with configured settings: ${tileTitle}`, async () => {
      await this.tileManagementService.createIntegrationAppTileWithSettings({
        tileInstanceName: tileTitle,
        tileId,
        connectorId,
        scheduleUrl: config.scheduleUrl,
        timePeriod: config.timePeriod,
        instanceUrl: config.instanceUrl,
        boardId: config.boardId,
      });
    });
  }

  /**
   * Remove an integration app tile by title
   * @param tileTitle - The title of the tile to remove
   */
  async removeIntegrationAppTile(tileTitle: string): Promise<void> {
    const integrationTiles = await this.getIntegrationTilesList();
    const target = tileTitle.toLowerCase().trim();
    const matchedTile = integrationTiles.find((tile: any) =>
      [tile?.tileInstanceName, tile?.title, tile?.name].some((n: any) => {
        const value = String(n ?? '')
          .toLowerCase()
          .trim();
        return value === target || value.startsWith(target);
      })
    );

    const integrationTileId =
      matchedTile?.id || matchedTile?.tileId || matchedTile?.contentTileId || matchedTile?.instanceId;
    if (!integrationTileId) {
      return;
    }

    const response = await this.tileManagementService.deleteIntegrationAppTile(integrationTileId);

    // Validate response is successful
    if (typeof response.ok === 'function' && !response.ok()) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Failed to delete tile "${tileTitle}" (ID: ${integrationTileId}): ${response.status()} - ${errorText}`
      );
    }

    // Remove from cleanup list if deletion was successful
    const index = this.createdTileIds.indexOf(integrationTileId);
    if (index > -1) {
      this.createdTileIds.splice(index, 1);
    }
  }

  /**
   * Get list of integration tiles
   * @private
   */
  private async getIntegrationTilesList(): Promise<any[]> {
    const tenantConfig = getTenantConfig() as any;
    const frontendBaseUrl = tenantConfig.frontendBaseUrl;

    const headers: Record<string, string> = {
      Origin: frontendBaseUrl,
      Referer: frontendBaseUrl,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const res = await this.httpClient.post(API_ENDPOINTS.integrations.contentTilesList, {
      data: { siteId: null, dashboardId: 'home' },
      headers,
      timeout: 30000,
    });

    if (!res.ok()) return [];

    const json: any = await res.json().catch(() => ({}));
    return Array.isArray(json?.result?.listOfItems) ? json.result.listOfItems : [];
  }

  /**
   * Executes an API call and returns error response instead of throwing
   * Used for negative testing scenarios
   */
  private async attemptApiCall(apiCall: () => Promise<any>): Promise<any> {
    try {
      return await apiCall();
    } catch (error: any) {
      return await this.extractErrorResponse(error);
    }
  }

  /**
   * Extracts error response from error object or API response
   */
  private async extractErrorResponse(error: any): Promise<any> {
    // If error has a response object (Playwright APIResponse)
    if (error?.response) {
      const response = error.response;
      if (typeof response.json === 'function') {
        try {
          const json = await response.json();
          return {
            status: response.status(),
            statusCode: response.status(),
            ...json,
          };
        } catch {
          return {
            status: response.status(),
            statusCode: response.status(),
            message: await response.text().catch(() => 'Unknown error'),
          };
        }
      }
      return response;
    }

    // If error has json property
    if (error?.json) {
      return error.json;
    }

    // Extract from error message if it contains HTTP status info
    // This handles errors from createIntegrationAppTile: "Failed to create tile "...": 400 - {...}"
    if (error?.message && (error.message.includes('HTTP') || error.message.includes('Failed'))) {
      // Try to extract status code from message like "Failed to create tile...: 400 - {...}" or "854 - {...}"
      const statusMatch = error.message.match(/:?\s*(\d{3,4})\s*-/);
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : 400;

      // Try to extract JSON from error message (after the status code)
      let errorData: any = {};
      const jsonMatch = error.message.match(/\d+\s*-\s*(\{.*\})/s);
      if (jsonMatch) {
        try {
          errorData = JSON.parse(jsonMatch[1]);
        } catch {
          // If JSON parsing fails, try to find JSON anywhere in the message
          const anyJsonMatch = error.message.match(/\{.*\}/s);
          if (anyJsonMatch) {
            try {
              errorData = JSON.parse(anyJsonMatch[0]);
            } catch {
              // If still fails, use empty object
            }
          }
        }
      }

      const errorCodeMatch = error.message.match(/Error Code:\s*([^,]+)/);
      return {
        status: statusCode,
        statusCode: statusCode,
        error_code: errorData.error_code || errorCodeMatch?.[1]?.trim() || 'N/A',
        errors: errorData.errors || error.errors || (errorData.error_code ? [errorData] : []),
        message: errorData.message || error.message,
        ...errorData,
      };
    }

    // If error is a Response object (Playwright APIResponse)
    if (error && typeof error.json === 'function') {
      try {
        const json = await error.json();
        return {
          status: error.status(),
          statusCode: error.status(),
          ...json,
        };
      } catch {
        return {
          status: error.status(),
          statusCode: error.status(),
          message: await error.text().catch(() => 'Unknown error'),
        };
      }
    }

    // If error is thrown from createIntegrationAppTile, it might have the response embedded
    // Check if error.message contains a status code pattern
    if (error?.message) {
      const statusMatch = error.message.match(/(\d{3,4})/);
      if (statusMatch) {
        const statusCode = parseInt(statusMatch[1]);
        // Try to extract JSON from the error message
        const jsonMatch = error.message.match(/\{.*\}/s);
        if (jsonMatch) {
          try {
            const errorData = JSON.parse(jsonMatch[0]);
            return {
              status: statusCode,
              statusCode: statusCode,
              ...errorData,
            };
          } catch {
            // If parsing fails, return with status
          }
        }
        return {
          status: statusCode,
          statusCode: statusCode,
          message: error.message,
          errors: error.errors || [],
        };
      }
    }

    return {
      status: error.statusCode || error.status || 400,
      statusCode: error.statusCode || error.status || 400,
      error_code: error.error_code || 'N/A',
      errors: error.errors || [],
      message: error.message || 'Unknown error',
    };
  }

  /**
   * Attempts to create tile with invalid connector ID
   * Returns error response instead of throwing for negative testing
   */
  async attemptCreateWithInvalidConnectorId(args: {
    tileInstanceName: string;
    tileId: string;
    connectorId: string;
  }): Promise<any> {
    return this.attemptApiCall(() =>
      this.tileManagementService.createIntegrationAppTile({
        tileInstanceName: args.tileInstanceName,
        connectorId: args.connectorId,
        tileId: args.tileId,
      })
    );
  }

  /**
   * Attempts to create tile with invalid tile ID
   * Returns error response instead of throwing for negative testing
   */
  async attemptCreateWithInvalidTileId(args: {
    tileInstanceName: string;
    tileId: string;
    connectorId: string;
  }): Promise<any> {
    return this.attemptApiCall(() =>
      this.tileManagementService.createIntegrationAppTile({
        tileInstanceName: args.tileInstanceName,
        connectorId: args.connectorId,
        tileId: args.tileId,
      })
    );
  }

  /**
   * Attempts to create tile with empty tile instance name
   * Returns error response instead of throwing for negative testing
   */
  async attemptCreateWithEmptyTileInstanceName(args: { tileId: string; connectorId: string }): Promise<any> {
    return this.attemptApiCall(() =>
      this.tileManagementService.createIntegrationAppTile({
        tileInstanceName: '',
        connectorId: args.connectorId,
        tileId: args.tileId,
      })
    );
  }

  /**
   * Attempts to fetch metadata with invalid/non-existent instance ID
   * Returns error response instead of throwing for negative testing
   */
  async attemptFetchMetadataWithInvalidId(instanceId: string): Promise<any> {
    return this.attemptApiCall(() => this.tileManagementService.fetchInstanceMetadata(instanceId));
  }

  /**
   * Cleans up all created tiles
   * Handles errors gracefully to ensure cleanup completes
   */
  async cleanup(): Promise<void> {
    const tilesToDelete = [...this.createdTileIds];
    this.createdTileIds = [];

    for (const tileId of tilesToDelete) {
      try {
        await this.tileManagementService.deleteIntegrationAppTile(tileId);
      } catch {
        // Continue cleanup even if individual tile deletion fails
      }
    }
  }
}
