import {
  FeaturedSitesMetrics,
  LeastPopularSitesMetrics,
  LeastPublishedContentMetrics,
  LowActivitySitesMetrics,
  MostPopularSitesMetrics,
  MostPublishedContentMetrics,
  NewSitesLast90DaysMetrics,
  TotalManagersMetrics,
  TotalSitesDistributionLast90DaysMetrics,
  TotalSitesDistributionMetrics,
  TotalSitesMetrics,
} from '@data-engineering/ui/dashboards/sites/metrics';
import { BaseAnalyticsDashboardPage } from '@data-engineering/ui/pages/baseAnalyticsDashboardPage';
import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export class SitesDashboard extends BaseAnalyticsDashboardPage {
  // Dedicated metric components using composition
  readonly totalSitesMetrics: TotalSitesMetrics;
  readonly newSitesLast90DaysMetrics: NewSitesLast90DaysMetrics;
  readonly featuredSitesMetrics: FeaturedSitesMetrics;
  readonly totalManagersMetrics: TotalManagersMetrics;
  readonly totalSitesDistributionMetrics: TotalSitesDistributionMetrics;
  readonly totalSitesDistributionLast90DaysMetrics: TotalSitesDistributionLast90DaysMetrics;
  readonly mostPopularSitesMetrics: MostPopularSitesMetrics;
  readonly leastPopularSitesMetrics: LeastPopularSitesMetrics;
  readonly mostPublishedContentMetrics: MostPublishedContentMetrics;
  readonly leastPublishedContentMetrics: LeastPublishedContentMetrics;
  readonly lowActivitySitesMetrics: LowActivitySitesMetrics;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SITES_DASHBOARD);
    this.totalSitesMetrics = new TotalSitesMetrics(page, this.thoughtSpotIframe);
    this.newSitesLast90DaysMetrics = new NewSitesLast90DaysMetrics(page, this.thoughtSpotIframe);
    this.featuredSitesMetrics = new FeaturedSitesMetrics(page, this.thoughtSpotIframe);
    this.totalManagersMetrics = new TotalManagersMetrics(page, this.thoughtSpotIframe);
    this.totalSitesDistributionMetrics = new TotalSitesDistributionMetrics(page, this.thoughtSpotIframe);
    this.totalSitesDistributionLast90DaysMetrics = new TotalSitesDistributionLast90DaysMetrics(
      page,
      this.thoughtSpotIframe
    );
    this.mostPopularSitesMetrics = new MostPopularSitesMetrics(page, this.thoughtSpotIframe);
    this.leastPopularSitesMetrics = new LeastPopularSitesMetrics(page, this.thoughtSpotIframe);
    this.mostPublishedContentMetrics = new MostPublishedContentMetrics(page, this.thoughtSpotIframe);
    this.leastPublishedContentMetrics = new LeastPublishedContentMetrics(page, this.thoughtSpotIframe);
    this.lowActivitySitesMetrics = new LowActivitySitesMetrics(page, this.thoughtSpotIframe);
  }

  /**
   * Verifies the Sites Dashboard page has loaded by asserting hero metrics visibility.
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Sites Dashboard page is loaded', async () => {
      await this.totalSitesMetrics.verifyMetricIsLoaded();
      await this.newSitesLast90DaysMetrics.verifyMetricIsLoaded();
    });
  }
}
