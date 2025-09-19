import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export interface HeroMetric {
  title: string;
  value: string;
}

export class HeroMetricsComponent extends BaseComponent {
  readonly getMetricByTitle: (title: string) => Locator;
  readonly getMetricValueByTitle: (title: string) => Locator;

  constructor(page: Page) {
    super(page);

    this.getMetricByTitle = (title: string) =>
      this.page.locator('[data-testid="content-editable"]').filter({ hasText: title }).first();

    this.getMetricValueByTitle = (title: string) =>
      this.getMetricByTitle(title)
        .locator('xpath=ancestor::div[contains(@class, "answer-content-module__answerVizContainer")]')
        .locator('[data-testid="kpi_herodata"]')
        .first();
  }

  /**
   * Gets the value of a specific metric by title
   * @param title - The metric title (e.g., "Reactions", "Shares")
   * @returns The metric value as string
   */
  async getMetricValue(title: string): Promise<string> {
    return await test.step(`Get ${title} metric value`, async () => {
      const valueElement = this.getMetricValueByTitle(title);
      await this.verifier.verifyTheElementIsVisible(valueElement);
      const value = await valueElement.textContent();
      return value?.trim() || '';
    });
  }

  /**
   * Verifies that a specific metric has a valid numeric value
   * @param title - The metric title
   */
  async verifyMetricHasValidValue(title: string): Promise<void> {
    await test.step(`Verify ${title} has valid value`, async () => {
      const value = await this.getMetricValue(title);

      // Remove commas and check if it's a valid number
      const numericValue = value.replace(/,/g, '');
      expect(numericValue, `${title} should have a valid numeric value`).toMatch(/^\d+$/);
      expect(parseInt(numericValue), `${title} should be >= 0`).toBeGreaterThanOrEqual(0);
    });
  }

  /**
   * Verifies that a specific metric title is visible
   * @param title - The metric title
   */
  async verifyMetricTitleIsVisible(title: string): Promise<void> {
    await test.step(`Verify ${title} metric title is visible`, async () => {
      const titleElement = this.getMetricByTitle(title);
      await this.verifier.verifyTheElementIsVisible(titleElement, {
        assertionMessage: `${title} metric title should be visible`,
      });
    });
  }
}
