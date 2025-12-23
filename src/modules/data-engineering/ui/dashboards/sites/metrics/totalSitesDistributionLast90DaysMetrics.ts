import { SITES_DASHBOARD_METRICS } from '@data-engineering/constants/sitesDashboardMetrics';
import { HorizontalBarChartComponent } from '@data-engineering/ui/components/horizontalBarChartComponent';
import { FrameLocator, Page } from '@playwright/test';

export class TotalSitesDistributionLast90DaysMetrics extends HorizontalBarChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SITES_DASHBOARD_METRICS.TOTAL_SITES_DISTRIBUTION_LAST_90_DAYS.title);
  }
}
