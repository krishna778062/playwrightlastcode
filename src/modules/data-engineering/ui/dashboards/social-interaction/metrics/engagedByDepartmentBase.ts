import { GroupByOnUserParameter } from '@data-engineering/constants/filters';
import { FilterOptions } from '@data-engineering/helpers/baseAnalyticsQueryHelper';
import { CSVValidationUtil } from '@data-engineering/utils/csvValidationUtil';
import { FrameLocator, Locator, Page, test } from '@playwright/test';

import { TabluarMetricsComponent } from '../../../components/tabluarMetricsComponent';

import { FileUtil } from '@/src/core/utils/fileUtil';

/**
 * Shared column names for Engaged by Department tables
 */
export enum EngagedByDepartmentColumns {
  DEPARTMENT = 'Department',
  REACTIONS = 'Reactions',
  FEED_POSTS_CONTENT_COMMENTS = 'Feed posts & content comments',
  REPLIES = 'Replies',
  SHARES = 'Shares',
  FAVORITES = 'Favorites',
  TOTAL_ENGAGEMENT = 'Total engagement',
}

/**
 * Base class for Engaged by Department metrics
 * Contains shared verification logic for both Most and Least engaged
 */
export abstract class EngagedByDepartmentBase extends TabluarMetricsComponent {
  private dynamicRootLocator?: Locator;

  constructor(page: Page, iframe: FrameLocator, metricTitle: string) {
    super(page, iframe, metricTitle);
  }

  /**
   * Gets the active root locator (dynamic if available, otherwise default)
   */
  private getActiveRootLocator(): Locator {
    return this.dynamicRootLocator || this.rootLocator;
  }

  /**
   * Override scrollToComponent to handle dynamic titles
   * Uses pattern matching to find the component regardless of the groupBy value
   */
  async scrollToComponent(groupBy?: GroupByOnUserParameter): Promise<void> {
    await test.step('Scroll to component', async () => {
      if (groupBy) {
        // Use dynamic title based on groupBy
        const baseTitle = this.metricTitle.replace(/ Department/i, '');
        const dynamicTitle = `${baseTitle} ${groupBy}`;
        const dynamicContainer = this.thoughtSpotIframe
          .locator('[class*="answer-content-module__answerVizContainer"]')
          .filter({
            has: this.thoughtSpotIframe.getByRole('heading', { name: dynamicTitle, exact: false }),
          });
        await dynamicContainer.scrollIntoViewIfNeeded();
      } else {
        // Use default behavior
        await this.rootLocator.scrollIntoViewIfNeeded();
      }
    });
  }

  /**
   * Verifies that the engaged by department data matches the snowflake data
   * Uses the robust validation from base component
   * @param snowflakeDataArray - The snowflake data array
   * @param groupBy - Optional groupBy parameter to determine the column name (defaults to Department)
   */
  async verifyUIDataMatchesWithSnowflakeData(
    snowflakeDataArray: Array<Record<string, any>>,
    groupBy?: GroupByOnUserParameter
  ): Promise<void> {
    // Determine the column name based on groupBy, default to 'Department'
    const groupByColumn = groupBy || GroupByOnUserParameter.DEPARTMENT;

    // Update rootLocator if groupBy is provided to use dynamic title
    if (groupBy) {
      await this.updateRootLocatorForDynamicTitle(groupBy);
      await this.verifyDynamicTitle(groupBy);
    }

    // Helper to get case-insensitive property value
    const getCaseInsensitiveValue = (obj: any, key: string): any => {
      const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
      return foundKey ? obj[foundKey] : obj[key];
    };

    const dataMapper = (item: Record<string, any>) => ({
      [groupByColumn]: getCaseInsensitiveValue(item, groupByColumn),
      [EngagedByDepartmentColumns.REACTIONS]: getCaseInsensitiveValue(item, 'Reactions').toString(),
      [EngagedByDepartmentColumns.FEED_POSTS_CONTENT_COMMENTS]: getCaseInsensitiveValue(
        item,
        'Feed posts & content comments'
      ).toString(),
      [EngagedByDepartmentColumns.REPLIES]: getCaseInsensitiveValue(item, 'Replies').toString(),
      [EngagedByDepartmentColumns.SHARES]: getCaseInsensitiveValue(item, 'Shares').toString(),
      [EngagedByDepartmentColumns.FAVORITES]: getCaseInsensitiveValue(item, 'Favorites').toString(),
      [EngagedByDepartmentColumns.TOTAL_ENGAGEMENT]: getCaseInsensitiveValue(item, 'Total engagement').toString(),
    });

    await this.compareUIDataWithDBRecords(snowflakeDataArray, dataMapper, groupByColumn);
  }

