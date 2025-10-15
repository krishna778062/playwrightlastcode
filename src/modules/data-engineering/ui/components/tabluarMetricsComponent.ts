import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

/**
 * This is a Tabular Metrics Component
 * which shows a tabular data
 *  - header rows
 *  - data rows
 *
 * Additional features
 *  - sort button
 *  - drill down
 */
export class TabluarMetricsComponent extends BaseComponent {
  readonly sortButton: Locator;
  readonly sortDirectionButton: (direction: 'Ascending' | 'Descending') => Locator;
  readonly drillDownButton: Locator;
  readonly drillDownOptionsMenu: Locator;
  readonly drillDownOption: (option: string) => Locator;

  readonly headerRow: Locator;
  readonly dataRow: Locator;

  constructor(
    page: Page,
    readonly thoughtSpotIframe: FrameLocator,
    metricTitle: string
  ) {
    // Find the container internally
    const container = thoughtSpotIframe.locator('[class*="answer-content-module__answerVizContainer"]').filter({
      has: thoughtSpotIframe.getByRole('heading', { name: metricTitle, exact: true }),
    });

    super(page, container);

    /// table elements ///
    this.headerRow = this.rootLocator
      .getByRole('row')
      .filter({ has: this.rootLocator.locator('[class*="ag-header-row"]') });

    this.dataRow = this.rootLocator
      .getByRole('row')
      .filter({ hasNot: this.rootLocator.locator('[class*="ag-header-row"]') });

    this.sortButton = this.thoughtSpotIframe.getByRole('tab', { name: 'Sort' });
    this.sortDirectionButton = (direction: 'Ascending' | 'Descending') =>
      this.thoughtSpotIframe.getByRole('tab', { name: direction });
    this.drillDownButton = this.thoughtSpotIframe.getByRole('tab', { name: 'Drill down' });
    this.drillDownOptionsMenu = this.thoughtSpotIframe.getByTestId('DRILL');
    this.drillDownOption = (option: string) => this.thoughtSpotIframe.getByRole('tab', { name: option });
  }

  /**
   * Gets the number of data rows in the table
   */
  async getRowCount(): Promise<number> {
    return await test.step(`Get row count for table`, async () => {
      const rows = await this.rootLocator.getByRole('row').all();

      // Filter out header row by checking if it contains columnheader
      let dataRowCount = 0;
      for (const row of rows) {
        const hasColumnHeader = (await row.getByRole('columnheader').count()) > 0;
        if (!hasColumnHeader) {
          dataRowCount++;
        }
      }

      return dataRowCount;
    });
  }

