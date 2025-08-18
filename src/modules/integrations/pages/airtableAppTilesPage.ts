import { Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { AirtableAppTilesComponent, AirtableConfig } from '../components/airtableAppTilesComponent';
import { BaseAppTileComponent } from '../components/baseAppTileComponent';
import { IntegrationsBasePage } from './integrationsBasePage';

/**
 * Airtable App Tiles Page following content/chat module patterns
 * Composition over inheritance approach
 */
export class AirtableAppTilesPage extends IntegrationsBasePage {
  // Component composition
  readonly airtableComponent: AirtableAppTilesComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE); // Airtable tiles are on home dashboard
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
    // Verify we're on the home page where Airtable tiles are displayed
    await this.verifier.verifyTheElementIsVisible(this.page.locator('main'), {
      assertionMessage: 'Home page main content should be visible',
      timeout: 30000,
    });
  }

  /**
   * Get actions (following global-search pattern)
   */
  get actions() {
    return this;
  }

  /**
   * Get assertions (following global-search pattern)
   */
  get assertions() {
    return this;
  }

  // Airtable-specific methods
  async addAirtableTile(tileTitle: string, config: AirtableConfig, destination: string = 'Add to home'): Promise<void> {
    return this.airtableComponent.addAirtableTile(tileTitle, config, destination);
  }

  async personalizeTileSorting(tileName: string, sortBy: string, sortOrder: string): Promise<void> {
    return this.airtableComponent.personalizeTileSorting(tileName, sortBy, sortOrder);
  }

  async verifyPersonalizeVisible(tileTitle: string): Promise<void> {
    return this.airtableComponent.verifyPersonalizeVisible(tileTitle);
  }

  async verifyPersonalizeNotVisible(tileTitle: string): Promise<void> {
    return this.airtableComponent.verifyPersonalizeNotVisible(tileTitle);
  }

  async verifyTileAscending(tileTitle: string): Promise<void> {
    await this.airtableComponent.verifyTilesAscending(tileTitle);
  }

  async verifyAscendingOrderThroughAPI(): Promise<void> {
    return this.airtableComponent.verifyAscendingOrderThroughAPI();
  }
}
