import { SITES_DASHBOARD_METRICS } from '@data-engineering/constants/sitesDashboardMetrics';
import { HeroMetricsComponent } from '@data-engineering/ui/components/heroMetricsComponent';
import { FrameLocator, Page } from '@playwright/test';

export class NewSitesLast90DaysMetrics extends HeroMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SITES_DASHBOARD_METRICS.NEW_SITES_LAST_90_DAYS.title);
  }

  /**
   * Verifies all UI data points for the New sites (last 90 days) metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(SITES_DASHBOARD_METRICS.NEW_SITES_LAST_90_DAYS.subtitle);
  }
}
