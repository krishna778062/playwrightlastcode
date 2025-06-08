import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from './baseApiClient';

export class AdminApiClient extends BaseApiClient {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }
}
