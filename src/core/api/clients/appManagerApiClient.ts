import { APIRequestContext } from '@playwright/test';
import { ChatService } from '@chat/api/services/ChatService';
import { UserManagementService } from '@core/api/services/UserManagementService';
import { IdentityService } from '@core/api/services/IdentityService';
import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';
import { SiteManagementService } from '../services/SiteManagementService';
import { ContentManagementService } from '../services/ContentManagementService';
import { GlobalSearchService } from '../services/GlobalSearchService';

export class AppManagerApiClient extends BaseApiClient {
  private readonly chatService: ChatService;
  private readonly userManagementService: UserManagementService;
  private readonly identityService: IdentityService;
  private readonly siteManagementService: SiteManagementService;
  private readonly contentManagementService: ContentManagementService;
  private readonly globalSearchService: GlobalSearchService;

  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
    this.chatService = new ChatService(context, baseUrl || '');
    this.userManagementService = new UserManagementService(context, baseUrl || '');
    this.identityService = new IdentityService(context, baseUrl || '');
    this.siteManagementService = new SiteManagementService(context, baseUrl || '');
    this.contentManagementService = new ContentManagementService(context, baseUrl || '');
    this.globalSearchService = new GlobalSearchService(context, baseUrl || '');
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

  getContentManagementService(): ContentManagementService {
    return this.contentManagementService;
  }

  getGlobalSearchService(): GlobalSearchService {
    return this.globalSearchService;
  }
}
