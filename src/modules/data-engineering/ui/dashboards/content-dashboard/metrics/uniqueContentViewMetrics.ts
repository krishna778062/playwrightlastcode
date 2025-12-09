import { FrameLocator, Page } from '@playwright/test';

import { BenchmarkMetricComponent } from '../../../components/benchmarkMetricComponent';

export class UniqueContentViewMetrics extends BenchmarkMetricComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Unique content views');
  }
}
