import { FrameLocator, Page } from '@playwright/test';

import { BaseOnSiteTabularMetricsComponent } from './baseOnSiteTabularMetricsComponent';

import { ON_SITE_METRICS } from '@/src/modules/data-engineering/constants/onSiteMetrics';

export enum MostPopularColumns {
  CONTENT = 'Content',
  POPULARITY_SCORE = 'Popularity score',
}

export class MostPopular extends BaseOnSiteTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, ON_SITE_METRICS.MOST_POPULAR.title, ON_SITE_METRICS.MOST_POPULAR.subtitle);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Title: string;
      'Popularity score': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [MostPopularColumns.CONTENT]: item['Title'],
      [MostPopularColumns.POPULARITY_SCORE]: item['Popularity score'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, MostPopularColumns.CONTENT);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
