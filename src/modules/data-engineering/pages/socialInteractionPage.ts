import { Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { HeroMetricsComponent } from '@/src/modules/data-engineering/components/heroMetricsComponent';

export class SocialInteractionPage extends BasePage {
  readonly heroMetrics: HeroMetricsComponent;

  readonly socialInteractionTab: Locator;

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl ?? '/analytics/social-interaction');

    this.heroMetrics = new HeroMetricsComponent(page);

    this.socialInteractionTab = this.page.getByRole('tab', { name: 'Social interaction' }).first();
  }

  /**
   * Navigates to the Social Interaction page from analytics landing
   */
  async navigateToSocialInteraction(): Promise<void> {
    await test.step('Navigate to Social Interaction page', async () => {
      await this.clickOnElement(this.socialInteractionTab);
    });
  }

  /**
   * Implementation of abstract method from BasePage
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Social Interaction page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.socialInteractionTab, {
        timeout: TIMEOUTS.VERY_LONG,
        assertionMessage: 'Social Interaction tab should be visible and active',
      });
    });
  }

  /**
   * Gets a specific metric value
   * @param metricTitle - The metric title
   */
  async getMetricValue(metricTitle: string): Promise<string> {
    return await this.heroMetrics.getMetricValue(metricTitle);
  }

  /**
   * Verifies a specific metric title is visible
   * @param metricTitle - The metric title
   */
  async verifyMetricTitleIsVisible(metricTitle: string): Promise<void> {
    await this.heroMetrics.verifyMetricTitleIsVisible(metricTitle);
  }

  /**
   * Verifies a specific metric sub title is visible
   * @param metricSubTitle - The metric sub title
   */
  async verifyMetricSubTitleIsVisible(metricSubTitle: string): Promise<void> {
    await this.heroMetrics.verifyMetricSubTitleIsVisible(metricSubTitle);
  }

  /**
   * Verifies a specific metric has a valid value
   * @param metricTitle - The metric title
   */
  async verifyMetricHasValidValue(metricTitle: string): Promise<void> {
    await this.heroMetrics.verifyMetricHasValidValue(metricTitle);
  }
}
