import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

interface AirtableConfig {
  baseName?: string;
  tableId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export class BaseAppTileComponent extends BaseComponent {
  readonly editDashboardButton: Locator;
  readonly tileTitleInput: Locator;
  readonly removePopupTitle: Locator;
  readonly removePopupMessageLocator: Locator;
  readonly dialog: Locator;
  readonly tileTypeCombobox: Locator;
  readonly tileSelector: Locator;
  readonly urlRadioButton: (name: string) => Locator;
  readonly urlTextbox: (name: string) => Locator;
  readonly textboxByName: (name: string) => Locator;
  readonly fieldInputByTestId: (fieldName: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.editDashboardButton = page.getByRole('button', {
      name: 'Manage dashboard & carousel',
    });
    this.tileTitleInput = page.getByLabel('Tile title');
    this.removePopupTitle = page.getByRole('heading', { name: 'Remove tile' });
    this.removePopupMessageLocator = page.getByRole('dialog').locator('p');
    this.dialog = page.getByRole('dialog');
    this.tileTypeCombobox = page.getByRole('combobox', { name: 'Tile type' });
    this.tileSelector = page.locator('aside.Tile');
    this.urlRadioButton = (name: string) => page.getByRole('radio', { name });
    this.urlTextbox = (name: string) => page.getByRole('textbox', { name });
    this.textboxByName = (name: string) => page.getByRole('textbox', { name });
    this.fieldInputByTestId = (fieldName: string) => page.locator(`[data-testid="field-${fieldName}"] input`);
  }
  protected getAppTileButton(name: string): Locator {
    return this.page.getByRole('button', { name: name, exact: true });
  }

  async clickButton(buttonName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${buttonName}`;
    await test.step(stepName, async () => {
      const button = this.page.getByRole('button', { name: buttonName });
      await this.clickOnElement(button, { timeout });
    });
  }

  private async selectRadioButton(fieldLocator: Locator, optionName: string): Promise<void> {
    const radioButton = fieldLocator.getByRole('radio', { name: optionName });
    await expect(radioButton).toBeVisible({ timeout: 5000 });
    await this.clickOnElement(radioButton, { timeout: 30_000 });
  }

  private async selectMenuItemFromDropdown(triggerLocator: Locator, itemName: string): Promise<void> {
    await this.clickOnElement(triggerLocator, { timeout: 30_000 });
    const menuItem = this.getMenuItemInMenu(this.getLastListboxMenu(), itemName);
    await this.clickOnElement(menuItem, { timeout: 30_000 });
  }

  /** Get three dots icon for a specific tile */
  protected getThreeDotsIcon(tileName: string): Locator {
    return this.page.locator(`//h2[text()='${tileName}']/ancestor::header//button[@aria-label='Category option']`);
  }

  private async isInEditMode(): Promise<boolean> {
    const doneButton = this.page.getByRole('button', { name: 'Done' });
    const addTileButton = this.page.getByRole('button', { name: 'Add tile' });
    return (await doneButton.isVisible().catch(() => false)) || (await addTileButton.isVisible().catch(() => false));
  }

  async clickEditDashboard(): Promise<void> {
    await test.step('Click Edit Dashboard', async () => {
      await this.editDashboardButton.waitFor({ state: 'visible', timeout: 30_000 });
      await this.clickOnElement(this.editDashboardButton, { timeout: 30_000 });
      await expect.poll(async () => this.isInEditMode()).toBeTruthy();
    });
  }

  async selectAppTile(appName: string): Promise<void> {
    await test.step(`Select App Tile '${appName}'`, async () => {
      await this.clickOnElement(this.getAppTileButton(appName), { timeout: 30_000 });
    });
  }

  async setTileTitle(title: string): Promise<void> {
    await test.step(`Set tile title to '${title}'`, async () => {
      await this.tileTitleInput.fill(title);
    });
  }

  async configureAppTile(config: AirtableConfig): Promise<void> {
    await test.step('Configure Airtable tile', async () => {
      if (config.baseName) await this.configureBaseName(config.baseName);
      if (config.tableId) await this.configureTableId(config.tableId);
      if (config.sortBy) await this.configureSortBy(config.sortBy);
      if (config.sortOrder) await this.configureSortOrder(config.sortOrder);
    });
  }

  async configureBaseName(baseName: string): Promise<void> {
    await test.step(`Configure base name: ${baseName}`, async () => {
      const baseNameInput = this.getComboboxInField(this.getFieldByTestId('field-Base ID'));
      await this.selectMenuItemFromDropdown(baseNameInput, baseName);
    });
  }

  protected getFieldByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  private getComboboxInField(fieldLocator: Locator): Locator {
    return fieldLocator.getByRole('combobox');
  }

  async configureTableId(tableId: string): Promise<void> {
    await test.step(`Configure table ID: ${tableId}`, async () => {
      await this.fillInElement(this.getFieldByTestId('field-Table ID').locator('input'), tableId, { timeout: 30_000 });
    });
  }

  async configureSortBy(sortBy: string): Promise<void> {
    await test.step(`Configure sort by: ${sortBy}`, async () => {
      await this.selectRadioButton(this.getFieldByTestId('field-Sort by'), sortBy);
    });
  }

  async configureSortOrder(sortOrder: string): Promise<void> {
    await test.step(`Configure sort order: ${sortOrder}`, async () => {
      await this.selectRadioButton(this.getFieldByTestId('field-Sort order'), sortOrder);
    });
  }

  async submitTileToHomeOrDashboard(choice: string): Promise<void> {
    await test.step(`Submit tile to '${choice}'`, async () => {
      await this.clickOnElement(this.page.getByRole('button', { name: choice }), { timeout: 30_000 });
      await this.dialog.waitFor({ state: 'detached', timeout: 30_000 });
    });
  }

  async verifyToastMessageIsVisibleWithText(message: string): Promise<void> {
    await test.step(`Verify toast '${message}'`, async () => {
      const pattern = new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const candidates = this.page.locator('[role="alert"], [role="status"], [aria-live]').filter({ hasText: pattern });
      const deadline = Date.now() + 15_000;
      let toast = candidates.first();

      while (Date.now() < deadline) {
        const count = await candidates.count().catch(() => 0);
        if (count > 0) {
          toast = candidates.last();
          if (await toast.isVisible().catch(() => false)) {
            await expect(toast).toContainText(message, { timeout: 1_000 });
            return;
          }
        }
        await this.page.waitForTimeout(250);
      }
      throw new Error(`Toast not found: "${message}"`);
    });
  }

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
      expect(headings).toEqual([...headings].sort((a, b) => a.localeCompare(b)));
    });
  }

  /**
   * Open the Add <provider> tile modal from the dashboard
   */
  async openAddAppTileModal(provider: string): Promise<void> {
    const normalizeProviderName = (name: string): string => {
      const candidate = name.trim().toLowerCase();
      if (candidate === 'outlook calendar' || candidate === 'microsoft outlook calendar') {
        return 'Outlook Calendar';
      }
      return name;
    };
    const normalizedProvider = normalizeProviderName(String(provider));
    await test.step(`Open Add ${normalizedProvider} tile modal`, async () => {
      await this.clickEditDashboard();
      await this.clickButton('Add tile');
      await this.clickButton('App tiles');
      await this.selectAppTile(normalizedProvider);

      const modalTitlePattern = new RegExp(`Add ${normalizedProvider} tile`, 'i');
      await expect(this.page.getByRole('dialog', { name: modalTitlePattern })).toBeVisible({ timeout: 10_000 });
      await expect(this.tileTypeCombobox).toBeVisible({ timeout: 10_000 });
    });
  }

  /**
   * Verify the connection helper text and connected email in the Add tile modal
   */
  async verifyConnectionMessage(expectedConnectionText: string, options: { connectedEmail: string }): Promise<void> {
    const { connectedEmail } = options;
    await test.step('Verify connection message in Add tile modal', async () => {
      const helperText = this.page.getByText(expectedConnectionText, { exact: false });
      await expect(helperText).toBeVisible({ timeout: 10_000 });

      await expect(
        this.dialog.getByText(
          new RegExp(`Connected as\\s+${connectedEmail.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}`, 'i')
        )
      ).toBeVisible({ timeout: 10_000 });
    });
  }

  /**
   * Click a link inside the currently open dialog by its accessible name
   */
  async clickDialogLink(label: string): Promise<void> {
    await test.step(`Click '${label}' link in dialog`, async () => {
      const link = this.dialog.getByRole('link', { name: label, exact: true });
      await expect(link).toBeVisible({ timeout: 10_000 });
      await link.click();
    });
  }

  async isTilePresent(title: string): Promise<void> {
    await test.step(`Check tiles present with title '${title}'`, async () => {
      let tiles = await this.findTilesByTitle(title);
      if ((await tiles.count()) <= 0) {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForPageLoadingToComplete();
        await this.tileSelector.first().waitFor({ timeout: 10000 });
        tiles = await this.findTilesByTitle(title);
      }
      await this.waitForTilesToBeFullyLoaded(tiles);
      const count = await tiles.count();
      if (count <= 0) {
        throw new Error(`No tile found with title "${title}"`);
      }
      await this.verifier.verifyTheElementIsVisible(tiles.first(), {
        assertionMessage: `Tile with title "${title}" should be visible`,
        timeout: 15_000,
      });
    });
  }

  getTileContainers(title: string): Locator {
    return this.page
      .locator('//aside[contains(@class, "Tile")]')
      .filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
  }

  async findTilesByTitle(title: string): Promise<Locator> {
    let tiles = this.getTileContainers(title);
    if ((await tiles.count()) <= 0) {
      const nameRegex = new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'), 'i');
      tiles = this.page
        .locator('//aside[contains(@class, "Tile")]')
        .filter({ has: this.page.getByRole('heading', { name: nameRegex }) });
    }
    return tiles;
  }

  async waitForPageLoadingToComplete(): Promise<void> {
    await test.step('Wait for page loading to complete', async () => {
      const selectors = [
        'progressbar',
        '[class*="loading"], [class*="spinner"], [class*="skeleton"]',
        'text=Loading...',
      ];
      for (const selector of selectors) {
        const elements = this.page.locator(selector);
        if ((await elements.count()) > 0) await expect(elements).not.toBeVisible({ timeout: 30_000 });
      }
      await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    });
  }

  async waitForTilesToBeFullyLoaded(tiles: Locator): Promise<void> {
    await test.step('Wait for tiles to be fully loaded', async () => {
      const count = await tiles.count();
      for (let i = 0; i < count; i++) {
        const tile = tiles.nth(i);
        await expect(tile.locator('progressbar')).not.toBeVisible({ timeout: 15_000 });
        const tileContent = tile.locator('a, button, [class*="content"], [class*="data"]').first();
        if ((await tileContent.count()) > 0) await expect(tileContent).toBeVisible({ timeout: 15_000 });
        const tileLoadingText = tile.locator('text=Loading...');
        if ((await tileLoadingText.count()) > 0) await expect(tileLoadingText).not.toBeVisible({ timeout: 15_000 });
      }
    });
  }

  async clickThreeDotsOnTile(tileName: string): Promise<void> {
    await test.step(`Click three dots menu on '${tileName}' tile`, async () => {
      const threeDotsButton = this.getThreeDotsIcon(tileName);
      await this.verifier.waitUntilElementIsVisible(threeDotsButton, { timeout: 15_000 });
      await this.clickOnElement(threeDotsButton, { force: true });
    });
  }

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

  private getOptionsMenuPanel(): Locator {
    return this.page.locator('.OptionsMenu-panel').last();
  }

  private async getTileOptionButtonWithFallback(panel: Locator, option: string): Promise<Locator> {
    const tablist = panel.getByRole('tablist');
    const byRole = tablist.getByRole('button', { name: option, exact: true });
    return (await byRole.count()) ? byRole.first() : tablist.locator(`button[title="${option}"]`).first();
  }

  getRemovePopupMessage(tileName: string): Locator {
    return this.removePopupMessageLocator.filter({ hasText: `remove the tile "${tileName}"` });
  }

  async verifyRemovePopupAppears(tileName: string): Promise<void> {
    await test.step(`Verify remove popup appears for '${tileName}'`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.removePopupTitle, {
        assertionMessage: 'Remove popup title should be visible',
        timeout: 30_000,
      });
      await this.verifier.verifyTheElementIsVisible(this.getRemovePopupMessage(tileName), {
        assertionMessage: `Remove popup message for "${tileName}" should be visible`,
        timeout: 30_000,
      });
    });
  }

  async verifyPersonalizeVisible(title: string): Promise<void> {
    await test.step(`Verify personalize visible for '${title}'`, async () => {
      await this.isTilePresent(title);
      if (await this.page.getByRole('button', { name: 'Done' }).isVisible()) {
        await this.clickButton('Done', 'Exit edit mode');
        await this.page.waitForTimeout(1000);
      }
      const btn = this.getTileContainers(title).getByRole('button', { name: 'Personalize', exact: true });
      await expect(btn).toHaveCount(1);
      await btn.scrollIntoViewIfNeeded();
      await expect(btn).toBeVisible({ timeout: 10_000 });
    });
  }

  async verifyPersonalizeNotVisible(title: string): Promise<void> {
    await test.step(`Verify personalize NOT visible for '${title}'`, async () => {
      const btn = this.getTileContainers(title).getByRole('button', { name: 'Personalize', exact: true });
      await expect(btn).not.toBeVisible();
    });
  }

  async openPersonalizeOptions(title: string): Promise<void> {
    await test.step(`Open personalize for '${title}'`, async () => {
      await this.verifyPersonalizeVisible(title);
      const personalizeBtn = this.getTileContainers(title).getByRole('button', { name: 'Personalize', exact: true });
      await this.clickOnElement(personalizeBtn, { timeout: 30_000 });
    });
  }

  async configurePersonalizeSortBy(sortBy: string): Promise<void> {
    await test.step(`Configure personalize sort by: ${sortBy}`, async () => {
      const field = this.getFieldByLabel(this.getDialogByNamePattern(/Personalize .* tile/i), 'Sort by');
      await this.selectMenuItemFromDropdown(field, sortBy);
    });
  }

  private getDialogByNamePattern(pattern: RegExp): Locator {
    return this.page.getByRole('dialog', { name: pattern });
  }

  private getFieldByLabel(dialog: Locator, label: string): Locator {
    return dialog.getByLabel(label);
  }

  private getLastListboxMenu(): Locator {
    return this.page.locator('[id$="-listbox"]').last();
  }

  private getMenuItemInMenu(menu: Locator, name: string): Locator {
    return menu.getByRole('menuitem', { name, exact: true });
  }

  async configurePersonalizeSortOrder(sortOrder: string): Promise<void> {
    await test.step(`Configure personalize sort order: ${sortOrder}`, async () => {
      const field = this.getFieldByLabel(this.getDialogByNamePattern(/Personalize .* tile/i), 'Sort order');
      await this.selectMenuItemFromDropdown(field, sortOrder);
    });
  }

  async personalizeTileSorting(tileTitle: string, sortBy: string, sortOrder: string): Promise<void> {
    await test.step(`Personalize tile sorting for '${tileTitle}'`, async () => {
      await this.openPersonalizeOptions(tileTitle);
      await this.configurePersonalizeSortBy(sortBy);
      await this.configurePersonalizeSortOrder(sortOrder);
      await this.clickButton('Save');
    });
  }

  async selectTile(tileType: string): Promise<void> {
    await test.step(`Select tile type: ${tileType}`, async () => {
      await this.clickOnElement(this.tileTypeCombobox, { timeout: 30_000 });
      await this.page.waitForTimeout(TIMEOUTS.VERY_VERY_SHORT);
      const tileOption = this.page.getByRole('menuitem').filter({ hasText: tileType });
      await this.clickOnElement(tileOption, { timeout: 30_000 });
    });
  }

  async getCurrentConfiguration(): Promise<AirtableConfig> {
    return await test.step('Get current Airtable configuration', async () => {
      const baseNameCombobox = this.getComboboxInField(this.getFieldByTestId('field-Base ID'));
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

  /**
   * Enter URL with radio selection
   */
  async enterUrl(fieldName: string, urlType: string, url: string): Promise<void> {
    await test.step(`Enter ${fieldName}`, async () => {
      await this.urlRadioButton(urlType).click();
      await this.urlTextbox(fieldName).fill(url);
    });
  }

  /**
   * Input any field by name
   */
  async inputFieldByName(fieldName: string, value: string): Promise<void> {
    await test.step(`Input ${fieldName}: ${value}`, async () => {
      let input = this.textboxByName(fieldName);
      if ((await input.count()) === 0) {
        input = this.fieldInputByTestId(fieldName);
      }
      await input.fill(value);
    });
  }
}
