import { FrameLocator, Page } from '@playwright/test';

import { BaseOnSiteTabularMetricsComponent } from './baseOnSiteTabularMetricsComponent';

import { ON_SITE_METRICS } from '@/src/modules/data-engineering/constants/onSiteMetrics';

export enum RepliesFromOtherUsersColumns {
  NAME = 'Name',
  INTERACTIONS_COUNT = 'Interactions Count',
}

export class RepliesFromOtherUsers extends BaseOnSiteTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(
      page,
      iframe,
      ON_SITE_METRICS.REPLIES_FROM_OTHER_USERS.title,
      ON_SITE_METRICS.REPLIES_FROM_OTHER_USERS.subtitle
    );
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'Full name': string;
      'Interaction count': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [RepliesFromOtherUsersColumns.NAME]: item['Full name'],
      [RepliesFromOtherUsersColumns.INTERACTIONS_COUNT]: item['Interaction count'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, RepliesFromOtherUsersColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
