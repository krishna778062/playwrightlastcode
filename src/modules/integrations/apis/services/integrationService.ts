import { APIRequestContext, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';

import { HttpClient } from '../../../../core/api/clients/httpClient';

export class CalendarIntegrationService {
  private httpClient: HttpClient;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(apiRequestContext, baseUrl);
  }

  async updateCalendarIntegrationConfig(config: { googleCalendarEnabled: boolean; outlookEnabled: boolean }) {
    return await test.step('Updating calendar integration configuration via API', async () => {
      console.log('Calendar integration config payload:', config);

      const response = await this.httpClient.post(API_ENDPOINTS.integrations.calendarIntegration, {
        data: config,
      });

      const json = await response.json();
      console.log('Calendar integration config response:', JSON.stringify(json, null, 2));

      if (json.status !== 200 || json.message !== 'SUCCESS') {
        throw new Error(`Calendar integration config update failed. Response: ${JSON.stringify(json)}`);
      }

      return json;
    });
  }

  async updateIntegrationDomains(action: 'add' | 'remove', domainName: string) {
    return await test.step(`${action === 'add' ? 'Adding' : 'Removing'} integration domain via API`, async () => {
      const payload = {
        type: action,
        googleCalendarDomainList: [{ domainName }],
      };

      console.log('Integration domains payload:', payload);

      const response = await this.httpClient.patch(API_ENDPOINTS.integrations.integrationDomains, {
        data: payload,
      });

      const json = await response.json();
      console.log('Integration domains response:', JSON.stringify(json, null, 2));

      if (json.status !== 200 || json.message !== 'SUCCESS') {
        throw new Error(`Integration domains update failed. Response: ${JSON.stringify(json)}`);
      }

      return json;
    });
  }
}
