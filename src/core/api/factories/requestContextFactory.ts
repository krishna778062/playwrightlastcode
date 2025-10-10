import { APIRequestContext, request } from '@playwright/test';

import { AuthHelper } from '@/src/core/api/helpers/authHelper';

export class RequestContextFactory {
  // ✅ Create authenticated context
  static async createAuthenticatedContext(
    tenantUrl: string,
    creds: {
      email: string;
      password: string;
    }
  ): Promise<APIRequestContext> {
    return AuthHelper.getLoggedInApiClient(tenantUrl, creds);
  }

  // ✅ Create context with custom headers
  static async createContextWithHeaders(headers: Record<string, string>): Promise<APIRequestContext> {
    return request.newContext({
      extraHTTPHeaders: headers,
    });
  }

  // ✅ Create context with storage state (for session restoration)
  static async createContextFromStorage(storageState: any): Promise<APIRequestContext> {
    return request.newContext({
      storageState,
    });
  }

  // ✅ Create context with specific user agent
  static async createContextWithUserAgent(userAgent: string): Promise<APIRequestContext> {
    return request.newContext({
      userAgent,
    });
  }

  // ✅ Create context with multiple options
  static async createContext(options: {
    headers?: Record<string, string>;
    userAgent?: string;
    storageState?: any;
    viewport?: { width: number; height: number };
  }): Promise<APIRequestContext> {
    return request.newContext(options);
  }
}
