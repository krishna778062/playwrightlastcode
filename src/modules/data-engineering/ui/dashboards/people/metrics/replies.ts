import { FrameLocator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { PEOPLE_METRICS } from '@/src/modules/data-engineering/constants/peopleMetrics';

export enum RepliesColumns {
  NAME = 'Name',
  REPLIES = 'Replies',
}

export class Replies extends BaseComponent {
  readonly metricTitle = PEOPLE_METRICS.REPLIES.title;
  readonly thoughtSpotIframe: FrameLocator;

  constructor(page: Page, thoughtSpotIframe: FrameLocator) {
    // Use exact match to avoid matching multiple elements
    super(
      page,
      thoughtSpotIframe.locator('[class*="answer-content-module__answerVizContainer"]').filter({
        has: thoughtSpotIframe.getByRole('heading', { name: PEOPLE_METRICS.REPLIES.title, exact: true }),
      })
    );
    this.thoughtSpotIframe = thoughtSpotIframe;
  }

  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<{
      Name: string;
      Replies: number;
    }>
  ): Promise<void> {
    // Get table data from UI
    const tableData = await this.getAllDataAsObjects();

    // Define data mapper - converts DB format to UI format
    const dataMapper = (item: { Name: string; Replies: number }) => ({
      [RepliesColumns.NAME]: item.Name,
      [RepliesColumns.REPLIES]: item.Replies.toString(),
    });

    // Map DB data to UI format
    const mappedDbData = snowflakeDataArray.map(dataMapper);

    // Compare
    for (const uiRow of tableData) {
      const dbRow = mappedDbData.find(db => db[RepliesColumns.NAME] === uiRow[RepliesColumns.NAME]);
      if (!dbRow) {
        throw new Error(`UI row not found in DB: ${uiRow[RepliesColumns.NAME]}`);
      }
      // Compare values
      if (uiRow[RepliesColumns.REPLIES] !== dbRow[RepliesColumns.REPLIES]) {
        throw new Error(
          `Mismatch for ${uiRow[RepliesColumns.NAME]}: UI=${uiRow[RepliesColumns.REPLIES]}, DB=${dbRow[RepliesColumns.REPLIES]}`
        );
      }
    }
  }

  // Get all data from the table as objects
  private async getAllDataAsObjects(): Promise<Record<string, string>[]> {
    const table = this.rootLocator.locator('table').first();
    const rows = await table.locator('tbody tr').all();

    const data: Record<string, string>[] = [];
    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      if (cells.length >= 2) {
        data.push({
          [RepliesColumns.NAME]: cells[0].trim(),
          [RepliesColumns.REPLIES]: cells[1].trim(),
        });
      }
    }
    return data;
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.rootLocator, {
      timeout: 40_000,
      assertionMessage: `${this.metricTitle} should be visible`,
    });
  }
}
