import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';
import { CSVValidationUtil } from '../../../../utils/csvValidationUtil';

import { FileUtil } from '@/src/core/utils/fileUtil';

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

  /**
   * Verifies CSV data matches with Snowflake data
   * Handles all CSV validation logic internally including data transformation
   * @param snowflakeDataArray - Raw database data from Snowflake (query helper handles transformation with forCSVValidation=true)
   * @param selectedPeriod - Selected period filter for validation
   */
  async verifyCSVDataMatchesWithSnowflakeData(
    snowflakeDataArray: NoResultSearchQueriesData[],
    selectedPeriod: string
  ): Promise<void> {
    await this.verifyDataIsLoaded();
    const { filePath } = await this.downloadDataAsCSV();
    console.log(`Downloaded data from UI should be saved at: ${filePath}`);

    try {
      // Validate the data in the CSV matches with the data from snowflake
      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: snowflakeDataArray as any,
        metricName: 'No result search queries',
        selectedPeriod: selectedPeriod,
        expectedHeaders: ['Search query', 'No result count', 'Total search volume', 'Percentage of total searches'],
        transformations: {
          headerMapping: {
            'Search query': 'search_term',
            'No result count': 'failed_search_count',
            'Total search volume': 'total_search_count',
            'Percentage of total searches': 'failure_percentage',
          },
          // Note: CSV has decimal format (0.153846) not percentage format (15.4%)
          // DB data has been converted to decimal format in transformedData
          // Use percentageField with normalizeToPercentage false to apply tolerance for decimal comparison
          percentageField: {
            fieldName: 'failure_percentage',
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
