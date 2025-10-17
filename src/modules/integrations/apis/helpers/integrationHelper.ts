import { APIRequestContext } from '@playwright/test';

import { CalendarIntegrationService } from '../services/integrationService';

export class CalendarIntegrationHelper {
  public calendarIntegrationService: CalendarIntegrationService;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.calendarIntegrationService = new CalendarIntegrationService(apiRequestContext, baseUrl);
  }

  async updateCalendarIntegrationConfig(config: { googleCalendarEnabled: boolean; outlookEnabled: boolean }) {
    return await this.calendarIntegrationService.updateCalendarIntegrationConfig(config);
  }

  async addIntegrationDomain(domainName: string) {
    return await this.calendarIntegrationService.updateIntegrationDomains('add', domainName);
  }

  async removeIntegrationDomain(domainName: string) {
    return await this.calendarIntegrationService.updateIntegrationDomains('remove', domainName);
  }
}
