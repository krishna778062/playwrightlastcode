import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class SubTabIndicator extends BasePage {
  readonly editMenuItem: Locator;
  readonly deleteMenuItem: Locator;
  readonly deactivateMenuItem: Locator;
  readonly activateMenuItem: Locator;
  readonly activeMenuItem: Locator;
  readonly deleteButton: Locator;
  readonly scheduledFilterTab: Locator;
  readonly pageContainer: Locator;
  readonly createdColumnButton: Locator;
  dataGridContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.pageContainer = page.getByTestId('pageContainer-page');
    this.editMenuItem = page.getByRole('menuitem', { name: 'Edit', exact: true });
    this.deleteMenuItem = page.getByRole('menuitem', { name: 'Delete', exact: true });
    this.deactivateMenuItem = page.getByRole('menuitem', { name: 'Deactivate' });
    this.activateMenuItem = page.getByRole('menuitem', { name: 'Activate' });
    this.activeMenuItem = page.getByRole('menuitem', { name: 'Activate' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.scheduledFilterTab = page.locator('[id="recurringAwardFiltersSCHEDULED"]');
    this.dataGridContainer = page.locator('[class*="DataGrid"]');
    this.createdColumnButton = page.locator('[class*="DataGrid"] button[aria-label="Created"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.pageContainer);
  }

  /**
   * This method returns a locator for indicator tab by name.
   * @param {string} tabName - name of the tab
   * @returns {Locator} - The locator for the redeem button
   */
  getTab(tabName: string): Locator {
    return this.page.getByRole('checkbox', { name: `${tabName}`, exact: true });
  }

  /**
   * This method returns a locator for table cell.
   * @param {string} cellValue - inner text of cell
   * @returns {Locator} - The locator for the redeem button
   */
  getCell(cellValue: string): Locator {
    return this.page.getByRole('cell', { name: `${cellValue}`, exact: true });
  }

  /**
   * This method returns a locator for table row.
   * @param {string} cellValue - inner text of cell
   * @returns {Locator} - The locator for the redeem button
   */
  getRowByAwardName(cellValue: string): Locator {
    return this.page.getByRole('cell', { name: `${cellValue}`, exact: true }).locator('..');
  }

  /**
   * This method returns a locator for table cell by row index and column index.
   * @param {number} rowIndex - index of the row
   * @param {number} colIndex - index of the column
   * @returns {Locator} - The locator for the table cell
   */
  getTableCell(rowIndex: number, colIndex: number): Locator {
    return this.page.locator('[class*="DataGrid"] > table > tbody > tr').nth(rowIndex).locator('td').nth(colIndex);
  }

  /**
   * This method returns a locator for the 3 dots button.
   * @param {string | number} identifier - The cell value (string) or row index (number)
   * @returns {Locator} - The locator for the more button
   */
  getThreeDotsButton(identifier: string | number): Locator {
    if (typeof identifier === 'string') {
      return this.getRowByAwardName(identifier).getByRole('button', { name: 'Show more' });
    } else if (typeof identifier === 'number') {
      return this.getRowByIndex(identifier).getByRole('button', { name: 'Show more' });
    }
    throw new Error('Invalid identifier type. Must be a string (cell value) or number (row index).');
  }

  /**
   * This method returns a locator for table row by index.
   * @param {number} index - index of the row
   * @returns {Locator} - The locator for the table row
   */
  getRowByIndex(index: number): Locator {
    return this.page.locator('tr[data-testid*="dataGridRow"]').nth(index);
  }
  /**
   * This method returns a locator for button.
   * @param {string} buttonText - inner text of button
   * @returns {Locator} - The locator for the button
   */
  getButton(buttonText: string, type: 'link' | 'button' = 'button'): Locator {
    return this.page.getByRole(type, { name: `${buttonText}`, exact: true });
  }

  /**
   * Click a column header button in the data grid, optionally multiple times (e.g., to toggle sort).
   * @param columnLabel aria-label of the column header (e.g., 'Created')
   * @param clickCount number of clicks to perform (default 1)
   */
  async clickOnColumnButton(columnLabel: string, clickCount: number): Promise<void> {
    const columnButton = this.page.locator('[class*="DataGrid"] button[aria-label="' + columnLabel + '"]').first();
    await this.verifier.verifyTheElementIsVisible(columnButton);
    for (let i = 0; i < clickCount; i++) {
      await columnButton.click();
    }
  }

  async checkTheAwardNameInTable(expectedawardName: string): Promise<void> {
    const awardNameCell = this.getTableCell(0, 0);
    await this.verifier.verifyTheElementIsVisible(awardNameCell);
    await this.verifier.verifyElementHasText(awardNameCell, expectedawardName);
  }

  async checkRecentlyCreatedAwardStatus(expectedawardStatus: string): Promise<void> {
    const awardStatusCell = this.getTableCell(0, 4);
    await this.verifier.verifyTheElementIsVisible(awardStatusCell);
    await this.verifier.verifyElementHasText(awardStatusCell, expectedawardStatus);
  }

  /**
   * Clean up the created award
   */
  async cleanupCreatedAward(): Promise<void> {
    if (this.page.isClosed()) {
      console.warn('Cleanup skipped: page already closed');
      return;
    }
    await this.getThreeDotsButton(0).click();
    // await expect(this.deleteMenuItem).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await this.deleteMenuItem.click();
    // await expect(this.deleteButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await this.deleteButton.click();
  }
}
