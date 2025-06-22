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

export class HttpClient {
  protected readonly context: APIRequestContext;
  protected readonly baseUrl: string;

  constructor(context: APIRequestContext, baseUrl?: string) {
    this.context = context;
    this.baseUrl = baseUrl || process.env.API_BASE_URL || '';
    if (!this.baseUrl) {
      throw new Error('BaseUrl must be provided either through constructor or API_BASE_URL environment variable');
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
    return this.context.get(this.getUrl(endpoint, { useInternalBackendUrl }), requestOptions);
  }

  async post(endpoint: string, options?: PostRequestOptions): Promise<APIResponse> {
    const { useInternalBackendUrl, ...requestOptions } = options || {};
    return this.context.post(this.getUrl(endpoint, { useInternalBackendUrl }), requestOptions);
  }

  async put(endpoint: string, options?: PutRequestOptions): Promise<APIResponse> {
    const { useInternalBackendUrl, ...requestOptions } = options || {};
    return this.context.put(this.getUrl(endpoint, { useInternalBackendUrl }), requestOptions);
  }

  async delete(endpoint: string, options?: DeleteRequestOptions): Promise<APIResponse> {
    const { useInternalBackendUrl, ...requestOptions } = options || {};
    return this.context.delete(this.getUrl(endpoint, { useInternalBackendUrl }), requestOptions);
  }

  async patch(endpoint: string, options?: PatchRequestOptions): Promise<APIResponse> {
    const { useInternalBackendUrl, ...requestOptions } = options || {};
    return this.context.patch(this.getUrl(endpoint, { useInternalBackendUrl }), requestOptions);
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
