import { FrameLocator, Page } from '@playwright/test';

import { BaseOnSiteTabularMetricsComponent } from './baseOnSiteTabularMetricsComponent';

import { ON_SITE_METRICS } from '@/src/modules/data-engineering/constants/onSiteMetrics';

export enum FeedPostsAndContentCommentsColumns {
  NAME = 'Name',
  INTERACTIONS_COUNT = 'Interactions Count',
}

export class FeedPostsAndContentComments extends BaseOnSiteTabularMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(
      page,
      iframe,
      ON_SITE_METRICS.FEED_POSTS_AND_CONTENT_COMMENTS.title,
      ON_SITE_METRICS.FEED_POSTS_AND_CONTENT_COMMENTS.subtitle
    );

    // Override container selection to use 2nd visible locator instead of first
    const exactMatchContainer = iframe
      .locator('[class*="answer-content-module__answerVizContainer"]')
      .filter({
        has: iframe.getByRole('heading', { name: ON_SITE_METRICS.FEED_POSTS_AND_CONTENT_COMMENTS.title, exact: true }),
      })
      .nth(1); // Use nth(1) to get the 2nd visible locator (0-indexed)

    // Replace rootLocator with the 2nd container
    (this as any).rootLocator = exactMatchContainer;

    // Re-initialize properties that depend on rootLocator
    (this as any).headerRow = exactMatchContainer
      .getByRole('row')
      .filter({ has: exactMatchContainer.locator('[class*="ag-header-row"]') });

    (this as any).dataRow = exactMatchContainer
      .getByRole('row')
      .filter({ hasNot: exactMatchContainer.locator('[class*="ag-header-row"]') });

    (this as any).downloadCSVButton = exactMatchContainer.getByRole('button', { name: 'Download CSV' });
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      'Full name': string;
      'Interaction count': number;
    }>
  ): Promise<void> {
    const dataMapper = (item: any) => ({
      [FeedPostsAndContentCommentsColumns.NAME]: item['Full name'],
      [FeedPostsAndContentCommentsColumns.INTERACTIONS_COUNT]: item['Interaction count'].toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, FeedPostsAndContentCommentsColumns.NAME);
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }
}
