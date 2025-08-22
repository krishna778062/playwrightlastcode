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

  // One action to remove a tile end-to-end
  async removeTile(tileTitle: string, successMessage?: string): Promise<void> {
    await this.clickThreeDotsOnTile(tileTitle);
    await this.clickTileOption('Remove');
    await this.verifyRemovePopupAppears(tileTitle);
    await this.clickRemoveTile();
    if (successMessage) {
      await this.verifyToastMessage(successMessage);
    }
  }

  async clickDone(): Promise<void> {
    return this.getAppTileComponent().clickDone();
  }

  /**
   * Wait for tile via API, refresh UI, and assert presence
   */
  async ensureTileVisibleAfterApi(
    tileTitle: string,
    options?: { timeoutMs?: number; pollIntervalMs?: number }
  ): Promise<void> {
    await this.getAppTileComponent().ensureTileVisibleAfterApi(tileTitle, options);
    await this.isTilePresent(tileTitle);
  }

  /**
   * Wait for tile removal via API, refresh UI, and assert absence
   */
  async ensureTileRemovedAfterApi(
    tileTitle: string,
    options?: { timeoutMs?: number; pollIntervalMs?: number }
  ): Promise<void> {
    await this.getAppTileComponent().ensureTileRemovedAfterApi(tileTitle, options);
    const exists = await this.tileExists(tileTitle);
    const { expect } = await import('@playwright/test');
    await expect(exists).toBeFalsy();
  }

  /** Reload and verify presence (keeps API wait at callsite) */
  async reloadAndVerifyTilePresent(tileTitle: string): Promise<void> {
    await this.getAppTileComponent().reloadAndVerifyTilePresent(tileTitle);
    await this.isTilePresent(tileTitle);
  }

  /** Reload and verify absence (keeps API wait at callsite) */
  async reloadAndVerifyTileAbsent(tileTitle: string): Promise<void> {
    await this.getAppTileComponent().reloadAndVerifyTileAbsent(tileTitle);
    const exists = await this.tileExists(tileTitle);
    const { expect } = await import('@playwright/test');
    await expect(exists).toBeFalsy();
  }

  /** Delete a tile by title via API and return whether it succeeded */
  async removeTileThroughApi(tileTitle: string): Promise<boolean> {
    const { deleteTileByTitleViaApi } = await import('../api/helpers/tileApiHelpers');
    return deleteTileByTitleViaApi(this.page, { tileInstanceName: tileTitle });
  }

  async removeTileByInstanceIdThroughApi(instanceId: string): Promise<boolean> {
    const { deleteTileByInstanceIdViaApi } = await import('../api/helpers/tileApiHelpers');
    return deleteTileByInstanceIdViaApi(this.page, { instanceId });
  }

  // Personalize verification methods
  async verifyPersonalizeVisible(tileTitle: string): Promise<void> {
    return this.getAppTileComponent().verifyPersonalizeVisible(tileTitle);
  }

  async verifyPersonalizeNotVisible(tileTitle: string): Promise<void> {
    return this.getAppTileComponent().verifyPersonalizeNotVisible(tileTitle);
  }
}
