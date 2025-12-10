import { Page, test } from '@playwright/test';

// Import reusable metrics from app-adoption
import { AdoptionRateUserLoginMetrics } from '../app-adoption/metrics/adoptionRateUserLoginMetrics';
import { ContributorsAndParticipantsMetrics } from '../app-adoption/metrics/contributorsAndParticipantsMetrics';
import { LoggedInUserMetrics } from '../app-adoption/metrics/loggedInUserMetrics';
import { TotalUsersMetrics } from '../app-adoption/metrics/totalUsersMetrics';
import { UserEngagementBreakdownMetric } from '../app-adoption/metrics/userEngagementBreakdown';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class OverviewDashboard extends BaseAnalyticsDashboardPage {
  // Reuse metric components from app-adoption dashboard
  readonly totalUsersMetrics: TotalUsersMetrics;
  readonly loggedInUsersMetrics: LoggedInUserMetrics;
  readonly contributorsAndParticipantsMetrics: ContributorsAndParticipantsMetrics;
  readonly adoptionRateUserLoginMetrics: AdoptionRateUserLoginMetrics;
  readonly userEngagementBreakdownMetric: UserEngagementBreakdownMetric;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APP_ANALYTICS_OVERVIEW_DASHBOARD);
    this.totalUsersMetrics = new TotalUsersMetrics(page, this.thoughtSpotIframe);
    this.loggedInUsersMetrics = new LoggedInUserMetrics(page, this.thoughtSpotIframe);
    this.contributorsAndParticipantsMetrics = new ContributorsAndParticipantsMetrics(page, this.thoughtSpotIframe);
    this.adoptionRateUserLoginMetrics = new AdoptionRateUserLoginMetrics(page, this.thoughtSpotIframe);
    this.userEngagementBreakdownMetric = new UserEngagementBreakdownMetric(page, this.thoughtSpotIframe);
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
