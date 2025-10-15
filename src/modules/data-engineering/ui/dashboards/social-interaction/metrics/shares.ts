import { FrameLocator, Page } from '@playwright/test';

import { HeroMetricsComponent } from '@/src/modules/data-engineering/ui/components/heroMetricsComponent';

export class Shares extends HeroMetricsComponent {
  constructor(page: Page, iframe: FrameLocator) {
    super(page, iframe);
  }

  /**
   * Gets the shares metric value
   * @returns The metric value as string
   */
  async getSharesValue(): Promise<string> {
    return await this.getMetricValue('Shares');
  }

  /**
   * Verifies that the shares metric has a valid numeric value
   */
  async verifySharesHasValidValue(): Promise<void> {
    await this.verifyMetricHasValidValue('Shares');
  }
}
