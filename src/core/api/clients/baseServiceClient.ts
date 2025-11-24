import { APIRequestContext, APIResponse } from '@playwright/test';

import { getInternalBackendUrl } from '../utils/apiUrlUtil';

import { HttpClient } from './httpClient';

import {
  DeleteRequestOptions,
  GetRequestOptions,
  PatchRequestOptions,
  PostRequestOptions,
  PutRequestOptions,
} from '@/src/core/types/http.type';

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
