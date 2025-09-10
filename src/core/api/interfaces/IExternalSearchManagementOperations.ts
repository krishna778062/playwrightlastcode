import { ExternalSearch, ExternalSearchResponse } from '@/src/core/types/externalSearch.type';

/**
 * Interface for External Search Management services
 */
export interface IExternalSearchManagementServices {
  /**
   * Updates the external search configuration with the provided providers array
   * @param providers - Array of external search providers to configure
   * @returns The updated external search configuration response
   */
  updateExternalSearchConfig(providers: ExternalSearch[]): Promise<ExternalSearchResponse>;
}
