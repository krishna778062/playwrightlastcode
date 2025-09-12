import { APIRequestContext } from '@playwright/test';

import { ChatService } from '@chat/api/services/ChatService';
import { FeedManagementService } from '@core/api/services/FeedManagementService';
import { IdentityService } from '@core/api/services/IdentityService';

import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';
import { ContentManagementService } from '@/src/core/api/services/ContentManagementService';
import { SiteManagementService } from '@/src/core/api/services/SiteManagementService';

export class StandardUserApiClient extends BaseApiClient {
  private readonly chatService: ChatService;
  private readonly identityService: IdentityService;
  private readonly siteManagementService: SiteManagementService;
  private readonly contentManagementService: ContentManagementService;
  private readonly feedManagementService: FeedManagementService;

  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
    this.chatService = new ChatService(context, baseUrl);
    this.identityService = new IdentityService(context, baseUrl);
    this.siteManagementService = new SiteManagementService(context, baseUrl);
    this.contentManagementService = new ContentManagementService(context, baseUrl || '');
    this.feedManagementService = new FeedManagementService(context, baseUrl);
  }

  getChatService(): ChatService {
    return this.chatService;
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

  getFeedManagementService(): FeedManagementService {
    return this.feedManagementService;
  }
}
