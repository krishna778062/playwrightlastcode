import { SITES_DASHBOARD_METRICS } from '@data-engineering/constants/sitesDashboardMetrics';
import { FrameLocator, Page } from '@playwright/test';

import { LowActivitySitesData } from '../../../../helpers/sitesDashboardQueryHelper';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';

export enum LowActivitySitesColumns {
  SITE_NAME = 'Site Name',
  SITE_TYPE = 'Site Type',
  VIEWS = 'Views',
}

// Re-export the type for convenience
export type { LowActivitySitesData };

export class LowActivitySitesMetrics extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SITES_DASHBOARD_METRICS.LOW_ACTIVITY_SITES.title);
  }

  /**
   * Verifies that the low activity sites data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of low activity sites data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(snowflakeDataArray: LowActivitySitesData[]): Promise<void> {
    const dataMapper = (item: LowActivitySitesData) => ({
      [LowActivitySitesColumns.SITE_NAME]: item.site_name.trim(),
      [LowActivitySitesColumns.SITE_TYPE]: item.description.trim(),
      [LowActivitySitesColumns.VIEWS]: item.total_views.toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, LowActivitySitesColumns.SITE_NAME);
  }
}
