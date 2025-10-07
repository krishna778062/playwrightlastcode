import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export interface HeroMetric {
  title: string;
  value: string;
}

export class HeroMetricsComponent extends BaseComponent {
  readonly getMetricByTitle: (title: string) => Locator;
  readonly getMetricValueByTitle: (title: string) => Locator;
  readonly getMetricBySubTitle: (subTitle: string) => Locator;
  readonly getMetricByColumnTitle: (metricTitle: string) => Promise<Locator[]>;

  constructor(page: Page) {
    super(page);

    this.getMetricByTitle = (title: string) =>
      this.page.locator('[id="_thoughtspot-embed"]').contentFrame().getByRole('heading', { name: title, exact: true });

    this.getMetricValueByTitle = (title: string) =>
      this.getMetricByTitle(title)
        .locator('xpath=ancestor::div[contains(@class, "answer-content-module__answerVizContainer")]')
        .locator('[data-testid="kpi_herodata"]')
        .first();

    this.getMetricBySubTitle = (subTitle: string) =>
      this.page.locator('[id="_thoughtspot-embed"]').contentFrame().getByRole('heading', { name: subTitle });

    this.getMetricByColumnTitle = async (metricTitle: string) => {
      const frame = this.page.locator('[id="_thoughtspot-embed"]').contentFrame();
      const heading = frame.getByRole('heading', { name: metricTitle });
      return await heading
        .locator('xpath=ancestor::div[contains(@class,"module__verticalLayoutContainer")]/following-sibling::div')
        .locator('div[class*="module__colHeaderText"]')
        .all();
    };
  }

  /**
   * Gets the value of a specific metric by title
   * @param title - The metric title (e.g., "Reactions", "Shares")
   * @returns The metric value as string
   */
  async getMetricValue(title: string): Promise<string> {
    return await test.step(`Get ${title} metric value`, async () => {
      const valueElement = this.getMetricValueByTitle(title);
      await this.verifier.verifyTheElementIsVisible(valueElement, { timeout: 30_000 });
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

  async verifyMetricSubTitleIsVisible(subTitle: string): Promise<void> {
    await test.step(`Verify ${subTitle} metric sub title is visible`, async () => {
      const subTitleElement = this.getMetricBySubTitle(subTitle);
      await this.verifier.verifyTheElementIsVisible(subTitleElement, {
        assertionMessage: `${subTitle} metric sub title should be visible`,
      });
    });
  }

  async verifyColumnTitleIsVisible(metricTitle: string, columnTitles: string[]): Promise<void> {
    await test.step(`Verify ${columnTitles} column title is visible`, async () => {
      const columnTitleElements = await this.getMetricByColumnTitle(metricTitle);
      expect(columnTitleElements.length, `${metricTitle} should have ${columnTitles.length} column titles`).toBe(
        columnTitles.length
      );
      for (let i = 0; i < columnTitleElements.length; i++) {
        const columnTitleElement = columnTitleElements[i].getByText(columnTitles[i], { exact: true });
        await this.verifier.verifyTheElementIsVisible(columnTitleElement, {
          assertionMessage: `${columnTitles[i]} column title should be visible`,
        });
      }
    });
  }

  async scrollToAnswer(metricTitle: string): Promise<void> {
    await test.step(`Scroll to ${metricTitle} answer`, async () => {
      const answerElement = this.getMetricByTitle(metricTitle);
      await answerElement.scrollIntoViewIfNeeded();
    });
  }

  async verifySocialCampaignShareDataIsCorrect(): Promise<void> {
    await test.step(`Verify social campaign share data is correct`, async () => {
      const socialCampaignShareData = await this.getMetricByColumnTitle('Social campaign share distribution');
      expect(socialCampaignShareData.length, `Social campaign share data should have 3 columns`).toBe(3);
    });
  }
}
