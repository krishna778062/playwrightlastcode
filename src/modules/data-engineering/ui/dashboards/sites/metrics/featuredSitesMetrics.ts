import { SITES_DASHBOARD_METRICS } from '@data-engineering/constants/sitesDashboardMetrics';
import { HeroMetricsComponent } from '@data-engineering/ui/components/heroMetricsComponent';
import { FrameLocator, Page } from '@playwright/test';

export class FeaturedSitesMetrics extends HeroMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SITES_DASHBOARD_METRICS.FEATURED_SITES.title);
  }

  /**
   * Verifies all UI data points for the Featured sites metric
   */
  async verifyMetricUIDataPoints(): Promise<void> {
    await this.verifyAnswerTitleIsVisible();
    await this.verifyAnswerSubTitleIsVisible(SITES_DASHBOARD_METRICS.FEATURED_SITES.subtitle);
  }
}
