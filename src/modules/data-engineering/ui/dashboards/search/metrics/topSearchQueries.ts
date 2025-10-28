import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';

export enum TopSearchQueriesColumns {
  SEARCH_QUERY = 'Search query',
  TOP_SEARCH_QUERY_VOLUME = 'Total search query volume',
  NUMBER_OF_CLICKTHROUGH_COUNT = 'Number of click-through count',
  CLICK_THROUGH_RATE = 'Click-through rate',
}

export interface TopSearchQueriesData {
  search_query: string;
  total_search: number;
  clickthrough: number;
  success_rate: string;
}

export class TopSearchQueries extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SEARCH_METRICS.TOP_SEARCH_QUERIES.title);
  }

  /**
   * Verifies that the top search queries data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of top search queries data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(snowflakeDataArray: TopSearchQueriesData[]): Promise<void> {
    const dataMapper = (item: TopSearchQueriesData) => ({
      [TopSearchQueriesColumns.SEARCH_QUERY]: item.search_query,
      [TopSearchQueriesColumns.TOP_SEARCH_QUERY_VOLUME]: item.total_search.toString(),
      [TopSearchQueriesColumns.NUMBER_OF_CLICKTHROUGH_COUNT]: item.clickthrough.toString(),
      [TopSearchQueriesColumns.CLICK_THROUGH_RATE]: item.success_rate,
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, TopSearchQueriesColumns.SEARCH_QUERY);
  }
}
