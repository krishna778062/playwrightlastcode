import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

import { TotalDepartments } from './metrics/totalDepartments';
import { TotalLocations } from './metrics/totalLocations';
import { TotalUserCategories } from './metrics/totalUserCategories';
import { TotalUsers } from './metrics/totalUsers';

import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class PeopleDashboard extends BaseAnalyticsDashboardPage {
  readonly peopleTab: Locator;

  // Metric components
  readonly totalUsers: TotalUsers;
  readonly totalDepartments: TotalDepartments;
  readonly totalLocations: TotalLocations;
  readonly totalUserCategories: TotalUserCategories;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PEOPLE_DASHBOARD_PAGE);
    this.peopleTab = this.page.getByRole('tab', { name: 'People' }).first();

    // Initialize metric components
    this.totalUsers = new TotalUsers(page, this.thoughtSpotIframe);
    this.totalDepartments = new TotalDepartments(page, this.thoughtSpotIframe);
    this.totalLocations = new TotalLocations(page, this.thoughtSpotIframe);
    this.totalUserCategories = new TotalUserCategories(page, this.thoughtSpotIframe);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify People Dashboard page is loaded', async () => {
      // Just verify the People tab is visible - don't wait for iframe/metrics
      // Those will be verified individually in each test
      await this.verifier.verifyTheElementIsVisible(this.peopleTab, {
        timeout: TIMEOUTS.VERY_LONG,
        assertionMessage: 'People tab should be visible and active',
      });
    });
  }
}
