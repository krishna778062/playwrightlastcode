import { BaseAppTileComponent } from '@integrations/components/baseAppTileComponent';
import { TileOperationsComponent } from '@integrations/components/tileOperationsComponent';
import { TimeOffRequestTileComponent } from '@integrations/components/timeOffRequestTileComponent';
import { ACTION_LABELS, DASHBOARD_BUTTONS } from '@integrations/constants/common';
import { AIRTABLE_TILE } from '@integrations/test-data/app-tiles.test-data';
import { Page, test } from '@playwright/test';

import { getEnvConfig } from '@core/utils/getEnvConfig';

/**
 * Home dashboard page for integrations
 * Provides common tile management and verification methods
 */
export class SiteDashboard {
  private page!: Page;
  private appTileComponent!: BaseAppTileComponent;
  private airtableComponent!: BaseAppTileComponent;
  private timeOffRequestTileComponent!: TimeOffRequestTileComponent;
  private tileOperationsComponent!: TileOperationsComponent;
  private appManagerApiClient?: any;

  constructor(page: Page, appManagerApiClient?: any) {
    this.page = page;
    this.appManagerApiClient = appManagerApiClient;
    this.appTileComponent = new BaseAppTileComponent(page);
    this.airtableComponent = new BaseAppTileComponent(page);
    this.timeOffRequestTileComponent = new TimeOffRequestTileComponent(page);
    this.tileOperationsComponent = new TileOperationsComponent(page);
  }

  /**
   * Navigate to a specific site dashboard
   * @param siteId - The ID of the site to navigate to
   */
  async navigateToSite(siteId: string): Promise<void> {
    const siteUrl = new URL(`/site/${siteId}/dashboard`, getEnvConfig().frontendBaseUrl).toString();
    await this.page.goto(siteUrl);
    await this.verifyThePageIsLoaded();
  }

  /**
   * Verify that the page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyToastMessage(message: string) {
    return this.airtableComponent.verifyToastMessageIsVisibleWithText(message);
  }

  async isTilePresent(tileTitle: string) {
    return this.airtableComponent.isTilePresent(tileTitle);
  }

  async removeTile(tileTitle: string, successMessage: string) {
    await this.airtableComponent.clickThreeDotsOnTile(tileTitle);
    await this.airtableComponent.clickTileOption(ACTION_LABELS.REMOVE);
    await this.airtableComponent.verifyRemovePopupAppears(tileTitle);
    await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.REMOVE);
    if (successMessage) {
      await this.airtableComponent.verifyToastMessageIsVisibleWithText(successMessage);
    }
  }

  /**
   * Edit tile name - combines all editing steps into a single method
   * @param oldTileTitle - Current tile title
   * @param newTileTitle - New tile title
   */
  async editTileName(oldTileTitle: string, newTileTitle: string): Promise<void> {
    await this.airtableComponent.clickThreeDotsOnTile(oldTileTitle);
    await this.airtableComponent.clickTileOption(ACTION_LABELS.EDIT);
    await this.airtableComponent.setTileTitle(newTileTitle);
    await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.SAVE);
  }

  /**
   * Reload page and verify tile is present
   * @param tileTitle - The title of the tile to verify
   */
  async reloadAndVerifyTilePresent(tileTitle: string): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.verifyThePageIsLoaded();
    await this.airtableComponent.isTilePresent(tileTitle);
  }

  /**
   * Complete workflow to add an Airtable tile
   * @param tileTitle - The title for the tile
   * @param config - Airtable configuration
   * @param destination - Where to add the tile
   */
  async addAirtableTile(tileTitle: string, config: any, destination: string): Promise<void> {
    await test.step(`Add Airtable tile: ${tileTitle}`, async () => {
      await this.airtableComponent.clickEditDashboard();
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.airtableComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
      await this.airtableComponent.selectAppTile(AIRTABLE_TILE.APP_NAME);
      await this.airtableComponent.setTileTitle(tileTitle);
      await this.airtableComponent.configureAppTile(config);
      await this.airtableComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Complete workflow to add an Airtable tile
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
   * Generic method to verify tile redirects to any URL
   * @param tileTitle - The title of the tile
   * @param expectedUrl - The expected URL to redirect to
   * @param linkSelector - Optional custom link selector (defaults to 'a:has(h3)')
   */
  async verifyTileRedirects(tileTitle: string, expectedUrl: string, linkSelector?: string): Promise<void> {
    await this.tileOperationsComponent.verifyTileRedirects(tileTitle, expectedUrl, linkSelector);
  }

  /**
   * Verify Airtable tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyAirtableTileContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyAirtableTileContentStructure(tileTitle);
  }

  /**
   * Verify Expensify report tile data
   */
  async verifyExpensifyReportData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyExpensifyReportData(tileTitle);
  }

  /**
   * Verify Apply for Time Off tile form fields are present and functional
   * @param tileTitle - The title of the tile to verify
   */
  async verifyApplyForTimeOffFields(tileTitle: string): Promise<void> {
    await this.timeOffRequestTileComponent.verifyApplyForTimeOffFields(tileTitle);
  }

  /**
   * Verify Display Time Off Balance tile content (no form fields expected)
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDisplayTimeOffBalanceFields(tileTitle: string): Promise<void> {
    await this.timeOffRequestTileComponent.verifyDisplayTimeOffBalanceFields(tileTitle);
  }
  /**
   * Verify Display Time Off tile metadata including VACFT and SICKFT sections
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDisplayTimeOffMetadata(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyDisplayTimeOffMetadata(tileTitle);
  }

  /**
   * Complete workflow to add an app tile
   */
  async addTilewithAppManagerDefined(
    tileTitle: string,
    appName: string,
    tileName: string,
    appManagerDefined: string,
    fieldName: string,
    url: string,
    destination: string
  ): Promise<void> {
    await test.step(`Add ${appName} tile: ${tileTitle}`, async () => {
      await this.appTileComponent.clickEditDashboard();
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
      await this.appTileComponent.selectAppTile(appName);
      await this.appTileComponent.selectTile(tileName);
      await this.appTileComponent.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.appTileComponent.setTileTitle(tileTitle);
      await this.appTileComponent.enterUrl(fieldName, appManagerDefined, url);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }
  /**
   * Verify Calendar upcoming events tile data
   */
  async verifyCalendarUpcomingEventsTileData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyUpcomingEventsTileData(tileTitle);
  }

  /**
   * Verify Show more behaviour for apptile on site dashboard
   */
  async verifyShowMoreBehavior(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyShowMoreBehavior(tileTitle);
  }
  /**
   * Verify DocuSign tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDocuSignContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyDocuSignTileContentStructure(tileTitle);
  }
}
