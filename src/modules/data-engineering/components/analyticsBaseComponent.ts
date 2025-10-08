import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class AnalyticsBaseComponent extends BaseComponent {
  readonly getAnswerTitle: (title: string) => Locator;
  readonly getAnswerSubTitle: (subTitle: string) => Locator;
  readonly getTableColumnHeaderText: (metricTitle: string) => Promise<Locator[]>;
  readonly getNoDataMessage: (title: string) => Locator;
  readonly getTableData: (metricTitle: string) => Promise<Locator[]>;

  constructor(page: Page) {
    super(page);

    const frame = this.page.locator('[id="_thoughtspot-embed"]').contentFrame();

    this.getAnswerTitle = (title: string) =>
      this.page.locator('[id="_thoughtspot-embed"]').contentFrame().getByRole('heading', { name: title, exact: true });

    this.getAnswerSubTitle = (subTitle: string) =>
      this.page.locator('[id="_thoughtspot-embed"]').contentFrame().getByRole('heading', { name: subTitle });

    this.getTableColumnHeaderText = async (metricTitle: string) => {
      const heading = frame.getByRole('heading', { name: metricTitle });
      return await heading
        .locator('xpath=ancestor::div[contains(@class,"module__verticalLayoutContainer")]/following-sibling::div')
        .locator('div[class*="module__colHeaderText"]')
        .all();
    };

    this.getNoDataMessage = (title: string) =>
      this.page
        .locator('[id="_thoughtspot-embed"]')
        .contentFrame()
        .locator('xpath=//span[@role="heading" and @aria-label="' + title + '"]')
        .locator('xpath=ancestor::div[contains(@class,"module__verticalLayoutContainer")]')
        .locator('xpath=following-sibling::div')
        .locator('xpath=.//h6[text()="No data found for this query"]');

    this.getTableData = async (metricTitle: string) => {
      const heading = frame.getByRole('heading', { name: metricTitle });
      return await heading
        .locator('xpath=ancestor::div[contains(@class,"module__verticalLayoutContainer")]/following-sibling::div')
        .locator('xpath=.//div[@class="ag-center-cols-container"]')
        .locator('xpath=.//div[@aria-rowindex]')
        .all();
    };
  }

  async verifyAnswerTitleIsVisible(title: string): Promise<void> {
    await test.step(`Verify ${title} metric title is visible`, async () => {
      const titleElement = this.getAnswerTitle(title);
      await this.verifier.verifyTheElementIsVisible(titleElement, {
        assertionMessage: `${title} metric title should be visible`,
      });
    });
  }

  async verifyAnswerSubTitleIsVisible(subTitle: string): Promise<void> {
    await test.step(`Verify ${subTitle} metric sub title is visible`, async () => {
      const subTitleElement = this.getAnswerSubTitle(subTitle);
      await this.verifier.verifyTheElementIsVisible(subTitleElement, {
        assertionMessage: `${subTitle} metric sub title should be visible`,
      });
    });
  }

  async verifyTableColumnHeaderTextIsVisible(metricTitle: string, columnTitles: string[]): Promise<void> {
    await test.step(`Verify ${columnTitles} column title is visible`, async () => {
      const columnTitleElements = await this.getTableColumnHeaderText(metricTitle);
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
      const answerElement = this.getAnswerTitle(metricTitle);
      await answerElement.scrollIntoViewIfNeeded();
    });
  }

  async verifyNoDataMessageIsVisible(title: string): Promise<void> {
    await test.step(`Verify low filter result message is visible`, async () => {
      const noDataMessageElement = this.getNoDataMessage(title);
      await this.verifier.verifyTheElementIsVisible(noDataMessageElement, {
        assertionMessage: `${title} low filtered result message should be visible`,
      });
    });
  }
}
