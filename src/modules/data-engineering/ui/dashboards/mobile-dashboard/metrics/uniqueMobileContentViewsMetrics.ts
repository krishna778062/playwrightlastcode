import { MOBILE_DASHBOARD_METRICS } from '@data-engineering/constants/mobileDashboardMetrics';
import { FrameLocator, Page } from '@playwright/test';

import { HeroMetricsComponent } from '../../../components/heroMetricsComponent';

export class UniqueMobileContentViewsMetrics extends HeroMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, MOBILE_DASHBOARD_METRICS.UNIQUE_MOBILE_CONTENT_VIEWS.title);
  }

  /**
   * Verifies all UI data points for the Unique mobile content views metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(MOBILE_DASHBOARD_METRICS.UNIQUE_MOBILE_CONTENT_VIEWS.subtitle);
  }
}
