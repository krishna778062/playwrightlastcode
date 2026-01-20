import { Page } from '@playwright/test';
import { CommonApiHelper } from '@recognition/api/helpers/commonApiHelper';
import { buildPeerRecognitionAwardPayload } from '@recognition/api/payloads/manageAwardsPayload';
import { RECOGNITION_API_ENDPOINTS } from '@recognition/api/recognitionApiEndpoints';

import { HttpClient } from '@core/api';

export class ManageAwardsApiService {
  private readonly commonApiHelper = new CommonApiHelper();

  /**
   * Create a peer recognition award via API and return its id and name.
   */
  async createAwardViaApi(
    page: Page,
    awardType: string,
    awardName?: string,
    description = 'Automation peer recognition award'
  ): Promise<{ awardId: string; awardName: string }> {
    const { apiContext } = await this.commonApiHelper.createApiContext(page, { 'content-type': 'application/json' });
    try {
      const httpClient = new HttpClient(apiContext, this.commonApiHelper.baseUrl);
      const finalAwardName = awardName ?? `${awardType} ${Date.now()}`;
      const payload = buildPeerRecognitionAwardPayload(finalAwardName, description);

      const response = await httpClient.post(RECOGNITION_API_ENDPOINTS.awards.create, { data: payload });
      if (response.status() !== 200 && response.status() !== 201) {
        throw new Error(`Create failed. Status: ${response.status()} Body: ${await response.text()}`);
      }

      const body = await response.json();
      const awardId = body?.id ?? body?.awardId;
      if (!awardId) {
        throw new Error('Create failed. awardId not returned by API');
      } else {
        console.log(
          `Award created successfully with name: ${finalAwardName} and awardId: ${awardId} with api status: ${response.status()}`
        );
      }
      return { awardId, awardName: finalAwardName };
    } finally {
      await apiContext.dispose();
    }
  }

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
      const endpoint = `${RECOGNITION_API_ENDPOINTS.awards.delete}${awardId}`;
      console.log('Endpoint:---', endpoint);
      const response = await httpClient.delete(endpoint);
      console.log('Award deletion response status:---', response.status());
      if (response.status() !== 200) {
        throw new Error(`Delete failed. Status: ${response.status()} Body: ${await response.text()}`);
      } else {
        console.log(
          `${awardType} award deleted successfully with awardId: ${awardId} with api status: ${response.status()}`
        );
      }
    } finally {
      await apiContext.dispose();
    }
  }
}
