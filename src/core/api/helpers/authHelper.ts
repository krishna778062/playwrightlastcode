import { APIRequestContext, Browser, BrowserContext, request } from '@playwright/test';

import { HttpClient } from '@/src/core/api/clients/httpClient';

export class AuthHelper {
  static async getLoggedInApiClient(
    tenantUrl: string,
    creds: {
      email: string;
      password: string;
    }
  ): Promise<APIRequestContext> {
    const tmpContext = await request.newContext();
    try {
      // ✅ Use HttpClient for API calls
      const httpClient = new HttpClient(tmpContext, tenantUrl);
      const token = await this.getValidationToken(httpClient, creds.email);
      await this.performLogin(httpClient, token, creds.password);

      const headers = await this.extractAuthHeaders(tmpContext);
      const storageState = await tmpContext.storageState();
      return await this.createAuthenticatedAPIContext(headers, storageState);
    } finally {
      await tmpContext.dispose();
    }
  }

  static async getLoggedInBrowserContext(
    browser: Browser,
    tenantUrl: string,
    creds: {
      email: string;
      password: string;
    }
  ): Promise<BrowserContext> {
    const tmpContext = await request.newContext();
    try {
      // ✅ Use HttpClient for API calls
      const httpClient = new HttpClient(tmpContext, tenantUrl);
      const token = await this.getValidationToken(httpClient, creds.email);
      await this.performLogin(httpClient, token, creds.password);

      const headers = await this.extractAuthHeaders(tmpContext);
      const storageState = await tmpContext.storageState();
      return await this.createAuthenticatedBrowserContext(browser, headers, storageState);
    } finally {
      await tmpContext.dispose();
    }
  }

  private static async getValidationToken(httpClient: HttpClient, email: string): Promise<string> {
    const response = await httpClient.post('/v2/identity/users/validate', {
      data: { loginIdentifier: email },
    });

    if (!response.ok()) {
      throw new Error(`User validation failed for email: ${email}`);
    }

    const responseJson = await response.json();
    const token = responseJson?.result?.token;

    if (!token) {
      throw new Error(`Token not found for email: ${email}`);
    }

    return token;
  }

  private static async performLogin(httpClient: HttpClient, token: string, password: string): Promise<void> {
    const response = await httpClient.post('/v2/identity/users/login', {
      data: { password },
      headers: { 'x-smtip-tsid': token },
    });

    if (!response.ok()) {
      throw new Error('Login failed');
    }
  }

  private static async extractAuthHeaders(context: APIRequestContext): Promise<Record<string, string>> {
    const storageState = await context.storageState();
    return this.fetchHeadersFromCookies(storageState.cookies);
  }

  private static async createAuthenticatedAPIContext(
    headers: Record<string, string>,
    storageState: any
  ): Promise<APIRequestContext> {
    return request.newContext({
      extraHTTPHeaders: headers,
      storageState: storageState,
    });
  }

  private static async createAuthenticatedBrowserContext(
    browser: Browser,
    headers: Record<string, string>,
    storageState: any
  ): Promise<BrowserContext> {
    return browser.newContext({
      extraHTTPHeaders: headers,
      storageState: storageState,
    });
  }

  private static fetchHeadersFromCookies(cookies: Array<{ name: string; value: string }>): Record<string, string> {
    const token = cookies.find(c => c.name === 'token')?.value;
    const ftokenValue = token?.replace(/%2B/g, '+');
    const csrfid = cookies.find(c => c.name === 'csrfid')?.value;

    if (!token || !csrfid) {
      const missingCookies = [];
      if (!token) missingCookies.push('token');
      if (!csrfid) missingCookies.push('csrfid');

      throw new Error(`Missing required cookies: ${missingCookies.join(', ')}`);
    }

    return {
      Cookie: `token=${token}; csrfid=${csrfid} ;ftoken=${ftokenValue}`,
      'x-smtip-csrfid': csrfid,
    };
  }
}
