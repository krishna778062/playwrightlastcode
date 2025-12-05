import { APIRequestContext, expect, test } from '@playwright/test';

import { HttpClient } from '../../../../core/api/clients/httpClient';
import { ISurveyManagementService } from '../interfaces/ISurveyManagementService';

export class SurveyManagementService implements ISurveyManagementService {
  public httpClient: HttpClient;
  private readonly authToken?: string;
  readonly cookieHeader?: string;
  readonly csrfToken?: string;

  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string,
    authToken?: string,
    cookieHeader?: string,
    csrfToken?: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
    this.authToken = authToken;
    this.cookieHeader = cookieHeader;
    this.csrfToken = csrfToken;
  }

  /**
   * Deletes a survey by its ID.
   * @param surveyId - The survey ID.
   */
  async deleteSurvey(surveyId: string): Promise<void> {
    return await test.step('Deleting survey via API delete request', async () => {
      await expect
        .poll(
          async () => {
            const extraHeaders: Record<string, string> = {};
            if (this.cookieHeader) extraHeaders['Cookie'] = this.cookieHeader;
            if (this.csrfToken) extraHeaders['x-smtip-csrfid'] = this.csrfToken;
            const response = await this.httpClient.delete(`/sentiment-ai/v1/surveys/${surveyId}`, {
              timeout: 50_000,
              headers: Object.keys(extraHeaders).length ? extraHeaders : undefined,
            });
            return response.status() === 200;
          },
          {
            intervals: [10000, 20000, 30000],
            timeout: 50_000,
          }
        )
        .toBe(true);
    });
  }
}
