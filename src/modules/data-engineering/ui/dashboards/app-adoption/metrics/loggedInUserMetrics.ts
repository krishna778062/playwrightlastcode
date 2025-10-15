import { FrameLocator, Page } from '@playwright/test';

import { BenchmarkMetricComponent } from '../../../components/benchmarkMetricComponent';

export class LoggedInUserMetrics extends BenchmarkMetricComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Logged in users');
  }
}
