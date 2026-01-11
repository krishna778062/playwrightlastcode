import { expect, FrameLocator, Page, test } from '@playwright/test';

import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

/**
 * Base Tabular Metrics Component for On-Site Dashboard
 * Extends TabluarMetricsComponent with On-Site specific behavior
 */
export class BaseOnSiteTabularMetricsComponent extends TabluarMetricsComponent {
  readonly metricSubtitle: string;

  constructor(page: Page, thoughtSpotIframe: FrameLocator, metricTitle: string, metricSubtitle: string) {
    // Create exact-match container for On-Site Dashboard
    const exactMatchContainer = thoughtSpotIframe
      .locator('[class*="answer-content-module__answerVizContainer"]')
      .filter({
        has: thoughtSpotIframe.getByRole('heading', { name: metricTitle, exact: true }),
      })
      .first();

    // Call parent constructor
    super(page, thoughtSpotIframe, metricTitle);

    // Store subtitle for verification
    this.metricSubtitle = metricSubtitle;

    // Replace rootLocator with the exact-match container
    (this as any).rootLocator = exactMatchContainer;

    // Re-initialize properties that depend on rootLocator
    (this as any).headerRow = exactMatchContainer
      .getByRole('row')
      .filter({ has: exactMatchContainer.locator('[class*="ag-header-row"]') });

    (this as any).dataRow = exactMatchContainer
      .getByRole('row')
      .filter({ hasNot: exactMatchContainer.locator('[class*="ag-header-row"]') });

    (this as any).downloadCSVButton = exactMatchContainer.getByRole('button', { name: 'Download CSV' });
  }

  /**
   * Override compareUIDataWithDBRecords to add On-Site Dashboard specific verification
   */
  async compareUIDataWithDBRecords<T extends Record<string, any>>(
    dbData: T[],
    dataMapper: (item: T) => Record<string, string>,
    keyColumn: string
  ): Promise<void> {
    await test.step(`Verify ${this.metricTitle} data is correct`, async () => {
      // Verify we're reading from the correct table by checking the heading is within the container
      await test.step('Verify correct table container is selected', async () => {
        const heading = (this as any).rootLocator.getByRole('heading', { name: this.metricTitle, exact: true });
        await this.verifier.verifyTheElementIsVisible(heading, {
          timeout: 20_000,
          assertionMessage: `Metric title "${this.metricTitle}" should be visible within the container`,
        });
      });

      // Verify subtitle is visible and matches the constant
      if (this.metricSubtitle) {
        await test.step('Verify metric subtitle is visible and matches constant', async () => {
          const subtitle = this.thoughtSpotIframe.getByRole('heading', { name: this.metricSubtitle });
          // Verify the subtitle text matches exactly with the constant
          await expect(subtitle, `Metric subtitle should be "${this.metricSubtitle}"`).toHaveText(this.metricSubtitle);
        });
      }

      // Check if the db data is empty then table ON UI should be empty
      if (dbData.length === 0) {
        await this.veirfyNoDataStateIsVisibleForTable();
      } else {
        // Get UI data as objects with column names as keys
        await this.verifyTabluarDataIsLoaded();

        const uiDataObjects = await this.getAllDataAsObjects();
        console.log('UI Data Objects:', uiDataObjects);

        // Convert ALL DB data to UI format for comparison (no slicing - use all records)
        const mappedDbData = dbData.map(dataMapper);
        console.log('Mapped DB Data (all records):', mappedDbData);

        await (this as any).runDataComparison(uiDataObjects, mappedDbData, keyColumn);
      }
    });
  }
}
