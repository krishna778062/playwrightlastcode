import { APIRequestContext } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import {
  FilterRequest,
  GetBatchRunDetailsResponse,
  GetCompanyNamesResponse,
  GetContentEngagementResponse,
  GetDepartmentsResponse,
  GetDivisionsResponse,
  GetLocationsResponse,
  GetSegmentsResponse,
  GetUserCategoriesResponse,
  MustReadAudienceListResponse,
  MustReadCountsResponse,
  MustReadStatusResponse,
  MustReadUserCountResponse,
  MustReadUserListResponse,
} from '@/src/modules/data-engineering/api/interfaces/analytics.interface';
import { DATA_ENGINEERING_API_ENDPOINTS } from '@/src/modules/data-engineering/constants/apiEndpoints';

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
   * @param endpoint - The API endpoint to fetch from
   * @param params - Query parameters for filtering
   * @returns Promise with the response data
   */
  private async getFilterData<T>(endpoint: string, params: FilterRequest = { status: 'active' }): Promise<T> {
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

    const fullEndpoint = `${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    // Session-based auth: cookies and x-smtip-csrfid are automatically handled by the APIRequestContext
    const response = await this.get(fullEndpoint);

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
    return this.getFilterData<GetSegmentsResponse>(DATA_ENGINEERING_API_ENDPOINTS.analytics.segments, params);
  }

  async getActiveSegments(): Promise<GetSegmentsResponse> {
    return this.getSegments({ status: 'active' });
  }

  async getDepartments(params: FilterRequest = { status: 'active' }): Promise<GetDepartmentsResponse> {
    return this.getFilterData<GetDepartmentsResponse>(DATA_ENGINEERING_API_ENDPOINTS.analytics.departments, params);
  }

  async getActiveDepartments(): Promise<GetDepartmentsResponse> {
    return this.getDepartments({ status: 'active' });
  }

  async getLocations(params: FilterRequest = { status: 'active' }): Promise<GetLocationsResponse> {
    return this.getFilterData<GetLocationsResponse>(DATA_ENGINEERING_API_ENDPOINTS.analytics.locations, params);
  }

  async getActiveLocations(): Promise<GetLocationsResponse> {
    return this.getLocations({ status: 'active' });
  }

  async getUserCategories(params: FilterRequest = { status: 'active' }): Promise<GetUserCategoriesResponse> {
    return this.getFilterData<GetUserCategoriesResponse>(
      DATA_ENGINEERING_API_ENDPOINTS.analytics.userCategories,
      params
    );
  }

  async getActiveUserCategories(): Promise<GetUserCategoriesResponse> {
    return this.getUserCategories({ status: 'active' });
  }

  async getCompanyNames(params: FilterRequest = { status: 'active' }): Promise<GetCompanyNamesResponse> {
    return this.getFilterData<GetCompanyNamesResponse>(DATA_ENGINEERING_API_ENDPOINTS.analytics.companyNames, params);
  }

  async getActiveCompanyNames(): Promise<GetCompanyNamesResponse> {
    return this.getCompanyNames({ status: 'active' });
  }

  async getDivisions(params: FilterRequest = { status: 'active' }): Promise<GetDivisionsResponse> {
    return this.getFilterData<GetDivisionsResponse>(DATA_ENGINEERING_API_ENDPOINTS.analytics.divisions, params);
  }

  async getActiveDivisions(): Promise<GetDivisionsResponse> {
    return this.getDivisions({ status: 'active' });
  }

  /**
   * Get batch run details for analytics
   * This endpoint doesn't require status parameter as it shows batch processing information
   */
  async getBatchRunDetails(): Promise<GetBatchRunDetailsResponse> {
    const response = await this.get(DATA_ENGINEERING_API_ENDPOINTS.analytics.batchRunDetails);

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    const responseData = await response.json();
    return responseData as GetBatchRunDetailsResponse;
  }

  /**
   * Get content engagement metrics for a specific content
   * @param contentId - The content ID to fetch engagement metrics for
   * @param isRestricted - Whether the content is restricted
   * @returns Promise with the content engagement response data
   */
  async getContentEngagement(contentId: string, isRestricted: boolean): Promise<GetContentEngagementResponse> {
    const response = await this.post(DATA_ENGINEERING_API_ENDPOINTS.analytics.contentEngagement, {
      data: {
        contentId,
        isRestricted,
      },
    });

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    const responseData = await response.json();
    return responseData as GetContentEngagementResponse;
  }

  /**
   * Get must-read status for a specific content
   * @param contentId - The content ID to fetch must-read status for
   * @returns Promise with the must-read status response data
   */
  async getMustReadStatus(contentId: string): Promise<MustReadStatusResponse> {
    const response = await this.post(DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadStatus, {
      data: {
        contentId,
      },
    });

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    const responseData = await response.json();
    return responseData as MustReadStatusResponse;
  }

  async getMustReadCounts(contentId: string): Promise<MustReadCountsResponse> {
    const response = await this.post(DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadCounts, {
      data: {
        contentId,
      },
    });

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    const responseData = await response.json();
    return responseData as MustReadCountsResponse;
  }

  async getMustReadAudienceList(contentId: string, page: number = 1): Promise<MustReadAudienceListResponse> {
    const response = await this.post(DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadAudienceList, {
      data: {
        contentId,
        page,
      },
    });

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    const responseData = await response.json();
    return responseData as MustReadAudienceListResponse;
  }

  async getMustReadUserList(params: {
    contentId: string;
    readStatus: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<MustReadUserListResponse> {
    const response = await this.post(DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadUserList, {
      data: {
        contentId: params.contentId,
        readStatus: params.readStatus,
        search: params.search ?? '',
        page: params.page ?? 1,
        limit: params.limit ?? 25,
      },
    });

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    const responseData = await response.json();
    return responseData as MustReadUserListResponse;
  }

  async getMustReadUserCount(params: {
    contentId: string;
    readStatus: string;
    search?: string;
  }): Promise<MustReadUserCountResponse> {
    const response = await this.post(DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadUserCount, {
      data: {
        contentId: params.contentId,
        readStatus: params.readStatus,
        search: params.search ?? '',
      },
    });

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    const responseData = await response.json();
    return responseData as MustReadUserCountResponse;
  }

  async getMustReadUsersCsv(contentId: string): Promise<string> {
    const response = await this.post(DATA_ENGINEERING_API_ENDPOINTS.analytics.mustReadUsersCsv, {
      data: {
        contentId,
      },
    });

    await this.validateResponse(response, {
      expectedStatusCodes: [200],
    });

    return await response.text();
  }
}
