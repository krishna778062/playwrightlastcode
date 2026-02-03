import { FrameLocator, Page } from '@playwright/test';

import { BaseOnSiteTabularMetricsComponent } from './baseOnSiteTabularMetricsComponent';

import { ON_SITE_METRICS } from '@/src/modules/data-engineering/constants/onSiteMetrics';

export enum MostContentPublishedColumns {
  NAME = 'Name',
  CONTENT_COUNT = 'Count',
}

export class MostContentPublished extends BaseOnSiteTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, ON_SITE_METRICS.MOST_CONTENT_PUBLISHED.title, ON_SITE_METRICS.MOST_CONTENT_PUBLISHED.subtitle);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Content count': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [MostContentPublishedColumns.NAME]: item['Name'],
      [MostContentPublishedColumns.CONTENT_COUNT]: item['Content count'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, MostContentPublishedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
