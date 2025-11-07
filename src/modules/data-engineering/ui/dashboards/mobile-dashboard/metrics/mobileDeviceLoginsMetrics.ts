import { FrameLocator, Page } from '@playwright/test';

import { BaseMobilePieChartMetric } from './baseMobilePieChartMetric';

export class MobileDeviceLoginsMetric extends BaseMobilePieChartMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Mobile device logins');
  }
}
