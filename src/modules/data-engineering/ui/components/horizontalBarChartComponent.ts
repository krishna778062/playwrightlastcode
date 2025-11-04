import { FrameLocator, Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class HorizontalBarChartComponent extends BaseComponent {
  readonly bars: Locator;
  readonly chartLegends: Locator;

  //tooltip container and get tooltip block with key text as
  readonly toolTipContainer: Locator;
  readonly getToolTipBlockWithKeyTextAs: (keyText: string) => Locator;
  constructor(
    page: Page,
    readonly thoughtSpotIframe: FrameLocator,
    readonly metricTitle: string
  ) {
    const container = thoughtSpotIframe.locator('[class*="answer-content-module__answerVizContainer"]').filter({
      has: thoughtSpotIframe.getByRole('heading', { name: metricTitle, exact: true }),
    });
    super(page, container);
    //chart elements
    this.bars = this.rootLocator
      .locator('[class*="highcharts-series-group"]')
      .locator('rect[class*="highcharts-point"]');

    this.chartLegends = this.rootLocator.locator('[class*="legend-item-v2"]').locator('.label-v2');

    // Tool tip container
    this.toolTipContainer = this.thoughtSpotIframe.locator('[class*="highcharts-tooltip-container"]');
    this.getToolTipBlockWithKeyTextAs = (label: string) =>
      this.toolTipContainer.locator("[class*='chart-tooltip-block']").filter({ hasText: label });
  }
}
