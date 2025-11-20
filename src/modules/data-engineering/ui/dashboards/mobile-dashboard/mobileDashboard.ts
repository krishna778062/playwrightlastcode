import {
  AvgMobileContentViewsPerUserMetrics,
  MobileAdoptionRateBarChartMetric,
  MobileAdoptionRateMetrics,
  MobileContentViewersMetrics,
  MobileContentViewsByTypeMetric,
  MobileContentViewsMetric,
  MobileDeviceLoginsMetric,
  MobileLoggedInUsersMetrics,
  TotalMobileContentViewsMetrics,
  TotalUsersMetrics,
  UniqueMobileContentViewsMetrics,
} from '@data-engineering/ui/dashboards/mobile-dashboard/metrics';
import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class MobileDashboard extends BaseAnalyticsDashboardPage {
  // Dedicated metric components using composition
  readonly totalUsersMetrics: TotalUsersMetrics;
  readonly mobileLoggedInUsersMetrics: MobileLoggedInUsersMetrics;
  readonly mobileContentViewersMetrics: MobileContentViewersMetrics;
  readonly totalMobileContentViewsMetrics: TotalMobileContentViewsMetrics;
  readonly avgMobileContentViewsPerUserMetrics: AvgMobileContentViewsPerUserMetrics;
  readonly uniqueMobileContentViewsMetrics: UniqueMobileContentViewsMetrics;
  readonly mobileDeviceLoginsMetric: MobileDeviceLoginsMetric;
  readonly mobileContentViewsByTypeMetric: MobileContentViewsByTypeMetric;
  readonly mobileContentViewsMetric: MobileContentViewsMetric;
  readonly mobileAdoptionRateBarChartMetric: MobileAdoptionRateBarChartMetric;
  readonly mobileAdoptionRateMetrics: MobileAdoptionRateMetrics;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MOBILE_DASHBOARD);
    this.totalUsersMetrics = new TotalUsersMetrics(page, this.thoughtSpotIframe);
    this.mobileLoggedInUsersMetrics = new MobileLoggedInUsersMetrics(page, this.thoughtSpotIframe);
    this.mobileContentViewersMetrics = new MobileContentViewersMetrics(page, this.thoughtSpotIframe);
    this.totalMobileContentViewsMetrics = new TotalMobileContentViewsMetrics(page, this.thoughtSpotIframe);
    this.avgMobileContentViewsPerUserMetrics = new AvgMobileContentViewsPerUserMetrics(page, this.thoughtSpotIframe);
    this.uniqueMobileContentViewsMetrics = new UniqueMobileContentViewsMetrics(page, this.thoughtSpotIframe);
    this.mobileDeviceLoginsMetric = new MobileDeviceLoginsMetric(page, this.thoughtSpotIframe);
    this.mobileContentViewsByTypeMetric = new MobileContentViewsByTypeMetric(page, this.thoughtSpotIframe);
    this.mobileContentViewsMetric = new MobileContentViewsMetric(page, this.thoughtSpotIframe);
    this.mobileAdoptionRateBarChartMetric = new MobileAdoptionRateBarChartMetric(page, this.thoughtSpotIframe);
    this.mobileAdoptionRateMetrics = new MobileAdoptionRateMetrics(page, this.thoughtSpotIframe);
  }

  /**
   * Verifies the Mobile Dashboard page has loaded by asserting hero metrics visibility.
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Mobile Dashboard page is loaded', async () => {
      await this.totalUsersMetrics.verifyMetricIsLoaded();
      await this.mobileLoggedInUsersMetrics.verifyMetricIsLoaded();
      await this.mobileContentViewersMetrics.verifyMetricIsLoaded();
      await this.totalMobileContentViewsMetrics.verifyMetricIsLoaded();
      await this.avgMobileContentViewsPerUserMetrics.verifyMetricIsLoaded();
      await this.uniqueMobileContentViewsMetrics.verifyMetricIsLoaded();
    });
  }
}
