import { Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { AirtableAppTilesComponent, AirtableConfig } from '../components/airtableAppTilesComponent';
import { BaseAppTileComponent } from '../components/baseAppTileComponent';
import { IntegrationsBasePage } from './integrationsBasePage';
import { verifyAscendingOrderThroughAPI } from '../api/helpers/airtableTileApi';

/**
 * Airtable App Tiles Page following content/chat module patterns
 * Composition over inheritance approach
 */
export class AirtableAppTilesPage extends IntegrationsBasePage {
  readonly airtableComponent: AirtableAppTilesComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.airtableComponent = new AirtableAppTilesComponent(page);
  }

  /**
   * Get the app tile component (required by base class)
   */
  getAppTileComponent(): BaseAppTileComponent {
    return this.airtableComponent;
  }

  /**
   * Verify that the Airtable tiles page is loaded (required by BasePage)
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator('main'), {
      assertionMessage: 'Home page main content should be visible',
      timeout: 30000,
    });
  }

  // Airtable-specific methods
  async addAirtableTile(tileTitle: string, config: AirtableConfig, destination: string = 'Add to home'): Promise<void> {
    return this.airtableComponent.addAirtableTile(tileTitle, config, destination);
  }

  async personalizeTileSorting(tileName: string, sortBy: string, sortOrder: string): Promise<void> {
    return this.airtableComponent.personalizeTileSorting(tileName, sortBy, sortOrder);
  }

  async verifyTileAscending(tileTitle: string): Promise<void> {
    await this.airtableComponent.verifyTilesAscending(tileTitle);
  }

  async verifyAscendingOrderThroughAPI(): Promise<void> {
    return verifyAscendingOrderThroughAPI(this.page);
  }
}
