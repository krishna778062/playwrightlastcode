import { MOBILE_DASHBOARD_METRICS } from '@data-engineering/constants/mobileDashboardMetrics';
import { FrameLocator, Page } from '@playwright/test';

import { BaseMobileBarChartMetric } from './baseMobileBarChartMetric';

export class MobileContentViewsMetric extends BaseMobileBarChartMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, MOBILE_DASHBOARD_METRICS.MOBILE_CONTENT_VIEWS.title);
  }
}
