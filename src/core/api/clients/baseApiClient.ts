import { APIRequestContext, Cookie, Page, request } from '@playwright/test';
import fs from 'fs';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { ApiError } from '@core/api/apiError';
import { HttpClient } from '@/src/core/api/clients/httpClient';

export abstract class BaseApiClient extends HttpClient {
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

      // Create new context with auth headers
      return await request.newContext({
        extraHTTPHeaders: headers,
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
    const cookies = await page.context().cookies();
    const headers = this.fetchHeadersFromCookies(cookies);
    return await request.newContext({
      extraHTTPHeaders: headers,
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
  private static fetchHeadersFromCookies(cookies: Cookie[]): Record<string, string> {
    const token = cookies.find(c => c.name === 'token')?.value;
    const csrfid = cookies.find(c => c.name === 'csrfid')?.value;

    if (!token || !csrfid) {
      throw new Error('No token or csrfid found in the cookies');
    }

    return {
      Cookie: `token=${token}; csrfid=${csrfid}`,
      'x-smtip-csrfid': csrfid,
    };
  }

  async getCategory(category: string) {
    const response = await this.post(API_ENDPOINTS.site.category, {
      data: {
        size: 16,
        sortBy: 'alphabetical',
        term: category,
      },
    });
    const json = await response.json();
    if (!json.result?.listOfItems?.length) throw new Error('Category not found');
    return {
      categoryId: json.result.listOfItems[0].categoryId,
      name: json.result.listOfItems[0].name,
    };
  }

  async createSite(siteType: string, category: string) {
    const randomNum = Math.floor(Math.random() * 1000000 + 1);
    const siteName = `AutomateUI_Test_${randomNum}`;
    const categoryObj = await this.getCategory(category);

    const response = await this.post(API_ENDPOINTS.site.url, {
      data: {
        data: {
          access: siteType,
          hasPages: true,
          hasEvents: true,
          hasAlbums: true,
          hasDashboard: true,
          landingPage: 'dashboard',
          isContentFeedEnabled: true,
          isContentSubmissionsEnabled: true,
          isOwner: true,
          isMembershipAutoApproved: false,
          isBroadcast: false,
          name: siteName,
          category: {
            categoryId: categoryObj.categoryId,
            name: categoryObj.name,
          },
        },
      },
    });
    const siteJson = await response.json();
    console.log('Full JSON Response:', JSON.stringify(siteJson, null, 2));
    if (siteJson.status !== 'success' || !siteJson.result?.siteId) {
      throw new Error(`Site creation failed. Response: ${JSON.stringify(siteJson)}`);
    }
    return { siteName: siteName, siteId: siteJson.result.siteId };
  }

  async deactivateSite(siteId: string) {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${API_ENDPOINTS.site.deactivate}` : API_ENDPOINTS.site.deactivate;
    console.log('Deactivate site full URL:', fullUrl);
    const response = await this.put(API_ENDPOINTS.site.deactivate, {
      data: {
        ids: [siteId],
        newStatus: 'deactivated',
      },
    });
    console.log('Deactivate site response:', response.status());
    const json = await response.json();
    if (json.status !== 'success') {
      throw new Error(`Failed to deactivate site: ${JSON.stringify(json)}`);
    }
    return json;
  }
}
