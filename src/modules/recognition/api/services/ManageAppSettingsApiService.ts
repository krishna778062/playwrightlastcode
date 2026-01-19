import { Page } from '@playwright/test';

import { HttpClient } from '@core/api';

import { CommonApiHelper } from '../helpers/commonApiHelper';
import { ManageAppSettingPayload } from '../payloads/manageAppSettingPayload';
import { RECOGNITION_API_ENDPOINTS } from '../recognitionApiEndpoints';

export class ManageAppSettingsApiService {
  private readonly commonApiHelper = new CommonApiHelper();

  /**
   * Enable or disable comments via tenant config API.
   * @param page Active Playwright page
   * @param commonEnableDisable 'enable' | 'disable' (for readability in callers/logs)
   * @param commentsEnabled boolean flag sent to API
   */
  async enableDisableCommentsSettingViaApi(
    page: Page,
    commonEnableDisable: 'enable' | 'disable',
    commentsEnabled: boolean
  ): Promise<void> {
    const { apiContext } = await this.commonApiHelper.createApiContext(page, { 'content-type': 'application/json' });
    try {
      const httpClient = new HttpClient(apiContext, this.commonApiHelper.baseUrl);
      const payload: ManageAppSettingPayload = {
        isExpertiseEnabled: true,
        companyValueMode: 'ATTACH',
        enabled: true,
        commentsEnabled,
      };
      const response = await httpClient.put(RECOGNITION_API_ENDPOINTS.tenantConfig.update, { data: payload });
      console.log('response status:---', response.status());
      if (!response.ok()) {
        const text = await response.text().catch(() => '');
        throw new Error(
          `Failed to ${commonEnableDisable} comments. Status: ${response.status()} Body: ${text || 'n/a'}`
        );
      }
    } finally {
      await apiContext.dispose();
      await page.reload();
    }
  }

  /**
   * Update recognition tenant config via API.
   * @param page Active Playwright page
   * @param payload Partial payload overrides; defaults keep comments enabled and recognition enabled.
   */
  async updateTenantConfig(
    page: Page,
    payload: Partial<ManageAppSettingPayload> & { commonEnableDisable?: 'enable' | 'disable' } = {}
  ): Promise<void> {
    const { apiContext } = await this.commonApiHelper.createApiContext(page, { 'content-type': 'application/json' });
    try {
      const httpClient = new HttpClient(apiContext, this.commonApiHelper.baseUrl);
      const resolvedPayload: ManageAppSettingPayload = {
        isExpertiseEnabled: payload.isExpertiseEnabled ?? true,
        companyValueMode: payload.companyValueMode ?? 'ATTACH',
        enabled: payload.enabled ?? true,
        commentsEnabled: payload.commentsEnabled ?? true,
      };
      const response = await httpClient.put(RECOGNITION_API_ENDPOINTS.tenantConfig.update, { data: resolvedPayload });
      if (!response.ok()) {
        const text = await response.text().catch(() => '');
        throw new Error(`Failed to update tenant config. Status: ${response.status()} Body: ${text || 'n/a'}`);
      }
    } finally {
      await apiContext.dispose();
      await page.reload();
    }
  }
}
