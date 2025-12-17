import { MOBILE_DASHBOARD_METRICS } from '@data-engineering/constants/mobileDashboardMetrics';
import { FrameLocator, Page } from '@playwright/test';

import { HeroMetricsComponent } from '../../../components/heroMetricsComponent';

export class TotalUsersMetrics extends HeroMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, MOBILE_DASHBOARD_METRICS.TOTAL_USERS.title);
  }

  /**
   * Verifies all UI data points for the Total users metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(MOBILE_DASHBOARD_METRICS.TOTAL_USERS.subtitle);
  }
}
