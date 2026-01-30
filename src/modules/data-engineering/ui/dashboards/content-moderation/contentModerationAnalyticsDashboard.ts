import { Locator, Page } from '@playwright/test';

import { Detected } from './metrics/detected';
import { Removed } from './metrics/removed';
import { Reported } from './metrics/reported';
import { TotalSources } from './metrics/totalSources';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BaseAnalyticsDashboardPage } from '@/src/modules/data-engineering/ui/pages/baseAnalyticsDashboardPage';

/**
 * Content Moderation Analytics Dashboard
 * Accessed via: Manage → Content Moderation → Analytics tab
 * Uses ThoughtSpot iframe for analytics visualization
 */
export class ContentModerationAnalyticsDashboard extends BaseAnalyticsDashboardPage {
  // Tab navigation
  readonly analyticsTab: Locator;

  // Page heading
  readonly contentModerationPageHeading: Locator;

  // ThoughtSpot iframe element (for visibility checks)
  readonly thoughtSpotIframeElement: Locator;

  // Hero metric components
  readonly totalSources: TotalSources;
  readonly detected: Detected;
  readonly reported: Reported;
  readonly removed: Removed;

  constructor(page: Page) {
    super(page, '/manage/content-moderation');

    // Tab locator
    this.analyticsTab = this.page.getByRole('tab', { name: 'Analytics' });

    // Page heading
    this.contentModerationPageHeading = this.page.getByRole('heading', { name: 'Content moderation', level: 1 });

    // ThoughtSpot iframe element for visibility checks
    this.thoughtSpotIframeElement = this.page.locator('iframe[name="ThoughtSpot Embedded Analytics"]').first();

    // Initialize metric components with ThoughtSpot iframe
    this.totalSources = new TotalSources(page, this.thoughtSpotIframe);
    this.detected = new Detected(page, this.thoughtSpotIframe);
    this.reported = new Reported(page, this.thoughtSpotIframe);
    this.removed = new Removed(page, this.thoughtSpotIframe);
  }

  /**
   * Verifies that the content moderation page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.contentModerationPageHeading, {
      timeout: TIMEOUTS.LONG,
      assertionMessage: 'Content moderation page heading should be visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.analyticsTab, {
      timeout: TIMEOUTS.MEDIUM,
      assertionMessage: 'Analytics tab should be visible',
    });
  }

  /**
   * Verifies that the Analytics tab content is loaded
   */
  async verifyAnalyticsTabIsLoaded(): Promise<void> {
    // Wait for ThoughtSpot iframe to be visible first
    await this.waitForThoughtSpotIframeToLoad();

    // Verify Total Sources metric is visible (this has its own 120s timeout)
    await this.totalSources.verifyMetricIsLoaded();
  }

  /**
   * Clicks on the Analytics tab to navigate to Analytics section
   */
  async clickAnalyticsTab(): Promise<void> {
    await this.clickOnElement(this.analyticsTab);

    // Wait for ThoughtSpot iframe to appear
    await this.waitForThoughtSpotIframeToLoad();
  }

  /**
   * Waits for ThoughtSpot iframe to be visible and content to start loading
   */
  async waitForThoughtSpotIframeToLoad(): Promise<void> {
    // Wait for iframe element to be visible
    await this.verifier.verifyTheElementIsVisible(this.thoughtSpotIframeElement, {
      timeout: TIMEOUTS.VERY_VERY_LONG,
      assertionMessage: 'ThoughtSpot iframe should be visible',
    });

    // Additional wait for iframe content to initialize
    await this.page.waitForTimeout(5000);
  }
}
