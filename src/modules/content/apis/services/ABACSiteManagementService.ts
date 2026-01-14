import { APIRequestContext, test } from '@playwright/test';

import { HttpClient } from '@core/api/clients/httpClient';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { ABACSiteCreationPayload, ABACSiteCreationResponse } from '@core/types/abacSiteManagement.types';
import { log } from '@core/utils/logger';

export class ABACSiteManagementService {
  public httpClient: HttpClient;

  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Creates a site with ABAC (target audience and subscription)
   * @param payload - ABAC site creation payload
   * @param accessType - Site access type: 'public' or 'private'
   * @returns Promise with site creation response
   */
  async createSite(
    payload: ABACSiteCreationPayload,
    accessType: 'public' | 'private' = 'public'
  ): Promise<ABACSiteCreationResponse> {
    return await test.step(`Creating ${accessType} site with ABAC audience`, async () => {
      // Extract CSRF token from cookies for UAT compatibility
      const storageState = await this.context.storageState();
      const cookies = storageState.cookies || [];
      const csrfid = cookies.find((c: any) => c.name === 'csrfid')?.value;

      const apiPayload: any = {
        access: accessType,
        hasPages: payload.hasPages ?? true,
        hasEvents: payload.hasEvents ?? true,
        hasAlbums: payload.hasAlbums ?? true,
        hasDashboard: payload.hasDashboard ?? true,
        landingPage: payload.landingPage || 'dashboard',
        isContentFeedEnabled: payload.isContentFeedEnabled ?? true,
        isContentSubmissionsEnabled: payload.isContentSubmissionsEnabled ?? true,
        isOwner: payload.isOwner ?? true,
        isMembershipAutoApproved: payload.isMembershipAutoApproved ?? false,
        isBroadcast: payload.isBroadcast ?? false,
        name: payload.name,
        category: {
          categoryId: payload.category.categoryId,
          name: payload.category.name,
        },
      };

      // Add ABAC-specific fields
      if (payload.targetAudience && payload.targetAudience.length > 0) {
        apiPayload.targetAudience = payload.targetAudience;
      }

      if (payload.subscription && payload.subscription.length > 0) {
        apiPayload.subscription = payload.subscription;
      }

      log.debug(`Creating ${accessType} site with ABAC`, { payload: JSON.stringify(apiPayload, null, 2) });

      const response = await this.httpClient.post(API_ENDPOINTS.site.url, {
        data: {
          data: apiPayload,
        },
      });

      const responseBody = await response.json();
      log.debug(`${accessType} site creation response`, { response: JSON.stringify(responseBody, null, 2) });

      if (!response.ok() || responseBody.status !== 'success') {
        const errorMessage =
          responseBody.message ||
          responseBody.errors?.map((e: any) => e.message || e.sub_message).join(', ') ||
          'Unknown error';
        throw new Error(
          `Failed to create ${accessType} site with ABAC. Status: ${response.status()}, Message: ${errorMessage}, Response: ${JSON.stringify(responseBody)}`
        );
      }

      return responseBody as ABACSiteCreationResponse;
    });
  }
}
