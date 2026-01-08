import { FrameLocator, Page } from '@playwright/test';

import { FILES_METRICS } from '../../../../constants/filesMetrics';
import { DistributionOfDownloadsByFileCategoryData } from '../../../../helpers/filesDashboardQueryHelper';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';

export enum DistributionOfDownloadsByFileCategoryColumns {
  FILE_CATEGORY = 'File category',
  TOTAL_DOWNLOADS = 'Total downloads',
  TOTAL_DOWNLOAD_PERCENTAGE = 'Total download percentage',
  AVERAGE_FILE_DOWNLOADS = 'Average file downloads',
}

// Re-export the type for convenience
export type { DistributionOfDownloadsByFileCategoryData };

export class DistributionOfDownloadsByFileCategory extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, FILES_METRICS.DISTRIBUTION_OF_DOWNLOADS_BY_FILE_CATEGORY.title);
  }

  /**
   * Verifies that the distribution of downloads by file category data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of distribution of downloads by file category data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: DistributionOfDownloadsByFileCategoryData[]
  ): Promise<void> {
    const dataMapper = (item: DistributionOfDownloadsByFileCategoryData) => ({
      [DistributionOfDownloadsByFileCategoryColumns.FILE_CATEGORY]: item.File_category || '',
      [DistributionOfDownloadsByFileCategoryColumns.TOTAL_DOWNLOADS]: item.Total_downloads.toString(),
      [DistributionOfDownloadsByFileCategoryColumns.TOTAL_DOWNLOAD_PERCENTAGE]: item.Download_contribution,
      [DistributionOfDownloadsByFileCategoryColumns.AVERAGE_FILE_DOWNLOADS]: item.Average_file_downloads,
    });

    await this.compareUIDataWithDBRecords(
      snowflakeDataArray,
      dataMapper,
      DistributionOfDownloadsByFileCategoryColumns.FILE_CATEGORY
    );
  }
}
