import { APIRequestContext } from '@playwright/test';

import { ChatService } from '@chat/api/services/ChatService';
import { FeedManagementService } from '@core/api/services/FeedManagementService';
import { IdentityService } from '@core/api/services/IdentityService';
import { UserManagementService } from '@core/api/services/UserManagementService';

import { AppsManagementService } from '../services/AppsManagementService';
import { ContentManagementService } from '../services/ContentManagementService';
import { ImageUploaderService } from '../services/ImageUploaderService';
import { SiteManagementService } from '../services/SiteManagementService';
import { TileManagementService } from '../services/TileManagementService';

import { BaseApiClient } from '@/src/core/api/clients/baseApiClient';

export class AppManagerApiClient extends BaseApiClient {
  private readonly chatService: ChatService;
  private readonly userManagementService: UserManagementService;
  private readonly identityService: IdentityService;
  private readonly siteManagementService: SiteManagementService;
  private readonly contentManagementService: ContentManagementService;
  private readonly tileManagementService: TileManagementService;
  private readonly imageUploaderService: ImageUploaderService;
  private readonly appsManagementService: AppsManagementService;
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

  getFeedManagementService(): FeedManagementService {
    return this.feedManagementService;
  }
}
