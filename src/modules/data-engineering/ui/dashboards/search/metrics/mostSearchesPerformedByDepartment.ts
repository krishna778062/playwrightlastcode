import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';

export enum MostSearchesPerformedByDepartmentColumns {
  DEPARTMENT = 'Department',
  TOTAL_SEARCH_QUERY_VOLUME = 'Total search query volume',
  UNIQUE_USER_SEARCHING = 'Unique user searching',
  AVERAGE_SEARCHES_PER_USER = 'Average searches per user',
}

export interface MostSearchesPerformedByDepartmentData {
  department: string;
  total_searches: number;
  distinct_users: number;
  avg_searches_per_user: number;
}

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
}
