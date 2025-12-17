import { FrameLocator, Page } from '@playwright/test';

import { HeroMetricsComponent } from '../../../components/heroMetricsComponent';

export class ReactionsMetrics extends HeroMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Reactions');
  }
}
