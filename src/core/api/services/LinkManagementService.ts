import { APIRequestContext } from '@playwright/test';

import { HttpClient } from '../clients/httpClient';

import { ILinkManagementOperations } from '@/src/core/api/interfaces/ILinkManagementOperations';
import { AppsManagementService } from '@/src/core/api/services/AppsManagementService';
import { AppsSettingsPayload, ExternalLink } from '@/src/core/types/app.type';

export class LinkManagementService implements ILinkManagementOperations {
  private appsManagementService: AppsManagementService;
  private httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.appsManagementService = new AppsManagementService(context, baseUrl);
    this.httpClient = new HttpClient(context, baseUrl);
  }

  async addExternalLink(link: ExternalLink): Promise<any> {
    const current = await this.appsManagementService.getAppsSettings();

    const updatedLinks = [...(current.result.externalLinks ?? []), { faviconUrl: null, ...link }];

    const updatedPayload = {
      ...current.result,
      externalLinks: updatedLinks,
      externalApps: {
        ...current.result.externalApps,
        appsIntegrationProvider: current.result.externalApps?.appsIntegrationProvider ?? 'custom',
      },
    } as AppsSettingsPayload;

    return await this.appsManagementService.updateAppsSettings(updatedPayload);
  }

  async removeExternalLink(linkName: string): Promise<any> {
    const current = await this.appsManagementService.getAppsSettings();
    const filtered = (current.result.externalLinks ?? []).filter((l: any) => l.name !== linkName);

    const updatedPayload = {
      ...current.result,
      externalLinks: filtered,
    } as AppsSettingsPayload;

    return await this.appsManagementService.updateAppsSettings(updatedPayload);
  }
}
