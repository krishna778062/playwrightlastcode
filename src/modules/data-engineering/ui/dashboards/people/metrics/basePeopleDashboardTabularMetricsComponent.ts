import { FrameLocator, Page, test } from '@playwright/test';

import { TabluarMetricsComponent } from '@/src/modules/data-engineering/ui/components/tabluarMetricsComponent';

/**
 * Base Tabular Metrics Component for People Dashboard
 * Extends TabluarMetricsComponent with People Dashboard specific behavior:
 * - Uses exact: true for heading matching to ensure correct table container selection
 * - Verifies metric title visibility within container before data comparison
 */
export class PeopleDashboardTabularMetricsComponent extends TabluarMetricsComponent {
  constructor(page: Page, thoughtSpotIframe: FrameLocator, metricTitle: string) {
    // Create exact-match container for People Dashboard before calling parent
    // This ensures we match the exact heading and select the correct table container
    const exactMatchContainer = thoughtSpotIframe
      .locator('[class*="answer-content-module__answerVizContainer"]')
      .filter({
        has: thoughtSpotIframe.getByRole('heading', { name: metricTitle, exact: true }),
      })
      .first();

    // Call parent constructor - it will create a container with exact: false
    // We'll override rootLocator and dependent properties after
    super(page, thoughtSpotIframe, metricTitle);

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
   * Override compareUIDataWithDBRecords to add People Dashboard specific verification
   * Verifies the correct table container is selected before data comparison
   */
  async compareUIDataWithDBRecords<T extends Record<string, any>>(
    dbData: T[],
    dataMapper: (item: T) => Record<string, string>,
    keyColumn: string
  ): Promise<void> {
    await test.step(`Verify ${this.metricTitle} data is correct`, async () => {
      // Verify we're reading from the correct table by checking the heading is within the container
      // This ensures the rootLocator is pointing to the correct table container
      await test.step('Verify correct table container is selected', async () => {
        const heading = (this as any).rootLocator.getByRole('heading', { name: this.metricTitle, exact: true });
        await this.verifier.verifyTheElementIsVisible(heading, {
          timeout: 20_000,
          assertionMessage: `Metric title "${this.metricTitle}" should be visible within the container`,
        });
      });

      // Continue with the rest of the comparison logic
      //check if the db data is empty then table ON UI should be empty
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
