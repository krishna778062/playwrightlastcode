import { FrameLocator, Page } from '@playwright/test';

import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';
import { HeroMetricsComponent } from '@/src/modules/data-engineering/ui/components/heroMetricsComponent';

export class TotalUserCategories extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe, PEOPLE_METRICS.USER_CATEGORY.title);
  }

  async verifyMetricValue(expectedValue: number): Promise<void> {
    await this.verifyMetricValueIsLoadedForHeroMetric(expectedValue);
  }
}
