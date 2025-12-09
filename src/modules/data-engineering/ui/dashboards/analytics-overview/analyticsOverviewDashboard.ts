import { DataChartType } from '@data-engineering/constants/dataChartType';
import { Locator, Page, test } from '@playwright/test';

import { BaseAnalyticsDashboardPage } from '../../pages/baseAnalyticsDashboardPage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export enum OverViewMetricsStore {
  loggedInUsersAtLeastOnce = 'Users who logged in at least once',
  usersWhoViewedContent = 'Users who viewed content',
  avgContentViewsPerUser = 'Avg content views per user',
  contentPublished = 'Content published',
  contributorsAndParticipants = 'Contributors & participants',
}

export enum MetricsStore {
  AppAdoption = 'App Adoption',
  AdoptionBheavior = 'Adoption Behavior',
}

export class AnalyticsOverviewDashboard extends BaseAnalyticsDashboardPage {
  readonly overViewSection: Locator;
  readonly metricsPanelLocator: (metric: OverViewMetricsStore) => Locator;
  readonly overViewMetricLocator: (metricName: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APP_ANALYTICS_OVERVIEW_DASHBOARD);
    this.overViewSection = this.page.locator("[class*='OverviewStats_tileContainer']");
    this.metricsPanelLocator = (metric: OverViewMetricsStore) =>
      this.page.locator("[class*='Panel-module__panel']").filter({ has: this.page.getByText(metric) });
    this.overViewMetricLocator = (metricName: string) =>
      this.overViewSection.locator("li[class*='Stats_stat']").filter({ has: this.page.getByText(metricName) });
  }

  getWidgetPanelContainer(metric: OverViewMetricsStore): Locator {
    return this.metricsPanelLocator(metric).locator('[class*="Panel-module__panel"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Analytics Overview Dashboard is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.overViewSection, {
        assertionMessage: 'Overview section should be visible',
      });
    });
  }

  /**
   * Verifies that all metrics are visible and loaded
   * @param metrics - The metrics to verify
   */
  async verifyAllMetricsAreVisibleAndLoaded(metrics: OverViewMetricsStore[]): Promise<void> {
    await test.step('Verify Metrics are visible and loaded', async () => {
      for (const metric of metrics) {
        await this.verifier.verifyTheElementIsVisible(this.metricsPanelLocator(metric), {
          assertionMessage: `${metric} should be visible`,
          timeout: 40_000,
        });
      }
    });
  }

  /**
   * Verifies that a widget is rendered with the right type of chart
   * @param metric - The metric to verify
   * @param expectedChartType - The expected chart type
   */
  async verifyWidgetIsRenderedWithRightTypeOfChart(
    metric: OverViewMetricsStore,
    expectedChartType: DataChartType
  ): Promise<void> {
    await test.step(`Verify ${metric} widget is rendered with right type of chart`, async () => {
      const widgetPanelContainer = this.getWidgetPanelContainer(metric);
      const chartLocator = widgetPanelContainer.locator(expectedChartType);
      await this.verifier.verifyTheElementIsVisible(chartLocator, {
        assertionMessage: `${metric} widget is rendered with right type of chart`,
      });
    });
  }

  /**
   * Clicks on the more button to open detailed metrics for a metric
   * @param metric - The metric to open detailed metrics for
   */
  async clickOnMoreButtonToOpenDetailedMetricsFor(metric: OverViewMetricsStore): Promise<void> {
    await test.step(`Click on more button to open detailed metrics for ${metric}`, async () => {
      const widgetPanelContainer = this.getWidgetPanelContainer(metric);
      const moreButton = widgetPanelContainer.getByRole('link', { name: 'More' });
      await this.clickOnElement(moreButton, {
        stepInfo: `Click on more button to open detailed metrics for ${metric}`,
      });
    });
  }

  /**
   * Verifies that the OverView Stats Section is visible
   */
  async verifyOverViewStatsSectionIsVisible(): Promise<void> {
    await test.step('Verify OverView Stats Section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.overViewSection, {
        assertionMessage: 'OverView Stats Section should be visible',
      });
    });
  }

  /**
   * Verifies that the OverView Section Metrics are visible
   */
  async verifyOverViewSectionMetricsAreVisible(): Promise<void> {
    for (const metric of Object.values(OverViewMetricsStore)) {
      await test.step(`Verify overview section metric -  ${metric} is visible`, async () => {
        await this.verifier.verifyTheElementIsVisible(this.overViewMetricLocator(metric), {
          assertionMessage: `${metric} should be visible`,
          timeout: 40_000,
        });
      });
    }
  }
}
