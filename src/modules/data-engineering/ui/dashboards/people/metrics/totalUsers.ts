import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { HeroMetricsComponent } from '@/src/modules/data-engineering/ui/components/heroMetricsComponent';

export class TotalUsers extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.TOTAL_USERS.title);
  }

  /**
   * Verifies all UI data points for the Total Users metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(PEOPLE_METRICS.TOTAL_USERS.subtitle);
  }

  /**
   * Verifies the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValue(expectedValue: number): Promise<void> {
    await this.verifyMetricValueIsLoadedForHeroMetric(expectedValue);
  }
}
