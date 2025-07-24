import { APIRequestContext, APIResponse } from '@playwright/test';
import { getInternalBackendUrl } from '@/src/core/utils/urlUtils';
import { ApiError } from '@core/api/apiError';
import {
  RequestOptionsBase,
  ValidateResponseOptions,
  GetRequestOptions,
  PostRequestOptions,
  PutRequestOptions,
  DeleteRequestOptions,
  PatchRequestOptions,
} from '@core/types';
import { BaseApiClient } from './baseApiClient';

export class HttpClient {
  context: APIRequestContext;
  readonly baseUrl: string;
  username?: string;
  password?: string;

  constructor(context: APIRequestContext, baseUrl?: string) {
    this.context = context;
    this.baseUrl = baseUrl || process.env.API_BASE_URL || '';
    if (!this.baseUrl) {
      throw new Error('BaseUrl must be provided either through constructor or API_BASE_URL environment variable');
    }
  }

  private async reauthenticate(): Promise<void> {
    if (!this.username || !this.password) {
      throw new Error('Cannot reauthenticate without username and password');
    }
    this.context = await BaseApiClient.loginViaApi({ username: this.username, password: this.password }, this.baseUrl);
  }

  private async sendRequest(
    request: (options: any) => Promise<APIResponse>,
    options?: RequestOptionsBase
  ): Promise<APIResponse> {
    try {
      const response = await request(options);
      if ([401, 403].includes(response.status())) {
        await this.reauthenticate();
        return await request(options);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  protected getUrl(endpoint: string, options?: RequestOptionsBase): string {
    const baseUrl = options?.useInternalBackendUrl
      ? getInternalBackendUrl(process.env.FRONTEND_BASE_URL!)
      : this.baseUrl;
    return `${baseUrl}${endpoint}`;
  }

  async get(endpoint: string, options?: GetRequestOptions): Promise<APIResponse> {
    const { useInternalBackendUrl, ...requestOptions } = options || {};
    const url = this.getUrl(endpoint, { useInternalBackendUrl });
    return this.sendRequest(() => this.context.get(url, requestOptions), options);
  }

  async post(endpoint: string, options?: PostRequestOptions): Promise<APIResponse> {
    const { useInternalBackendUrl, ...requestOptions } = options || {};
    const url = this.getUrl(endpoint, { useInternalBackendUrl });
    return this.sendRequest(() => this.context.post(url, requestOptions), options);
  }

  async put(endpoint: string, options?: PutRequestOptions): Promise<APIResponse> {
    const { useInternalBackendUrl, ...requestOptions } = options || {};
    const url = this.getUrl(endpoint, { useInternalBackendUrl });
    return this.sendRequest(() => this.context.put(url, requestOptions), options);
  }

  async delete(endpoint: string, options?: DeleteRequestOptions): Promise<APIResponse> {
    const { useInternalBackendUrl, ...requestOptions } = options || {};
    const url = this.getUrl(endpoint, { useInternalBackendUrl });
    return this.sendRequest(() => this.context.delete(url, requestOptions), options);
  }

  async patch(endpoint: string, options?: PatchRequestOptions): Promise<APIResponse> {
    const { useInternalBackendUrl, ...requestOptions } = options || {};
    const url = this.getUrl(endpoint, { useInternalBackendUrl });
    return this.sendRequest(() => this.context.patch(url, requestOptions), options);
  }

  protected async validateResponse(response: APIResponse, options: ValidateResponseOptions = {}): Promise<void> {
    const {
      expectedStatusCodes = [200, 201, 204],
      allowEmptyResponse = true,
      customValidation,
      throwOnError = true,
    } = options;

    if (!expectedStatusCodes.includes(response.status())) {
      const error = new ApiError(response.status(), await response.text(), response.url());
      if (throwOnError) {
        throw error;
      }
    }

    if (!allowEmptyResponse && (await response.text()) === '') {
      const error = new ApiError(
        response.status(),
        'Response body is empty when it was expected to have content',
        response.url()
      );
      if (throwOnError) {
        throw error;
      }
    }

    if (customValidation) {
      await customValidation(response);
    }
  }

  protected async parseResponse<T>(response: APIResponse, validationOptions?: ValidateResponseOptions): Promise<T> {
    await this.validateResponse(response, validationOptions);
    return response.json() as T;
  }
}
