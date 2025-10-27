import { AnalyticsFiltersComponent } from '@data-engineering/ui/components/analyticsFiltersComponent';
import { AnalyticsDashboardNavigationTabComponent } from '@data-engineering/ui/components/navigationTabComponent';
import { FrameLocator, Locator, Page } from '@playwright/test';

import { BasePage } from '@/src/core/ui/pages/basePage';
import { AnalyticsBaseComponent } from '@/src/modules/data-engineering/ui/components/analyticsBaseComponent';

/**
 * Analytics Dashboard Base Page
 * This page is the base page for all analytics dashboard pages
 * It contains the common components and methods for all analytics dashboard pages
 */
export abstract class BaseAnalyticsDashboardPage extends BasePage {
  readonly analyticsBaseComponent: AnalyticsBaseComponent;
  readonly analyticsFiltersComponent: AnalyticsFiltersComponent;
  readonly analyticsDashboardNavigationTabComponent: AnalyticsDashboardNavigationTabComponent;
  readonly thoughtSpotIframe: FrameLocator;

  readonly answerSectionContainer: (metricTitle: string) => Locator;

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl);
    this.analyticsBaseComponent = new AnalyticsBaseComponent(page);
    this.analyticsFiltersComponent = new AnalyticsFiltersComponent(page);
    this.analyticsDashboardNavigationTabComponent = new AnalyticsDashboardNavigationTabComponent(page);
    this.thoughtSpotIframe = page.locator('iframe[name="ThoughtSpot Embedded Analytics"]').contentFrame();
    this.answerSectionContainer = (metricTitle: string) =>
      this.thoughtSpotIframe.locator('[data-testid="answer-content"]').filter({ hasText: metricTitle });
  }

  async verifyTableColumnHeaderTextIsVisible(metricTitle: string, columnTitles: string[]): Promise<void> {
    await this.analyticsBaseComponent.verifyTableColumnHeaderTextIsVisible(metricTitle, columnTitles);
  }

  async scrollToAnswer(metricTitle: string): Promise<void> {
    await this.analyticsBaseComponent.scrollToAnswer(metricTitle);
  }

  async verifyAnswerTitleIsVisible(metricTitle: string): Promise<void> {
    await this.analyticsBaseComponent.verifyAnswerTitleIsVisible(metricTitle);
  }

  async verifyAnswerSubTitleIsVisible(metricSubTitle: string): Promise<void> {
    await this.analyticsBaseComponent.verifyAnswerSubTitleIsVisible(metricSubTitle);
  }
}
