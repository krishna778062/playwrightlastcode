import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';

export enum TopSearchQueriesWithNoClickthroughColumns {
  SEARCH_QUERY = 'Search query',
  TOTAL_SEARCH_QUERY_VOLUME = 'Total search query volume',
  NO_CLICK_COUNT = 'No click count',
  NO_CLICK_RATE = 'No click rate',
}

export interface TopSearchQueriesWithNoClickthroughData {
  search_query: string;
  total_search: number;
  no_click_count: number;
  no_click_rate: string;
}

export class TopSearchQueriesWithNoClickthrough extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SEARCH_METRICS.TOP_SEARCH_QUERIES_WITH_NO_CLICKTHROUGH.title);
  }

  /**
   * Verifies that the top search queries with no clickthrough data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of top search queries with no clickthrough data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: TopSearchQueriesWithNoClickthroughData[]
  ): Promise<void> {
    const dataMapper = (item: TopSearchQueriesWithNoClickthroughData) => ({
      [TopSearchQueriesWithNoClickthroughColumns.SEARCH_QUERY]: item.search_query,
      [TopSearchQueriesWithNoClickthroughColumns.TOTAL_SEARCH_QUERY_VOLUME]: item.total_search.toString(),
      [TopSearchQueriesWithNoClickthroughColumns.NO_CLICK_COUNT]: item.no_click_count.toString(),
      [TopSearchQueriesWithNoClickthroughColumns.NO_CLICK_RATE]: item.no_click_rate,
    });

    await this.compareUIDataWithDBRecords(
      snowflakeDataArray,
      dataMapper,
      TopSearchQueriesWithNoClickthroughColumns.SEARCH_QUERY
    );
  }
}
