import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

/**
 * Analytics Landing Page
 * This page is the landing page for all analytics pages
 * It contains the common components and methods for all analytics pages
 */
export class AnalyticsLandingPage extends BasePage {
  readonly appAnalyticsButton: Locator;
  readonly recognitionAnalyticsButton: Locator;
  readonly campaignAnalyticsButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ANALYTICS_LANDING_PAGE);
    this.appAnalyticsButton = page.getByRole('link', { name: 'App' });
    this.recognitionAnalyticsButton = page.getByRole('link', { name: 'Recognition' });
    this.campaignAnalyticsButton = page.getByRole('link', { name: 'Campaigns' });
  }

  /**
   * Verifies that the analytics landing page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Analytics Landing Page is loaded', async () => {
      await expect(this.appAnalyticsButton, 'App Analytics button should be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
      await expect(this.recognitionAnalyticsButton, 'Recognition Analytics button should be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
      await expect(this.campaignAnalyticsButton, 'Campaign Analytics button should be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Opens the App Analytics page
   */
  async openAppAnalytics(): Promise<void> {
    await test.step('Open App Analytics', async () => {
      await this.appAnalyticsButton.click();
    });
  }

  /**
   * Opens the Recognition Analytics page
   */
  async openRecognitionAnalytics(): Promise<void> {
    await test.step('Open Recognition Analytics', async () => {
      await this.recognitionAnalyticsButton.click();
    });
  }

  /**
   * Opens the Campaign Analytics page
   */
  async openCampaignAnalytics(): Promise<void> {
    await test.step('Open Campaign Analytics', async () => {
      await this.campaignAnalyticsButton.click();
    });
  }

  /**
   * Verifies that all analytics options are visible
   * (app, recognition, campaigns)
   */
  async verifyAllAnalyticsOptionsAreVisible(): Promise<void> {
    await test.step('Verify all analytics options are visible', async () => {
      await expect(this.appAnalyticsButton.first(), 'App Analytics button should be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
      await expect(
        this.recognitionAnalyticsButton.first(),
        'Recognition Analytics button should be visible'
      ).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await expect(this.campaignAnalyticsButton.first(), 'Campaign Analytics button should be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }
}
