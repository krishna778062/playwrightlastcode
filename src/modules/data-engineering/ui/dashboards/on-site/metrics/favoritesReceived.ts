import { FrameLocator, Page } from '@playwright/test';

import { BaseOnSiteTabularMetricsComponent } from './baseOnSiteTabularMetricsComponent';

import { ON_SITE_METRICS } from '@/src/modules/data-engineering/constants/onSiteMetrics';

export enum FavoritesReceivedColumns {
  NAME = 'Name',
  INTERACTIONS_COUNT = 'Interactions Count',
}

export class FavoritesReceived extends BaseOnSiteTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, ON_SITE_METRICS.FAVORITES_RECEIVED.title, ON_SITE_METRICS.FAVORITES_RECEIVED.subtitle);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'Full name': string;
      'Interaction count': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [FavoritesReceivedColumns.NAME]: item['Full name'],
      [FavoritesReceivedColumns.INTERACTIONS_COUNT]: item['Interaction count'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, FavoritesReceivedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
