import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class AnalyticsFiltersComponent extends BaseComponent {
  /**
   * Returns the filter pill button by its visible label (Department, Location, People Category, Company name, Period)
   */
  readonly filterGroup: (label: string) => Locator;

  /**
   * Root of the filter dialog (ThoughtSpot popover)
   */
  readonly filterDialog: Locator;

  /**
   * Returns a specific option within an open filter dialog by its visible text
   */
  readonly filterOptionByText: (text: string) => Locator;

  /**
   * Apply and Clear buttons within the filter dialog
   */
  readonly filterApplyButton: Locator;
  readonly filterClearAllButton: Locator;

  constructor(page: Page) {
    super(page);
    this.filterGroup = (label: string) => this.page.getByRole('button', { name: label, exact: true }).first();
    this.filterDialog = this.page.locator('[id*="tippy"]');
    this.filterOptionByText = (text: string) =>
      this.filterDialog.getByRole('option', { name: text, exact: true }).first();
    this.filterApplyButton = this.page.getByRole('button', { name: 'Apply' }).first();
    this.filterClearAllButton = this.page.getByRole('button', { name: 'Clear' }).first();
  }

  /**
   * Opens a filter dialog by label and waits for the dialog to be visible
   * @param label - The filter label to open
   */
  async openFilter(label: string) {
    await test.step(`Open filter: ${label}`, async () => {
      await this.clickOnElement(this.filterGroup(label));
      await expect(this.filterDialog, `Filter dialog should be visible for ${label}`).toBeVisible();
    });
  }

  /**
   * Clicks Clear button if visible in the filter dialog
   */
  async clearAllIfVisible() {
    await test.step('Clear all selected values if visible', async () => {
      if (await this.filterClearAllButton.isVisible()) {
        await this.clickOnElement(this.filterClearAllButton);
      }
    });
  }

  /**
   * Selects an option from the open filter dialog by visible text
   * @param optionText - The option to select
   */
  async selectOption(optionText: string) {
    await test.step(`Select option: ${optionText}`, async () => {
      await this.clickOnElement(this.filterOptionByText(optionText));
    });
  }

  /**
   * Applies the current selections in the filter dialog and waits for dialog to close
   */
  async apply() {
    await test.step('Apply selected filter values', async () => {
      await this.clickOnElement(this.filterApplyButton);
      await expect(this.filterDialog, 'Filter dialog should be hidden after Apply').toBeHidden();
    });
  }

  /**
   * Convenience method to open a filter, clear previous values, select an option, and apply
   * @param label - Filter label
   * @param optionText - Option to select
   */
  async applyFilter(label: string, optionText: string) {
    await test.step(`Apply filter flow: ${label} => ${optionText}`, async () => {
      await this.openFilter(label);
      await this.clearAllIfVisible();
      await this.selectOption(optionText);
      await this.apply();
    });
  }

  /**
   * Verifies that common filters are visible on the dashboard (Department, Location, Company name, People Category, Period)
   */
  async verifyFiltersAreVisible() {
    await test.step('Verify common filters are visible', async () => {
      await expect(this.filterGroup('Department'), 'Department filter should be visible').toBeVisible();
      await expect(this.filterGroup('Location'), 'Location filter should be visible').toBeVisible();
      await expect(this.filterGroup('Company name'), 'Company name filter should be visible').toBeVisible();
      await expect(this.filterGroup('People Category'), 'People Category filter should be visible').toBeVisible();
      await expect(this.filterGroup('Period'), 'Period filter should be visible').toBeVisible();
    });
  }

  /**
   * Verifies that a filter dialog opens and core controls are present
   * @param label - Filter label to check
   */
  async verifyFilterDialogUI(label: string) {
    await test.step(`Verify filter dialog UI: ${label}`, async () => {
      await this.openFilter(label);
      await expect(this.filterApplyButton, 'Apply button should be visible in filter dialog').toBeVisible();
      await expect(this.filterClearAllButton, 'Clear button should be visible in filter dialog').toBeVisible();
    });
  }

  /**
   * Verifies Period filter lists all expected values and then closes the dialog by clicking outside
   * @param label - The Period filter label (e.g., "Period")
   */
  async verifyFilterPeriodUI(label: string) {
    await test.step('Verify Period filter options', async () => {
      await this.openFilter(label);
      const options = [
        'Last 7 days',
        'Last 30 days',
        'Last 90 days',
        'Last 12 months',
        'Last 36 months',
        'Year to date',
        'Custom',
      ];
      for (const option of options) {
        await expect(
          this.filterDialog.getByRole('radio', { name: option }),
          `Period option "${option}" should be visible`
        ).toBeVisible();
      }
      // Close the dialog by clicking on top of the page
      await this.page.mouse.click(5, 5);
      await expect(this.filterDialog, 'Filter dialog should be hidden after clicking outside').toBeHidden();
    });
  }

  /**
   * Opens a filter and returns all option texts currently visible in the dialog
   * @param label - Filter label
   * @returns List of option texts
   */
  async getOptionTexts(label: string): Promise<string[]> {
    return await test.step(`Get option texts for filter: ${label}`, async () => {
      await this.openFilter(label);
      const items = this.filterDialog.getByRole('option');
      const texts = await items.allTextContents();
      await this.apply();
      return texts.map(t => t.trim()).filter(Boolean);
    });
  }
}
