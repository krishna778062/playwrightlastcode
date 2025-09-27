import { APIRequestContext, APIResponse } from '@playwright/test';

import {
  DeleteRequestOptions,
  GetRequestOptions,
  PatchRequestOptions,
  PostRequestOptions,
  PutRequestOptions,
  ValidateResponseOptions,
} from '../types/types';

import { ApiError } from '@/src/core/api/errors/apiError';

export class HttpClient {
  readonly context: APIRequestContext;
  readonly baseUrl: string;

  constructor(context: APIRequestContext, baseUrl: string) {
    this.context = context;
    this.baseUrl = baseUrl;
  }

  protected getUrl(endpoint: string): string {
    //if the endpoint already has http or https, then we need to add the baseUrl to it
    if (endpoint.startsWith('http') || endpoint.startsWith('https')) {
      return endpoint;
    }
    //if the endpoint does not have / then append it to the baseUrl
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }
    return `${this.baseUrl}${endpoint}`;
  }

  async get(endpoint: string, options?: GetRequestOptions): Promise<APIResponse> {
    return this.context.get(this.getUrl(endpoint), options);
  }

  async post(endpoint: string, options?: PostRequestOptions): Promise<APIResponse> {
    return this.context.post(this.getUrl(endpoint), options);
  }

  async put(endpoint: string, options?: PutRequestOptions): Promise<APIResponse> {
    return this.context.put(this.getUrl(endpoint), options);
  }

  async delete(endpoint: string, options?: DeleteRequestOptions): Promise<APIResponse> {
    return this.context.delete(this.getUrl(endpoint), options);
  }

  async patch(endpoint: string, options?: PatchRequestOptions): Promise<APIResponse> {
    return this.context.patch(this.getUrl(endpoint), options);
  }

  public async validateResponse(response: APIResponse, options: ValidateResponseOptions = {}): Promise<void> {
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

  public async parseResponse<T>(response: APIResponse, validationOptions?: ValidateResponseOptions): Promise<T> {
    await this.validateResponse(response, validationOptions);
    return response.json() as T;
  }
}
