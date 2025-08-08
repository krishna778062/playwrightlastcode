import { test, Locator, Page, expect } from '@playwright/test';
import { BaseAppTileComponent } from './baseAppTileComponent';

export interface AirtableConfig {
  baseName: string;
  tableId: string;
  sortBy?: string;
  sortOrder?: string;
}

export class AirtableAppTilesComponent extends BaseAppTileComponent {
  readonly baseIdInput: Locator;
  readonly tableIdInput: Locator;
  readonly sortByDropdown: Locator;
  readonly sortOrderDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.baseIdInput = page.getByLabel('Base ID');
    this.tableIdInput = page.getByLabel('Table ID');
    this.sortByDropdown = page.getByLabel('Sort by');
    this.sortOrderDropdown = page.getByLabel('Sort order');
  }

  /** Implement app-specific configuration for Airtable */
  async configureAppTile(config: AirtableConfig): Promise<void> {
    await test.step('Configure Airtable tile', async () => {
      await this.selectBaseId(config.baseName);
      await this.setTableId(config.tableId);
      if (config.sortBy) {
        await this.selectRadioOption('Sort by', config.sortBy);
      }
      if (config.sortOrder) {
        await this.selectRadioOption('Sort order', config.sortOrder);
      }
    });
  }

  /**
   * Choose a Base ID from its dropdown (using data-test-id)
   * @param baseName - the visible base name to pick
   */
  async selectBaseId(baseName: string): Promise<void> {
    await test.step(`Select Base ID '${baseName}'`, async () => {
      const field = this.page.getByTestId('field-Base ID');
      await field.getByRole('combobox').click();
      await this.page.getByRole('menuitem', { name: baseName }).click();
    });
  }

  /** Fill in the Table ID */
  async setTableId(tableId: string): Promise<void> {
    await test.step(`Set Table ID to '${tableId}'`, async () => {
      await this.tableIdInput.fill(tableId);
    });
  }

  /**
   * Select an option from any labeled dropdown
   * @param label e.g. 'Sort by' or 'Sort order'
   * @param option the visible option text
   */
  async selectRadioOption(sectionLabel: string, value: string): Promise<void> {
    await test.step(`Select '${value}' in '${sectionLabel}'`, async () => {
      const group = this.page.getByRole('group', { name: sectionLabel });
      await group.getByRole('radio', { name: value, exact: true }).check();
    });
  }

  /**
   * Verify the “Personalize” button is visible for a given tile
   * @param title – the tile’s heading text
   */
  async verifyPersonalizeVisible(title: string): Promise<void> {
    await test.step(`Verify personalize visible for '${title}'`, async () => {
      const tile = this.getTileContainer(title);
      const btn = tile.getByRole('button', { name: 'Personalize' }).first();
      await btn.scrollIntoViewIfNeeded();
      await expect(btn).toBeVisible({ timeout: 10_000 });
    });
  }

  /**
   * Open the “Personalize” menu for a given tile
   * @param title – the tile’s heading text
   */
  async openPersonalizeOptions(title: string): Promise<void> {
    await test.step(`Open personalize for '${title}'`, async () => {
      const tile = this.getTileContainer(title);
      const btn = tile.getByRole('button', { name: 'Personalize' }).first();
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
    });
  }

  /**
   * Pick a “Sort by” value under the open Personalize dialog
   * @param value – the exact option text to choose
   */
  async selectSortBy(value: string): Promise<void> {
    await test.step(`Select sort by '${value}'`, async () => {
      const dialog = this.page.getByRole('dialog', { name: /Personalize .* tile/i });
      const field = dialog.getByLabel('Sort by');
      await field.click();
      const menu = this.page.locator('[id$="-listbox"]').last();
      await menu.waitFor({ state: 'visible' });
      await menu.getByRole('menuitem', { name: value, exact: true }).click();
    });
  }

  /**
   * Pick a “Sort order” value under the open Personalize dialog
   * @param value – the exact option text to choose
   */
  async selectSortOrder(value: string): Promise<void> {
    await test.step(`Select sort order '${value}'`, async () => {
      const dialog = this.page.getByRole('dialog', { name: /Personalize .* tile/i });
      const field = dialog.getByLabel('Sort order');
      await field.click();
      const menu = this.page.locator('[id$="-listbox"]').last();
      await menu.waitFor({ state: 'visible' });
      await menu.getByRole('menuitem', { name: value, exact: true }).click();
    });
  }

  /**
   * Verify that Airtable tiles are sorted in ascending order by their headings
   */
  async verifyTilesAscending(): Promise<void> {
    await test.step('Verify Airtable tiles are in ascending order', async () => {
      const airtableContainer = this.page.locator('aside.Tile.Drop-item:has(img[src*="airtable"])');
      const headings = await airtableContainer.getByRole('heading', { level: 3 }).allTextContents();
      const sorted = [...headings].sort((a, b) => a.localeCompare(b));
      console.log(' Actual Airtable order: ', headings);
      console.log('Expected (sorted):    ', sorted);
      await expect(headings).toEqual(sorted);
    });
  }

  /** Verify the “Personalize” button is not visible for a given tile */
  async verifyPersonalizeNotVisible(title: string): Promise<void> {
    await test.step(`Verify personalize NOT visible for '${title}'`, async () => {
      const tile = this.getTileContainer(title);
      const btn = tile.getByRole('button', { name: 'Personalize' }).first();
      await btn.waitFor({ state: 'attached', timeout: 2_000 }).catch(() => null);
      await expect(btn).not.toBeVisible();
    });
  }
}
