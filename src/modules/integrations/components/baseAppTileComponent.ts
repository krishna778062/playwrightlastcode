import { test, Locator, Page, expect } from '@playwright/test';
import { BaseComponent } from '@core/components/baseComponent';

interface AirtableConfig {
  baseName?: string;
  tableId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export class BaseAppTileComponent extends BaseComponent {
  readonly editDashboardButton: Locator;
  readonly addTileButton: Locator;
  readonly appTilesToggle: Locator;
  readonly tileTitleInput: Locator;
  readonly dialog: Locator;
  readonly saveButton: Locator;
  readonly toastMessage: Locator;
  readonly removePopupTitle: Locator;
  readonly removePopupMessageLocator: Locator;
  readonly removeTileButton: Locator;
  readonly doneButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editDashboardButton = page.getByRole('button', {
      name: 'Manage dashboard & carousel',
    });
    this.addTileButton = page.getByRole('button', { name: 'Add tile' });
    this.appTilesToggle = page.getByRole('button', { name: 'App tiles' });
    this.tileTitleInput = page.getByLabel('Tile title');
    this.dialog = page.locator('div[role="dialog"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.toastMessage = page.locator('[class*="Toast"]');
    this.removePopupTitle = page.getByRole('heading', { name: 'Remove tile' });
    this.removePopupMessageLocator = page.getByRole('dialog').locator('p');
    this.removeTileButton = page.getByRole('button', { name: 'Remove' });
    this.doneButton = page.getByRole('button', { name: 'Done' });
  }

  /** Get app tile button by name */
  protected getAppTileButton(name: string): Locator {
    return this.page.getByRole('button').filter({ hasText: name });
  }

  /**
   * Common method to select radio button by name
   * @param fieldLocator - The field container locator
   * @param optionName - The name of the radio button option
   */
  private async selectRadioButton(fieldLocator: Locator, optionName: string): Promise<void> {
    const radioButton = fieldLocator.getByRole('radio', { name: optionName });
    await expect(radioButton).toBeVisible({ timeout: 5000 });
    await this.clickOnElement(radioButton, { timeout: 30_000 });
  }

  /**
   * Common method to select menu item from dropdown
   * @param triggerLocator - The dropdown trigger locator
   * @param itemName - The name of the menu item to select
   */
  private async selectMenuItemFromDropdown(triggerLocator: Locator, itemName: string): Promise<void> {
    await this.clickOnElement(triggerLocator, { timeout: 30_000 });
    const menu = this.getLastListboxMenu();
    const menuItem = this.getMenuItemInMenu(menu, itemName);
    await this.clickOnElement(menuItem, { timeout: 30_000 });
  }

  /**
   * Common method to interact with dialog field (click field, select menu item)
   * @param fieldLocator - The field locator
   * @param itemName - The menu item name to select
   */
  private async interactWithDialogField(fieldLocator: Locator, itemName: string): Promise<void> {
    await this.clickOnElement(fieldLocator, { timeout: 30_000 });
    const menu = this.getLastListboxMenu();
    const menuItem = this.getMenuItemInMenu(menu, itemName);
    await this.clickOnElement(menuItem, { timeout: 30_000 });
  }

  /** Get three dots icon for a specific tile */
  protected getThreeDotsIcon(tileName: string): Locator {
    return this.page.locator(`//h2[text()='${tileName}']/ancestor::header//button[@aria-label='Category option']`);
  }

  /** Get tile option button (Edit/Remove) - base method */
  protected getTileOptionButton(option: string): Locator {
    return this.page.getByRole('button', { name: option });
  }

  private async isInEditMode(): Promise<boolean> {
    return (
      (await this.doneButton.isVisible().catch(() => false)) ||
      (await this.addTileButton.isVisible().catch(() => false))
    );
  }

  /** Click the "Edit Dashboard" button */
  async clickEditDashboard(): Promise<void> {
    await test.step('Click Edit Dashboard', async () => {
      await this.editDashboardButton.waitFor({
        state: 'visible',
        timeout: 30_000,
      });
      await this.clickOnElement(this.editDashboardButton, { timeout: 30_000 });
      await expect.poll(async () => this.isInEditMode()).toBeTruthy();
    });
  }

  /** Click "Add tile" */
  async clickAddTile(): Promise<void> {
    await test.step('Click Add Tile', async () => {
      await this.clickOnElement(this.addTileButton, { timeout: 30_000 });
    });
  }

  /** Open the "Apps tiles" tab in the Add-Tile modal */
  async clickAppTiles(): Promise<void> {
    await test.step('Click Apps & Links tab', async () => {
      await this.clickOnElement(this.appTilesToggle, { timeout: 30_000 });
    });
  }

  /** Select an app tile by name */
  async selectAppTile(appName: string): Promise<void> {
    await test.step(`Select App Tile '${appName}'`, async () => {
      await this.clickOnElement(this.getAppTileButton(appName), { timeout: 30_000 });
    });
  }

  /** Fill in the Tile title field */
  async setTileTitle(title: string): Promise<void> {
    await test.step(`Set tile title to '${title}'`, async () => {
      await this.tileTitleInput.fill(title);
    });
  }

  /**
   * Configure Airtable app tile with specific settings
   * @param config - Airtable configuration object
   */
  async configureAppTile(config: AirtableConfig): Promise<void> {
    await test.step('Configure Airtable tile', async () => {
      if (config.baseName) {
        await this.configureBaseName(config.baseName);
      }
      if (config.tableId) {
        await this.configureTableId(config.tableId);
      }
      if (config.sortBy) {
        await this.configureSortBy(config.sortBy);
      }
      if (config.sortOrder) {
        await this.configureSortOrder(config.sortOrder);
      }
    });
  }

  /**
   * Configure base name for Airtable tile
   */
  async configureBaseName(baseName: string): Promise<void> {
    await test.step(`Configure base name: ${baseName}`, async () => {
      const baseNameField = this.getFieldByTestId('field-Base ID');
      const baseNameInput = this.getComboboxInField(baseNameField);
      await this.selectMenuItemFromDropdown(baseNameInput, baseName);
    });
  }

  /**
   * Get field by test ID - generic reusable method
   */
  protected getFieldByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Get combobox within a field - generic reusable method
   */
  private getComboboxInField(fieldLocator: Locator): Locator {
    return fieldLocator.getByRole('combobox');
  }

  /**
   * Configure table ID for Airtable tile
   */
  async configureTableId(tableId: string): Promise<void> {
    await test.step(`Configure table ID: ${tableId}`, async () => {
      const tableIdInput = this.getFieldByTestId('field-Table ID').locator('input');
      await this.fillInElement(tableIdInput, tableId, { timeout: 30_000 });
    });
  }

  /**
   * Configure sort by field for Airtable tile
   */
  async configureSortBy(sortBy: string): Promise<void> {
    await test.step(`Configure sort by: ${sortBy}`, async () => {
      const sortByField = this.getFieldByTestId('field-Sort by');
      await this.selectRadioButton(sortByField, sortBy);
    });
  }

  /**
   * Configure sort order for Airtable tile
   */
  async configureSortOrder(sortOrder: string): Promise<void> {
    await test.step(`Configure sort order: ${sortOrder}`, async () => {
      const sortOrderField = this.getFieldByTestId('field-Sort order');
      await this.selectRadioButton(sortOrderField, sortOrder);
    });
  }

  /** Save the tile configuration */
  async save(): Promise<void> {
    await test.step('Save tile configuration', async () => {
      await this.clickOnElement(this.saveButton, { timeout: 30_000 });
    });
  }

  /** Submit tile to home or dashboard */
  async submitTileToHomeOrDashboard(choice: string): Promise<void> {
    await test.step(`Submit tile to '${choice}'`, async () => {
      await this.clickOnElement(this.page.getByRole('button', { name: choice }), { timeout: 30_000 });
    });
  }

  /** Verify that a toast with the given text appears */
  async verifyToastMessage(message: string): Promise<void> {
    await test.step(`Verify toast '${message}'`, async () => {
      const escaped = message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escaped, 'i');
      const candidates = this.page.locator('[role="alert"], [role="status"], [aria-live]').filter({ hasText: pattern });
      const deadline = Date.now() + 15_000;
      let foundVisible = false;
      let toast = candidates.first();
      while (Date.now() < deadline) {
        const count = await candidates.count().catch(() => 0);
        if (count > 0) {
          toast = candidates.last();
          if (await toast.isVisible().catch(() => false)) {
            foundVisible = true;
            break;
          }
        }
        await this.page.waitForTimeout(250);
      }
      if (!foundVisible) {
        throw new Error(`Toast not found: "${message}"`);
      }
      await expect(toast).toContainText(message, { timeout: 1_000 });
    });
  }

