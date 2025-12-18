import { APIResponse, Page, request } from '@playwright/test';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';

import { HttpClient } from '@core/api';

export type RewardGiftingOptionType = 'POINTS' | string;

export interface RewardGiftingOptionAmount {
  amount: number;
}

/**
 * Default request body shape used by Rewards gifting options endpoints.
 * If your cURL uses a different shape, pass `requestBodyOverride` to `saveGiftingOptions`.
 */
export interface RewardGiftingOptionsRequestBody {
  optionType: RewardGiftingOptionType;
  options: RewardGiftingOptionAmount[];
  // Some deployments may accept additional properties (e.g. usdPerPoint). Keep this extensible.
  [key: string]: unknown;
}

export interface SaveGiftingOptionsParams {
  /**
   * Endpoint relative to reward api baseUrl.
   * Default matches the URL you shared: /recognition/admin/rewards/config
   */
  endpoint?: string;
  /**
   * Option type for the gifting options; POINTS is the typical default.
   */
  optionType?: RewardGiftingOptionType;
  /**
   * If true, keeps the incoming amounts order (after filtering/validation).
   * If false, sorts ascending for deterministic payloads.
   */
  preserveOrder?: boolean;
  /**
   * Override the entire request body (useful if your cURL payload differs).
   * When provided, `amounts` are ignored for body construction (but still validated unless validateAmounts=false).
   */
  requestBodyOverride?: Record<string, unknown>;
  /**
   * Skip validating the `amounts` array (not recommended).
   */
  validateAmounts?: boolean;
  /**
   * Additional headers to merge into default headers.
   */
  extraHeaders?: Record<string, string>;
}

/**
 * API helper to configure Reward "gifting options" via Rewards API.
 * - Extracts auth cookies + CSRF token from the provided Page context (same pattern as RewardsApiService)
 * - Converts a `number[]` into the request body expected by rewards config endpoints
 * - Persists via API and returns the Playwright APIResponse / parsed JSON
 */
export class RewardGiftingOptionsSetup {
  private readonly baseUrl = getRewardTenantConfigFromCache().apiBaseUrl;
  private readonly frontendBaseUrl = getRewardTenantConfigFromCache().frontendBaseUrl;

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

  private normalizeAmounts(amounts: number[], preserveOrder = false): number[] {
    if (!Array.isArray(amounts)) {
      throw new Error(`Gifting option amounts must be an array. Got: ${typeof amounts}`);
    }

    const cleaned = amounts
      .map(a => (typeof a === 'string' ? Number(a) : a))
      .filter(a => Number.isFinite(a))
      .map(a => Number(a))
      .map(a => (Object.is(a, -0) ? 0 : a));

    // Must be positive integers <= 100000 (matches UI validation copy)
    for (const a of cleaned) {
      if (!Number.isInteger(a) || a <= 0 || a > 100000) {
        throw new Error(`Invalid gifting option amount: ${a}. Expected positive integer in range 1..100000.`);
      }
    }

    // Must be unique (matches UI validation copy)
    const unique = preserveOrder ? cleaned : Array.from(new Set(cleaned));
    const uniqueSet = new Set(unique);
    if (uniqueSet.size !== cleaned.length) {
      throw new Error('All gifting option amounts must be unique.');
    }

    // Max 8 options (matches UI validation copy)
    if (unique.length > 8) {
      throw new Error('Maximum 8 gifting options.');
    }

    if (preserveOrder) return unique;
    return [...unique].sort((a, b) => a - b);
  }

  private buildRequestBody(
    amounts: number[],
    optionType: RewardGiftingOptionType,
    preserveOrder: boolean
  ): RewardGiftingOptionsRequestBody {
    const normalized = this.normalizeAmounts(amounts, preserveOrder);
    return {
      optionType,
      options: normalized.map(amount => ({ amount })),
    };
  }

  /**
   * Save gifting options via the Rewards API.
   * @param page - Playwright Page used to extract cookies/CSRF and storageState
   * @param amounts - list of gifting option amounts (e.g. [10, 20, 50])
   * @param params - optional behavior overrides (endpoint/body/etc.)
   */
  async saveGiftingOptions(page: Page, amounts: number[], params: SaveGiftingOptionsParams = {}): Promise<APIResponse> {
    const {
      endpoint = '/recognition/admin/rewards/config',
      optionType = 'POINTS',
      preserveOrder = false,
      requestBodyOverride,
      validateAmounts = true,
      extraHeaders = {},
    } = params;

    if (validateAmounts) {
      // validation happens inside buildRequestBody as well, but keep it explicit for override mode
      this.normalizeAmounts(amounts, preserveOrder);
    }

    const csrfToken = await this.getCsrfToken(page);
    const storageState = await page.context().storageState();

    const headers: Record<string, string> = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      origin: this.frontendBaseUrl.replace(/\/$/, ''),
      pragma: 'no-cache',
      referer: this.frontendBaseUrl.endsWith('/') ? this.frontendBaseUrl : `${this.frontendBaseUrl}/`,
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'content-type': 'application/json',
      'x-smtip-csrfid': csrfToken,
      ...extraHeaders,
    };

    const apiContext = await request.newContext({
      extraHTTPHeaders: headers,
      storageState,
    });

    try {
      const httpClient = new HttpClient(apiContext, this.baseUrl);
      const body: Record<string, unknown> =
        requestBodyOverride ?? (this.buildRequestBody(amounts, optionType, preserveOrder) as Record<string, unknown>);

      // Most rewards config endpoints accept PUT; if your cURL uses PATCH/POST you can use HttpClient directly.
      return await httpClient.put(endpoint, { data: body });
    } finally {
      await apiContext.dispose();
    }
  }

  /**
   * Save gifting options via the Rewards API and return JSON response.
   */
  async saveGiftingOptionsAsJson<T = any>(
    page: Page,
    amounts: number[],
    params: SaveGiftingOptionsParams = {}
  ): Promise<T> {
    const response = await this.saveGiftingOptions(page, amounts, params);
    return (await response.json()) as T;
  }
}
