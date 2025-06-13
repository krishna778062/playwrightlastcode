import { APIRequestContext } from '@playwright/test';
import { ChatService } from '@chat/api/services/ChatService';
import { UserManagementService } from '@core/api/services/UserManagementService';
import { IdentityService } from '@core/api/services/IdentityService';
import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';

export class AppManagerApiClient extends BaseApiClient {
  private readonly chatService: ChatService;
  private readonly userManagementService: UserManagementService;
  private readonly identityService: IdentityService;

  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
    this.chatService = new ChatService(context, baseUrl);
    this.userManagementService = new UserManagementService(context, baseUrl);
    this.identityService = new IdentityService(context, baseUrl);
  }

  getChatService(): ChatService {
    return this.chatService;
  }

  getUserManagementService(): UserManagementService {
    return this.userManagementService;
  }

  getIdentityService(): IdentityService {
    return this.identityService;
  }
}
