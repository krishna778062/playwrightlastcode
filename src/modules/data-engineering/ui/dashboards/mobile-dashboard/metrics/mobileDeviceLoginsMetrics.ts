import { MOBILE_DASHBOARD_METRICS } from '@data-engineering/constants/mobileDashboardMetrics';
import { FrameLocator, Page } from '@playwright/test';

import { BaseMobilePieChartMetric } from './baseMobilePieChartMetric';

export class MobileDeviceLoginsMetric extends BaseMobilePieChartMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, MOBILE_DASHBOARD_METRICS.MOBILE_DEVICE_LOGINS.title);
  }
}
