import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface CustomAppTile {
  name: string;
  description: string;
  app: string;
  status: 'Draft' | 'Published';
  updated: string;
  rowId?: string;
}

export interface TileFilter {
  apps?: string;
  status?: 'Draft' | 'Published' | 'All';
}

export class CustomAppTilesPage extends BasePage {
  // Page header elements
  readonly pageTitle: Locator;
  readonly createCustomAppTileButton: Locator;

  // Search elements
  readonly searchInput: Locator;

  // Create tile form elements
  readonly tileNameInput: Locator;
  readonly tileDescriptionInput: Locator;
  readonly tileTypeSelect: Locator;
  readonly appSelect: Locator;
  readonly apiActionSelect: Locator;
  // Add tile modal footer button
  readonly addToHomeButton: Locator;
  readonly addToSiteDashboardButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CUSTOM_APP_TILES_PAGE);

    // Page header elements
    this.pageTitle = page.locator('h1', { hasText: 'Custom app tiles' });
    this.createCustomAppTileButton = page.getByRole('link', { name: 'Create custom app tile' });

    // Search elements
    this.searchInput = page.getByPlaceholder('Search…');

    // Create tile form elements
    this.tileNameInput = page.locator('#tileName');
    this.tileDescriptionInput = page.locator('#tileDescription');
    this.tileTypeSelect = page.locator('#tileType');
    this.appSelect = page.locator('[aria-label="App"]');
    this.apiActionSelect = page.locator('[aria-label="API action"]');
    // Add tile modal footer button
    this.addToHomeButton = page.getByRole('button', { name: 'Add to home' });
    this.addToSiteDashboardButton = page.getByRole('button', { name: 'Add to site dashboard' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Custom App Tiles page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageTitle, {
        timeout: 30_000,
        assertionMessage: 'Page title should be visible',
      });
    });
  }

  async clickCreateCustomAppTileButton(): Promise<void> {
    await test.step('Click on Create custom app tile button', async () => {
      await this.clickOnElement(this.createCustomAppTileButton, {
        stepInfo: 'Click Create custom app tile button',
      });
    });
  }

  async enterTileName(tileName: string): Promise<void> {
    await test.step(`Enter tile name: ${tileName}`, async () => {
      await this.fillInElement(this.tileNameInput, tileName, {
        stepInfo: `Enter tile name: ${tileName}`,
      });
    });
  }

  async enterTileDescription(description: string): Promise<void> {
    await test.step(`Enter tile description: ${description}`, async () => {
      await this.fillInElement(this.tileDescriptionInput, description, {
        stepInfo: `Enter tile description: ${description}`,
      });
    });
  }

  async selectTileType(option: string): Promise<void> {
    await test.step(`Select tile type: ${option}`, async () => {
      await this.tileTypeSelect.selectOption(option);
    });
  }

  async selectApp(appName: string): Promise<void> {
    await test.step(`Select app: ${appName}`, async () => {
      await this.appSelect.click();
      await this.page.getByRole('option', { name: appName }).click();
    });
  }

  async selectApiAction(actionName: string): Promise<void> {
    await test.step(`Select API action: ${actionName}`, async () => {
      await this.apiActionSelect.click();
      await this.page.getByRole('option', { name: actionName }).click();
    });
  }

  async clickButton(buttonName: string): Promise<void> {
    await test.step(`Click ${buttonName} button`, async () => {
      const button = this.page.getByRole('button', { name: buttonName });
      await this.clickOnElement(button, {
        stepInfo: `Click ${buttonName} button`,
      });
    });
  }

  async verifyButtonStates(): Promise<void> {
    await test.step('Verify button states in footer', async () => {
      // Verify Cancel button is enabled
      const cancelButton = this.page.getByRole('link', { name: 'Cancel' });
      await this.verifier.verifyTheElementIsVisible(cancelButton, {
        assertionMessage: 'Cancel button should be visible and enabled',
      });
      await this.verifier.verifyTheElementIsEnabled(cancelButton, {
        assertionMessage: 'Cancel button should be enabled',
      });

      // Verify Save button is disabled
      const saveButton = this.page.getByRole('button', { name: 'Save' });
      await this.verifier.verifyTheElementIsVisible(saveButton, {
        assertionMessage: 'Save button should be visible',
      });
      await this.verifyButtonIsDisabled(saveButton, 'Save button should be disabled');

      // Verify Publish button is disabled
      const publishButton = this.page.getByRole('button', { name: 'Publish' });
      await this.verifier.verifyTheElementIsVisible(publishButton, {
        assertionMessage: 'Publish button should be visible',
      });
      await this.verifyButtonIsDisabled(publishButton, 'Publish button should be disabled');
    });
  }

  async verifyButtonIsDisabled(locator: Locator, message: string): Promise<void> {
    await test.step(`Verify button is disabled: ${message}`, async () => {
      await expect(locator, 'Button should be disabled').toBeDisabled();
    });
  }
}
