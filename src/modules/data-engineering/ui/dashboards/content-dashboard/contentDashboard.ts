import {
  CurrentlyPublishedMetrics,
  TotalContentPublishedMetrics,
  TotalContentViewsMetrics,
  UniqueContentViewMetrics,
} from '@data-engineering/ui/dashboards/content-dashboard/metrics';
import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class ContentDashboard extends BaseAnalyticsDashboardPage {
  // dedicated metric components using composition
  readonly totalContentViewsMetric: TotalContentViewsMetrics;
  readonly totalContentPublishedMetric: TotalContentPublishedMetrics;
  readonly uniqueContentViewMetric: UniqueContentViewMetrics;
  readonly currentlyPublishedMetric: CurrentlyPublishedMetrics;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CONTENT_DASHBOARD);
    this.totalContentViewsMetric = new TotalContentViewsMetrics(page, this.thoughtSpotIframe);
    this.totalContentPublishedMetric = new TotalContentPublishedMetrics(page, this.thoughtSpotIframe);
    this.uniqueContentViewMetric = new UniqueContentViewMetrics(page, this.thoughtSpotIframe);
    this.currentlyPublishedMetric = new CurrentlyPublishedMetrics(page, this.thoughtSpotIframe);
  }

  /**
   * Verifies the Content page has loaded by asserting Total content published metric visibility.
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Content Dashboard page is loaded', async () => {
      await this.totalContentPublishedMetric.verifyMetricIsLoaded();
    });
  }
}