  /**
   * Verify that Airtable tiles are sorted in ascending order by their headings
   */
  async verifyTilesAscending(tileTitle: string): Promise<void> {
    if (!tileTitle) throw new Error('verifyTilesAscending: tileTitle is required');
    await test.step(`Verify '${tileTitle}' Airtable tile items are ascending`, async () => {
      const tile = this.page
        .locator('aside.Tile')
        .filter({ has: this.page.locator('img[src*="airtable"]') })
        .filter({ has: this.page.locator('h2.Tile-heading', { hasText: tileTitle }) });
      await expect(tile).toBeVisible({ timeout: 10_000 });
      const itemHeadings = tile.getByRole('heading', { level: 3 });
      await expect(itemHeadings.first()).toBeVisible({ timeout: 10_000 });
      const headings = (await itemHeadings.allTextContents()).map(t => t.trim()).filter(Boolean);
      const sorted = [...headings].sort((a, b) => a.localeCompare(b));
      await expect(headings).toEqual(sorted);
    });
  }

  /** Verify that a tile with given title is present on the page */
  async isTilePresent(title: string): Promise<void> {
    await test.step(`Check tiles present with title '${title}'`, async () => {
      let tiles = await this.findTilesByTitle(title);
      if ((await tiles.count()) <= 0) {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForPageLoadingToComplete();
        tiles = await this.findTilesByTitle(title);
      }
      await this.waitForTilesToBeFullyLoaded(tiles);
      const count = await tiles.count();
      if (count <= 0) {
        throw new Error(`No tile found with title "${title}"`);
      }
      for (let i = 0; i < count; i++) {
        await this.verifier.verifyTheElementIsVisible(tiles.nth(i), {
          assertionMessage: `Tile #${i + 1} with title "${title}" should be visible`,
          timeout: 10_000,
        });
      }
    });
  }

