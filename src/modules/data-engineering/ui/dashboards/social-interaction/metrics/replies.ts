import { FrameLocator, Page } from '@playwright/test';

import { HeroMetricsComponent } from '@/src/modules/data-engineering/ui/components/heroMetricsComponent';

export class Replies extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe);
  }

  /**
   * Gets the replies metric value
   * @returns The metric value as string
   */
  async getRepliesValue(): Promise<string> {
    return await this.getMetricValue('Replies');
  }

  /**
   * Verifies that the replies metric has a valid numeric value
   */
  async verifyRepliesHasValidValue(): Promise<void> {
    await this.verifyMetricHasValidValue('Replies');
  }
}
