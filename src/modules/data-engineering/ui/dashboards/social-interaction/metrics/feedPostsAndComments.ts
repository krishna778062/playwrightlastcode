import { FrameLocator, Page } from '@playwright/test';

import { HeroMetricsComponent } from '@/src/modules/data-engineering/ui/components/heroMetricsComponent';

export class FeedPostsAndComments extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe);
  }

  /**
   * Gets the feed posts and comments metric value
   * @returns The metric value as string
   */
  async getFeedPostsAndCommentsValue(): Promise<string> {
    return await this.getMetricValue('Feed posts and comments');
  }

  /**
   * Verifies that the feed posts and comments metric has a valid numeric value
   */
  async verifyFeedPostsAndCommentsHasValidValue(): Promise<void> {
    await this.verifyMetricHasValidValue('Feed posts and comments');
  }
}
