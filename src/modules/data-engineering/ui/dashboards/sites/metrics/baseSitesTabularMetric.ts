import { FrameLocator, Page } from '@playwright/test';

import { MostPopularSitesData } from '../../../../helpers/sitesDashboardQueryHelper';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';

/**
 * Base class for sites tabular metrics that have Popularity Score column
 * Provides common functionality for handling Popularity Score comparison
 * Used by Most Popular and Least Popular sites metrics
 */
export abstract class BaseSitesTabularMetric extends TabluarMetricsComponent {
  protected readonly POPULARITY_SCORE_COLUMN = 'Popularity Score';

  constructor(page: Page, thoughtSpotIframe: FrameLocator, metricTitle: string) {
    super(page, thoughtSpotIframe, metricTitle);
  }

  /**
   * Maps site type code to display name
   */
  protected mapSiteTypeCodeToDisplayName(siteTypeCode: string): string {
    const siteTypeMap: Record<string, string> = {
      STT001: 'Public',
      STT002: 'Private',
      STT003: 'Unlisted',
    };
    return siteTypeMap[siteTypeCode] || siteTypeCode;
  }

  /**
   * Verifies that the popular sites data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Helper method to verify UI data matches DB data
   * @param snowflakeDataArray - Array of popular sites data from Snowflake
   * @param dataMapper - Function to map DB data to UI format
   * @param keyColumn - The column name to use for matching records
   */
  protected async compareUIDataWithDBRecordsHelper(
    snowflakeDataArray: MostPopularSitesData[],
    dataMapper: (item: MostPopularSitesData) => Record<string, string>,
    keyColumn: string
  ): Promise<void> {
    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, keyColumn);
  }
}
