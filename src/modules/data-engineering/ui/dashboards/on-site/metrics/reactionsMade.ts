import { FrameLocator, Page } from '@playwright/test';

import { BaseOnSiteTabularMetricsComponent } from './baseOnSiteTabularMetricsComponent';

import { ON_SITE_METRICS } from '@/src/modules/data-engineering/constants/onSiteMetrics';

export enum ReactionsMadeColumns {
  NAME = 'Name',
  INTERACTIONS_COUNT = 'Interactions Count',
}

export class ReactionsMade extends BaseOnSiteTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, ON_SITE_METRICS.REACTIONS_MADE.title, ON_SITE_METRICS.REACTIONS_MADE.subtitle);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'Full name': string;
      'Interaction count': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ReactionsMadeColumns.NAME]: item['Full name'],
      [ReactionsMadeColumns.INTERACTIONS_COUNT]: item['Interaction count'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ReactionsMadeColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
