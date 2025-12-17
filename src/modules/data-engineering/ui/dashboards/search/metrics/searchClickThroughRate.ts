import { FrameLocator, Page } from '@playwright/test';

import { SEARCH_METRICS } from '../../../../constants/searchMetrics';
import { HeroMetricsComponent } from '../../../../ui/components/heroMetricsComponent';

export class SearchClickThroughRate extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SEARCH_METRICS.SEARCH_CLICK_THROUGH_RATE.title);
  }

  /**
   * Verifies all UI data points for the Search Click Through Rate metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(SEARCH_METRICS.SEARCH_CLICK_THROUGH_RATE.subtitle);
  }

  /**
   * Verifies the metric value matches the expected value
   * @param expectedValue - The expected metric value (formatted string)
   */
  async verifyMetricValue(expectedValue: string): Promise<void> {
    await this.verifyMetricValueIsLoadedForHeroMetricWithNormalFormat(
      parseInt(
        expectedValue
          .split(/[\(\[]/)[0]
          .trim()
          .replace(/,/g, ''),
        10
      )
    );
  }
}
