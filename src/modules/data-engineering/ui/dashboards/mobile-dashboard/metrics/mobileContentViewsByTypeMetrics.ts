import { FrameLocator, Page } from '@playwright/test';

import { BaseMobilePieChartMetric } from './baseMobilePieChartMetric';

export class MobileContentViewsByTypeMetric extends BaseMobilePieChartMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, 'Mobile content views by type');
  }

  /**
   * Override hover method to add visibility wait before hovering
   * (This chart needs explicit wait, base class doesn't wait)
   */
  async hoverOverSegmentLabelWithLabelAs(label: string): Promise<void> {
    const chartLabel = this.getChartLabelLocatorWithLabelAsOverride(label);

    // Wait for the element to be visible first (this chart needs explicit wait)
    await this.verifier.waitUntilElementIsVisible(chartLabel, {
      timeout: 15_000,
      stepInfo: `Wait for chart label "${label}" to be visible for hover`,
    });

    await chartLabel.hover();
  }
}
