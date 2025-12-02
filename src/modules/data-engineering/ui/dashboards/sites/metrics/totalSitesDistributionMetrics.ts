import { SITES_DASHBOARD_METRICS } from '@data-engineering/constants/sitesDashboardMetrics';
import { PieChartComponent } from '@data-engineering/ui/components/pieChartComponent';
import { FrameLocator, Page } from '@playwright/test';

export class TotalSitesDistributionMetrics extends PieChartComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, SITES_DASHBOARD_METRICS.TOTAL_SITES_DISTRIBUTION.title);
  }
}
