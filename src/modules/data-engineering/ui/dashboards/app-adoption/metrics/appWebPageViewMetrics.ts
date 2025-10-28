import { FrameLocator, Page } from '@playwright/test';

import { TabluarMetricsComponent } from '../../../components/tabluarMetricsComponent';

import { AppWebPageViewsData } from '@/src/modules/data-engineering/helpers/appAdaptionQueryHelper';

export enum AppWebPageViewsDataColumns {
  WEB_PAGE_GROUP = 'Web page group',
  TOTAL_PEOPLE = 'Total people',
  PAGE_VIEW_COUNT = 'Page view count',
  PERCENTAGE_CONTRIBUTION_TO_TOTAL_PAGE_VIEWS = 'Percentage contribution to total page views',
}

export class AppWebPageViewMetrics extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'App web page views');
  }

  async verifyUIDataMatchesWithSnowflakeData(snowflakeDataArray: AppWebPageViewsData[]): Promise<void> {
    const dataMapper = (item: AppWebPageViewsData) => ({
      [AppWebPageViewsDataColumns.WEB_PAGE_GROUP]: item.webPageGroup,
      [AppWebPageViewsDataColumns.TOTAL_PEOPLE]: item.totalPeople.toString(),
      [AppWebPageViewsDataColumns.PAGE_VIEW_COUNT]: item.pageViewCount.toString(),
      [AppWebPageViewsDataColumns.PERCENTAGE_CONTRIBUTION_TO_TOTAL_PAGE_VIEWS]:
        item.percentageContributionToTotalPageViews.toString(),
    });
    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, AppWebPageViewsDataColumns.WEB_PAGE_GROUP);
  }
}
