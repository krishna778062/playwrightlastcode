import { APIRequestContext, APIResponse, Cookie, Page, request } from '@playwright/test';
import fs from 'fs';

import { ApiError } from '@core/api/apiError';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';

import { HttpClient } from '@/src/core/api/clients/httpClient';

export abstract class BaseApiClient extends HttpClient {
  static headers: Record<string, string> = {};

  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }

  /**
   * Creates an API context by logging in via API
   * @param creds Login credentials
   * @param baseUrl Base URL for the API
   * @returns Promise resolving to APIRequestContext
   */
  static async loginViaApi(creds: { username: string; password: string }, baseUrl: string): Promise<APIRequestContext> {
    const tmpContext = await request.newContext();
    try {
      // Validate user
      const validateUserNameRes = await tmpContext.post(`${baseUrl}${API_ENDPOINTS.identity.validate}`, {
        data: { loginIdentifier: creds.username },
      });

      if (!validateUserNameRes.ok()) {
        throw new ApiError(
          validateUserNameRes.status(),
          `User validation failed for email: ${creds.username}`,
          validateUserNameRes.url()
        );
      }

      const validateUserNameResJson = await validateUserNameRes.json();
      const token = validateUserNameResJson?.result?.token;

      if (!token) {
        throw new Error(`Token not found for email in the validate API call: ${creds.username}`);
      }

      // Login user with token
      const loginApiRes = await tmpContext.post(`${baseUrl}${API_ENDPOINTS.identity.login}`, {
        data: {
          password: creds.password,
        },
        headers: {
          'x-smtip-tsid': token,
        },
      });

      if (!loginApiRes.ok()) {
        throw new ApiError(loginApiRes.status(), `Login failed for email: ${creds.username}`, loginApiRes.url());
      }

      const storageState = await tmpContext.storageState();
      const headers = this.fetchHeadersFromCookies(storageState.cookies);
      this.headers = headers;

      // Create new context with auth headers
      return await request.newContext({
        extraHTTPHeaders: headers,
        storageState: storageState,
      });
    } finally {
      await tmpContext.dispose();
    }
  }

  /**
   * Creates an API context from browser cookies
   * @param page Playwright Page object
   * @returns Promise resolving to APIRequestContext
   */
  static async createFromCookies(page: Page): Promise<APIRequestContext> {
    const storageState = await page.context().storageState();
    const cookies = await page.context().cookies();
    const headers = this.fetchHeadersFromCookies(cookies);
    return await request.newContext({
      extraHTTPHeaders: headers,
      storageState: storageState,
    });
  }

  /**
   * Creates an API context from stored state
   * @param path Path to the storage state file
   * @returns Promise resolving to APIRequestContext
   */
  static async createFromStorage(path: string): Promise<APIRequestContext> {
    if (!fs.existsSync(path)) {
      throw new Error(`Storage state file ${path} does not exist`);
    }

    const storageState = JSON.parse(fs.readFileSync(path, 'utf8'));
    const headers = this.fetchHeadersFromCookies(storageState.cookies);

    return await request.newContext({
      extraHTTPHeaders: headers,
      storageState: storageState,
    });
  }

  /**
   * Extracts authentication headers from cookies
   * @param cookies Array of cookies
   * @returns Headers object with authentication tokens
   */
  static fetchHeadersFromCookies(cookies: Cookie[]): Record<string, string> {
    const token = cookies.find(c => c.name === 'token')?.value;
    const csrfid = cookies.find(c => c.name === 'csrfid')?.value;
    const ftokenValue = token?.replace(/%2B/g, '+');

    if (!token || !csrfid) {
      throw new Error('No token or csrfid found in the cookies');
    }

    return {
      Cookie: `token=${token}; csrfid=${csrfid};ftoken=${ftokenValue}`,
      'x-smtip-csrfid': csrfid,
    };
  }
}
