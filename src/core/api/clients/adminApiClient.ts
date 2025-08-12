import { APIRequestContext } from '@playwright/test';

import { BaseApiClient } from './baseApiClient';

// use to perfrom api calls that are only used in the admin portal
export class AdminApiClient extends BaseApiClient {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }
}