  /** Get all tile containers for a given title */
  getTileContainers(title: string): Locator {
    return this.page
      .locator('//aside[contains(@class, "Tile")]')
      .filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
  }

  /** Find tiles by title with fallback regex matching */
  async findTilesByTitle(title: string) {
    let tiles = this.getTileContainers(title);
    let count = await tiles.count();
    if (count <= 0) {
      const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
      const nameRegex = new RegExp(escaped, 'i');
      const container = this.page.locator('//aside[contains(@class, "Tile")]');
      const headingRegex = this.page.getByRole('heading', { name: nameRegex });
      tiles = container.filter({ has: headingRegex });
    }
    return tiles;
  }

  /** Wait for all loading indicators to disappear from the page */
  async waitForPageLoadingToComplete(): Promise<void> {
    await test.step('Wait for page loading to complete', async () => {
      const progressBars = this.page.locator('progressbar');
      if ((await progressBars.count()) > 0) {
        await expect(progressBars).not.toBeVisible({ timeout: 30_000 });
      }

      const loadingSpinners = this.page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
      if ((await loadingSpinners.count()) > 0) {
        await expect(loadingSpinners).not.toBeVisible({ timeout: 30_000 });
      }

      const loadingText = this.page.locator('text=Loading...');
      if ((await loadingText.count()) > 0) {
        await expect(loadingText).not.toBeVisible({ timeout: 30_000 });
      }

      await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    });
  }

