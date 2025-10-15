import { FrameLocator, Page } from '@playwright/test';

import { SOCIAL_INTERACTION_METRICS } from '@/src/modules/data-engineering/constants/socialInteractionMetrics';
import { HeroMetricsComponent } from '@/src/modules/data-engineering/ui/components/heroMetricsComponent';

export class Shares extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, SOCIAL_INTERACTION_METRICS.SHARES.title);
  }
}
