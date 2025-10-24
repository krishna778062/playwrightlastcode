import { FrameLocator, Page } from '@playwright/test';

import { SOCIAL_INTERACTION_METRICS } from '@/src/modules/data-engineering/constants/socialInteractionMetrics';
import { HeroMetricsComponent } from '@/src/modules/data-engineering/ui/components/heroMetricsComponent';

export class Replies extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SOCIAL_INTERACTION_METRICS.REPLIES.title);
  }

  /**
   * Verifies the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValue(expectedValue: number): Promise<void> {
    await this.verifyMetricValueIsLoadedForHeroMetric(expectedValue);
  }
}
