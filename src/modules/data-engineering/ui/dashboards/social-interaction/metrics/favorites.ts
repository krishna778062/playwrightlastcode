import { FrameLocator, Page } from '@playwright/test';

import { HeroMetricsComponent } from '@/src/modules/data-engineering/ui/components/heroMetricsComponent';

export class Favorites extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe);
  }

  /**
   * Gets the favorites metric value
   * @returns The metric value as string
   */
  async getFavoritesValue(): Promise<string> {
    return await this.getMetricValue('Favorites');
  }

  /**
   * Verifies that the favorites metric has a valid numeric value
   */
  async verifyFavoritesHasValidValue(): Promise<void> {
    await this.verifyMetricHasValidValue('Favorites');
  }
}
