import { Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';
import { BaseAppTileComponent } from '../components/baseAppTileComponent';

/**
 * Base page for all integrations pages following content/chat module patterns
 * Provides common integration functionality and component composition
 */
export abstract class IntegrationsBasePage extends BasePage {
  constructor(page: Page, endpoint?: string) {
    super(page, endpoint);
  }

  /**
   * Abstract method to be implemented by specific integration pages
   * This allows the factory pattern to work with different integration types
   */
  abstract getAppTileComponent(): BaseAppTileComponent;

  // Common tile operations available in BaseAppTileComponent
  async clickEditDashboard(): Promise<void> {
    return this.getAppTileComponent().clickEditDashboard();
  }

  async clickAddTile(): Promise<void> {
    return this.getAppTileComponent().clickAddTile();
  }

  async clickAppTiles(): Promise<void> {
    return this.getAppTileComponent().clickAppTiles();
  }

  async selectAppTile(appName: string): Promise<void> {
    return this.getAppTileComponent().selectAppTile(appName);
  }

  async setTileTitle(title: string): Promise<void> {
    return this.getAppTileComponent().setTileTitle(title);
  }

  async save(): Promise<void> {
    return this.getAppTileComponent().save();
  }

  async submitTileToHomeOrDashboard(choice: string): Promise<void> {
    return this.getAppTileComponent().submitTileToHomeOrDashboard(choice);
  }

  async verifyToastMessage(message: string): Promise<void> {
    return this.getAppTileComponent().verifyToastMessage(message);
  }

  async isTilePresent(tileTitle: string): Promise<void> {
    return this.getAppTileComponent().isTilePresent(tileTitle);
  }

  async tileExists(title: string): Promise<boolean> {
    return this.getAppTileComponent().tileExists(title);
  }

  async clickThreeDotsOnTile(tileName: string): Promise<void> {
    return this.getAppTileComponent().clickThreeDotsOnTile(tileName);
  }

  async clickTileOption(option: 'Edit' | 'Remove'): Promise<void> {
    return this.getAppTileComponent().clickTileOption(option);
  }

  async verifyRemovePopupAppears(tileName: string): Promise<void> {
    return this.getAppTileComponent().verifyRemovePopupAppears(tileName);
  }

  async clickRemoveTile(): Promise<void> {
    return this.getAppTileComponent().clickRemoveTile();
  }

  async clickDone(): Promise<void> {
    return this.getAppTileComponent().clickDone();
  }
}
