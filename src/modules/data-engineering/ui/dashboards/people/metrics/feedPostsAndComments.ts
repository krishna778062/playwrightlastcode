import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

export enum FeedPostsAndCommentsColumns {
  NAME = 'Name',
  POSTS_AND_COMMENTS = 'Post and comment',
}

export class FeedPostsAndComments extends TabluarMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.FEED_POSTS_AND_COMMENTS.title);
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      'Post and comment': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [FeedPostsAndCommentsColumns.NAME]: item['Name'],
      [FeedPostsAndCommentsColumns.POSTS_AND_COMMENTS]: item['Post and comment'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, FeedPostsAndCommentsColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
