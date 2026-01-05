import { Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { MonthlyReportsAdoption } from './metrics/monthlyReportsAdoption';

import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

export class MonthlyReportsDashboard extends BaseAnalyticsDashboardPage {
  // Tabular metric components
  readonly monthlyReportsAdoption: MonthlyReportsAdoption;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MONTHLY_REPORTS_DASHBOARD);
    // Initialize tabular metric components
    this.monthlyReportsAdoption = new MonthlyReportsAdoption(page, this.thoughtSpotIframe);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // Verify the dashboard page is loaded
    // The specific verification can be added based on the actual page structure
  }
}
