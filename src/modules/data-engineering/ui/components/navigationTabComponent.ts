import { Locator, Page, test } from '@playwright/test';

import { AnalyticsDashboardTabName } from '../../constants/analyticsDashboardTabName';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

/**
 * Handles navigation between analytics dashboard tabs
 * and this will be used by the analytics dashboard base page
 */
export class AnalyticsDashboardNavigationTabComponent extends BaseComponent {
  readonly currentTabLocator: Locator;
  readonly dashboardTabLocator: (dashboardTabName: AnalyticsDashboardTabName) => Locator;
  constructor(readonly page: Page) {
    super(page);
    this.currentTabLocator = this.page.getByRole('tab').filter({ has: this.page.locator('[aria-selected=true]') });
    this.dashboardTabLocator = (dashboardTabName: AnalyticsDashboardTabName) =>
      this.page.getByRole('tab', { name: dashboardTabName });
  }

  /**
   * Navigates to a specific dashboard tab by clicking on it
   * @param dashboardTabName - The name of the dashboard tab to navigate to
   */
  async navigateToAnalyticsDashboardTab(dashboardTabName: AnalyticsDashboardTabName): Promise<void> {
    await test.step(`Navigating to ${dashboardTabName} tab by clicking on it`, async () => {
      await this.clickOnElement(this.dashboardTabLocator(dashboardTabName));
    });
  }

  /**
   * Gets the name of the current tab
   * @returns The name of the current tab
   */
  async getTheCurrentTabName(): Promise<string | null> {
    return (await this.currentTabLocator.textContent()) ?? null;
  }
}
