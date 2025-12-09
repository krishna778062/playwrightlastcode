import { FrameLocator, Page } from '@playwright/test';

import { CustomHeroMetricComponent } from '../../../components/customHeroMetricComponent';

export class TotalUsersMetrics extends CustomHeroMetricComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Total users');
  }
}
