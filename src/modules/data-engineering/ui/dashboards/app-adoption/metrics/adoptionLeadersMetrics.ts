import { FrameLocator, Page } from '@playwright/test';

import { TabluarMetricsComponent } from '../../../components/tabluarMetricsComponent';

export class AdoptionLeadersMetrics extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Adoption leaders');
  }
}
