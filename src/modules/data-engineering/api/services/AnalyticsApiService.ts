import { APIRequestContext } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import {
  FilterRequest,
  GetBatchRunDetailsResponse,
  GetCompanyNamesResponse,
  GetDepartmentsResponse,
  GetDivisionsResponse,
  GetLocationsResponse,
  GetSegmentsResponse,
  GetUserCategoriesResponse,
} from '@/src/modules/data-engineering/api/interfaces/filters.interface';

/**
 * Service class for Analytics API operations
 * Handles all API interactions for analytics filter endpoints (DuckDB-powered)
 *
 * Uses session-based authentication with cookies and x-smtip-csrfid header.
 * Authentication is handled automatically by the APIRequestContext.
 */
export class AnalyticsApiService extends HttpClient {
  constructor(context: APIRequestContext, baseUrl: string) {
    super(context, baseUrl);
  }

  /**
   * Generic method to fetch analytics filter data
   * @param filterType - The type of filter (segments, departments, locations, etc.)
   * @param params - Query parameters for filtering
   * @returns Promise with the response data
   */
  private async getFilterData<T>(filterType: string, params: FilterRequest = { status: 'active' }): Promise<T> {
    const queryParams = new URLSearchParams();

    if (params.status) {
      queryParams.append('status', params.status);
    }
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.pageSize !== undefined) {
      queryParams.append('pageSize', params.pageSize.toString());
    }

    const endpoint = `/v2/analytics/${filterType}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    // Session-based auth: cookies and x-smtip-csrfid are automatically handled by the APIRequestContext
    const response = await this.get(endpoint);

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    const responseData = await response.json();
    return responseData as T;
  }

  /**
   * Get segments by status
   */
  async getSegments(params: FilterRequest = { status: 'active' }): Promise<GetSegmentsResponse> {
    return this.getFilterData<GetSegmentsResponse>('segments', params);
  }

  async getActiveSegments(): Promise<GetSegmentsResponse> {
    return this.getSegments({ status: 'active' });
  }

  async getDepartments(params: FilterRequest = { status: 'active' }): Promise<GetDepartmentsResponse> {
    return this.getFilterData<GetDepartmentsResponse>('departments', params);
  }

  async getActiveDepartments(): Promise<GetDepartmentsResponse> {
    return this.getDepartments({ status: 'active' });
  }

  async getLocations(params: FilterRequest = { status: 'active' }): Promise<GetLocationsResponse> {
    return this.getFilterData<GetLocationsResponse>('locations', params);
  }

  async getActiveLocations(): Promise<GetLocationsResponse> {
    return this.getLocations({ status: 'active' });
  }

  async getUserCategories(params: FilterRequest = { status: 'active' }): Promise<GetUserCategoriesResponse> {
    return this.getFilterData<GetUserCategoriesResponse>('userCategories', params);
  }

  async getActiveUserCategories(): Promise<GetUserCategoriesResponse> {
    return this.getUserCategories({ status: 'active' });
  }

  async getCompanyNames(params: FilterRequest = { status: 'active' }): Promise<GetCompanyNamesResponse> {
    return this.getFilterData<GetCompanyNamesResponse>('companyNames', params);
  }

  async getActiveCompanyNames(): Promise<GetCompanyNamesResponse> {
    return this.getCompanyNames({ status: 'active' });
  }

  async getDivisions(params: FilterRequest = { status: 'active' }): Promise<GetDivisionsResponse> {
    return this.getFilterData<GetDivisionsResponse>('divisions', params);
  }

  async getActiveDivisions(): Promise<GetDivisionsResponse> {
    return this.getDivisions({ status: 'active' });
  }

  /**
   * Get batch run details for analytics
   * This endpoint doesn't require status parameter as it shows batch processing information
   */
  async getBatchRunDetails(): Promise<GetBatchRunDetailsResponse> {
    const endpoint = '/v2/analytics/batchRunDetails';

    const response = await this.get(endpoint);

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    const responseData = await response.json();
    return responseData as GetBatchRunDetailsResponse;
  }
}
