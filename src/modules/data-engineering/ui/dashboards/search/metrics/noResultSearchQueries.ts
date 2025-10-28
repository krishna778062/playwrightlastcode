import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';

export enum NoResultSearchQueriesColumns {
  SEARCH_QUERY = 'Search query',
  NO_RESULT_COUNT = 'No result count',
  TOTAL_SEARCH_VOLUME = 'Total search volume',
  PERCENTAGE_OF_TOTAL_SEARCHES = 'Percentage of total searches',
}

export interface NoResultSearchQueriesData {
  search_term: string;
  failed_search_count: number;
  total_search_count: number;
  failure_percentage: number;
}

export class NoResultSearchQueries extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SEARCH_METRICS.NO_RESULT_SEARCH_QUERIES.title);
  }

  /**
   * Verifies that the no result search queries data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of no result search queries data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(snowflakeDataArray: NoResultSearchQueriesData[]): Promise<void> {
    const dataMapper = (item: NoResultSearchQueriesData) => ({
      [NoResultSearchQueriesColumns.SEARCH_QUERY]: item.search_term,
      [NoResultSearchQueriesColumns.NO_RESULT_COUNT]: item.failed_search_count.toString(),
      [NoResultSearchQueriesColumns.TOTAL_SEARCH_VOLUME]: item.total_search_count.toString(),
      [NoResultSearchQueriesColumns.PERCENTAGE_OF_TOTAL_SEARCHES]: item.failure_percentage.toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, NoResultSearchQueriesColumns.SEARCH_QUERY);
  }
}