  /**
   * Updates rootLocator to use dynamic title based on groupBy
   * @param groupBy - The groupBy parameter
   */
  async updateRootLocatorForDynamicTitle(groupBy: GroupByOnUserParameter): Promise<void> {
    await test.step(`Update rootLocator for dynamic title: ${groupBy}`, async () => {
      const baseTitle = this.metricTitle.replace(/ Department/i, '');
      const dynamicTitle = `${baseTitle} ${groupBy}`;
      const dynamicContainer = this.thoughtSpotIframe
        .locator('[class*="answer-content-module__answerVizContainer"]')
        .filter({
          has: this.thoughtSpotIframe.getByRole('heading', { name: dynamicTitle, exact: false }),
        });
      // Update the rootLocator by creating a new BaseComponent with the dynamic container
      // We need to wait for it to be visible first
      await dynamicContainer.waitFor({ state: 'visible', timeout: 30_000 });
      // Store the dynamic container for use in other methods
      this.dynamicRootLocator = dynamicContainer;
    });
  }

  /**
   * Verifies the dynamic title based on groupBy parameter
   * e.g., "Most engaged by Location" or "Least engaged by Department"
   * @param groupBy - The groupBy parameter
   */
  private async verifyDynamicTitle(groupBy: GroupByOnUserParameter): Promise<void> {
    await test.step(`Verify metric title matches groupBy: ${groupBy}`, async () => {
      // Extract the base title (e.g., "Most engaged by" or "Least engaged by")
      // Handle both "Department" and "department" in the title
      const baseTitle = this.metricTitle.replace(/ Department/i, '');
      const expectedTitle = `${baseTitle} ${groupBy}`;

      // Use dynamic container if available, otherwise use rootLocator
      const container = this.getActiveRootLocator();
      const titleLocator = container.getByRole('heading', { name: expectedTitle });
      await this.verifier.verifyTheElementIsVisible(titleLocator, {
        assertionMessage: `Metric title should be "${expectedTitle}"`,
        timeout: 30_000,
      });
    });
  }

  async verifyDataIsLoaded(): Promise<void> {
    await this.verifyTabluarDataIsLoaded();
  }

  /**
   * Override verifyTabluarDataIsLoaded to use dynamic container when available
   */
  async verifyTabluarDataIsLoaded(): Promise<void> {
    await test.step(`verify tabular data - table is visible`, async () => {
      const container = this.getActiveRootLocator();
      await this.verifier.verifyTheElementIsVisible(container, {
        timeout: 40_000,
        assertionMessage: `table should be visible`,
      });
    });

    await test.step(`verify tabular data - table is loaded`, async () => {
      const container = this.getActiveRootLocator();
      const dataCells = container.getByRole('gridcell');
      await this.verifier.verifyCountOfElementsIsGreaterThan(dataCells, 0, {
        timeout: 40_000,
        assertionMessage: `table should have data cells`,
      });
    });
  }

  /**
   * Override getHeaders to use dynamic container when available
   */
  async getHeaders(): Promise<string[]> {
    return await test.step(`Get headers for table`, async () => {
      const container = this.getActiveRootLocator();
      const headerCells = await container.getByRole('columnheader').all();

      const headers: string[] = [];
      for (const cell of headerCells) {
        const text = await cell.textContent();
        if (text) {
          headers.push(text.trim());
        }
      }
      return headers;
    });
  }

