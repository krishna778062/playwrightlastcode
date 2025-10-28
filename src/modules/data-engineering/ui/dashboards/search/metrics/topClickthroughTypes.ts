import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { TabluarMetricsComponent } from '../../../../ui/components/tabluarMetricsComponent';

export enum TopClickthroughTypesColumns {
  TYPE = 'Type',
  TOTAL_CLICK_THROUGH = 'Total click-through',
  PERCENTAGE_OF_CLICK_THROUGH_TYPES = 'Percentage of click-through types',
}

export interface TopClickthroughTypesData {
  item_type: string;
  click_count: number;
  total_clickthrough: number;
  percentage: string;
}

export class TopClickthroughTypes extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SEARCH_METRICS.TOP_CLICKTHROUGH_TYPES.title);
  }

  /**
   * Verifies that the top clickthrough types data is loaded
   */
  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Verifies that the UI data matches the database data
   * @param snowflakeDataArray - Array of top clickthrough types data from Snowflake
   */
  async verifyUIDataMatchesWithSnowflakeData(snowflakeDataArray: TopClickthroughTypesData[]): Promise<void> {
    const dataMapper = (item: TopClickthroughTypesData) => ({
      [TopClickthroughTypesColumns.TYPE]: item.item_type,
      [TopClickthroughTypesColumns.TOTAL_CLICK_THROUGH]: item.click_count.toString(),
      [TopClickthroughTypesColumns.PERCENTAGE_OF_CLICK_THROUGH_TYPES]: item.percentage,
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, TopClickthroughTypesColumns.TYPE);
  }
}
