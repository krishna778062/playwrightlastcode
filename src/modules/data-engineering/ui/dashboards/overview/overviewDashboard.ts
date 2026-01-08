import { Page, test } from '@playwright/test';

// Import reusable metrics from app-adoption
import { AdoptionRateUserLoginMetrics } from '../app-adoption/metrics/adoptionRateUserLoginMetrics';
import { ContributorsAndParticipantsMetrics } from '../app-adoption/metrics/contributorsAndParticipantsMetrics';
import { LoggedInUserMetrics } from '../app-adoption/metrics/loggedInUserMetrics';
import { TotalUsersMetrics } from '../app-adoption/metrics/totalUsersMetrics';
import { UserEngagementBreakdownMetric } from '../app-adoption/metrics/userEngagementBreakdown';
// Import reusable metrics from content dashboard
import {
  ContentPublishedMetrics,
  TotalContentPublishedMetrics,
  UsersWhoViewedContentMetrics,
} from '../content-dashboard/metrics';
// Import reusable metrics from sites dashboard
import {
  FeaturedSitesMetrics,
  MostPopularSitesMetrics,
  TotalManagersMetrics,
  TotalSitesDistributionMetrics,
  TotalSitesMetrics,
} from '../sites/metrics';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class OverviewDashboard extends BaseAnalyticsDashboardPage {
  // Reuse metric components from app-adoption dashboard
  readonly totalUsersMetrics: TotalUsersMetrics;
  readonly loggedInUsersMetrics: LoggedInUserMetrics;
  readonly contributorsAndParticipantsMetrics: ContributorsAndParticipantsMetrics;
  readonly adoptionRateUserLoginMetrics: AdoptionRateUserLoginMetrics;
  readonly userEngagementBreakdownMetric: UserEngagementBreakdownMetric;

  // Reuse metric components from sites dashboard
  readonly totalSitesMetrics: TotalSitesMetrics;
  readonly featuredSitesMetrics: FeaturedSitesMetrics;
  readonly totalManagersMetrics: TotalManagersMetrics;
  readonly totalSitesDistributionMetrics: TotalSitesDistributionMetrics;
  readonly mostPopularSitesMetrics: MostPopularSitesMetrics;

  // Reuse metric components from content dashboard
  readonly totalContentPublishedMetric: TotalContentPublishedMetrics;
  readonly usersWhoViewedContentMetric: UsersWhoViewedContentMetrics;
  readonly contentPublishedMetric: ContentPublishedMetrics;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APP_ANALYTICS_OVERVIEW_DASHBOARD);
    this.totalUsersMetrics = new TotalUsersMetrics(page, this.thoughtSpotIframe);
    this.loggedInUsersMetrics = new LoggedInUserMetrics(page, this.thoughtSpotIframe);
    this.contributorsAndParticipantsMetrics = new ContributorsAndParticipantsMetrics(page, this.thoughtSpotIframe);
    this.adoptionRateUserLoginMetrics = new AdoptionRateUserLoginMetrics(page, this.thoughtSpotIframe);
    this.userEngagementBreakdownMetric = new UserEngagementBreakdownMetric(page, this.thoughtSpotIframe);

    // Initialize sites metrics
    this.totalSitesMetrics = new TotalSitesMetrics(page, this.thoughtSpotIframe);
    this.featuredSitesMetrics = new FeaturedSitesMetrics(page, this.thoughtSpotIframe);
    this.totalManagersMetrics = new TotalManagersMetrics(page, this.thoughtSpotIframe);
    this.totalSitesDistributionMetrics = new TotalSitesDistributionMetrics(page, this.thoughtSpotIframe);
    this.mostPopularSitesMetrics = new MostPopularSitesMetrics(page, this.thoughtSpotIframe);

    // Initialize content metrics
    this.totalContentPublishedMetric = new TotalContentPublishedMetrics(page, this.thoughtSpotIframe);
    this.usersWhoViewedContentMetric = new UsersWhoViewedContentMetrics(page, this.thoughtSpotIframe);
    this.contentPublishedMetric = new ContentPublishedMetrics(page, this.thoughtSpotIframe);
  }

  /**
   * Verifies the Overview Dashboard page has loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Overview Dashboard page is loaded', async () => {
      await this.totalUsersMetrics.verifyMetricIsLoaded();
    });
  }
}
