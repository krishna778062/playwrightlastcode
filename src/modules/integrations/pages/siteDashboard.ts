import { BaseAppTileComponent } from '@integrations/components/baseAppTileComponent';
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
  private airtableComponent!: BaseAppTileComponent;

  constructor(page: Page) {
    this.page = page;
    this.airtableComponent = new BaseAppTileComponent(page);
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
    return this.airtableComponent.verifyToastMessage(message);
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
      await this.airtableComponent.verifyToastMessage(successMessage);
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
}
