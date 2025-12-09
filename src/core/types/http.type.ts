import { APIRequestContext, APIResponse } from '@playwright/test';

// Get Playwright's request options types for different methods
type GetOptions = NonNullable<Parameters<APIRequestContext['get']>[1]>;
type PostOptions = NonNullable<Parameters<APIRequestContext['post']>[1]>;
type PutOptions = NonNullable<Parameters<APIRequestContext['put']>[1]>;
type DeleteOptions = NonNullable<Parameters<APIRequestContext['delete']>[1]>;
type PatchOptions = NonNullable<Parameters<APIRequestContext['patch']>[1]>;

export interface ValidateResponseOptions {
  expectedStatusCodes?: number[];
  allowEmptyResponse?: boolean;
  customValidation?: (response: APIResponse) => Promise<void>;
  throwOnError?: boolean;
}

export interface GetRequestOptions extends GetOptions {}
export interface PostRequestOptions extends PostOptions {}
export interface PutRequestOptions extends PutOptions {}
export interface DeleteRequestOptions extends DeleteOptions {}
export interface PatchRequestOptions extends PatchOptions {}
