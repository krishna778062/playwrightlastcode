import { APIRequestContext, test } from '@playwright/test';

import { HttpClient } from '@core/api/clients/httpClient';
import { ApiError } from '@core/api/errors/apiError';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';

export interface ContentTilesListParams {
  siteId?: string | null;
  dashboardId: 'home' | 'site';
}

export interface ContentTilesListResponse {
  status: string | number;
  result?: {
    listOfItems: any[];
  };
  data?: {
    listOfItems: any[];
  };
  [key: string]: any;
}

export class ContentTilesHelper {
  private httpClient: HttpClient;
  private baseUrl: string;
  private frontendBaseUrl: string;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    baseUrl: string,
    frontendBaseUrl: string
  ) {
    this.baseUrl = baseUrl;
    this.frontendBaseUrl = frontendBaseUrl;
    this.httpClient = new HttpClient(apiRequestContext, baseUrl);
  }

  /**
   * Validates API response and throws error if invalid
   * @param response - The API response
   * @param json - The parsed JSON response
   * @param operation - The operation name for error messages
   */
  private validateResponse(response: any, json: any, operation: string): void {
    if (!response.ok() || json.error_code || json.errors || (json.status !== 'success' && json.status !== 200)) {
      const errors = json.errors || [];
      const errorMessages = errors.map((err: any) => `${err.error_code}: ${err.message}`).join(', ');
      const errorMessage = json.message || errorMessages || 'Unknown error';
      const errorCode = json.error_code || json.errors?.[0]?.error_code || 'N/A';
      const statusCode = response.status();

      throw new ApiError(
        statusCode,
        `${operation} failed. Error Code: ${errorCode}, Message: ${errorMessage}`,
        response.url(),
        json,
        new Error(`HTTP ${statusCode}: ${errorMessage}`)
      );
    }
  }

  /**
   * Executes a service call, validates the response, and returns parsed JSON
   */
  private async executeAndValidate<T>(serviceCall: () => Promise<any>, operation: string): Promise<T> {
    const response = await serviceCall();
    const json = await response.json().catch(() => ({}));

    this.validateResponse(response, json, operation);
    return json as T;
  }

  /**
   * Gets content tiles list for home or site dashboard
   * @param params - Parameters for the list request
   * @returns The content tiles list response
   */
  async getContentTilesList(params: ContentTilesListParams): Promise<ContentTilesListResponse> {
    return test.step(`Get content tiles list for ${params.dashboardId} dashboard`, async () => {
      return this.executeAndValidate<ContentTilesListResponse>(
        () =>
          this.httpClient.post(API_ENDPOINTS.integrations.contentTilesList, {
            data: {
              siteId: params.siteId ?? null,
              dashboardId: params.dashboardId,
            },
            headers: {
              Origin: this.frontendBaseUrl,
              Referer: this.frontendBaseUrl,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }),
        'Get content tiles list'
      );
    });
  }

  /**
   * Gets content tiles list for home dashboard
   * @returns The content tiles list response
   */
  async getContentTilesListForHome(): Promise<ContentTilesListResponse> {
    return this.getContentTilesList({ siteId: null, dashboardId: 'home' });
  }

  /**
   * Gets content tiles list for site dashboard
   * @param siteId - The site ID
   * @returns The content tiles list response
   */
  async getContentTilesListForSite(siteId: string): Promise<ContentTilesListResponse> {
    return this.getContentTilesList({ siteId, dashboardId: 'site' });
  }

  /**
   * Attempts to get content tiles list and returns error response instead of throwing
   * Used for negative testing scenarios
   */
  async attemptGetContentTilesListWithInvalidParams(params: any): Promise<any> {
    try {
      const response = await this.httpClient.post(API_ENDPOINTS.integrations.contentTilesList, {
        data: params,
        headers: {
          Origin: this.frontendBaseUrl,
          Referer: this.frontendBaseUrl,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json().catch(() => ({}));
      return json;
    } catch (error: any) {
      return this.extractErrorResponse(error);
    }
  }

  /**
   * Extracts error response from caught error
   */
  private extractErrorResponse(error: any): any {
    if (error?.response) {
      return error.response;
    }
    if (error?.json) {
      return error.json;
    }
    return {
      error_code: 'UNKNOWN_ERROR',
      message: error?.message || 'Unknown error occurred',
      status: 'error',
    };
  }

  /**
   * Cleanup method (placeholder for consistency with other helpers)
   */
  async cleanup(): Promise<void> {
    // No cleanup needed for read-only operations
  }
}
