import { AppManagerApiClient } from '../api/clients/appManagerApiClient';

export class BaseTestDataBuilder {
  protected readonly apiClient: AppManagerApiClient;

  /**
   * Note: since app manager have most access we will
   * use its client to seed the data
   * @param apiClient
   */
  constructor(apiClient: AppManagerApiClient) {
    this.apiClient = apiClient;
  }
}
