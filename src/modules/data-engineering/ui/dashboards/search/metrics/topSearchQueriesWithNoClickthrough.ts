import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { TopSearchQueriesWithNoClickthroughData } from '../../../../helpers/searchDashboardQueryHelper';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';
import { CSVValidationUtil } from '../../../../utils/csvValidationUtil';

import { CSVUtils } from '@/src/core/utils/csvUtils';
import { FileUtil } from '@/src/core/utils/fileUtil';

export enum TopSearchQueriesWithNoClickthroughColumns {
  SEARCH_QUERY = 'Search query',
  TOTAL_SEARCH_QUERY_VOLUME = 'Total search query volume',
  NO_CLICK_COUNT = 'No click count',
  NO_CLICK_RATE = 'No click rate',
}

// Re-export the type for convenience
export type { TopSearchQueriesWithNoClickthroughData };

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
      [TopSearchQueriesWithNoClickthroughColumns.NO_CLICK_RATE]: String(item.no_click_rate),
    });

    await this.compareUIDataWithDBRecords(
      snowflakeDataArray,
      dataMapper,
      TopSearchQueriesWithNoClickthroughColumns.SEARCH_QUERY
    );
  }

  /**
   * Verifies CSV data matches with Snowflake data
   * Handles all CSV validation logic internally including data transformation
   * @param snowflakeDataArray - Raw database data from Snowflake (query helper handles transformation with forCSVValidation=true)
   * @param selectedPeriod - Selected period filter for validation
   */
  async verifyCSVDataMatchesWithSnowflakeData(
    snowflakeDataArray: TopSearchQueriesWithNoClickthroughData[],
    selectedPeriod: string
  ): Promise<void> {
    await this.verifyDataIsLoaded();
    const { filePath } = await this.downloadDataAsCSV();
    console.log(`Downloaded data from UI should be saved at: ${filePath}`);

    try {
      // CSV download only includes records visible in UI (5 records), not all DB records (10)
      // Parse CSV first to get which search queries are actually in the CSV
      const csvData = await CSVUtils.parseReportCSV(filePath);
      const csvSearchQueries = csvData.data.map((row: any) => row['Search query']);

      // Filter DB data to only include records that are in the CSV
      const transformedDataForValidation = snowflakeDataArray.filter((item: any) =>
        csvSearchQueries.includes(item.search_query)
      );

      // Validate the data in the CSV matches with the data from snowflake
      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: transformedDataForValidation as any,
        metricName: 'Top search queries with no clickthrough',
        selectedPeriod: selectedPeriod,
        expectedHeaders: ['Search query', 'No click count', 'Total search query volume', 'No of click rate'],
        transformations: {
          headerMapping: {
            'Search query': 'search_query',
            'No click count': 'no_click_count',
            'Total search query volume': 'total_search',
            'No of click rate': 'no_click_rate',
          },
          // Note: CSV has decimal format (0.5) not percentage format (50%)
          // Query helper already converted DB percentage to decimal format (see forCSVValidation flag)
          // Use percentageField with normalizeToPercentage false to apply tolerance for decimal comparison
          percentageField: {
            fieldName: 'no_click_rate',
            normalizeToPercentage: false, // Don't normalize since both are already in decimal format
          },
          tolerance: {
            percentage: 0.01, // Allow 1 percentage point difference (0.01 in decimal format)
          },
        },
      });
    } finally {
      // Clean up CSV file
      FileUtil.deleteTemporaryFile(filePath);
    }
  }
}
