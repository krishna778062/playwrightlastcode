import { FrameLocator, Page } from '@playwright/test';

import { BaseOnSiteTabularMetricsComponent } from './baseOnSiteTabularMetricsComponent';

import { ON_SITE_METRICS } from '@/src/modules/data-engineering/constants/onSiteMetrics';

export enum ContentReferralsColumns {
  UTM_SOURCE_NAME = 'UTM source name',
  CONTENT_ITEMS = 'Content items',
  REFERRALS = 'Referrals',
  REFERRALS_CONTRIBUTION = 'Referrals contribution',
  AVG_REFERRALS_PER_ITEM = 'Avg referrals per item',
}

export class ContentReferrals extends BaseOnSiteTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, ON_SITE_METRICS.CONTENT_REFERRALS.title, ON_SITE_METRICS.CONTENT_REFERRALS.subtitle);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'UTM source name': string;
      'Content items': number;
      Referrals: number;
      'Referrals contribution': number;
      'Avg referrals per item': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ContentReferralsColumns.UTM_SOURCE_NAME]: item['UTM source name'],
      [ContentReferralsColumns.CONTENT_ITEMS]: item['Content items'].toString(),
      [ContentReferralsColumns.REFERRALS]: item['Referrals'].toString(),
      [ContentReferralsColumns.REFERRALS_CONTRIBUTION]: item['Referrals contribution'].toString(),
      [ContentReferralsColumns.AVG_REFERRALS_PER_ITEM]: item['Avg referrals per item'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ContentReferralsColumns.UTM_SOURCE_NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
