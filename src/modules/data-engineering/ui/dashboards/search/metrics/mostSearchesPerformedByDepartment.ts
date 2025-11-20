import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { MostSearchesPerformedByDepartmentData } from '../../../../helpers/searchDashboardQueryHelper';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';
import { CSVValidationUtil } from '../../../../utils/csvValidationUtil';

import { FileUtil } from '@/src/core/utils/fileUtil';

export enum MostSearchesPerformedByDepartmentColumns {
  DEPARTMENT = 'Department',
  TOTAL_SEARCH_QUERY_VOLUME = 'Total search query volume',
  UNIQUE_USER_SEARCHING = 'Unique user searching',
  AVERAGE_SEARCHES_PER_USER = 'Average searches per user',
}

// Re-export the type for convenience
export type { MostSearchesPerformedByDepartmentData };

export class MostSearchesPerformedByDepartment extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SEARCH_METRICS.MOST_SEARCHES_PERFORMED_BY_DEPARTMENT.title);
  }

  /**
   * Verifies that the most searches performed by department data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of most searches performed by department data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: MostSearchesPerformedByDepartmentData[]
  ): Promise<void> {
    const dataMapper = (item: MostSearchesPerformedByDepartmentData) => ({
      [MostSearchesPerformedByDepartmentColumns.DEPARTMENT]: item.department,
      [MostSearchesPerformedByDepartmentColumns.TOTAL_SEARCH_QUERY_VOLUME]: item.total_searches.toString(),
      [MostSearchesPerformedByDepartmentColumns.UNIQUE_USER_SEARCHING]: item.distinct_users.toString(),
      [MostSearchesPerformedByDepartmentColumns.AVERAGE_SEARCHES_PER_USER]: item.avg_searches_per_user.toString(),
    });

    await this.compareUIDataWithDBRecords(
      snowflakeDataArray,
      dataMapper,
      MostSearchesPerformedByDepartmentColumns.DEPARTMENT
    );
  }

  /**
   * Verifies CSV data matches with Snowflake data
   * Handles all CSV validation logic internally including data transformation
   * @param snowflakeDataArray - Raw database data from Snowflake (query helper handles transformation)
   * @param selectedPeriod - Selected period filter for validation
   */
  async verifyCSVDataMatchesWithSnowflakeData(
    snowflakeDataArray: MostSearchesPerformedByDepartmentData[],
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
        metricName: 'Most searches performed by Department',
        selectedPeriod: selectedPeriod,
        expectedHeaders: [
          'Department',
          'Total search query volume',
          'Unique user searching',
          'Average searches per user',
        ],
        transformations: {
          headerMapping: {
            Department: 'department',
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
