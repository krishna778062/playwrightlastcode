import { FrameLocator, Page } from '@playwright/test';

import { BaseOnSiteTabularMetricsComponent } from './baseOnSiteTabularMetricsComponent';

import { ON_SITE_METRICS } from '@/src/modules/data-engineering/constants/onSiteMetrics';

export enum MostViewedContentColumns {
  CONTENT = 'Content',
  VIEWS = 'Views',
}

export class MostViewedContent extends BaseOnSiteTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, ON_SITE_METRICS.MOST_VIEWED_CONTENT.title, ON_SITE_METRICS.MOST_VIEWED_CONTENT.subtitle);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Content: string;
      Views: number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [MostViewedContentColumns.CONTENT]: item['Content'],
      [MostViewedContentColumns.VIEWS]: item['Views'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, MostViewedContentColumns.CONTENT);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
