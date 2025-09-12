import { DASHBOARD_BUTTONS, FIELD_NAMES, ORGANIZATION_SETTINGS } from '@integrations/constants/common';
import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { TileOperationsComponent } from '@integrations-components/tileOperationsComponent';
import { AIRTABLE_TILE } from '@integrations-test-data/app-tiles.test-data';
import { expect, Page, test } from '@playwright/test';

import { TileManagementHelper } from '@core/helpers/tileManagementHelper';

class AppTileComponent extends BaseAppTileComponent {
  constructor(page: Page) {
    super(page);
  }
}

export class HomeDashboard {
  private readonly page: Page;
  private readonly airtableComponent: BaseAppTileComponent;
  private readonly appTileComponent: AppTileComponent;
  private readonly tileOperationsComponent: TileOperationsComponent;
  private readonly tileManagementHelper: TileManagementHelper;

  private readonly defaultConfig = {
    baseName: AIRTABLE_TILE.BASE_NAME,
    tableId: AIRTABLE_TILE.TABLE_ID,
    sortBy: AIRTABLE_TILE.USER_DEFINED,
    sortOrder: AIRTABLE_TILE.USER_DEFINED,
  };

  constructor(page: Page, tileManagementHelper: TileManagementHelper) {
    this.page = page;
    this.airtableComponent = new BaseAppTileComponent(page);
    this.appTileComponent = new AppTileComponent(page);
    this.tileOperationsComponent = new TileOperationsComponent(page);
    this.tileManagementHelper = tileManagementHelper;
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
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
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
    await this.airtableComponent.clickTileOption(DASHBOARD_BUTTONS.EDIT);
    await this.airtableComponent.setTileTitle(newTileTitle);
    await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.SAVE);
  }
  /**
   * Check if tile is present (alias for verifyTilePresent)
   */
  async isTilePresent(tileTitle: string): Promise<void> {
    await this.verifyTilePresent(tileTitle);
  }

  /**
   * Complete workflow to add an app tile
   */
  async addTile(tileTitle: string, appName: string, tileName: string, destination: string): Promise<void> {
    await test.step(`Add ${appName} tile: ${tileTitle}`, async () => {
      await this.airtableComponent.clickEditDashboard();
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
      await this.airtableComponent.selectAppTile(appName);
      await this.airtableComponent.selectTile(tileName);
      await this.airtableComponent.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.airtableComponent.setTileTitle(tileTitle);
      await this.airtableComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Complete workflow to add an app tile
   */
  async addTilewithPersonalize(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string
  ): Promise<void> {
    await test.step(`Add ${appName} tile: ${tileTitle}`, async () => {
      await this.airtableComponent.clickEditDashboard();
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
      await this.airtableComponent.selectAppTile(appName);
      await this.airtableComponent.selectTile(tileName);
      await this.airtableComponent.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.airtableComponent.setTileTitle(tileTitle);
      await this.selectRadioOption(FIELD_NAMES.ORGANIZATION, ORGANIZATION_SETTINGS.USER_DEFINED);
      await this.airtableComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Complete workflow to add an app tile
   */
  async addTilewithPersonalizeExpensify(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string
  ): Promise<void> {
    await test.step(`Add ${appName} tile: ${tileTitle}`, async () => {
      await this.airtableComponent.clickEditDashboard();
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
      await this.airtableComponent.selectAppTile(appName);
      await this.airtableComponent.selectTile(tileName);
      await this.airtableComponent.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.airtableComponent.setTileTitle(tileTitle);
      await this.selectRadioOption('Status', ORGANIZATION_SETTINGS.USER_DEFINED);
      await this.airtableComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  async PersonalizeTile(tileTitle: string, fieldName: string, fieldValue: string): Promise<void> {
    await this.tileOperationsComponent.personalizeTile(tileTitle, fieldName, fieldValue);
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

  /**
   * Verify GitHub PR tile data
   */
  async verifyGitHubPRTileData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyGitHubPRTileData(tileTitle);
  }

  /**
   * Verify GitHub My Open PRs tile data
   */
  async verifyGitHubOpenPRs(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyGitHubOpenPRs(tileTitle);
  }

  /**
   * Select radio button option by field name and option text
   */
  async selectRadioOption(fieldName: string, option: string): Promise<void> {
    await this.tileOperationsComponent.selectRadioOption(fieldName, option);
  }

  /**
   * Select any radio button option by label text (for unique labels)
   */
  async selectRadioOptionByLabel(option: string): Promise<void> {
    await this.tileOperationsComponent.selectRadioOptionByLabel(option);
  }

  /**
   * Select value from Organization combobox dropdown
   */
  async selectFromDropdown(option: string, itemName: string): Promise<void> {
    await this.tileOperationsComponent.selectFromDropdown(option, itemName);
  }

  /**
   * Select status from status dropdown menu
   */
  async selectStatus(option: string, status: string): Promise<void> {
    await this.tileOperationsComponent.selectFromDropdown(option, status);
  }

  /**
   * Verify status tag is shown in tile
   */
  async verifyStatusTag(tileTitle: string, status: string): Promise<void> {
    await this.tileOperationsComponent.verifyStatusTag(tileTitle, status);
  }

  /**
   * Verify tile shows "No results" state with settings button
   */
  async verifyNoResultsWithSettings(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyNoResultsWithSettings(tileTitle);
  }

  /**
   * Click settings button and verify personalize modal opens
   */
  async clickSettingsAndVerifyPersonalizeModal(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.clickSettingsAndVerifyPersonalizeModal(tileTitle);
  }

  /**
   * Generic method to verify tile redirects to any URL
   * @param tileTitle - The title of the tile
   * @param expectedUrl - The expected URL to redirect to
   * @param linkSelector - Optional custom link selector (defaults to 'a:has(h3)')
   */
  async verifyTileRedirects(tileTitle: string, expectedUrl: string, linkSelector?: string): Promise<void> {
    await this.tileOperationsComponent.verifyTileRedirects(tileTitle, expectedUrl, linkSelector);
  }

  /**
   * Verify Expensify report tile data
   */
  async verifyExpensifyReportData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyExpensifyReportData(tileTitle);
  }

  /**
   * Verify Airtable tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyAirtableTileContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyAirtableTileContentStructure(tileTitle);
  }
}
