import { MOBILE_DASHBOARD_METRICS } from '@data-engineering/constants/mobileDashboardMetrics';
import { FrameLocator, Page } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

import { BaseMobilePieChartMetric } from './baseMobilePieChartMetric';

export class MobileContentViewsByTypeMetric extends BaseMobilePieChartMetric {
  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    super(page, thoughtSpotIframe, MOBILE_DASHBOARD_METRICS.MOBILE_CONTENT_VIEWS_BY_TYPE.title);
  }

  /**
   * Override hover method to add visibility wait before hovering
   * (This chart needs explicit wait, base class doesn't wait)
   * Uses force: true to bypass SVG pointer event interception for small/low-opacity segments
   */
  async hoverOverSegmentLabelWithLabelAs(label: string): Promise<void> {
    const chartLabel = this.getChartLabelLocatorWithLabelAsOverride(label);

    // Wait for the element to be visible first (this chart needs explicit wait)
    await this.verifier.waitUntilElementIsVisible(chartLabel, {
      timeout: TIMEOUTS.SHORT,
      stepInfo: `Wait for chart label "${label}" to be visible for hover`,
    });

    // Use force: true to bypass SVG pointer event interception
    // Highcharts renders small segments with low opacity and the SVG root can intercept pointer events
    await chartLabel.hover({ force: true });
  }
}
