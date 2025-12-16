import { FrameLocator, Page } from '@playwright/test';

import { BenchmarkMetricComponent } from '../../../components/benchmarkMetricComponent';

export class TotalContentPublishedMetrics extends BenchmarkMetricComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Total content published');
  }
}
