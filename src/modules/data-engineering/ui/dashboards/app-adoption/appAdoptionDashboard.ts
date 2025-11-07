import {
  ContributorsAndParticipantsMetrics,
  LoggedInUserMetrics,
  TotalUsersMetrics,
} from '@data-engineering/ui/dashboards/app-adoption/metrics';
import { Page, test } from '@playwright/test';

import { AdoptionLeadersMetrics } from './metrics/adoptionLeadersMetrics';
import { AdoptionRateUserLoginMetrics } from './metrics/adoptionRateUserLoginMetrics';
import { AppWebPageViewMetrics } from './metrics/appWebPageViewMetrics';
import { UserEngagementBreakdownMetric } from './metrics/userEngagementBreakdown';
import { UserLoginFrequencyDistributionMetrics } from './metrics/userLoginFrequenceyDistributionMetrics';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class AppAdoptionDashboard extends BaseAnalyticsDashboardPage {
  //dedicated metric components using composition
  readonly totalUsersMetrics: TotalUsersMetrics;
  readonly loggedInUsersMetrics: LoggedInUserMetrics;
  readonly contributorsAndParticipantsMetrics: ContributorsAndParticipantsMetrics;
  readonly adoptionLeadersMetrics: AdoptionLeadersMetrics;
  readonly appWebPageViewsMetrics: AppWebPageViewMetrics;
  readonly userEngagementBreakdownMetric: UserEngagementBreakdownMetric;
  readonly adoptionRateUserLoginMetrics: AdoptionRateUserLoginMetrics;
  readonly adoptionRateUserLoginFrequencyDistributionMetrics: UserLoginFrequencyDistributionMetrics;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APP_ADOPTION_DASHBOARD);
    this.totalUsersMetrics = new TotalUsersMetrics(page, this.thoughtSpotIframe);
    this.loggedInUsersMetrics = new LoggedInUserMetrics(page, this.thoughtSpotIframe);
    this.contributorsAndParticipantsMetrics = new ContributorsAndParticipantsMetrics(page, this.thoughtSpotIframe);
    this.adoptionLeadersMetrics = new AdoptionLeadersMetrics(page, this.thoughtSpotIframe);
    this.appWebPageViewsMetrics = new AppWebPageViewMetrics(page, this.thoughtSpotIframe);
    this.userEngagementBreakdownMetric = new UserEngagementBreakdownMetric(page, this.thoughtSpotIframe);
    this.adoptionRateUserLoginMetrics = new AdoptionRateUserLoginMetrics(page, this.thoughtSpotIframe);
    this.adoptionRateUserLoginFrequencyDistributionMetrics = new UserLoginFrequencyDistributionMetrics(
      page,
      this.thoughtSpotIframe
    );
  }

  /**
   * Verifies the App Adoption page has loaded by asserting Adoption tab visibility.
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify App Adoption page is loaded', async () => {
      await this.totalUsersMetrics.verifyMetricIsLoaded();
      await this.loggedInUsersMetrics.verifyMetricIsLoaded();
      await this.contributorsAndParticipantsMetrics.verifyMetricIsLoaded();
    });
  }
}
