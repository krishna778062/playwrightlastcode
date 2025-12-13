import { SITES_DASHBOARD_METRICS } from '@data-engineering/constants/sitesDashboardMetrics';
import { FrameLocator, Page } from '@playwright/test';

import { MostPublishedContentData } from '../../../../helpers/sitesDashboardQueryHelper';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';
import { CSVValidationUtil } from '../../../../utils/csvValidationUtil';

import { FileUtil } from '@/src/core/utils/fileUtil';

export enum MostPublishedContentColumns {
  SITE_NAME = 'Site name',
  PAGE = 'Page',
  EVENT = 'Event',
  ALBUM = 'Album',
  CONTENT_PUBLISHED = 'Content published',
}

// Re-export the type for convenience
export type { MostPublishedContentData };

export class MostPublishedContentMetrics extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SITES_DASHBOARD_METRICS.MOST_PUBLISHED_CONTENT.title);
  }

  /**
   * Verifies that the most published content data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of most published content data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(snowflakeDataArray: MostPublishedContentData[]): Promise<void> {
    const dataMapper = (item: MostPublishedContentData) => ({
      [MostPublishedContentColumns.SITE_NAME]: item.site_name.trim(),
      [MostPublishedContentColumns.PAGE]: item.pages_count.toString(),
      [MostPublishedContentColumns.EVENT]: item.events_count.toString(),
      [MostPublishedContentColumns.ALBUM]: item.albums_count.toString(),
      [MostPublishedContentColumns.CONTENT_PUBLISHED]: item.total_content.toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, MostPublishedContentColumns.SITE_NAME);
  }

  /**
   * Verifies CSV data matches with Snowflake data
   * Handles all CSV validation logic internally including data transformation
   * @param snowflakeDataArray - Raw database data from Snowflake
   * @param selectedPeriod - Selected period filter for validation
   */
  async verifyCSVDataMatchesWithSnowflakeData(
    snowflakeDataArray: MostPublishedContentData[],
    selectedPeriod: string
  ): Promise<void> {
    await this.verifyDataIsLoaded();
    const { filePath } = await this.downloadDataAsCSV();
    console.log(`Downloaded data from UI should be saved at: ${filePath}`);

    try {
      // Transform DB data for CSV validation
      const transformedDataForValidation = snowflakeDataArray.map(item => ({
        site_name: item.site_name.trim(),
        page: item.pages_count,
        event: item.events_count,
        album: item.albums_count,
        content_published: item.total_content,
      }));

      // Validate the data in the CSV matches with the data from snowflake
      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: transformedDataForValidation as any,
        metricName: 'Most published content',
        selectedPeriod: selectedPeriod,
        expectedHeaders: ['Site name', 'Page', 'Event', 'Album', 'Content published'],
        transformations: {
          headerMapping: {
            'Site name': 'site_name',
            Page: 'page',
            Event: 'event',
            Album: 'album',
            'Content published': 'content_published',
          },
        },
      });
    } finally {
      // Clean up CSV file
      FileUtil.deleteTemporaryFile(filePath);
    }
  }
}
