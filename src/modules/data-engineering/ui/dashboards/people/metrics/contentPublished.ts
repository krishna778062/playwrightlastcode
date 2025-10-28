import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export enum ContentPublishedColumns {
  NAME = 'Name',
  PUBLISHED_CONTENT = 'Published content',
}

export class ContentPublished extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.CONTENT_PUBLISHED.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Published content': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [ContentPublishedColumns.NAME]: item['Name'],
      [ContentPublishedColumns.PUBLISHED_CONTENT]: item['Published content'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, ContentPublishedColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
