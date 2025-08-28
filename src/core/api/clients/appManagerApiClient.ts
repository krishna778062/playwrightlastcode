import { APIRequestContext } from '@playwright/test';

import { ChatService } from '@chat/api/services/ChatService';
import { FeedManagementService } from '@core/api/services/FeedManagementService';
import { IdentityService } from '@core/api/services/IdentityService';
import { UserManagementService } from '@core/api/services/UserManagementService';

import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';
import { AppsManagementService } from '@/src/core/api/services/AppsManagementService';
import { ContentManagementService } from '@/src/core/api/services/ContentManagementService';
import { ExternalSearchManagementService } from '@/src/core/api/services/ExternalSearchManagementService';
import { ImageUploaderService } from '@/src/core/api/services/ImageUploaderService';
import { SiteManagementService } from '@/src/core/api/services/SiteManagementService';
import { TileManagementService } from '@/src/core/api/services/TileManagementService';

export class AppManagerApiClient extends BaseApiClient {
  private readonly chatService: ChatService;
  private readonly userManagementService: UserManagementService;
  private readonly identityService: IdentityService;
  private readonly siteManagementService: SiteManagementService;
  private readonly contentManagementService: ContentManagementService;
  private readonly tileManagementService: TileManagementService;
  private readonly imageUploaderService: ImageUploaderService;
  private readonly appsManagementService: AppsManagementService;
  private readonly externalSearchManagementService: ExternalSearchManagementService;
  private readonly feedManagementService: FeedManagementService;

  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
    this.chatService = new ChatService(context, baseUrl);
    this.userManagementService = new UserManagementService(context, baseUrl);
    this.identityService = new IdentityService(context, baseUrl);
    this.siteManagementService = new SiteManagementService(context, baseUrl);
    this.tileManagementService = new TileManagementService(context, baseUrl);
    this.contentManagementService = new ContentManagementService(context, baseUrl || '');
    this.imageUploaderService = new ImageUploaderService(this, context);
    this.appsManagementService = new AppsManagementService(context, baseUrl);
    this.externalSearchManagementService = new ExternalSearchManagementService(context, baseUrl);
    this.feedManagementService = new FeedManagementService(context, baseUrl);
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

  getTileManagementService(): TileManagementService {
    return this.tileManagementService;
  }

  getImageUploaderService(): ImageUploaderService {
    return this.imageUploaderService;
  }

  getAppsManagementService(): AppsManagementService {
    return this.appsManagementService;
  }

  getExternalSearchManagementService(): ExternalSearchManagementService {
    return this.externalSearchManagementService;
  }

  getFeedManagementService(): FeedManagementService {
    return this.feedManagementService;
  }
}
