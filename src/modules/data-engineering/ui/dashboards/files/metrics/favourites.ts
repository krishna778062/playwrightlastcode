import { FrameLocator, Page } from '@playwright/test';

import { FILES_METRICS } from '../../../../constants/filesMetrics';
import { HeroMetricsComponent } from '../../../../ui/components/heroMetricsComponent';

export class Favourites extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, FILES_METRICS.FAVOURITES.title);
  }

  /**
   * Verifies all UI data points for the Favourites metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(FILES_METRICS.FAVOURITES.subtitle);
  }

  /**
   * Verifies the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValue(expectedValue: number): Promise<void> {
    await this.verifyMetricValueIsLoadedForHeroMetric(expectedValue);
  }
}
