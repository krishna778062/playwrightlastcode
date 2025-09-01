import { expect, Page, test } from '@playwright/test';
import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import {
  deleteTileByTitleViaApi,
  createAppTileViaApi as createAppTileViaApiHelper,
} from '@integrations-api/helpers/tileApiHelpers';
import { AIRTABLE_TILE } from '@integrations-test-data/app-tiles.test-data';
import { ACTION_LABELS } from '@integrations/constants/common';

class AppTileComponent extends BaseAppTileComponent {
  constructor(page: Page) {
    super(page);
  }
}

export class HomeDashboard {
  private readonly page: Page;
  private readonly airtableComponent: BaseAppTileComponent;
  private readonly appTileComponent: AppTileComponent;

  private readonly defaultConfig = {
    baseName: AIRTABLE_TILE.BASE_NAME,
    tableId: AIRTABLE_TILE.TABLE_ID,
    sortBy: AIRTABLE_TILE.USER_DEFINED,
    sortOrder: AIRTABLE_TILE.USER_DEFINED,
  };

  constructor(page: Page) {
    this.page = page;
    this.airtableComponent = new BaseAppTileComponent(page);
    this.appTileComponent = new AppTileComponent(page);
  }

  /**
   * Get configuration object
   */
  get config() {
    return this.defaultConfig;
  }

  /**
   * Verify that the page is loaded and ready
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify home dashboard page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await expect(this.page).toHaveTitle(/.*Dashboard.*/);
    });
  }

  /**
   * Verify that personalize options are not visible for a tile
   */
  async verifyPersonalizeNotVisible(tileTitle: string): Promise<void> {
    await test.step(`Verify personalize options not visible for '${tileTitle}'`, async () => {
      const personalizeButton = this.page.locator(
        `//h2[text()='${tileTitle}']/ancestor::header//button[contains(@aria-label, 'Personalize')]`
      );
      await expect(personalizeButton).not.toBeVisible();
    });
  }

  /**
   * Verify ascending order through API
   */
  async verifyAscendingOrderThroughAPI(tileTitle: string): Promise<void> {
    await test.step(`Verify ascending order through API for '${tileTitle}'`, async () => {
      await test.step('API verification logic would go here', async () => {
        // Placeholder for actual API verification
      });
    });
  }

  async verifyTileAscending(tileTitle: string): Promise<void> {
    return this.appTileComponent.verifyTilesAscending(tileTitle);
  }

  /**
   * Submit tile to home or dashboard
   */
  async submitTileToHomeOrDashboard(choice: string): Promise<void> {
    return this.appTileComponent.submitTileToHomeOrDashboard(choice);
  }

  /**
   * Verify that a tile is present on the dashboard
   */
  async verifyTilePresent(tileTitle: string): Promise<void> {
    return this.appTileComponent.isTilePresent(tileTitle);
  }

  /**
   * Verify that personalize options are visible for a tile
   */
  async verifyPersonalizeVisible(tileTitle: string): Promise<void> {
    return this.appTileComponent.verifyPersonalizeVisible(tileTitle);
  }

  /**
   * Verify toast message appears
   */
  async verifyToastMessage(message: string): Promise<void> {
    return this.appTileComponent.verifyToastMessage(message);
  }

  /**
   * Configure Airtable app tile with default settings
   */
  async configureAppTile(): Promise<void> {
    await test.step('Configure Airtable tile', async () => {
      await this.appTileComponent.configureBaseName(this.defaultConfig.baseName);
      await this.appTileComponent.configureTableId(this.defaultConfig.tableId);
      await this.appTileComponent.configureSortBy(this.defaultConfig.sortBy);
      await this.appTileComponent.configureSortOrder(this.defaultConfig.sortOrder);
    });
  }

  /**
   * Personalize tile sorting options
   */
  async personalizeTileSorting(tileTitle: string, sortBy: string, sortOrder: string): Promise<void> {
    return this.appTileComponent.personalizeTileSorting(tileTitle, sortBy, sortOrder);
  }

  /**
   * Complete workflow to add an Airtable tile
   */
  async addAirtableTile(tileTitle: string, config: any, destination: string): Promise<void> {
    await test.step(`Add Airtable tile: ${tileTitle}`, async () => {
      await this.airtableComponent.clickEditDashboard();
      await this.airtableComponent.clickAddTile();
      await this.airtableComponent.clickAppTiles();
      await this.airtableComponent.selectAppTile('Airtable');
      await this.airtableComponent.setTileTitle(tileTitle);
      await this.airtableComponent.configureAppTile(config);
      await this.airtableComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Reload page and verify tile is present
   */
  async reloadAndVerifyTilePresent(tileTitle: string): Promise<void> {
    await test.step(`Reload page and verify tile present: ${tileTitle}`, async () => {
      await this.page.reload();
      await this.verifyTilePresent(tileTitle);
    });
  }

  /**
   * Edit tile name - combines all editing steps into a single method
   */
  async editTile(oldTileTitle: string, newTileTitle: string): Promise<void> {
    await this.airtableComponent.clickEditDashboard();
    await this.airtableComponent.clickThreeDotsOnTile(oldTileTitle);
    await this.airtableComponent.clickTileOption('Edit');
    await this.airtableComponent.setTileTitle(newTileTitle);
    await this.airtableComponent.save();
  }
  // ... existing code ...
  /**
   * Check if tile is present (alias for verifyTilePresent)
   */
  async isTilePresent(tileTitle: string): Promise<void> {
    await this.verifyTilePresent(tileTitle);
  }

  /**
   * Create app tile via API
   */
  async createAppTileViaApi(tileTitle: string, connectorId: string): Promise<void> {
    await test.step(`Create app tile via API: ${tileTitle}`, async () => {
      await createAppTileViaApiHelper(this.page, { tileInstanceName: tileTitle, connectorId });
    });
  }

  /**
   * Remove tile through API
   */
  async removeTileThroughApi(tileTitle: string): Promise<boolean> {
    return await test.step(`Remove tile through API: ${tileTitle}`, async () => {
      console.log(`Attempting to remove tile: ${tileTitle}`);
      const result = await deleteTileByTitleViaApi(this.page, { tileInstanceName: tileTitle });
      console.log(`Tile removal result: ${result}`);
      return result;
    });
  }

  /**
   * Verify tile is removed
   */
  async verifyTileRemoved(tileTitle: string): Promise<void> {
    await test.step(`Verify tile removed: ${tileTitle}`, async () => {
      await this.page.reload();
      await this.page.waitForLoadState('domcontentloaded');
      const tileLocator = this.page.getByRole('heading', { name: tileTitle });
      await expect(tileLocator).not.toBeVisible();
    });
  }
}
