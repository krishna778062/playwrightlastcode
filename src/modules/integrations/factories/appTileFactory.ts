import { Page } from '@playwright/test';
import { BaseAppTileComponent } from '../components/baseAppTileComponent';
import { AirtableAppTilesComponent, AirtableConfig } from '../components/airtableAppTilesComponent';
import { APP_TILE } from '../constants/tileTypes';

export type AppTileConfig = AirtableConfig;

export type SupportedAppTile = typeof APP_TILE.AIRTABLE;

/**
 * Factory class for creating app tile components based on the app type
 */
export class AppTileFactory {
  /**
   * Creates an appropriate app tile component based on the app name
   * @param page - Playwright page object
   * @param appName - Name of the app (e.g., 'Airtable')
   * @returns App-specific component instance
   */
  static createAppTileComponent(page: Page, appName: SupportedAppTile): BaseAppTileComponent {
    if (appName === APP_TILE.AIRTABLE) {
      return new AirtableAppTilesComponent(page);
    }
    throw new Error(`Unsupported app tile: ${appName}`);
  }

  /**
   * Get a list of all supported app tiles
   */
  static getSupportedApps(): SupportedAppTile[] {
    return [APP_TILE.AIRTABLE];
  }

  /**
   * Check if an app is supported by the factory
   * @param appName - Name of the app to check
   */
  static isSupported(appName: string): appName is SupportedAppTile {
    return this.getSupportedApps().includes(appName as SupportedAppTile);
  }
}

/**
 * Generic App Tile Page class that can work with any supported integration
 */
export class GenericAppTilePage {
  private component: BaseAppTileComponent;
  readonly page: Page;

  constructor(page: Page, appName: SupportedAppTile) {
    this.page = page;
    this.component = AppTileFactory.createAppTileComponent(page, appName);
  }

  /**
   * Complete workflow to add any supported app tile with configuration
   * @param appName - Name of the app (e.g., 'Airtable')
   * @param tileTitle - The title for the tile
   * @param config - App-specific configuration
   * @param destination - Where to add the tile (default: 'Add to home')
   */
  async addAppTile(
    appName: SupportedAppTile,
    tileTitle: string,
    config: AppTileConfig,
    destination: string = 'Add to home'
  ): Promise<void> {
    await this.component.clickEditDashboard();
    await this.component.clickAddTile();
    await this.component.clickAppTiles();
    await this.component.selectAppTile(appName);
    await this.component.setTileTitle(tileTitle);
    await this.component.configureAppTile(config);
    await this.component.submitTileToHomeOrDashboard(destination);
  }

  /**
   * Complete workflow to remove a tile
   * @param tileName - Name of the tile to remove
   */
  async removeTile(tileName: string): Promise<void> {
    await this.component.clickThreeDotsOnTile(tileName);
    await this.component.clickTileOption('Remove');
    await this.component.clickRemoveTile();
  }

  /**
   * Verify that a tile is present
   * @param tileTitle - Title of the tile to verify
   */
  async verifyTilePresent(tileTitle: string): Promise<void> {
    await this.component.isTilePresent(tileTitle);
  }

  /**
   * Verify a toast message
   * @param message - Expected toast message
   */
  async verifyToastMessage(message: string): Promise<void> {
    await this.component.verifyToastMessage(message);
  }
}
