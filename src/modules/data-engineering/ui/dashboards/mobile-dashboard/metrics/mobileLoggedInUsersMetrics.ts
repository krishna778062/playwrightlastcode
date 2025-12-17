import { MOBILE_DASHBOARD_METRICS } from '@data-engineering/constants/mobileDashboardMetrics';
import { FrameLocator, Page } from '@playwright/test';

import { HeroMetricsComponent } from '../../../components/heroMetricsComponent';

export class MobileLoggedInUsersMetrics extends HeroMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, MOBILE_DASHBOARD_METRICS.MOBILE_LOGGED_IN_USERS.title);
  }

  /**
   * Verifies all UI data points for the Mobile logged in users metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(MOBILE_DASHBOARD_METRICS.MOBILE_LOGGED_IN_USERS.subtitle);
  }
}