  /** Wait for tiles to be fully loaded and visible */
  async waitForTilesToBeFullyLoaded(tiles: any): Promise<void> {
    await test.step('Wait for tiles to be fully loaded', async () => {
      const count = await tiles.count();
      for (let i = 0; i < count; i++) {
        const tile = tiles.nth(i);
        await expect(tile.locator('progressbar')).not.toBeVisible({ timeout: 15_000 });

        const tileContent = tile.locator('a, button, [class*="content"], [class*="data"]').first();
        if ((await tileContent.count()) > 0) {
          await expect(tileContent).toBeVisible({ timeout: 15_000 });
        }

        const tileLoadingText = tile.locator('text=Loading...');
        if ((await tileLoadingText.count()) > 0) {
          await expect(tileLoadingText).not.toBeVisible({ timeout: 15_000 });
        }
      }
    });
  }

  /** Click the three-dots menu on a tile */
  async clickThreeDotsOnTile(tileName: string): Promise<void> {
    await test.step(`Click three dots on '${tileName}'`, async () => {
      const btn = this.getThreeDotsIcon(tileName);
      await btn.waitFor({ state: 'visible', timeout: 10_000 });
      await this.page.waitForTimeout(200);
      await btn.click({ force: true });
      await this.page.waitForTimeout(300);
    });
  }

  /** Choose "Edit" or "Remove" from a tile's menu */
  async clickTileOption(option: string): Promise<void> {
    await test.step(`Click tile option '${option}'`, async () => {
      const panel = this.getOptionsMenuPanel();
      await expect(panel).toBeVisible({ timeout: 10_000 });
      await this.page.waitForTimeout(500);
      const target = await this.getTileOptionButtonWithFallback(panel, option);
      await expect(target).toBeVisible({ timeout: 10_000 });
      await target.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(200);
      await this.clickOnElement(target, { timeout: 30_000 });
    });
  }

  /**
   * Get options menu panel - reusable method
   */
  private getOptionsMenuPanel(): Locator {
    return this.page.locator('.OptionsMenu-panel').last();
  }

  /**
   * Get tile option button with fallback - reusable method
   */
  private async getTileOptionButtonWithFallback(panel: Locator, option: string): Promise<Locator> {
    const tablist = panel.getByRole('tablist');
    const byRole = tablist.getByRole('button', { name: option, exact: true });
    const byTitle = tablist.locator(`button[title="${option}"]`);
    const roleCount = await byRole.count();
    return roleCount ? byRole.first() : byTitle.first();
  }

  /** Get remove popup message for a specific tile */
  getRemovePopupMessage(tileName: string): Locator {
    return this.removePopupMessageLocator.filter({
      hasText: `remove the tile "${tileName}"`,
    });
  }