  /**
   * Override getAllData to use dynamic container when available
   */
  async getAllData(): Promise<string[][]> {
    return await test.step(`Get all data for table`, async () => {
      const container = this.getActiveRootLocator();
      const rows = await container.getByRole('row').all();

      const allData: string[][] = [];
      for (const row of rows) {
        // Skip header row by checking if it contains columnheader
        const isHeaderRow = (await row.getByRole('columnheader').count()) > 0;
        if (isHeaderRow) continue;

        const cells = await row.getByRole('gridcell').all();
        const rowData: string[] = [];

        for (const cell of cells) {
          const text = await cell.textContent();
          rowData.push(text?.trim() || '');
        }
        allData.push(rowData);
      }
      return allData;
    });
  }

  /**
   * Override downloadDataAsCSV to use dynamic container when available
   */
  async downloadDataAsCSV(): Promise<{ filePath: string; fileName: string }> {
    return await test.step(`download data as csv`, async () => {
      const container = this.getActiveRootLocator();
      const downloadAction = async () => {
        await container.hover();
        // Use the download button scoped to the active container
        const downloadButton = container.getByRole('button', { name: 'Download CSV' });
        await this.verifier.verifyTheElementIsVisible(downloadButton, {
          timeout: 10_000,
          assertionMessage: `Download csv button should be visible`,
        });
        await this.clickOnElement(downloadButton, { stepInfo: `Click on download csv button` });
      };
      return await this.downloadAndSaveFile(downloadAction, { stepInfo: `Download csv file` });
    });
  }

  /**
   * Downloads CSV and validates it against database data
   * @param snowflakeDataArray - The snowflake data array
   * @param filterBy - Filter options including time period
   */
  async verifyCSVDataMatchesWithDBData(
    snowflakeDataArray: Array<Record<string, any>>,
    filterBy: FilterOptions
  ): Promise<void> {
    // Determine the column name based on groupBy, default to 'Department'
    const groupByColumn = filterBy.groupBy || GroupByOnUserParameter.DEPARTMENT;

    // Calculate dynamic metric title if groupBy is provided
    const metricTitle = filterBy.groupBy
      ? `${this.metricTitle.replace(/ Department/i, '')} ${filterBy.groupBy}`
      : this.metricTitle;

    // Update rootLocator if groupBy is provided to use dynamic title
    if (filterBy.groupBy) {
      await this.updateRootLocatorForDynamicTitle(filterBy.groupBy);
    }

    // Download CSV
    const { filePath } = await this.downloadDataAsCSV();

    try {
      // Validate CSV against DB data
      await CSVValidationUtil.validateAndAssert({
        csvPath: filePath,
        expectedDBData: snowflakeDataArray as any,
        metricName: metricTitle,
        selectedPeriod: filterBy.timePeriod,
        customStartDate: filterBy.customStartDate,
        customEndDate: filterBy.customEndDate,
        expectedHeaders: [
          groupByColumn,
          EngagedByDepartmentColumns.REACTIONS,
          EngagedByDepartmentColumns.FEED_POSTS_CONTENT_COMMENTS,
          EngagedByDepartmentColumns.REPLIES,
          EngagedByDepartmentColumns.SHARES,
          EngagedByDepartmentColumns.FAVORITES,
          EngagedByDepartmentColumns.TOTAL_ENGAGEMENT,
        ],
        transformations: {
          headerMapping: {
            [groupByColumn]: groupByColumn,
            [EngagedByDepartmentColumns.REACTIONS]: 'Reactions',
            [EngagedByDepartmentColumns.FEED_POSTS_CONTENT_COMMENTS]: 'Feed posts & content comments',
            [EngagedByDepartmentColumns.REPLIES]: 'Replies',
            [EngagedByDepartmentColumns.SHARES]: 'Shares',
            [EngagedByDepartmentColumns.FAVORITES]: 'Favorites',
            [EngagedByDepartmentColumns.TOTAL_ENGAGEMENT]: 'Total engagement',
          },
        },
      });
    } finally {
      // Clean up CSV file after validation
      FileUtil.deleteTemporaryFile(filePath);
    }
  }
}