  /**
   * Gets all column headers from the table
   */
  async getHeaders(): Promise<string[]> {
    return await test.step(`Get headers for table`, async () => {
      const headerCells = await this.rootLocator.getByRole('columnheader').all();

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
   * Gets all table data as a 2D array
   */
  async getAllData(): Promise<string[][]> {
    return await test.step(`Get all data for table`, async () => {
      const rows = await this.rootLocator.getByRole('row').all();

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
   * Gets all table data as objects with column names as keys
   * @returns Array of objects where keys are column headers and values are cell data
   */
  async getAllDataAsObjects(): Promise<Record<string, string>[]> {
    return await test.step(`Get all data as objects for table`, async () => {
      const headers = await this.getHeaders();
      const allData = await this.getAllData();

      return allData.map(row => {
        const rowObject: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowObject[header] = row[index] || '';
        });
        return rowObject;
      });
    });
  }

  /**
   * Gets a specific value from a table row
   * @param params - Query parameters in natural language style
   * @param params.where - Condition: find rows where this column equals this value
   * @param params.select - Which column value to return
   */
  async getValueByIdentifier(params: {
    where: {
      column: string;
      equals: string;
    };
    select: string;
  }): Promise<string> {
    const { where, select } = params;

    return await test.step(`get ${select} where ${where.column} = ${where.equals}`, async () => {
      const headers = await this.getHeaders();
      const whereIndex = headers.indexOf(where.column);
      const selectIndex = headers.indexOf(select);

      if (whereIndex === -1) {
        throw new Error(`Column "${where.column}" not found in table`);
      }
      if (selectIndex === -1) {
        throw new Error(`Column "${select}" not found in table`);
      }

      const allData = await this.getAllData();

      for (const row of allData) {
        if (row[whereIndex] === where.equals) {
          return row[selectIndex];
        }
      }

      throw new Error(`No row found where ${where.column} = ${where.equals}`);
    });
  }

  /**
   * Gets an entire row from a table
   * @param params - Query parameters in natural language style
   * @param params.where - Condition: find rows where this column equals this value
   */
  async getRowByIdentifier(params: {
    where: {
      column: string;
      equals: string;
    };
  }): Promise<string[]> {
    const { where } = params;

    return await test.step(`get row where ${where.column} = ${where.equals}`, async () => {
      const headers = await this.getHeaders();
      const whereIndex = headers.indexOf(where.column);

      if (whereIndex === -1) {
        throw new Error(`Column "${where.column}" not found in table`);
      }

      const allData = await this.getAllData();

      for (const row of allData) {
        if (row[whereIndex] === where.equals) {
          return row;
        }
      }

      throw new Error(`No row found where ${where.column} = ${where.equals}`);
    });
  }

  // Validation methods
  async verifyRowCount(expectedCount: number): Promise<void> {
    await test.step(`verify tabular data - has ${expectedCount} rows`, async () => {
      const actualCount = await this.getRowCount();
      expect(actualCount).toBe(expectedCount);
    });
  }

  async verifyHeaders(expectedHeaders: string[]): Promise<void> {
    await test.step(`verify tabular data - headers are correct`, async () => {
      const actualHeaders = await this.getHeaders();
      expect(actualHeaders).toEqual(expectedHeaders);
    });
  }

  async verifyIdentifierExists(params: {
    where: {
      column: string;
      equals: string;
    };
  }): Promise<void> {
    const { where } = params;

    await test.step(`verify tabular data - has value - ${where.equals} when searching in column - ${where.column}`, async () => {
      try {
        await this.getRowByIdentifier({ where });
      } catch {
        throw new Error(`${where.equals} not found in ${where.column} column`);
      }
    });
  }

  /**
   * Verifies that the tabular data is loaded
   */
  async verifyTabluarDataIsLoaded(): Promise<void> {
    await test.step(`verify tabular data - table is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.rootLocator, {
        timeout: 40_000,
        assertionMessage: `table should be visible`,
      });
    });

    await test.step(`verify tabular data - table is loaded`, async () => {
      const dataCells = this.rootLocator.getByRole('gridcell');
      await this.verifier.verifyCountOfElementsIsGreaterThan(dataCells, 0, {
        timeout: 40_000,
        assertionMessage: `table should have data cells`,
      });
    });
  }

  /**
   * Sorts a table by the specified column
   * @param columnName - The column name to sort by
   * @param direction - Sort direction ('asc' or 'desc')
   */
  async sortTableByColumn(columnName: string, direction: 'Ascending' | 'Descending' = 'Ascending'): Promise<void> {
    return await test.step(`Sort table by ${columnName} ${direction}`, async () => {
      // Find the column header
      const columnHeader = this.rootLocator.getByRole('columnheader', { name: columnName });

      // Hover over the column header to reveal the menu button
      await columnHeader.hover();

      // Wait for and click the header menu button
      const headerMenuButton = columnHeader.locator('button');
      await this.clickOnElement(headerMenuButton, { stepInfo: `Click on header menu button to open more menu` });

      // Wait for menu to appear and click on "Sort" option
      await this.clickOnElement(this.sortButton, { stepInfo: `Click on Sort option` });

      // Click on the specific sort direction
      await this.clickOnElement(this.sortDirectionButton(direction), { stepInfo: `Click on ${direction} option` });
    });
  }

  /**
   * Finds a specific row in the table based on identifier
   * @param tableContainer - The table container locator
   * @param rowIdentifier - Object to identify the row
   * @returns The target row locator
   */
  private async findRowByIdentifier(
    tableContainer: Locator,
    rowIdentifier: { column: string; value: string }
  ): Promise<Locator> {
    const rows = await tableContainer.getByRole('row').all();
    const headers = await this.getHeaders();

    for (const row of rows) {
      const isHeaderRow = (await row.getByRole('columnheader').count()) > 0;
      if (isHeaderRow) continue;

      const cells = await row.getByRole('gridcell').all();
      const identifierIndex = headers.indexOf(rowIdentifier.column);

      if (identifierIndex !== -1 && cells[identifierIndex]) {
        const cellValue = await cells[identifierIndex].textContent();
        if (cellValue?.trim() === rowIdentifier.value) {
          return row;
        }
      }
    }

    throw new Error(`Row with ${rowIdentifier.column} = ${rowIdentifier.value} not found`);
  }

  /**
   * Gets a specific cell from a row by column name
   * @param row - The row locator
   * @param columnName - The column name
   * @returns The target cell locator
   */
  private async getCellByColumnName(row: Locator, columnName: string): Promise<Locator> {
    const headers = await this.getHeaders();
    const columnIndex = headers.indexOf(columnName);

    if (columnIndex === -1) {
      throw new Error(`Column ${columnName} not found`);
    }

    const cells = await row.getByRole('gridcell').all();
    return cells[columnIndex];
  }

  /**
   * Gets a specific row's data as an object with column headers as keys
   * @param rowIndex - Zero-based index of the data row (0 = first data row, 1 = second data row, etc.)
   * @returns Object with column headers as keys and cell values as values
   * @example
   * // Get first data row: { 'Social platform': 'Twitter', 'Share count': '1', 'Platform share contribution (%)': '100.0%' }
   * const firstRow = await table.getRowValuesAsObject(0);
   */
  async getRowValuesAsObjectForRowIndex(rowIndex: number): Promise<Record<string, string>> {
    const headers = await this.getHeaders();
    const rows = await this.rootLocator.getByRole('row').all();

    // Skip header row (index 0) and get the data row
    const dataRowIndex = rowIndex + 1; // +1 to skip header row

    if (dataRowIndex >= rows.length) {
      throw new Error(`Row at index ${rowIndex} not found. Table has ${rows.length - 1} data rows.`);
    }

    const targetRow = rows[dataRowIndex];

    const cells = await targetRow.getByRole('gridcell').all();
    const rowObject: Record<string, string> = {};

    for (let i = 0; i < headers.length; i++) {
      const cellText = await cells[i].textContent();
      rowObject[headers[i]] = cellText?.trim() || '';
    }

    return rowObject;
  }

  /**
   * Drills down on a specific cell value
   * @param rowIdentifier - Object to identify the row (e.g., { column: 'Social platform', value: 'Twitter' })
   * @param targetColumn - The column to drill down on
   */
  async drillDownOnCell(rowIdentifier: { column: string; value: string }, targetColumn: string): Promise<void> {
    return await test.step(`Drill down on ${targetColumn} for ${rowIdentifier.value}`, async () => {
      // Find the specific row
      const targetRow = await this.findRowByIdentifier(this.rootLocator, rowIdentifier);

      // Get the target cell
      const targetCell = await this.getCellByColumnName(targetRow, targetColumn);

      // Right-click on the cell to open context menu
      await targetCell.click({ button: 'right' });

      // Wait for context menu and click drill down option
      await this.clickOnElement(this.drillDownButton, { stepInfo: `Click on drill down option` });

      await this.page.waitForTimeout(10_000);
      // Verify drill down options menu is visible
      await this.verifier.verifyTheElementIsVisible(this.drillDownOptionsMenu, {
        timeout: 10_000,
        assertionMessage: `Drill down options menu should be visible`,
      });
    });
  }

  /**** Verification methods ****/

  async verifyRowCountIs(expectedCount: number): Promise<void> {
    await test.step(`verify tabular data - row count is ${expectedCount}`, async () => {
      await expect(this.dataRow, `expecting data row to have ${expectedCount} rows`).toHaveCount(expectedCount);
    });
  }

  async verifyHeadersAre(expectedHeaders: string[]): Promise<void> {
    await test.step(`verify tabular data - headers are ${expectedHeaders}`, async () => {
      const actualHeaders = await this.getHeaders();
      expect(actualHeaders).toEqual(expectedHeaders);
    });
  }
}
