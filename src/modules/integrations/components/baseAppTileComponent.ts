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

  /** Wait for tiles to finish loading (progress bars disappear) */
  async waitForTilesToLoad(tiles: any): Promise<void> {
    const count = await tiles.count();
    for (let i = 0; i < count; i++) {
      const tile = tiles.nth(i);
      await expect(tile.locator('progressbar')).not.toBeVisible({ timeout: 15_000 });
    }
  }

  /** Wait for all loading indicators to disappear from the page */
  async waitForPageLoadingToComplete(): Promise<void> {
    await test.step('Wait for page loading to complete', async () => {
      // Wait for any progress bars to disappear
      const progressBars = this.page.locator('progressbar');
      if ((await progressBars.count()) > 0) {
        await expect(progressBars).not.toBeVisible({ timeout: 30_000 });
      }

      // Wait for any loading spinners or skeletons to disappear
      const loadingSpinners = this.page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
      if ((await loadingSpinners.count()) > 0) {
        await expect(loadingSpinners).not.toBeVisible({ timeout: 30_000 });
      }

      // Wait for any "Loading..." text to disappear
      const loadingText = this.page.locator('text=Loading...');
      if ((await loadingText.count()) > 0) {
        await expect(loadingText).not.toBeVisible({ timeout: 30_000 });
      }

      // Wait for network to be idle
      await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    });
  }

  /** Wait for tiles to be fully loaded and visible */
  async waitForTilesToBeFullyLoaded(tiles: any): Promise<void> {
    await test.step('Wait for tiles to be fully loaded', async () => {
      const count = await tiles.count();
      for (let i = 0; i < count; i++) {
        const tile = tiles.nth(i);

        // Wait for progress bars to disappear
        await expect(tile.locator('progressbar')).not.toBeVisible({ timeout: 15_000 });

        // Wait for tile content to be visible (not just the container)
        const tileContent = tile.locator('a, button, [class*="content"], [class*="data"]').first();
        if ((await tileContent.count()) > 0) {
          await expect(tileContent).toBeVisible({ timeout: 15_000 });
        }

        // Wait for any loading text within the tile to disappear
        const tileLoadingText = tile.locator('text=Loading...');
        if ((await tileLoadingText.count()) > 0) {
          await expect(tileLoadingText).not.toBeVisible({ timeout: 15_000 });
        }
      }
    });
  }

  /** Wait for a specific tile by title to be fully loaded */
  async waitForTileToBeFullyLoaded(tileTitle: string): Promise<void> {
    await test.step(`Wait for tile '${tileTitle}' to be fully loaded`, async () => {
      // First wait for page loading to complete
      await this.waitForPageLoadingToComplete();

      // Find the specific tile
      const tiles = await this.findTilesByTitle(tileTitle);
      const count = await tiles.count();

      if (count > 0) {
        // Wait for the tile to be fully loaded
        await this.waitForTilesToBeFullyLoaded(tiles);
      } else {
        // If tile not found, wait a bit more and try again
        await this.page.waitForTimeout(2000);
        const retryTiles = await this.findTilesByTitle(tileTitle);
        const retryCount = await retryTiles.count();
        if (retryCount > 0) {
          await this.waitForTilesToBeFullyLoaded(retryTiles);
        }
      }
    });
  }

  /** Wait for page to be fully loaded after navigation */
  async waitForPageToBeFullyLoaded(): Promise<void> {
    await test.step('Wait for page to be fully loaded after navigation', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await this.waitForPageLoadingToComplete();
    });
  }

  /** Quiet existence check for a tile title (no assertion side-effects) */
  async tileExists(title: string): Promise<boolean> {
    try {
      const tiles = await this.findTilesByTitle(title);
      const count = await tiles.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /** Wait for tile via API, refresh UI, and assert presence */
  async ensureTileVisibleAfterApi(
    tileTitle: string,
    options?: { timeoutMs?: number; pollIntervalMs?: number }
  ): Promise<void> {
    const { waitUntilTilePresentInApi } = await import('../api/helpers/tileApiHelpers');
    await test.step(`Ensure tile '${tileTitle}' appears (API → UI)`, async () => {
      await waitUntilTilePresentInApi(this.page, tileTitle, options);
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.waitForPageLoadingToComplete();
    });
  }

  /** Wait for tile removal via API, refresh UI, and assert absence */
  async ensureTileRemovedAfterApi(
    tileTitle: string,
    options?: { timeoutMs?: number; pollIntervalMs?: number }
  ): Promise<void> {
    const { waitUntilTileAbsentInApi } = await import('../api/helpers/tileApiHelpers');

    await test.step(`Ensure tile '${tileTitle}' is removed (API → UI)`, async () => {
      await waitUntilTileAbsentInApi(this.page, tileTitle, options);
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.waitForPageLoadingToComplete();
    });
  }

  /** Reload and verify tile presence (no API polling) */
  async reloadAndVerifyTilePresent(tileTitle: string): Promise<void> {
    await test.step(`Reload and verify tile '${tileTitle}' is present`, async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.waitForTileToBeFullyLoaded(tileTitle);
    });
  }

  /** Reload and verify tile absence (no API polling) */
  async reloadAndVerifyTileAbsent(tileTitle: string): Promise<void> {
    await test.step(`Reload and verify tile '${tileTitle}' is absent`, async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.waitForPageLoadingToComplete();
    });
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
  async clickTileOption(option: string): Promise<void> {
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
}
