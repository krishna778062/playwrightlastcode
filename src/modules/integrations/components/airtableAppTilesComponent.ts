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
      await this.clickOnElement(field.getByRole('combobox'), { timeout: 30_000 });
      await this.clickOnElement(this.page.getByRole('menuitem', { name: baseName }), { timeout: 30_000 });
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
      // First ensure the tile exists
      await this.isTilePresent(title);
      const doneButton = this.page.getByRole('button', { name: 'Done' });
      if (await doneButton.isVisible()) {
        await this.clickOnElement(doneButton, { timeout: 5000 });
        await this.page.waitForTimeout(1000);
      }

      // Now check for the Personalize button
      const tile = this.getTileContainers(title);
      const btn = tile.getByRole('button', { name: 'Personalize', exact: true });
      await expect(btn).toHaveCount(1);
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
      const tile = this.getTileContainers(title);
      const btn = tile.getByRole('button', { name: 'Personalize', exact: true });
      await expect(btn).toHaveCount(1);
      await btn.scrollIntoViewIfNeeded();
      await this.clickOnElement(btn, { timeout: 30_000 });
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
      await this.clickOnElement(field, { timeout: 30_000 });
      const menu = this.page.locator('[id$="-listbox"]').last();
      await this.clickOnElement(menu.getByRole('menuitem', { name: value, exact: true }), { timeout: 30_000 });
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
      await this.clickOnElement(field, { timeout: 30_000 });
      const menu = this.page.locator('[id$="-listbox"]').last();
      await this.clickOnElement(menu.getByRole('menuitem', { name: value, exact: true }), { timeout: 30_000 });
    });
  }

  /**
   * Verify that Airtable tiles are sorted in ascending order by their headings
   */
  async verifyTilesAscending(tileTitle: string): Promise<void> {
    if (!tileTitle) throw new Error('verifyTilesAscending: tileTitle is required');
    await test.step(`Verify '${tileTitle}' Airtable tile items are ascending`, async () => {
      // Find exactly the Airtable tile whose H2 contains the title (suffix included)
      const tile = this.page
        .locator('aside.Tile')
        .filter({ has: this.page.locator('img[src*="airtable"]') })
        .filter({ has: this.page.locator('h2.Tile-heading', { hasText: tileTitle }) });
      await expect(tile).toBeVisible({ timeout: 10_000 });
      // Only this tile’s item titles (h3)
      const itemHeadings = tile.getByRole('heading', { level: 3 });
      await expect(itemHeadings.first()).toBeVisible({ timeout: 10_000 });
      const headings = (await itemHeadings.allTextContents()).map(t => t.trim()).filter(Boolean);
      const sorted = [...headings].sort((a, b) => a.localeCompare(b));
      console.log('Actual order:', headings);
      console.log('Expected order:', sorted);
      await expect(headings).toEqual(sorted);
    });
  }
  /**
   * Verify ascending order through API response data
   */
  async verifyAscendingOrderThroughAPI(): Promise<void> {
    await test.step('Verify Airtable items are in ascending order via API', async () => {
      // 1. Fetch tiles data (from cookies if possible, else API credentials)
      const payload = await this.apiFetchRootAppTiles();

      // Helper to unwrap nested `.data`
      const unwrap = (obj: any) => obj?.data ?? obj;

      // 2. Root response object/array
      const rootData = unwrap(payload);

      // 3. Locate the Airtable tile block
      const airtableTile =
        (Array.isArray(rootData) &&
          rootData.find((t: any) => t?.connectorLabel === 'airtable' || t?.connectionType === 'airtable')) ||
        rootData;

      // 4. Extract records (try different possible properties)
      const records =
        unwrap(unwrap(airtableTile?.externalData)?.data) ?? airtableTile?.results ?? airtableTile?.records ?? [];

      // 5. Ensure we have an array
      expect(Array.isArray(records)).toBeTruthy();

      // 6. Collect all record names/titles
      const titles = records
        .map((rec: any) => (rec?.fields?.Name ?? rec?.title ?? rec?.name ?? '').trim())
        .filter(Boolean);

      // 7. Create a sorted copy (case-insensitive, numeric-aware)
      const sortedTitles = [...titles].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
      );

      // 8. Compare actual vs expected
      console.log('API Titles:', titles);
      console.log('Sorted Expected:', sortedTitles);

      await expect(titles).toEqual(sortedTitles);
    });
  }

  private async apiFetchRootAppTiles(): Promise<any> {
    // Try to read through existing page session cookies
    try {
      const response = await this.page.request.get('/v1/tiles/root/instances?type=app');
      if (response.ok()) {
        return response.json();
      }
    } catch {}

    // Fallback to authenticated API client via factory if needed
    try {
      const { ApiClientFactory } = await import('@/src/core/api/factories/apiClientFactory');
      const { AppManagerApiClient } = await import('@/src/core/api/clients/appManagerApiClient');
      const { getEnvConfig } = await import('@/src/core/utils/getEnvConfig');
      const { frontendBaseUrl, appManagerEmail, appManagerPassword, apiBaseUrl } = getEnvConfig();

      const client = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: { username: appManagerEmail, password: appManagerPassword },
        baseUrl: apiBaseUrl || frontendBaseUrl,
      });
      const res = await client.get('/v1/tiles/root/instances?type=app');
      return res.json();
    } catch (e) {
      throw new Error(`Failed to fetch tiles instances via API: ${String(e)}`);
    }
  }

  /** Verify the "Personalize" button is not visible for a given tile */
  async verifyPersonalizeNotVisible(title: string): Promise<void> {
    await test.step(`Verify personalize NOT visible for '${title}'`, async () => {
      const tile = this.getTileContainers(title);
      const btn = tile.getByRole('button', { name: 'Personalize', exact: true });
      await expect(btn).not.toBeVisible();
    });
  }

  /**
   * Complete workflow to add an Airtable tile with configuration
   * @param tileTitle - The title for the tile
   * @param config - Airtable-specific configuration
   * @param destination - Where to add the tile
   */
  async addAirtableTile(tileTitle: string, config: AirtableConfig, destination: string = 'Add to home'): Promise<void> {
    await test.step(`Add Airtable tile: ${tileTitle}`, async () => {
      await this.clickEditDashboard();
      await this.clickAddTile();
      await this.clickAppTiles();
      await this.selectAppTile('Airtable');
      await this.setTileTitle(tileTitle);
      await this.configureAppTile(config);
      await this.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Personalize tile sorting options
   * @param tileName - Name of the tile to personalize
   * @param sortBy - Sort by option
   * @param sortOrder - Sort order option
   */
  async personalizeTileSorting(tileName: string, sortBy: string, sortOrder: string): Promise<void> {
    await test.step(`Personalize tile sorting: ${tileName}`, async () => {
      await this.openPersonalizeOptions(tileName);
      await this.selectSortBy(sortBy);
      await this.selectSortOrder(sortOrder);
      await this.save();
    });
  }
}
