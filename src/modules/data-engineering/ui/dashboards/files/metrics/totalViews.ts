import { FrameLocator, Page } from '@playwright/test';

import { FILES_METRICS } from '../../../../constants/filesMetrics';
import { HeroMetricsComponent } from '../../../../ui/components/heroMetricsComponent';

export class TotalViews extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, FILES_METRICS.TOTAL_VIEWS.title);
  }

  /**
   * Verifies all UI data points for the Total Views metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(FILES_METRICS.TOTAL_VIEWS.subtitle);
  }

  /**
   * Verifies the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValue(expectedValue: number): Promise<void> {
    await this.verifyMetricValueIsLoadedForHeroMetric(expectedValue);
  }
}
