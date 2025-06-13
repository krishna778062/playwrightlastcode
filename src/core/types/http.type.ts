import { APIRequestContext, APIResponse } from '@playwright/test';

// Get Playwright's request options types for different methods
type GetOptions = NonNullable<Parameters<APIRequestContext['get']>[1]>;
type PostOptions = NonNullable<Parameters<APIRequestContext['post']>[1]>;
type PutOptions = NonNullable<Parameters<APIRequestContext['put']>[1]>;
type DeleteOptions = NonNullable<Parameters<APIRequestContext['delete']>[1]>;
type PatchOptions = NonNullable<Parameters<APIRequestContext['patch']>[1]>;

// Extend each method's options with our custom option
export interface RequestOptionsBase {
  useInternalBackendUrl?: boolean;
}

export interface ValidateResponseOptions {
  expectedStatusCodes?: number[];
  allowEmptyResponse?: boolean;
  customValidation?: (response: APIResponse) => Promise<void>;
  throwOnError?: boolean;
}

export interface GetRequestOptions extends GetOptions, RequestOptionsBase {}
export interface PostRequestOptions extends PostOptions, RequestOptionsBase {}
export interface PutRequestOptions extends PutOptions, RequestOptionsBase {}
export interface DeleteRequestOptions extends DeleteOptions, RequestOptionsBase {}
export interface PatchRequestOptions extends PatchOptions, RequestOptionsBase {}
