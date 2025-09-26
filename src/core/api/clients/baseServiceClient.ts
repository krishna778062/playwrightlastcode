import { APIRequestContext, APIResponse } from '@playwright/test';

import { HttpClient } from './httpClient';

import {
  DeleteRequestOptions,
  GetRequestOptions,
  PatchRequestOptions,
  PostRequestOptions,
  PutRequestOptions,
} from '@/src/core/api/types/types';

export interface ServiceClientConfig {
  serviceName: string;
  baseUrl: string;
  requiresAuth?: boolean;
}

export abstract class BaseServiceClient {
  protected httpClient: HttpClient;
  protected serviceName: string;

  constructor(serviceName: string, context: APIRequestContext, baseUrl: string) {
    this.serviceName = serviceName;
    this.httpClient = new HttpClient(context, baseUrl);
  }

  // Raw HTTP methods - give you full access to response (headers, cookies, status, etc.)
  public async get(endpoint: string, options?: GetRequestOptions): Promise<APIResponse> {
    try {
      return await this.httpClient.get(endpoint, options);
    } catch (error) {
      throw new Error(`[${this.serviceName}] GET ${endpoint} failed: ${error}`);
    }
  }

  public async post(endpoint: string, options?: PostRequestOptions): Promise<APIResponse> {
    try {
      return await this.httpClient.post(endpoint, options);
    } catch (error) {
      throw new Error(`[${this.serviceName}] POST ${endpoint} failed: ${error}`);
    }
  }

  public async put(endpoint: string, options?: PutRequestOptions): Promise<APIResponse> {
    try {
      return await this.httpClient.put(endpoint, options);
    } catch (error) {
      throw new Error(`[${this.serviceName}] PUT ${endpoint} failed: ${error}`);
    }
  }

  public async patch(endpoint: string, options?: PatchRequestOptions): Promise<APIResponse> {
    try {
      return await this.httpClient.patch(endpoint, options);
    } catch (error) {
      throw new Error(`[${this.serviceName}] PATCH ${endpoint} failed: ${error}`);
    }
  }

  public async delete(endpoint: string, options?: DeleteRequestOptions): Promise<APIResponse> {
    try {
      return await this.httpClient.delete(endpoint, options);
    } catch (error) {
      throw new Error(`[${this.serviceName}] DELETE ${endpoint} failed: ${error}`);
    }
  }

  protected getBackEndUrl(): string {
    return getInternalBackendUrl(process.env.FRONTEND_BASE_URL!);
  }
}

export const getInternalBackendUrl = (appUrl: string): string => {
  if (!appUrl) {
    throw new Error('App URL is required to determine backend URL');
  }

  const domain = Object.keys(BACKEND_URLS).find(key => appUrl.includes(key));
  if (!domain) {
    throw new Error(`Backend URL is not found for the given app URL : ${appUrl}`);
  }

  return BACKEND_URLS[domain as keyof typeof BACKEND_URLS];
};

const BACKEND_URLS = {
  'test.simpplr.xyz': 'https://api-be.test.simpplr.xyz',
  'uat.simpplr.xyz': 'https://api-be.uat.simpplr.xyz',
  'dev.simpplr.xyz': 'https://api-be.dev.simpplr.xyz',
  'app.simpplr.xyz': 'https://api-be.app.simpplr.xyz',
  'qa.simpplr.xyz': 'https://api-be.qa.simpplr.xyz',
  'perf.simpplr.xyz': 'https://api-be.perf.simpplr.xyz',
} as const;
