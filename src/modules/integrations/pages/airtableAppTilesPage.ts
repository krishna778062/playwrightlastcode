import { Page } from '@playwright/test';
import { AirtableAppTilesComponent, AirtableConfig } from '../components/airtableAppTilesComponent';

export class AirtableAppTilesPage extends AirtableAppTilesComponent {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Complete workflow to add an Airtable tile with configuration
   * @param tileTitle - The title for the tile
   * @param config - Airtable-specific configuration
   */
  async addAirtableTile(tileTitle: string, config: AirtableConfig, destination: string = 'Add to home'): Promise<void> {
    await this.clickEditDashboard();
    await this.clickAddTile();
    await this.clickAppTiles();
    await this.selectAppTile('Airtable');
    await this.setTileTitle(tileTitle);
    await this.configureAppTile(config);
    await this.submitTileToHomeOrDashboard(destination);
  }

  /**
   * Personalize tile sorting options
   * @param tileName - Name of the tile to personalize
   * @param sortBy - Sort by option
   * @param sortOrder - Sort order option
   */
  async personalizeTileSorting(tileName: string, sortBy: string, sortOrder: string): Promise<void> {
    await this.openPersonalizeOptions(tileName);
    await this.selectSortBy(sortBy);
    await this.selectSortOrder(sortOrder);
    await this.save();
  }
}
