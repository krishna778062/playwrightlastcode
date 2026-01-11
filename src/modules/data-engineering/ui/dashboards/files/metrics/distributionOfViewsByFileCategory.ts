import { FrameLocator, Page } from '@playwright/test';

import { FILES_METRICS } from '../../../../constants/filesMetrics';
import { DistributionOfViewsByFileCategoryData } from '../../../../helpers/filesDashboardQueryHelper';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';

export enum DistributionOfViewsByFileCategoryColumns {
  FILE_CATEGORY = 'File category',
  TOTAL_VIEWS = 'Total views',
  VIEW_CONTRIBUTION = 'View contribution',
  AVERAGE_FILE_VIEWS = 'Average file views',
}

// Re-export the type for convenience
export type { DistributionOfViewsByFileCategoryData };

export class DistributionOfViewsByFileCategory extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, FILES_METRICS.DISTRIBUTION_OF_VIEWS_BY_FILE_CATEGORY.title);
  }

  /**
   * Verifies that the distribution of views by file category data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of distribution of views by file category data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: DistributionOfViewsByFileCategoryData[]
  ): Promise<void> {
    const dataMapper = (item: DistributionOfViewsByFileCategoryData) => ({
      [DistributionOfViewsByFileCategoryColumns.FILE_CATEGORY]: item.File_category || '',
      [DistributionOfViewsByFileCategoryColumns.TOTAL_VIEWS]: item.Total_views.toString(),
      [DistributionOfViewsByFileCategoryColumns.VIEW_CONTRIBUTION]: item.View_contribution,
      [DistributionOfViewsByFileCategoryColumns.AVERAGE_FILE_VIEWS]: item.Average_file_views,
    });

    await this.compareUIDataWithDBRecords(
      snowflakeDataArray,
      dataMapper,
      DistributionOfViewsByFileCategoryColumns.FILE_CATEGORY
    );
  }
}
