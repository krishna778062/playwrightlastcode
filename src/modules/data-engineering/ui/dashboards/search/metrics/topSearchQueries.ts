import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';
import { CSVValidationUtil } from '../../../../utils/csvValidationUtil';
import { convertPercentageToDecimal } from '../../../../utils/percentageUtils';

import { FileUtil } from '@/src/core/utils/fileUtil';

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

  /**
   * Verifies CSV data matches with Snowflake data
   * Handles all CSV validation logic internally including data transformation
   * @param snowflakeDataArray - Raw database data from Snowflake (query helper handles transformation)
   * @param selectedPeriod - Selected period filter for validation
   */
  async verifyCSVDataMatchesWithSnowflakeData(
    snowflakeDataArray: TopSearchQueriesData[],
    selectedPeriod: string
  ): Promise<void> {
    await this.verifyDataIsLoaded();
    const { filePath } = await this.downloadDataAsCSV();
    console.log(`Downloaded data from UI should be saved at: ${filePath}`);

    try {
      // Transform for CSV: convert success_rate from percentage string to decimal number
      const transformedDataForValidation = snowflakeDataArray.map(item => ({
        ...item,
        success_rate: convertPercentageToDecimal(item.success_rate),
      }));

      // Validate the data in the CSV matches with the data from snowflake
      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: transformedDataForValidation as any,
        metricName: 'Top search queries',
        selectedPeriod: selectedPeriod,
        expectedHeaders: [
          'Search query',
          'Total search query volume',
          'Number of click-through count',
          'Click-through rate',
        ],
        transformations: {
          headerMapping: {
            'Search query': 'search_query',
            'Total search query volume': 'total_search',
            'Number of click-through count': 'clickthrough',
            'Click-through rate': 'success_rate',
          },
          // Note: CSV has decimal format (0.5) not percentage format (50%)
          // DB data has been converted to decimal format in transformedData
          // Use percentageField with normalizeToPercentage false to apply tolerance for decimal comparison
          percentageField: {
            fieldName: 'success_rate',
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
