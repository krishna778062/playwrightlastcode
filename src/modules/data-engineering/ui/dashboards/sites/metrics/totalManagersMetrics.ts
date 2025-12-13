import { SITES_DASHBOARD_METRICS } from '@data-engineering/constants/sitesDashboardMetrics';
import { HeroMetricsComponent } from '@data-engineering/ui/components/heroMetricsComponent';
import { FrameLocator, Page } from '@playwright/test';

export class TotalManagersMetrics extends HeroMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SITES_DASHBOARD_METRICS.TOTAL_MANAGERS.title);
  }

  /**
   * Verifies all UI data points for the Total managers metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(SITES_DASHBOARD_METRICS.TOTAL_MANAGERS.subtitle);
  }
}
