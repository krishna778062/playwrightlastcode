import { FrameLocator, Page } from '@playwright/test';

import { ChartBasedMetricComponent } from '../../../components/chartBasedMetricComponent';

export class TotalUsersMetrics extends ChartBasedMetricComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Total users');
  }
}
