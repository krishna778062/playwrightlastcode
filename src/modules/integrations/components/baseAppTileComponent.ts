import { test, Locator, Page, expect } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export abstract class BaseAppTileComponent extends BaseComponent {
  readonly editDashboardButton: Locator;
  readonly addTileButton: Locator;
  readonly editCarouselButton: Locator;
  readonly appTilesToggle: Locator;
  readonly tileTitleInput: Locator;
  readonly dialog: Locator;
  readonly saveButton: Locator;
  readonly toastMessage: Locator;
  readonly tileHeadings: Locator;
  readonly removePopupTitle: Locator;
  readonly removePopupMessageLocator: Locator;
  readonly removeTileButton: Locator;
  readonly doneButton: Locator;
  readonly pageOptionsMenu: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize component locators
    // Prefer stable, scoped, role-based locators
    this.pageOptionsMenu = page.locator('.PageOptionsMenu');
    this.editDashboardButton = page.getByRole('button', {
      name: 'Manage dashboard & carousel',
    });

    this.addTileButton = page.getByRole('button', { name: 'Add tile' });
    this.editCarouselButton = page.getByRole('button', { name: 'Edit carousel' });
    this.appTilesToggle = page.getByRole('button', { name: 'App tiles' });
    this.tileTitleInput = page.getByLabel('Tile title');
    this.dialog = page.locator('div[role="dialog"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.toastMessage = page.locator('[class*="Toast"]');
    this.tileHeadings = page.getByRole('heading', { level: 3 });
    this.removePopupTitle = page.getByRole('heading', { name: 'Remove tile' });
    this.removePopupMessageLocator = page.getByRole('dialog').locator('p');
    this.removeTileButton = page.getByRole('button', { name: 'Remove' });
    this.doneButton = page.getByRole('button', { name: 'Done' });
  }

  /** Get app tile button by name */
  protected getAppTileButton(name: string): Locator {
    return this.page.getByRole('button').filter({ hasText: name });
  }

  /** Get three dots icon for a specific tile */
  protected getThreeDotsIcon(tileName: string): Locator {
    return this.page.locator(`//h2[text()='${tileName}']/ancestor::header//button[@aria-label='Category option']`);
  }

  /** Get tile option button (Edit/Remove) */
  protected getTileOptionButton(option: 'Edit' | 'Remove'): Locator {
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
      await this.editDashboardButton.click();
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

  /** Verify that a tile with given title is present on the page */
  async isTilePresent(title: string): Promise<void> {
    await test.step(`Check tiles present with title '${title}'`, async () => {
      const tiles = this.getTileContainers(title);
      const count = await tiles.count();
      if (count <= 0) {
        // Throw a clean error without noisy expect output
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

  /** Quiet existence check for a tile title (no assertion side-effects) */
  async tileExists(title: string): Promise<boolean> {
    try {
      const tiles = this.getTileContainers(title);
      const count = await tiles.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /** Get all tile containers for a given title */
  getTileContainers(title: string): Locator {
    return this.page
      .locator('//aside[contains(@class, "Tile")]')
      .filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
  }

  /** Click the three-dots menu on a tile */
  async clickThreeDotsOnTile(tileName: string): Promise<void> {
    await test.step(`Click three dots on '${tileName}'`, async () => {
      const btn = this.getThreeDotsIcon(tileName);
      await btn.waitFor({ state: 'visible', timeout: 10_000 });
      await btn.click({ force: true });
    });
  }

  /** Choose "Edit" or "Remove" from a tile's menu */
  async clickTileOption(option: 'Edit' | 'Remove'): Promise<void> {
    await test.step(`Click tile option '${option}'`, async () => {
      const panel = this.page.locator('.OptionsMenu-panel').last();
      await expect(panel).toBeVisible({ timeout: 5000 });
      const tablist = panel.getByRole('tablist');
      const byRole = tablist.getByRole('button', { name: option, exact: true });
      const byTitle = tablist.locator(`button[title="${option}"]`);
      const target = (await byRole.count()) ? byRole.first() : byTitle.first();
      await expect(target).toBeVisible({ timeout: 5000 });
      await this.clickOnElement(target, { timeout: 30_000 });
    });
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

      // Verify popup message contains tile name
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

  /** Abstract method for app-specific configuration */
  abstract configureAppTile(config: Record<string, any>): Promise<void>;
}
