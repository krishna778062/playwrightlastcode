import { Page, test } from '@playwright/test';

import { AverageSearchesPerLoggedInUser } from './metrics/averageSearchesPerLoggedInUser';
import { MostSearchesPerformedByDepartment } from './metrics/mostSearchesPerformedByDepartment';
import { NoResultSearchMetrics } from './metrics/noResultSearch';
import { NoResultSearchQueries } from './metrics/noResultSearchQueries';
import { SearchClickThroughRate } from './metrics/searchClickThroughRate';
import { SearchUsageVolumeClickThroughRate } from './metrics/searchUsageVolumeClickThroughRate';
import { TopClickthroughTypes } from './metrics/topClickthroughTypes';
import { TopSearchQueries } from './metrics/topSearchQueries';
import { TopSearchQueriesWithNoClickthrough } from './metrics/topSearchQueriesWithNoClickthrough';
import { TotalSearchVolume } from './metrics';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class SearchDashboard extends BaseAnalyticsDashboardPage {
  // Dedicated metric components using composition
  readonly totalSearchVolume: TotalSearchVolume;
  readonly searchClickThroughRate: SearchClickThroughRate;
  readonly noResultSearch: NoResultSearchMetrics;
  readonly averageSearchesPerLoggedInUser: AverageSearchesPerLoggedInUser;
  readonly searchUsageVolumeAndClickThroughRate: SearchUsageVolumeClickThroughRate;
  readonly topSearchQueries: TopSearchQueries;
  readonly topSearchQueriesWithNoClickthrough: TopSearchQueriesWithNoClickthrough;
  readonly topClickthroughTypes: TopClickthroughTypes;
  readonly noResultSearchQueries: NoResultSearchQueries;
  readonly mostSearchesPerformedByDepartment: MostSearchesPerformedByDepartment;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SEARCH_DASHBOARD);
    this.totalSearchVolume = new TotalSearchVolume(page, this.thoughtSpotIframe);
    this.searchClickThroughRate = new SearchClickThroughRate(page, this.thoughtSpotIframe);
    this.noResultSearch = new NoResultSearchMetrics(page, this.thoughtSpotIframe);
    this.averageSearchesPerLoggedInUser = new AverageSearchesPerLoggedInUser(page, this.thoughtSpotIframe);
    this.searchUsageVolumeAndClickThroughRate = new SearchUsageVolumeClickThroughRate(page, this.thoughtSpotIframe);
    this.topSearchQueries = new TopSearchQueries(page, this.thoughtSpotIframe);
    this.topSearchQueriesWithNoClickthrough = new TopSearchQueriesWithNoClickthrough(page, this.thoughtSpotIframe);
    this.topClickthroughTypes = new TopClickthroughTypes(page, this.thoughtSpotIframe);
    this.noResultSearchQueries = new NoResultSearchQueries(page, this.thoughtSpotIframe);
    this.mostSearchesPerformedByDepartment = new MostSearchesPerformedByDepartment(page, this.thoughtSpotIframe);
  }

  /**
   * Verifies the Search page has loaded by asserting Search tab visibility.
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Search page is loaded', async () => {
      await this.totalSearchVolume.verifyMetricIsLoaded();
      await this.searchClickThroughRate.verifyMetricIsLoaded();
      await this.noResultSearch.verifyMetricIsLoaded();
      await this.averageSearchesPerLoggedInUser.verifyMetricIsLoaded();
    });
  }
}
