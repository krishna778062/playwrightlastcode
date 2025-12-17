import { FrameLocator, Page } from '@playwright/test';

import { BenchmarkMetricComponent } from '../../../components/benchmarkMetricComponent';

export class ContributorsAndParticipantsMetrics extends BenchmarkMetricComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Contributors and participants');
  }
}
