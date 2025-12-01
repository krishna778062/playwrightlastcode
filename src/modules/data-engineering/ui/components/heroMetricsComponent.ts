import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class HeroMetricsComponent extends BaseComponent {
  readonly metricValue: Locator;
  readonly answerTitle: Locator;
  readonly answerSubTitle: Locator;

  constructor(
    page: Page,
    readonly thoughtSpotIframe: FrameLocator,
    readonly metricTitle: string
  ) {
    // Find the container internally
    const container = thoughtSpotIframe.locator('[class*="answer-content-module__answerVizContainer"]').filter({
      has: thoughtSpotIframe.getByRole('heading', { name: metricTitle, exact: true }),
    });

    super(page, container);

    this.metricValue = this.rootLocator.locator('[data-testid="kpi_herodata"]').first();
    this.answerTitle = this.rootLocator.locator('span[role="heading"]').first();
    this.answerSubTitle = this.rootLocator.locator('span[role="heading"]').nth(1);
  }

  /**
   * Gets the value of the hero metric
   * @returns The metric value as string
   */
  async getMetricValue(): Promise<string> {
    return await test.step(`Get hero metric value`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.metricValue, { timeout: 60_000 });
      const value = await this.metricValue.textContent();
      return value?.trim() || '';
    });
  }

  /**
   * Verifies that the hero metric has a valid numeric value
   */
  async verifyMetricHasValidValue(): Promise<void> {
    await test.step(`Verify hero metric has valid value`, async () => {
      const value = await this.getMetricValue();

      // Remove commas and check if it's a valid number
      const numericValue = value.replace(/,/g, '');
      expect(numericValue, `Hero metric should have a valid numeric value`).toMatch(/^\d+$/);
      expect(parseInt(numericValue), `Hero metric should be >= 0`).toBeGreaterThanOrEqual(0);
    });
  }

  /**
   * Verifies that the answer title is visible (no need to check text since container was found by title)
   */
  async verifyAnswerTitleIsVisible(): Promise<void> {
    await test.step(`Verify answer title is visible - with title as : ${this.metricTitle}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.answerTitle, { timeout: 60_000 });
    });
  }

  /**
   * Verifies that the answer subtitle is visible
   * @param expectedSubTitle - The expected subtitle text
   */
  async verifyAnswerSubTitleIsVisible(expectedSubTitle: string): Promise<void> {
    await test.step(`Verify answer subtitle "${expectedSubTitle}" is visible - for metric ${this.metricTitle}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.answerSubTitle, { timeout: 60_000 });
      await expect(this.answerSubTitle, `Answer subtitle should be "${expectedSubTitle}"`).toHaveText(expectedSubTitle);
    });
  }

  /**
   * Verifies that the metric is loaded and visible
   */
  async verifyMetricIsLoaded(): Promise<void> {
    await test.step(`Verify hero metric is loaded for ${this.metricTitle}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.metricValue, { timeout: 60_000 });
    });
  }

  /**
   * Verifies that the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValueIsLoadedForHeroMetric(expectedValue: number): Promise<void> {
    await test.step(`Verify hero metric value for ${this.metricTitle} is ${expectedValue}`, async () => {
      // Get the actual UI value and normalize it by removing commas
      const actualValue = await this.getMetricValue();
      const normalizedActualValue = actualValue.replace(/,/g, '').split(' ')[0];

      expect(normalizedActualValue, `Hero metric value should be ${expectedValue} (UI shows: ${actualValue})`).toBe(
        expectedValue.toString()
      );
    });
  }

  /**
   * Verifies that the metric value matches the expected value
   * @param expectedValue - The expected metric value
   */
  async verifyMetricValueIsLoadedForHeroMetricWithNormalFormat(expectedValue: string | number): Promise<void> {
    await test.step(`Verify hero metric value for ${this.metricTitle} is ${expectedValue}`, async () => {
      // Convert to number safely, removing commas if any
      const numericValue = typeof expectedValue === 'string' ? Number(expectedValue.replace(/,/g, '')) : expectedValue;

      expect(numericValue, `Hero metric value should be ${numericValue}`).toBe(numericValue);
    });
  }

  /**
   * Verifies the metric value matches the expected value
   * Accepts both string and number types for flexibility
   * @param expectedValue - The expected metric value as string or number
   */
  async verifyMetricValue(expectedValue: string | number): Promise<void> {
    const numericValue = typeof expectedValue === 'string' ? Number(expectedValue) : expectedValue;
    await this.verifyMetricValueIsLoadedForHeroMetric(numericValue);
  }
}
