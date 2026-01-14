import { Page } from '@playwright/test';

import { HttpClient } from '@core/api';

import { CommonApiHelper } from '../helpers/commonApiHelper';
import { RECOGNITION_API_ENDPOINTS } from '../recognitionApiEndpoints';

export class RecognitionHubApiService {
  private readonly commonApiHelper = new CommonApiHelper();

  /**
   * Delete award by id (generic helper).
   * @param page Active Playwright page (uses current auth/session)
   * @param awardName Optional name of the award to delete
   * @param awardId Award identifier to delete
   */
  async deleteAwardViaApi(page: Page, awardType: string, awardId: any): Promise<void> {
    const { apiContext } = await this.commonApiHelper.createApiContext(page, { 'content-type': 'application/json' });
    try {
      const httpClient = new HttpClient(apiContext, this.commonApiHelper.baseUrl);
      const endpoint = `${RECOGNITION_API_ENDPOINTS.hub.deleteAward}${awardId}`;
      console.log('Endpoint:---', endpoint);
      const response = await httpClient.delete(endpoint);
      console.log('Award deletion response status:---', response.status());
      if (response.status() !== 200) {
        throw new Error(`Delete failed. Status: ${response.status()} Body: ${await response.text()}`);
      }
    } finally {
      console.log(`${awardType} award deleted successfully`);
      await apiContext.dispose();
    }
  }
}
