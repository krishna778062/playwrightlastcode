import { FrameLocator, Page } from '@playwright/test';

import { FILES_METRICS } from '../../../../constants/filesMetrics';
import { HeroMetricsComponent } from '../../../../ui/components/heroMetricsComponent';

export class Reactions extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, FILES_METRICS.REACTIONS.title);
  }

  /**
   * Verifies all UI data points for the Reactions metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(FILES_METRICS.REACTIONS.subtitle);
  }

  /**
   * Verifies the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValue(expectedValue: number): Promise<void> {
    await this.verifyMetricValueIsLoadedForHeroMetric(expectedValue);
  }
}
