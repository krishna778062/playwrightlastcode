import { test, Locator, Page, expect } from '@playwright/test';

export abstract class BaseAppTileComponent {
  readonly page: Page;
  readonly editDashboardButton: Locator;
  readonly addTileButton: Locator;
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

  constructor(page: Page) {
    this.page = page;
    this.editDashboardButton = page.getByRole('button', { name: 'Manage dashboard & carousel' });
    this.addTileButton = page.getByRole('button', { name: 'Add tile' });
    this.appTilesToggle = page.locator(
      "//div[contains(@class,'IconToggle-label') and text()='App tiles']/parent::button"
    );
    this.tileTitleInput = page.getByLabel('Tile title');
    this.dialog = page.locator('div[role="dialog"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.toastMessage = page.locator('div.ToastBar');
    this.tileHeadings = page.getByRole('heading', { level: 3 });
    this.removePopupTitle = page.getByRole('heading', { name: 'Remove tile' });
    this.removePopupMessageLocator = page.locator('form.Form div.Modal-content p');
    this.removeTileButton = page.getByRole('button', { name: 'Remove' });
    this.doneButton = page.getByRole('button', { name: 'Done' });
  }

  /** Get app tile button by name */
  protected getAppTileButton(name: string): Locator {
    return this.page.locator(`//p[text()='${name}']/ancestor::button`);
  }

  /** Get three dots icon for a specific tile */
  protected getThreeDotsIcon(tileName: string): Locator {
    return this.page.locator(`//h2[text()='${tileName}']//ancestor::header//button//i`);
  }

  /** Get tile option button (Edit/Remove) */
  protected getTileOptionButton(option: 'Edit' | 'Remove'): Locator {
    return this.page.locator(`button.Panel-item[title="${option}"]`);
  }

  /** Click the "Edit Dashboard" button */
  async clickEditDashboard(): Promise<void> {
    await test.step('Click Edit Dashboard', async () => {
      // Wait for edit dashboard button to be visible and clickable
      await this.editDashboardButton.waitFor({ state: 'visible', timeout: 30000 });
      await this.editDashboardButton.click();
    });
  }

  /** Click "Add tile" */
  async clickAddTile(): Promise<void> {
    await test.step('Click Add Tile', async () => {
      await this.addTileButton.click();
    });
  }

  /** Open the "Apps tiles" tab in the Add-Tile modal */
  async clickAppTiles(): Promise<void> {
    await test.step('Click Apps & Links tab', async () => {
      await this.appTilesToggle.click();
    });
  }

  /** Select an app tile by name */
  async selectAppTile(appName: string): Promise<void> {
    await test.step(`Select App Tile '${appName}'`, async () => {
      await this.getAppTileButton(appName).click();
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
      await this.saveButton.click();
    });
  }

  /** Submit tile to home or dashboard */
  async submitTileToHomeOrDashboard(choice: string): Promise<void> {
    await test.step(`Submit tile to '${choice}'`, async () => {
      await this.page.getByRole('button', { name: choice }).click();
    });
  }

  /** Verify that a toast message appears with the given text */
  async verifyToastMessage(message: string): Promise<void> {
    await test.step(`Verify toast '${message}'`, async () => {
      const body = this.page.locator('div.Toastify__toast-body p');
      await body.first().waitFor({ state: 'visible', timeout: 15_000 });
      await expect(this.page.locator(`div.Toastify__toast-body p:has-text("${message}")`)).toBeVisible({
        timeout: 15_000,
      });
    });
  }

  /** Verify that a tile with given title is present on the page */
  async isTilePresent(title: string): Promise<void> {
    await test.step(`Check tile present '${title}'`, async () => {
      const locator = this.page.locator(`//h2[text()='${title}']`).first();
      await expect(locator).toBeVisible();
    });
  }

  /** Get the tile's container element */
  getTileContainer(title: string): Locator {
    return this.page.locator(`xpath=//h2[text()="${title}"]/ancestor::aside[contains(@class,"Modern-tile")]`).first();
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
      const opt = this.getTileOptionButton(option);
      await opt.waitFor({ state: 'visible', timeout: 10_000 });
      await opt.click();
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
      // Wait for popup title to appear
      await this.removePopupTitle.waitFor({ state: 'visible', timeout: 10000 });

      // Verify popup message contains tile name
      const popupMessage = this.getRemovePopupMessage(tileName);
      await popupMessage.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`Remove popup appeared for tile: ${tileName}`);
    });
  }

  /** Confirm removal by clicking "Remove" in the popup */
  async clickRemoveTile(): Promise<void> {
    await test.step('Click Remove tile', async () => {
      await this.removeTileButton.click();
    });
  }

  /** Click Done button to exit edit mode */
  async clickDone(): Promise<void> {
    await test.step('Exit edit mode', async () => {
      await this.doneButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.doneButton.click();
    });
  }

  /** Abstract method for app-specific configuration */
  abstract configureAppTile(config: Record<string, any>): Promise<void>;
}
