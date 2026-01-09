import { Page, request } from '@playwright/test';
import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

import { HttpClient } from '@core/api';

export interface RecurringAwardCreatePayload {
  award: {
    awardName: string;
    description: string;
    awardIcon?: string;
    status?: 'ACTIVE' | string;
    type?: 'NOMINATION' | string;
    guidance?: string;
    [key: string]: unknown;
  };
  delegates: Array<{ id: string; fullName?: string; [key: string]: unknown }>;
  nomination: {
    frequency: 'MONTHLY' | 'QUARTERLY' | string;
    nomineeTargets: Array<{ type: string; [key: string]: unknown }>;
    voterTargets: Array<{ type: string; [key: string]: unknown }>;
    anonymity?: 'ANONYMOUS' | 'VISIBLE' | string;
    startDate: string;
    timeZone: string;
    participationConfig?: Record<string, unknown>;
    closeConfig?: Record<string, unknown>;
    overdueConfig?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface RecurringAwardCreationResult<T = any> {
  awardId?: string;
  nominationId?: string;
  data: T;
}

/**
 * API helper for Recognition recurring awards.
 * - Builds an authenticated request context from the active browser session
 * - Creates recurring awards via API (mirrors the UI flow defaults)
 * - Can wait for the UI creation API response and extract IDs (award/nomination)
 */
export class RecurringAwardsApiService {
  private readonly recognitionConfig = getRecognitionTenantConfigFromCache();
  private readonly baseUrl = this.recognitionConfig.apiBaseUrl.replace(/\/$/, '');
  private readonly frontendBaseUrl = this.recognitionConfig.frontendBaseUrl.replace(/\/$/, '');
  private readonly frontendOrigin = new URL(this.frontendBaseUrl).origin;

  private async getCsrfToken(page: Page): Promise<string> {
    const cookies = await page.context().cookies();
    const csrfid = cookies.find(c => c.name === 'csrfid')?.value;
    let csrfToken: string | null | undefined = csrfid;
    if (!csrfToken) {
      csrfToken = await page.evaluate(() => {
        return sessionStorage.getItem('csrfid') || sessionStorage.getItem('x-smtip-csrfid') || null;
      });
    }
    if (!csrfToken) {
      throw new Error('CSRF token not found in cookies or sessionStorage');
    }
    return csrfToken;
  }

  private async createApiContext(page: Page, extraHeaders: Record<string, string> = {}) {
    const csrfToken = await this.getCsrfToken(page);
    const storageState = await page.context().storageState();

    const headers: Record<string, string> = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      origin: this.frontendOrigin,
      pragma: 'no-cache',
      referer: this.frontendBaseUrl.endsWith('/') ? this.frontendBaseUrl : `${this.frontendBaseUrl}/`,
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'x-smtip-csrfid': csrfToken,
      ...extraHeaders,
    };

    const apiContext = await request.newContext({
      extraHTTPHeaders: headers,
      storageState,
    });

    return { apiContext, headers };
  }

  private extractIdsFromResponse(payload: any): { awardId?: string; nominationId?: string } {
    if (!payload || typeof payload !== 'object') {
      return {};
    }
    const awardId =
      payload?.awardId || payload?.id || payload?.result?.award?.id || payload?.award?.id || payload?.data?.award?.id;
    const nominationId =
      payload?.nominationId ||
      payload?.result?.nomination?.id ||
      payload?.nomination?.id ||
      payload?.data?.nomination?.id;
    return { awardId, nominationId };
  }

  private buildDefaultPayload(overrides: Partial<RecurringAwardCreatePayload> = {}): RecurringAwardCreatePayload {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const defaultPayload: RecurringAwardCreatePayload = {
      award: {
        awardName: `API Recurring Award ${today.getTime()}`,
        description: 'Automated recurring award via API',
        status: 'ACTIVE',
        type: 'NOMINATION',
        guidance: '',
      },
      delegates: [
        {
          id: this.recognitionConfig.appManagerUserId,
          fullName: this.recognitionConfig.appManagerName,
        },
      ],
      nomination: {
        frequency: 'MONTHLY',
        nomineeTargets: [{ type: 'all' }],
        voterTargets: [{ type: 'all' }],
        anonymity: 'ANONYMOUS',
        startDate: formattedDate,
        timeZone: 'UTC',
        participationConfig: { mode: 'DEFAULT' },
        closeConfig: { mode: 'DEFAULT' },
        overdueConfig: { mode: 'DEFAULT' },
      },
    };

    return {
      ...defaultPayload,
      ...overrides,
      award: { ...defaultPayload.award, ...overrides.award },
      nomination: { ...defaultPayload.nomination, ...overrides.nomination },
      delegates: overrides.delegates ?? defaultPayload.delegates,
    };
  }

  /**
   * Create a recurring award via API using defaults that mirror the UI flow.
   * @param page Active Playwright page (used to reuse logged-in session)
   * @param payloadOverride Optional partial payload to override defaults
   */
  async createRecurringAward(
    page: Page,
    payloadOverride: Partial<RecurringAwardCreatePayload> = {}
  ): Promise<RecurringAwardCreationResult> {
    const payload = this.buildDefaultPayload(payloadOverride);
    const { apiContext } = await this.createApiContext(page, { 'content-type': 'application/json' });
    try {
      const httpClient = new HttpClient(apiContext, this.baseUrl);
      const response = await httpClient.post('/recognition/admin/awards/recurring', { data: payload });
      const data = await response.json();
      const { awardId, nominationId } = this.extractIdsFromResponse(data);
      return { awardId, nominationId, data };
    } finally {
      await apiContext.dispose();
    }
  }

  /**
   * Wait for the UI-driven recurring award creation API call and extract IDs.
   * Useful when the award is created through UI but IDs are needed for DB checks.
   */
  async waitForRecurringAwardCreationResponse(page: Page, timeoutMs = 20000): Promise<RecurringAwardCreationResult> {
    const response = await page.waitForResponse(
      resp =>
        resp.request().method() === 'POST' &&
        resp.url().includes('/recognition/admin/awards/recurring') &&
        resp.status() >= 200 &&
        resp.status() < 500,
      { timeout: timeoutMs }
    );
    const data = await response.json().catch(() => ({}));
    const { awardId, nominationId } = this.extractIdsFromResponse(data);
    return { awardId, nominationId, data };
  }

  /**
   * Validate creation response and ensure IDs are present.
   */
  validateCreationResult(result: RecurringAwardCreationResult): { awardId: string; nominationId: string } {
    const { awardId, nominationId } = result;
    if (!nominationId) {
      throw new Error('Nomination ID was not returned from the recurring award creation response');
    }
    if (!awardId) {
      throw new Error('Award ID was not returned from the recurring award creation response');
    }
    return { awardId, nominationId };
  }

  /**
   * Extract tenant code from the current page context.
   */
  async getTenantCode(page: Page): Promise<string> {
    const tenantCode = await page.evaluate(() => (window as any)?.Simpplr?.Settings?.accountId);
    if (!tenantCode || typeof tenantCode !== 'string') {
      throw new Error('Tenant code was not found in window.Simpplr.Settings.accountId');
    }
    return tenantCode;
  }

  /**
   * Trigger recurring award sync status API.
   * @param page Active Playwright page (uses current auth/session)
   * @param tenantCode Tenant/account identifier used in the path segment
   */
  async hitRecurringSyncAwardApi(page: Page, tenantCode: string): Promise<void> {
    const { apiContext } = await this.createApiContext(page);
    try {
      const httpClient = new HttpClient(apiContext, this.baseUrl);
      const url = `${this.baseUrl}/recognition/awards/sync-status-recurring/${tenantCode}`;
      console.log('url', url);
      const response = await httpClient.get(url);
      console.log(`status of hitRecurringSyncAwardApi api is.....:-', ${response.status()}`);
      if (response.status() !== 200) {
        throw new Error(`Sync did not run successfully. Status: ${response.status()} Body: ${await response.text()}`);
      }
    } finally {
      await apiContext.dispose();
    }
  }

  /**
   * Delete a recurring award by id (generic helper).
   * @param page Active Playwright page (uses current auth/session)
   * @param awardName Optional name of the award to delete
   * @param awardId Award identifier to delete
   */
  async deleteAwardViaApi(page: Page, awardName: string, awardId: any): Promise<void> {
    const { apiContext } = await this.createApiContext(page);
    try {
      const httpClient = new HttpClient(apiContext, this.baseUrl);
      const url = `${this.baseUrl}/recognition/admin/awards/${awardId}`;
      const response = await httpClient.delete(url);
      if (response.status() !== 200) {
        throw new Error(`Delete failed. Status: ${response.status()} Body: ${await response.text()}`);
      }
    } finally {
      console.log(`${awardName} award deleted successfully`);
      await apiContext.dispose();
    }
  }
}
