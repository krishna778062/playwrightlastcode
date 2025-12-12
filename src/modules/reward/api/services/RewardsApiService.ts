import { APIResponse, Page, request } from '@playwright/test';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';

import { HttpClient } from '../clients/httpClient';

/**
 * Service for making API calls to the Rewards API
 * Extracts authentication cookies and CSRF token from the page's browser context
 */
export class RewardsApiService {
  private readonly baseUrl = getRewardTenantConfigFromCache().apiBaseUrl;

  /**
   * Gets the rewards data from the API
   * Extracts cookies and CSRF token from the page's session storage/browser context
   * @param page - The Playwright Page object to extract cookies from
   * @returns Promise<APIResponse> - The API response
   */
  async getRewards(page: Page): Promise<APIResponse> {
    // Get cookies from the page's browser context
    const cookies = await page.context().cookies();

    // Extract CSRF token from cookies
    const csrfid = cookies.find(c => c.name === 'csrfid')?.value;

    // If CSRF token is not in cookies, try to get it from sessionStorage
    let csrfToken: string | null | undefined = csrfid;
    if (!csrfToken) {
      csrfToken = await page.evaluate(() => {
        // Try to get CSRF token from sessionStorage
        return sessionStorage.getItem('csrfid') || sessionStorage.getItem('x-smtip-csrfid') || null;
      });
    }

    if (!csrfToken) {
      throw new Error('CSRF token not found in cookies or sessionStorage');
    }

    // Get storage state from the page context to preserve all session data
    const storageState = await page.context().storageState();

    // Create headers (excluding Cookie header as Playwright handles it via storageState)
    const headers: Record<string, string> = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      origin: 'https://reward-settings.qa.simpplr.xyz',
      pragma: 'no-cache',
      referer: 'https://reward-settings.qa.simpplr.xyz/',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'x-smtip-csrfid': csrfToken,
    };

    // Create API request context with the headers and storage state (includes cookies)
    const apiContext = await request.newContext({
      extraHTTPHeaders: headers,
      storageState: storageState,
    });

    try {
      // Create HTTP client and make the request
      const httpClient = new HttpClient(apiContext, this.baseUrl);
      const response = await httpClient.get('/recognition/admin/rewards');

      return response;
    } finally {
      // Clean up the API context
      await apiContext.dispose();
    }
  }

  /**
   * Gets the rewards data and returns it as JSON
   * @param page - The Playwright Page object to extract cookies from
   * @returns Promise<T> - The parsed JSON response
   */
  async getRewardsAsJson<T = any>(page: Page): Promise<T> {
    // Get cookies from the page's browser context
    const cookies = await page.context().cookies();

    // Extract CSRF token from cookies
    const csrfid = cookies.find(c => c.name === 'csrfid')?.value;

    // If CSRF token is not in cookies, try to get it from sessionStorage
    let csrfToken: string | null | undefined = csrfid;
    if (!csrfToken) {
      csrfToken = await page.evaluate(() => {
        // Try to get CSRF token from sessionStorage
        return sessionStorage.getItem('csrfid') || sessionStorage.getItem('x-smtip-csrfid') || null;
      });
    }

    if (!csrfToken) {
      throw new Error('CSRF token not found in cookies or sessionStorage');
    }

    // Get storage state from the page context to preserve all session data
    const storageState = await page.context().storageState();

    // Create headers (excluding Cookie header as Playwright handles it via storageState)
    const headers: Record<string, string> = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      origin: 'https://reward-settings.qa.simpplr.xyz',
      pragma: 'no-cache',
      referer: 'https://reward-settings.qa.simpplr.xyz/',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'x-smtip-csrfid': csrfToken,
    };

    // Create API request context with the headers and storage state (includes cookies)
    const apiContext = await request.newContext({
      extraHTTPHeaders: headers,
      storageState: storageState,
    });

    try {
      // Create HTTP client and make the request
      const httpClient = new HttpClient(apiContext, this.baseUrl);
      const response = await httpClient.get('/recognition/admin/rewards');

      // Read JSON before disposing the context
      const jsonData = await response.json();
      return jsonData as T;
    } finally {
      // Clean up the API context
      await apiContext.dispose();
    }
  }
}