  /** Verify the remove confirmation popup appears */
  async verifyRemovePopupAppears(tileName: string): Promise<void> {
    await test.step(`Verify remove popup appears for '${tileName}'`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.removePopupTitle, {
        assertionMessage: 'Remove popup title should be visible',
        timeout: 30_000,
      });

      const popupMessage = this.getRemovePopupMessage(tileName);
      await this.verifier.verifyTheElementIsVisible(popupMessage, {
        assertionMessage: `Remove popup message for "${tileName}" should be visible`,
        timeout: 30_000,
      });
    });
  }

  /** Confirm removal by clicking "Remove" in the popup */
  async clickRemoveTile(): Promise<void> {
    await test.step('Click Remove tile', async () => {
      await this.clickOnElement(this.removeTileButton, { timeout: 30_000 });
    });
  }

  /** Click Done button to exit edit mode */
  async clickDone(): Promise<void> {
    await test.step('Exit edit mode', async () => {
      await this.clickOnElement(this.doneButton, { timeout: 30_000 });
    });
  }

  /** Verify the "Personalize" button is visible for a given tile */
  async verifyPersonalizeVisible(title: string): Promise<void> {
    await test.step(`Verify personalize visible for '${title}'`, async () => {
      await this.isTilePresent(title);
      const doneButton = this.page.getByRole('button', { name: 'Done' });
      if (await doneButton.isVisible()) {
        await this.clickOnElement(doneButton, { timeout: 5000 });
        await this.page.waitForTimeout(1000);
      }
      const tile = this.getTileContainers(title);
      const btn = tile.getByRole('button', { name: 'Personalize', exact: true });
      await expect(btn).toHaveCount(1);
      await btn.scrollIntoViewIfNeeded();
      await expect(btn).toBeVisible({ timeout: 10_000 });
    });
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
   * Open the "Personalize" menu for a given tile
   */
  async openPersonalizeOptions(title: string): Promise<void> {
    await test.step(`Open personalize for '${title}'`, async () => {
      await this.verifyPersonalizeVisible(title);
      const tile = this.getTileContainers(title);
      const personalizeBtn = tile.getByRole('button', { name: 'Personalize', exact: true });
      await this.clickOnElement(personalizeBtn, { timeout: 30_000 });
    });
  }

  /**
   * Configure sort by in personalize dialog
   */
  async configurePersonalizeSortBy(sortBy: string): Promise<void> {
    await test.step(`Configure personalize sort by: ${sortBy}`, async () => {
      const dialog = this.getDialogByNamePattern(/Personalize .* tile/i);
      const field = this.getFieldByLabel(dialog, 'Sort by');
      await this.interactWithDialogField(field, sortBy);
    });
  }

  /**
   * Get dialog by name pattern - generic reusable method
   */
  private getDialogByNamePattern(pattern: RegExp): Locator {
    return this.page.getByRole('dialog', { name: pattern });
  }

  /**
   * Get field by label within dialog - generic reusable method
   */
  private getFieldByLabel(dialog: Locator, label: string): Locator {
    return dialog.getByLabel(label);
  }

  /**
   * Get last listbox menu - generic reusable method
   */
  private getLastListboxMenu(): Locator {
    return this.page.locator('[id$="-listbox"]').last();
  }

  /**
   * Get menu item by name within a specific menu - generic reusable method
   */
  private getMenuItemInMenu(menu: Locator, name: string): Locator {
    return menu.getByRole('menuitem', { name, exact: true });
  }

  /**
   * Configure sort order in personalize dialog
   */
  async configurePersonalizeSortOrder(sortOrder: string): Promise<void> {
    await test.step(`Configure personalize sort order: ${sortOrder}`, async () => {
      const dialog = this.getDialogByNamePattern(/Personalize .* tile/i);
      const field = this.getFieldByLabel(dialog, 'Sort order');
      await this.interactWithDialogField(field, sortOrder);
    });
  }

  /**
   * Save changes in dialog - generic reusable method
   */
  async saveDialogChanges(): Promise<void> {
    await test.step('Save dialog changes', async () => {
      const saveButton = this.page.getByRole('button', { name: 'Save' });
      await this.clickOnElement(saveButton, { timeout: 30_000 });
    });
  }

  /**
   * Personalize tile sorting options
   */
  async personalizeTileSorting(tileTitle: string, sortBy: string, sortOrder: string): Promise<void> {
    await test.step(`Personalize tile sorting for '${tileTitle}'`, async () => {
      await this.openPersonalizeOptions(tileTitle);
      await this.configurePersonalizeSortBy(sortBy);
      await this.configurePersonalizeSortOrder(sortOrder);
      await this.saveDialogChanges();
    });
  }

  /**
   * Get current Airtable configuration
   * @returns Promise<AirtableConfig> - Current configuration values
   */
  async getCurrentConfiguration(): Promise<AirtableConfig> {
    return await test.step('Get current Airtable configuration', async () => {
      const baseNameField = this.getFieldByTestId('field-Base ID');
      const baseNameCombobox = this.getComboboxInField(baseNameField);
      const baseName = (await baseNameCombobox.textContent()) || '';
      const tableId = (await this.getFieldByTestId('field-Table ID').locator('input').inputValue()) || '';
      const sortBy = (await this.getFieldByTestId('field-Sort by').textContent()) || '';
      const sortOrder = (await this.getFieldByTestId('field-Sort order').textContent()) || '';

      return {
        baseName: baseName.trim(),
        tableId: tableId.trim(),
        sortBy: sortBy.trim(),
        sortOrder: sortOrder.trim(),
      };
    });
  }
}
