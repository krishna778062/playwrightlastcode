import { APIRequestContext } from '@playwright/test';
import { ChatService } from '@chat/api/services/ChatService';
import { UserManagementService } from '@core/api/services/UserManagementService';
import { IdentityService } from '@core/api/services/IdentityService';
import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';
import { SiteManagementService } from '../services/SiteManagementService';
import { TileManagementService } from '../services/TileManagementService';

export class AppManagerApiClient extends BaseApiClient {
  private readonly chatService: ChatService;
  private readonly userManagementService: UserManagementService;
  private readonly identityService: IdentityService;
  private readonly siteManagementService: SiteManagementService;
  private readonly tileManagementService: TileManagementService;
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
    this.chatService = new ChatService(context, baseUrl);
    this.userManagementService = new UserManagementService(context, baseUrl);
    this.identityService = new IdentityService(context, baseUrl);
    this.siteManagementService = new SiteManagementService(context, baseUrl);
    this.tileManagementService = new TileManagementService(context, baseUrl);
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

  getSiteManagementService(): SiteManagementService {
    return this.siteManagementService;
  }

  getTileManagementService(): TileManagementService {
    return this.tileManagementService;
  }
}
