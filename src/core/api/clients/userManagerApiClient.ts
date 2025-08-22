import { APIRequestContext } from '@playwright/test';

import { IdentityService } from '@core/api/services/IdentityService';
import { UserManagementService } from '@core/api/services/UserManagementService';

import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';

export class UserManagerApiClient extends BaseApiClient {
  private readonly userManagementService: UserManagementService;
  private readonly identityService: IdentityService;

  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
    this.userManagementService = new UserManagementService(context, baseUrl);
    this.identityService = new IdentityService(context, baseUrl);
  }

  getUserManagementService(): UserManagementService {
    return this.userManagementService;
  }

  getIdentityService(): IdentityService {
    return this.identityService;
  }
}
