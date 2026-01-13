import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { MostSearchesPerformedByLocationData } from '../../../../helpers/searchDashboardQueryHelper';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';
import { CSVValidationUtil } from '../../../../utils/csvValidationUtil';

import { FileUtil } from '@/src/core/utils/fileUtil';

export enum MostSearchesPerformedByLocationColumns {
  LOCATION = 'Location',
  TOTAL_SEARCH_QUERY_VOLUME = 'Total search query volume',
  UNIQUE_USER_SEARCHING = 'Unique user searching',
  AVERAGE_SEARCHES_PER_USER = 'Average searches per user',
}

// Re-export the type for convenience
export type { MostSearchesPerformedByLocationData };

export class MostSearchesPerformedByLocation extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SEARCH_METRICS.MOST_SEARCHES_PERFORMED_BY_LOCATION.title);
  }

  /**
   * Verifies that the most searches performed by location data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of most searches performed by location data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(snowflakeDataArray: MostSearchesPerformedByLocationData[]): Promise<void> {
    const dataMapper = (item: MostSearchesPerformedByLocationData) => ({
      [MostSearchesPerformedByLocationColumns.LOCATION]: item.location,
      [MostSearchesPerformedByLocationColumns.TOTAL_SEARCH_QUERY_VOLUME]: item.total_searches.toString(),
      [MostSearchesPerformedByLocationColumns.UNIQUE_USER_SEARCHING]: item.distinct_users.toString(),
      [MostSearchesPerformedByLocationColumns.AVERAGE_SEARCHES_PER_USER]: item.avg_searches_per_user.toString(),
    });

    await this.compareUIDataWithDBRecords(
      snowflakeDataArray,
      dataMapper,
      MostSearchesPerformedByLocationColumns.LOCATION
    );
  }

  /**
   * Verifies CSV data matches with Snowflake data
   * Handles all CSV validation logic internally including data transformation
   * @param snowflakeDataArray - Raw database data from Snowflake (query helper handles transformation)
   * @param selectedPeriod - Selected period filter for validation
   * @param customStartDate - Optional custom start date (required for CUSTOM period)
   * @param customEndDate - Optional custom end date (required for CUSTOM period)
   */
  async verifyCSVDataMatchesWithSnowflakeData(
    snowflakeDataArray: MostSearchesPerformedByLocationData[],
    selectedPeriod: string,
    customStartDate?: string,
    customEndDate?: string
  ): Promise<void> {
    await this.verifyDataIsLoaded();
    const { filePath } = await this.downloadDataAsCSV();
    console.log(`Downloaded data from UI should be saved at: ${filePath}`);

    try {
      // Validate the data in the CSV matches with the data from snowflake
      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: snowflakeDataArray as any,
        metricName: 'Most searches performed by Location',
        selectedPeriod: selectedPeriod,
        customStartDate: customStartDate,
        customEndDate: customEndDate,
        expectedHeaders: [
          'Location',
          'Total search query volume',
          'Unique user searching',
          'Average searches per user',
        ],
        transformations: {
          headerMapping: {
            Location: 'location',
            'Total search query volume': 'total_searches',
            'Unique user searching': 'distinct_users',
            'Average searches per user': 'avg_searches_per_user',
          },
        },
      });
    } finally {
      // Clean up CSV file
      FileUtil.deleteTemporaryFile(filePath);
    }
  }
}
