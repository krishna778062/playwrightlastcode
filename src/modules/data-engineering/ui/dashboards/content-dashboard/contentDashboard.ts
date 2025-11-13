import {
  CommentsMetrics,
  CurrentlyPublishedMetrics,
  FavoritesMetrics,
  RepliesMetrics,
  SharesMetrics,
  TotalContentPublishedMetrics,
  TotalContentViewsMetrics,
  UniqueContentViewMetrics,
  UsersWhoViewedContentMetrics,
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
  readonly usersWhoViewedContentMetric: UsersWhoViewedContentMetrics;
  readonly commentsMetric: CommentsMetrics;
  readonly repliesMetric: RepliesMetrics;
  readonly sharesMetric: SharesMetrics;
  readonly favoritesMetric: FavoritesMetrics;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CONTENT_DASHBOARD);
    this.totalContentViewsMetric = new TotalContentViewsMetrics(page, this.thoughtSpotIframe);
    this.totalContentPublishedMetric = new TotalContentPublishedMetrics(page, this.thoughtSpotIframe);
    this.uniqueContentViewMetric = new UniqueContentViewMetrics(page, this.thoughtSpotIframe);
    this.currentlyPublishedMetric = new CurrentlyPublishedMetrics(page, this.thoughtSpotIframe);
    this.usersWhoViewedContentMetric = new UsersWhoViewedContentMetrics(page, this.thoughtSpotIframe);
    this.commentsMetric = new CommentsMetrics(page, this.thoughtSpotIframe);
    this.repliesMetric = new RepliesMetrics(page, this.thoughtSpotIframe);
    this.sharesMetric = new SharesMetrics(page, this.thoughtSpotIframe);
    this.favoritesMetric = new FavoritesMetrics(page, this.thoughtSpotIframe);
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
