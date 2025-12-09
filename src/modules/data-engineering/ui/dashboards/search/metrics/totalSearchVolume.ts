import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { HeroMetricsComponent } from '../../../../ui/components/heroMetricsComponent';

export class TotalSearchVolume extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SEARCH_METRICS.TOTAL_SEARCH_VOLUME.title);
  }

  /**
   * Verifies all UI data points for the Total Search Volume metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(SEARCH_METRICS.TOTAL_SEARCH_VOLUME.subtitle);
  }

  /**
   * Verifies the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValue(expectedValue: number): Promise<void> {
    await this.verifyMetricValueIsLoadedForHeroMetric(expectedValue);
  }
}
