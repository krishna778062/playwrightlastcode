import { APIRequestContext, Page } from '@playwright/test';

import { BaseApiClient } from '../clients/baseApiClient';

// This allows us to create any type of client that extends BaseApiClient
export class ApiClientFactory {
  static async createClient<T extends BaseApiClient>(
    clientConstructor: new (context: APIRequestContext, baseUrl: string) => T,
    options: {
      type: 'credentials' | 'cookies' | 'storage';
      credentials?: { username: string; password: string };
      page?: Page;
      storagePath?: string;
      baseUrl: string;
    }
  ): Promise<T> {
    const context = await this.createContext(options);
    return new clientConstructor(context, options.baseUrl);
  }

  private static async createContext(options: {
    type: 'credentials' | 'cookies' | 'storage';
    credentials?: { username: string; password: string };
    page?: Page;
    storagePath?: string;
    baseUrl: string;
  }): Promise<APIRequestContext> {
    switch (options.type) {
      case 'credentials':
        if (!options.credentials) throw new Error('Credentials required');
        return BaseApiClient.loginViaApi(options.credentials, options.baseUrl);
      case 'cookies':
        if (!options.page) throw new Error('Page required');
        return BaseApiClient.createFromCookies(options.page);
      case 'storage':
        if (!options.storagePath) throw new Error('Storage path required');
        return BaseApiClient.createFromStorage(options.storagePath);
      default:
        throw new Error('Invalid authentication type');
    }
  }
}
