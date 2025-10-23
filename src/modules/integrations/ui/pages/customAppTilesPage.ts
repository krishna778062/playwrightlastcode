import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { expect, Locator, Page, test } from '@playwright/test';
import path from 'path';

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
  readonly appTileComponent: BaseAppTileComponent;

  // Page header elements
  readonly pageTitle: Locator;
  readonly createCustomAppTileButton: Locator;

  // Search elements
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;

  // Apps dropdown elements
  readonly appsDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly appsSearchInput: Locator;
  readonly appsClearButton: Locator;
  readonly appOptionLabels: Locator;

  // Tile list elements
  readonly tileRows: Locator;
  readonly noResultsHeading: Locator;
  readonly noResultsDescription: Locator;
  readonly showMoreButton: Locator;
  readonly resultCount: Locator;

  // Tile management elements
  readonly tileMoreButton: Locator;
  readonly tileMenuOption: Locator;
  readonly confirmDeleteButton: Locator;
  readonly tileHeadingByPrefix: Locator;
  readonly tileStatusByName: Locator;
  readonly topTileName: Locator;

  // Create tile form elements
  readonly tileNameInput: Locator;
  readonly tileDescriptionInput: Locator;
  readonly tileTypeSelect: Locator;
  readonly appSelect: Locator;
  readonly apiActionSelect: Locator;
  readonly saveButton: Locator;
  readonly nextButton: Locator;
  readonly publishButton: Locator;
  readonly previewButton: Locator;

  // Canvas and builder elements
  readonly canvasContainer: Locator;
  readonly imageTextRowsBlock: Locator;
  readonly containerBlock: Locator;
  readonly textBlock: Locator;
  readonly imageBlock: Locator;
  readonly formContainer: Locator;

  // Canvas verification elements
  readonly smallImagePlaceholder: Locator;
  readonly imageRowContainer: Locator;
  readonly innerTextContainer: Locator;
  readonly innerTextContainers: Locator;
  readonly dividerHr: Locator;
  readonly canvasComponentContainers: Locator;
  readonly formContainerSubmitButton: Locator;
  readonly formContainerButton: Locator;

  // Data tab elements
  readonly dataTab: Locator;
  readonly tileBuilderTab: Locator;
  readonly loopDataToggle: Locator;
  readonly arrayObjectDropdown: Locator;
  readonly expandTileRadio: Locator;
  readonly addDynamicButton: Locator;
  readonly dynamicField: Locator;
  readonly initialDisplayCountDropdown: Locator;
  readonly externalUrlButtonText: Locator;

  // Image configuration elements
  readonly imageSizeDropdown: Locator;
  readonly imageContainer: Locator;
  readonly targetUrlInput: Locator;
  readonly imageWithHyperlink: Locator;
  readonly selectFromComputerButton: Locator;
  readonly imageUploadInput: Locator;

  // Form configuration elements
  readonly configureApiActionButton: Locator;
  readonly apiActionWrapper: Locator;
  readonly apiActionWrapperEnabled: Locator;
  readonly apiActionWrapperDisabled: Locator;
  readonly addCustomAppLink: Locator;
  readonly createApiActionLink: Locator;
  readonly formBehaviorDropdown: Locator;
  readonly overlayBody: Locator;
  readonly overlayFieldLabel: Locator;

  // Success/Error message elements
  readonly successMessage: Locator;
  readonly botLink: Locator;
  readonly errorInput: Locator;
  readonly incompleteSettingsMessage: Locator;

  // Dialog and modal elements
  readonly dialogTitle: Locator;
  readonly changeTileTypeMessage: Locator;
  readonly cancelButton: Locator;
  readonly confirmButton: Locator;

  // Tile field elements
  readonly tileFieldLabel: Locator;
  readonly tileFieldLink: Locator;
  readonly tileFieldImage: Locator;

  // Button state verification elements
  readonly saveButtonForVerification: Locator;
  readonly nextButtonForVerification: Locator;

  // Additional locators for methods
  readonly firstTileRow: Locator;
  readonly cancelButtonForVerification: Locator;
  readonly saveButtonForDisabledVerification: Locator;
  readonly nextButtonForDisabledVerification: Locator;
  readonly formBehaviorDropdownOptions: Locator;
  readonly incompleteSettingsMessageLocator: Locator;
  readonly changeTileTypeDialog: Locator;
  readonly changeTileTypeMessageLocator: Locator;
  readonly previousLinkLocator: Locator;
  readonly previousDividerLocator: Locator;
  readonly formHeadingLocator: Locator;
  readonly configureButtonLocator: Locator;
  readonly tileHeaderLocator: Locator;
  readonly apiActionNoResults: Locator;

  // More locators for remaining methods
  readonly appColumns: Locator;
  readonly checkboxes: Locator;
  readonly reactSelectInput: Locator;
  readonly buttonElement: Locator;
  readonly containerPlaceholder: Locator;
  readonly loopContainers: Locator;
  readonly inlineTileFieldLabel: Locator;
  readonly tileRowByPrefix: Locator;
  readonly saveButtonGeneric: Locator;
  readonly nextButtonGeneric: Locator;

  // Dynamic locators for dropdown options
  readonly arrayOption: Locator;
  readonly dropdownItem: Locator;
  readonly displayCountOption: Locator;
  readonly imageSizeOption: Locator;
  readonly formBehaviorOption: Locator;

  // Additional dynamic locators for methods
  readonly dynamicTextBlock: Locator;
  readonly dynamicSourceLocator: Locator;
  readonly dynamicPropertyLocator: Locator;
  readonly dynamicTileRow: Locator;
  readonly dynamicMoreButton: Locator;
  readonly dynamicMenuItem: Locator;
  readonly dynamicTileStatus: Locator;
  readonly dynamicTileHeader: Locator;
  readonly dynamicSaveButton: Locator;
  readonly dynamicNextButton: Locator;

  // Additional locators for remaining methods
  readonly dynamicAppColumns: Locator;
  readonly dynamicBlockSelector: Locator;
  readonly dynamicImageTextRowsTemplate: Locator;
  readonly dynamicParagraphs: Locator;
  readonly dynamicFallbackPlaceholder: Locator;
  readonly dynamicTextElements: Locator;
  readonly dynamicTileSection: Locator;

  // Additional locators for methods that were using inline locators
  readonly appOptionByRole: Locator;
  readonly apiActionOptionByRole: Locator;
  readonly buttonByRole: Locator;
  readonly linkByRole: Locator;
  readonly radioByRole: Locator;
  readonly clearButtonByRole: Locator;
  readonly parameterLocator: Locator;
  readonly radioLocator: Locator;
  readonly fieldLabelLocator: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CUSTOM_APP_TILES_PAGE);

    this.appTileComponent = new BaseAppTileComponent(page);

    // Page header elements
    this.pageTitle = page.locator('h1', { hasText: 'Custom app tiles' });
    this.createCustomAppTileButton = page.getByRole('link', { name: 'Create custom app tile' });

    // Search elements
    this.searchInput = page.locator('#search');
    this.clearSearchButton = page.locator('button[aria-label="Clear"]');

    // Apps dropdown elements
    this.appsDropdown = page.locator('button', { hasText: 'Apps' });
    this.statusDropdown = page.locator('button.FilterGroup-module__pill__a50KR', { hasText: 'Status' });
    this.appsSearchInput = page.locator('input[aria-label="Search…"]');
    this.appsClearButton = page.locator('button[type="reset"]', { hasText: 'Clear' });
    this.appOptionLabels = page.locator('label.CheckboxWithIconAndCount-module__label__iBhDy');

    // Tile list elements
    this.tileRows = page.locator('tr[data-testid^="dataGridRow-"]');
    this.noResultsHeading = page.locator('h3', { hasText: 'No results' });
    this.noResultsDescription = page.locator('p', { hasText: 'Try adjusting search term or filters' });
    this.showMoreButton = page.locator('button', { hasText: 'Show more' });
    this.resultCount = page.locator('.TilesList_resultCount--kEOjb');

    // Tile management elements
    this.tileMoreButton = page.locator('button[aria-label="Show more"]');
    this.tileMenuOption = page
      .locator('[role="menuitem"], .dropdown-menu-item, [data-testid*="menu-item"], [data-testid*="option"]')
      .first();
    this.confirmDeleteButton = page.locator('button', { hasText: 'Delete' });
    this.tileHeadingByPrefix = page.locator('h3.Typography-module__heading3__OGpiQ');
    this.tileStatusByName = page.locator('span.StatusTag-module__statusTag__NNFTa');
    this.topTileName = page.locator('h3.Typography-module__heading3__OGpiQ').first();

    // Create tile form elements
    this.tileNameInput = page.locator('#tileName');
    this.tileDescriptionInput = page.locator('#tileDescription');
    this.tileTypeSelect = page.locator('#tileType');
    this.appSelect = page.locator('[aria-label="App"]');
    this.apiActionSelect = page.locator('[aria-label="API action"]');
    this.saveButton = page.locator('button', { hasText: 'Save' });
    this.nextButton = page.locator('button', { hasText: 'Next' });
    this.publishButton = page.locator('button', { hasText: 'Publish' });
    this.previewButton = page.locator('button', { hasText: 'Preview' });

    // Canvas and builder elements
    this.canvasContainer = page.locator('[data-testid="container"]');
    this.imageTextRowsBlock = page.locator('[data-testid="image-text-rows-block"]');
    this.containerBlock = page.locator('[data-testid="container-block"]');
    this.textBlock = page.locator('[data-testid="text-block"]');
    this.imageBlock = page.locator('[data-testid="image-block"]');
    this.formContainer = page.locator('[data-testid="form-container"]');

    // Canvas verification elements
    this.smallImagePlaceholder = page.locator('[data-testid="small-image-placeholder"]');
    this.imageRowContainer = page.locator('[data-testid="image-row-container"]');
    this.innerTextContainer = page.locator('[data-testid="inner-text-container"]');
    this.innerTextContainers = page.locator('[data-testid="inner-text-containers"]');
    this.dividerHr = page.locator('[data-testid="divider-hr"]');
    this.canvasComponentContainers = page.locator('[data-testid="canvas-component-containers"]');
    this.formContainerSubmitButton = page.locator('[data-testid="form-container-submit-button"]');
    this.formContainerButton = page.locator('div[data-testid="formContainer"] button');

    // Data tab elements
    this.dataTab = page.locator('[data-testid="data-tab"]');
    this.tileBuilderTab = page.locator('button', { hasText: 'Tile builder' });
    this.loopDataToggle = page.locator('[data-testid="loop-data-toggle"]');
    this.arrayObjectDropdown = page.locator('[data-testid="array-object-dropdown"]');
    this.expandTileRadio = page.locator('[data-testid="expand-tile-radio"]');
    this.addDynamicButton = page.locator('[data-testid="add-dynamic-button"]');
    this.dynamicField = page.locator('[data-testid="dynamic-field"]');
    this.initialDisplayCountDropdown = page.locator('[data-testid="initial-display-count-dropdown"]');
    this.externalUrlButtonText = page.locator('[data-testid="external-url-button-text"]');

    // Image configuration elements
    this.imageSizeDropdown = page.locator(
      '[data-testid="image-size-dropdown"], select[aria-label*="size"], select[aria-label*="Size"]'
    );
    this.imageContainer = page.locator(
      '[data-testid="image-container"], ._imageContainer_1kgp0_1, [class*="imageContainer"]'
    );
    this.targetUrlInput = page.locator('[data-testid="target-url-input"]');
    this.imageWithHyperlink = page.locator('[data-testid="image-with-hyperlink"]');
    this.selectFromComputerButton = page.locator('button', { hasText: 'select from computer' });
    this.imageUploadInput = page.locator('input[type="file"][aria-labelledby*="dropzone"]');

    // Form configuration elements
    this.configureApiActionButton = page.locator('[data-testid="configure-api-action-button"]');
    this.apiActionWrapper = page.locator('div[data-testid="field-API action"]');
    this.apiActionWrapperEnabled = page.locator('div[data-testid="field-API action"] [aria-disabled="false"]');
    this.apiActionWrapperDisabled = page.locator('div[data-testid="field-API action"] [aria-disabled="true"]');
    this.addCustomAppLink = page.locator('a', { hasText: 'App not available? Add custom app' });
    this.createApiActionLink = page.locator('a', { hasText: 'API action not available? Create API action' });
    this.formBehaviorDropdown = page.locator('select[aria-label="Form behavior"]');
    this.overlayBody = page.locator('[data-testid="overlay-body"]');
    this.overlayFieldLabel = page.locator('[data-testid="overlay-field-label"]');

    // Success/Error message elements
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.botLink = page.locator('[data-testid="bot-link"]');
    this.errorInput = page.locator('[data-testid="error-input"]');
    this.incompleteSettingsMessage = page.locator('[data-testid="incomplete-settings-message"]');

    // Dialog and modal elements
    this.dialogTitle = page.locator('[data-testid="dialog-title"]');
    this.changeTileTypeMessage = page.locator('[data-testid="change-tile-type-message"]');
    this.cancelButton = page.locator('button', { hasText: 'Cancel' });
    this.confirmButton = page.locator('button', { hasText: 'Confirm' });

    // Tile field elements
    this.tileFieldLabel = page.locator('[data-testid="tile-field-label"]');
    this.tileFieldLink = page.locator('[data-testid="tile-field-link"]');
    this.tileFieldImage = page.locator('[data-testid="tile-field-image"]');

    // Button state verification elements
    this.saveButtonForVerification = page.locator('button', { hasText: 'Save' });
    this.nextButtonForVerification = page.locator('button', { hasText: 'Next' });

    // Additional locators for methods
    this.firstTileRow = page.locator('tbody tr').first();
    this.cancelButtonForVerification = page.getByRole('link', { name: 'Cancel' });
    this.saveButtonForDisabledVerification = page.getByRole('button', { name: 'Save' });
    this.nextButtonForDisabledVerification = page.getByRole('button', { name: 'Next' });
    this.formBehaviorDropdownOptions = page.locator('select[aria-label="Form behavior"] option:not([disabled])');
    this.incompleteSettingsMessageLocator = page.locator('[data-testid="incomplete-settings-message"]');
    this.changeTileTypeDialog = page.locator('[data-testid="dialog-title"]');
    this.changeTileTypeMessageLocator = page.locator('[data-testid="change-tile-type-message"]');
    this.previousLinkLocator = page.locator('[data-testid="ticket-tile"]', { hasText: 'atlassian.net/rest/api' });
    this.previousDividerLocator = page.locator('[data-testid="canvas-old-divider"]', { hasText: 'divider' });
    this.formHeadingLocator = page.locator('h3', { hasText: 'Form' });
    this.configureButtonLocator = page.locator('button', { hasText: 'Configure API action' });
    this.tileHeaderLocator = page.locator('h3', { hasText: '' });
    this.apiActionNoResults = page.locator('[data-testid="api-action-no-results"]');

    // More locators for remaining methods
    this.appColumns = page.locator('td:nth-child(2) p');
    this.checkboxes = page.locator('input[type="checkbox"]');
    this.reactSelectInput = page.locator('#react-select-4-input');
    this.buttonElement = page.locator('a, button');
    this.containerPlaceholder = page.locator('[data-testid="container-placeholder"]');
    this.loopContainers = page.locator('[data-testid="loop-container"]');
    this.inlineTileFieldLabel = page.locator('[data-testid="inline-tile-field-label"]');
    this.tileRowByPrefix = page.locator('tr');
    this.saveButtonGeneric = page.locator('button');
    this.nextButtonGeneric = page.locator('button');

    // Dynamic locators for dropdown options
    this.arrayOption = page.locator('[data-testid="array-option"]');
    this.dropdownItem = page.locator('[data-testid="dropdown-item"]');
    this.displayCountOption = page.locator('[data-testid="display-count-option"]');
    this.imageSizeOption = page.locator('[data-testid="image-size-option"], option');
    this.formBehaviorOption = page.locator('select[aria-label="Form behavior"] option');

    // Additional dynamic locators for methods
    this.dynamicTextBlock = page.locator('[data-testid*="-block"]');
    this.dynamicSourceLocator = page.locator("xpath=//button[@draggable='true'] | //div[@role='button']");
    this.dynamicPropertyLocator = page.locator('[data-testid]');
    this.dynamicTileRow = page.locator('tr');
    this.dynamicMoreButton = page.locator('button[aria-label="Show more"]');
    this.dynamicMenuItem = page.locator('[role="menuitem"]');
    this.dynamicTileStatus = page.locator('span.StatusTag-module__statusTag__NNFTa');
    this.dynamicTileHeader = page.locator('h3');
    this.dynamicSaveButton = page.locator('button');
    this.dynamicNextButton = page.locator('button');

    // Additional locators for remaining methods
    this.dynamicAppColumns = page.locator('td:nth-child(2)');
    this.dynamicBlockSelector = page.locator('button[aria-label][draggable="true"]');
    this.dynamicImageTextRowsTemplate = page.locator(
      'div[role="button"], button[aria-label="Image and text rows"], button'
    );
    this.dynamicParagraphs = page.locator('p');
    this.dynamicFallbackPlaceholder = page.locator("xpath=//div[contains(@class,'smallPlaceholderContainer')]");
    this.dynamicTextElements = page.locator('h3, p');
    this.dynamicTileSection = page.locator('[data-testid*="tile-section-"]');

    // Additional locators for methods that were using inline locators
    this.appOptionByRole = page.getByRole('option');
    this.apiActionOptionByRole = page.getByRole('option');
    this.buttonByRole = page.getByRole('button');
    this.linkByRole = page.getByRole('link');
    this.radioByRole = page.getByRole('radio');
    this.clearButtonByRole = page.getByRole('button', { name: 'Clear' });
    this.parameterLocator = page.locator('p');
    this.radioLocator = page.locator('input[type="radio"]');
    this.fieldLabelLocator = page.locator('[data-testid^="field-"]');
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

  async verifyTileTypeOptions(expectedOptions: string[]): Promise<void> {
    await test.step(`Verify tile type options: ${expectedOptions.join(', ')}`, async () => {
      const options = await this.tileTypeSelect.locator('option').allTextContents();

      for (const expectedOption of expectedOptions) {
        this.expect(options).toContain(expectedOption);
      }
    });
  }

  async selectApp(appName: string): Promise<void> {
    await test.step(`Select app: ${appName}`, async () => {
      await this.appSelect.click();
      await this.appOptionByRole.filter({ hasText: appName }).click();
    });
  }

  async selectApiAction(actionName: string): Promise<void> {
    await test.step(`Select API action: ${actionName}`, async () => {
      await this.apiActionSelect.click();
      await this.apiActionOptionByRole.filter({ hasText: actionName }).click();
    });
  }

  async clickButton(buttonName: string): Promise<void> {
    await test.step(`Click ${buttonName} button`, async () => {
      // Try to find as button first, then as link if not found
      let element = this.buttonByRole.filter({ hasText: buttonName });

      try {
        await element.waitFor({ state: 'visible', timeout: 2000 });
      } catch {
        // If button not found, try as link
        element = this.linkByRole.filter({ hasText: buttonName });
      }

      await this.clickOnElement(element, {
        stepInfo: `Click ${buttonName} button`,
      });
    });
  }

  async verifyButtonStates(): Promise<void> {
    await test.step('Verify button states in footer', async () => {
      // Verify Cancel button is enabled
      await this.verifier.verifyTheElementIsVisible(this.cancelButtonForVerification, {
        assertionMessage: 'Cancel button should be visible and enabled',
      });
      await this.verifier.verifyTheElementIsEnabled(this.cancelButtonForVerification, {
        assertionMessage: 'Cancel button should be enabled',
      });

      // Verify Save button is disabled
      await this.verifier.verifyTheElementIsVisible(this.saveButtonForDisabledVerification, {
        assertionMessage: 'Save button should be visible',
      });
      await this.verifyButtonIsDisabled(this.saveButtonForDisabledVerification, 'Save button should be disabled');

      // Verify Next button is disabled
      await this.verifier.verifyTheElementIsVisible(this.nextButtonForDisabledVerification, {
        assertionMessage: 'Next button should be visible',
      });
      await this.verifyButtonIsDisabled(this.nextButtonForDisabledVerification, 'Next button should be disabled');
    });
  }

  private async verifyButtonIsDisabled(locator: Locator, message: string): Promise<void> {
    await test.step(`Verify button is disabled: ${message}`, async () => {
      await expect(locator).toBeDisabled();
    });
  }

  // Search functionality
  async searchForTiles(searchTerm: string): Promise<void> {
    await test.step(`Search for tiles with term: ${searchTerm}`, async () => {
      // Click on search field to ensure it's focused
      await this.clickOnElement(this.searchInput, {
        stepInfo: `Click on search field`,
      });

      // Clear any existing text first
      await this.searchInput.fill('');

      // Type the search term
      await this.fillInElement(this.searchInput, searchTerm, {
        stepInfo: `Search for tiles with term: ${searchTerm}`,
      });

      // Wait for search to be processed
      await this.page.waitForLoadState('networkidle');
    });
  }

  async clearSearch(): Promise<void> {
    await test.step('Clear search field', async () => {
      // Wait for search input to be visible and have value before clearing
      await this.searchInput.waitFor({ state: 'visible' });
      await this.clearSearchButton.waitFor({ state: 'visible' });

      // Click on clear button
      await this.clickOnElement(this.clearSearchButton, {
        stepInfo: 'Clear search field',
      });

      // Wait for search to be cleared
      await this.searchInput.waitFor({ state: 'visible' });
    });
  }

  async verifySearchFieldIsEmpty(): Promise<void> {
    await test.step('Verify search field is empty', async () => {
      await this.expect(this.searchInput).toHaveValue('');
    });
  }

  async verifyResultCount(expectedCount: number): Promise<void> {
    await test.step(`Verify result count is ${expectedCount}`, async () => {
      const countText = await this.resultCount.textContent();
      const actualCount = parseInt(countText?.split(' ')[0] || '0');
      this.expect(actualCount).toBe(expectedCount);
    });
  }

  async verifyAllAppTilesVisible(): Promise<void> {
    await test.step('Verify all app tiles are visible', async () => {
      // Wait for tiles to load after search is cleared
      await this.tileRows.first().waitFor({ state: 'visible', timeout: 10000 });
      const tiles = this.tileRows;
      await this.expect(tiles.first()).toBeVisible();
      const count = await tiles.count();
      this.expect(count).toBeGreaterThan(0);
    });
  }

  async verifyNoResultsText(expectedText: string): Promise<void> {
    await test.step(`Verify no results text: ${expectedText}`, async () => {
      await this.expect(this.noResultsHeading).toBeVisible();
      await this.expect(this.noResultsDescription).toBeVisible();
      const actualText = `${await this.noResultsHeading.textContent()} ${await this.noResultsDescription.textContent()}`;
      this.expect(actualText.trim()).toBe(expectedText);
    });
  }

  // Apps dropdown functionality
  async verifyCustomAppsCountAtMost(maxCount: number): Promise<void> {
    await test.step(`Verify custom apps count is at most ${maxCount}`, async () => {
      await this.clickOnElement(this.appsDropdown);
      const count = await this.appOptionLabels.count();
      this.expect(count).toBeLessThanOrEqual(maxCount);
      await this.page.keyboard.press('Escape');
    });
  }

  async selectAppsInDropdown(appNames: string[]): Promise<void> {
    await test.step(`Select apps in dropdown: ${appNames.join(', ')}`, async () => {
      // Click on apps dropdown to open it
      await this.clickOnElement(this.appsDropdown);

      // Wait for dropdown to be visible
      await this.appOptionLabels.first().waitFor({ state: 'visible', timeout: 10000 });

      // Get all available app options for debugging
      const availableApps = await this.appOptionLabels.allTextContents();

      for (const appName of appNames) {
        const trimmedAppName = appName.trim();

        // Try to find the app option
        let appOption = this.appOptionLabels.filter({ hasText: trimmedAppName });

        // Check if the option exists
        let optionCount = await appOption.count();

        // If not found, try searching for it
        if (optionCount === 0) {
          // Check if search input is visible and accessible
          const isSearchVisible = await this.appsSearchInput.isVisible();
          if (isSearchVisible) {
            try {
              // Clear any existing search and type the app name
              await this.appsSearchInput.fill('');
              await this.appsSearchInput.fill(trimmedAppName);
              // Wait for search results to appear
              await this.appOptionLabels.first().waitFor({ state: 'visible', timeout: 5000 });

              // Try to find the app again after searching
              appOption = this.appOptionLabels.filter({ hasText: trimmedAppName });
              optionCount = await appOption.count();
            } catch (searchError) {
              console.log(`Search failed for "${trimmedAppName}":`, searchError);
              // Continue without searching
            }
          } else {
            // If search input is not visible, skip searching and continue with error
            console.log(`Search input not visible, skipping search for "${trimmedAppName}"`);
          }
        }

        if (optionCount === 0) {
          throw new Error(`App "${trimmedAppName}" not found in dropdown. Available apps: ${availableApps.join(', ')}`);
        }

        await this.clickOnElement(appOption);
      }
    });
  }

  async verifyVisibleApps(expectedApps: string[]): Promise<void> {
    await test.step(`Verify visible apps: ${expectedApps.join(', ')}`, async () => {
      // Wait for the table to be visible and updated
      await this.tileRows.first().waitFor({ state: 'visible', timeout: 10000 });

      // Try multiple possible locators for app names
      const appColumns = this.appColumns;
      let actualApps = await appColumns.allTextContents();

      // If no apps found with the first locator, try alternative locators
      if (actualApps.length === 0) {
        // Try different column selectors using constructor-assigned locators
        const alternativeLocators = [
          this.dynamicAppColumns,
          this.dynamicAppColumns.locator('div'),
          this.dynamicAppColumns.locator('span'),
          this.dynamicAppColumns.locator('.Typography-module__body__OGpiQ'),
          this.dynamicTileRow.locator('td:nth-child(2)'),
          this.dynamicTileRow.locator('td:nth-child(2) p'),
          this.dynamicTileRow.locator('td:nth-child(2) div'),
        ];

        for (const locator of alternativeLocators) {
          actualApps = await locator.allTextContents();

          if (actualApps.length > 0) {
            break;
          }
        }
      }

      const trimmedActual = actualApps.map(app => app.trim()).filter(app => app !== '');
      const trimmedExpected = expectedApps.map(app => app.trim());

      for (const expectedApp of trimmedExpected) {
        this.expect(trimmedActual).toContain(expectedApp);
      }
    });
  }

  async closeAppsDropdownWithEscapeKey(): Promise<void> {
    await test.step('Close apps dropdown with Escape key', async () => {
      await this.page.keyboard.press('Escape');
    });
  }

  async selectStatusFilter(status: 'Draft' | 'Published'): Promise<void> {
    await test.step(`Select status filter: ${status}`, async () => {
      await this.clickOnElement(this.statusDropdown);
      await this.radioByRole.filter({ hasText: status }).click();
      await this.page.keyboard.press('Escape');
    });
  }

  async clearStatusFilter(): Promise<void> {
    await test.step('Clear status filter', async () => {
      await this.clickOnElement(this.statusDropdown);
      await this.clearButtonByRole.click();
      await this.page.keyboard.press('Escape');
    });
  }

  async clickOnAppsDropdown(): Promise<void> {
    await test.step('Click on apps dropdown', async () => {
      await this.clickOnElement(this.appsDropdown);
    });
  }

  async typeInAppsSearch(text: string): Promise<void> {
    await test.step(`Type in apps search: ${text}`, async () => {
      await this.fillInElement(this.appsSearchInput, text);
    });
  }

  async clickSearchFieldCross(): Promise<void> {
    await test.step('Click search field cross button', async () => {
      await this.clickOnElement(this.clearSearchButton);
    });
  }

  async verifySearchFieldIsNill(): Promise<void> {
    await test.step('Verify search field is empty', async () => {
      await this.expect(this.appsSearchInput).toHaveValue('');
    });
  }

  async clickClearButtonAboveSearch(): Promise<void> {
    await test.step('Click clear button above search', async () => {
      await this.clickOnElement(this.appsClearButton);
    });
  }

  async verifyAppsFilterApplied(expectedAppCount: number): Promise<void> {
    await test.step(`Verify apps filter is applied with ${expectedAppCount} apps selected`, async () => {
      // Wait for the filter to apply by waiting for the table to update
      await this.tileRows.first().waitFor({ state: 'visible', timeout: 10000 });

      // Check if the apps dropdown shows the selected count
      const appsDropdownText = await this.appsDropdown.textContent();

      // The dropdown should show the count of selected apps
      this.expect(appsDropdownText).toContain(expectedAppCount.toString());
    });
  }

  async clearAppsFilterAndWait(): Promise<void> {
    await test.step('Clear apps filter and wait for page to update', async () => {
      await this.clickOnAppsDropdown();
      await this.clickClearButtonAboveSearch();
      await this.closeAppsDropdownWithEscapeKey();

      // Wait for page to update by waiting for tiles to be visible
      await this.tileRows.first().waitFor({ state: 'visible', timeout: 10000 });
    });
  }

  async verifyNoAppCheckboxIsSelected(): Promise<void> {
    await test.step('Verify no app checkbox is selected', async () => {
      const count = await this.checkboxes.count();
      for (let i = 0; i < count; i++) {
        const isChecked = await this.checkboxes.nth(i).isChecked();
        this.expect(isChecked).toBe(false);
      }
    });
  }

  // Show more functionality
  async verifyShowMoreIsVisibleIfAboveThreshold(threshold: number): Promise<void> {
    await test.step(`Verify show more is visible if above threshold: ${threshold}`, async () => {
      const tileCount = await this.getRenderedTileCount();

      if (tileCount > threshold) {
        await this.expect(this.showMoreButton).toBeVisible();
      }
    });
  }

  async clickShowMore(): Promise<void> {
    await test.step('Click show more button', async () => {
      await this.clickOnElement(this.showMoreButton);
    });
  }

  async verifyShowMoreIsNotVisible(): Promise<void> {
    await test.step('Verify show more button is not visible', async () => {
      await this.expect(this.showMoreButton).not.toBeVisible();
    });
  }

  async getRenderedTileCount(): Promise<number> {
    return await this.tileRows.count();
  }

  // Enhanced tile creation methods
  async enterDynamicAnswer(fieldLabel: string, baseAnswer: string): Promise<string> {
    const suffix = Math.random().toString(36).substring(2, 7);
    const finalAnswer = `${baseAnswer}_${suffix}`;
    await this.fillInElement(this.tileNameInput, finalAnswer);
    return finalAnswer;
  }

  async verifyApiActionDisabled(): Promise<void> {
    await test.step('Verify API action dropdown is disabled', async () => {
      await this.apiActionWrapperDisabled.waitFor({ state: 'visible', timeout: 10000 });
      await this.expect(this.apiActionWrapperDisabled).toBeVisible();
    });
  }

  async verifyApiActionEnabled(): Promise<void> {
    await test.step('Verify API action dropdown is enabled', async () => {
      // Wait for the API action wrapper to be visible
      await this.apiActionWrapper.waitFor({ state: 'visible', timeout: 10000 });

      // Check if the control is not disabled by looking for enabled state
      // or by checking that aria-disabled is not "true"
      const isDisabled = await this.apiActionWrapper.getAttribute('aria-disabled');
      this.expect(isDisabled).not.toBe('true');

      // Also verify the input is not disabled
      const inputDisabled = await this.reactSelectInput.getAttribute('disabled');
      this.expect(inputDisabled).toBeNull();
    });
  }

  async clickAddCustomAppLink(): Promise<void> {
    await test.step('Click Add custom app link', async () => {
      await this.clickOnElement(this.addCustomAppLink, {
        stepInfo: 'Click Add custom app link',
      });
    });
  }

  async clickCreateApiActionLink(): Promise<void> {
    await test.step('Click Create API action link', async () => {
      await this.clickOnElement(this.createApiActionLink, {
        stepInfo: 'Click Create API action link',
      });
    });
  }

  async clickLinkAndVerifyRedirect(
    linkType: 'addCustomApp' | 'createApiAction',
    expectedUrlPattern: string
  ): Promise<void> {
    await test.step(`Click ${linkType} link and verify redirect`, async () => {
      // Click the appropriate link based on type
      const linkElement = linkType === 'addCustomApp' ? this.addCustomAppLink : this.createApiActionLink;
      const stepInfo = linkType === 'addCustomApp' ? 'Click Add custom app link' : 'Click Create API action link';

      await this.clickOnElement(linkElement, {
        stepInfo,
      });

      // Verify redirect to expected URL
      await this.page.waitForURL(`**${expectedUrlPattern}**`);
      await this.expect(this.page).toHaveURL(new RegExp(`.*${expectedUrlPattern}`));
    });
  }

  async clickCreateButton(buttonText: string, expectedEndpoint: string): Promise<void> {
    await test.step(`Click ${buttonText} button and verify redirect`, async () => {
      // Find and click the button/link by text
      const buttonElement = this.buttonElement.filter({ hasText: buttonText });

      // Listen for new page/tab opening
      const [newPage] = await Promise.all([
        this.page.context().waitForEvent('page'),
        this.clickOnElement(buttonElement, {
          stepInfo: `Click ${buttonText} button`,
        }),
      ]);

      // Wait for the new page to load
      await newPage.waitForLoadState('networkidle');

      // Verify redirect to expected endpoint in the new tab
      await newPage.waitForURL(`**${expectedEndpoint}**`);
      await this.expect(newPage).toHaveURL(new RegExp(`.*${expectedEndpoint}`));

      // Close the new tab
      await newPage.close();
    });
  }

  async verifyRedirectToCustomAppsPage(): Promise<void> {
    await test.step('Verify redirect to custom apps page', async () => {
      await this.page.waitForURL(`**${PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE}**`);
      await this.expect(this.page).toHaveURL(new RegExp(`.*${PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE}`));
    });
  }

  async verifyRedirectToApiActionsPage(): Promise<void> {
    await test.step('Verify redirect to API actions page', async () => {
      await this.page.waitForURL(`**${PAGE_ENDPOINTS.API_ACTIONS_PAGE}**`);
      await this.expect(this.page).toHaveURL(new RegExp(`.*${PAGE_ENDPOINTS.API_ACTIONS_PAGE}`));
    });
  }

  // Canvas and drag-drop functionality
  async dragImageAndTextRowsIntoCanvas(imageBlock: string): Promise<void> {
    await test.step(`Drag ${imageBlock} block into canvas`, async () => {
      // Use constructor-assigned locator with filter for specific aria-label
      const blockSelector = this.dynamicBlockSelector.filter({ hasText: imageBlock });
      const canvasSelector = this.canvasContainer;

      // Wait for the draggable block to be visible first
      await blockSelector.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for canvas to be available - it might take time to render after Next button click
      await this.waitForCanvasToBeReady();

      // Ensure elements are stable before drag operation
      await blockSelector.waitFor({ state: 'attached' });
      await canvasSelector.waitFor({ state: 'attached' });

      try {
        // Try the standard dragTo method first
        await blockSelector.dragTo(canvasSelector, { timeout: 20000 });
      } catch (error) {
        console.log('Standard dragTo failed, trying alternative method:', error);

        // Alternative method using mouse events
        await this.performDragWithMouseEvents(blockSelector, canvasSelector);
      }
    });
  }

  // Wait for canvas to be ready for drag operations
  private async waitForCanvasToBeReady(): Promise<void> {
    // Wait for canvas container to be visible
    await this.canvasContainer.waitFor({ state: 'visible', timeout: 15000 });

    // Wait for canvas to be fully rendered and interactive
    await this.canvasContainer.waitFor({ state: 'attached' });

    // Verify canvas is actually ready by checking if it's attached and has proper dimensions
    const boundingBox = await this.canvasContainer.boundingBox();
    if (!boundingBox || boundingBox.width === 0 || boundingBox.height === 0) {
      throw new Error('Canvas container is not properly rendered');
    }
  }

  // Alternative drag method using mouse events
  private async performDragWithMouseEvents(sourceElement: Locator, targetElement: Locator): Promise<void> {
    // Get bounding boxes
    const sourceBox = await sourceElement.boundingBox();
    const targetBox = await targetElement.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Could not get bounding boxes for drag operation');
    }

    // Calculate center points
    const sourceCenter = {
      x: sourceBox.x + sourceBox.width / 2,
      y: sourceBox.y + sourceBox.height / 2,
    };

    const targetCenter = {
      x: targetBox.x + targetBox.width / 2,
      y: targetBox.y + targetBox.height / 2,
    };

    // Perform drag operation with mouse events
    await this.page.mouse.move(sourceCenter.x, sourceCenter.y);
    await this.page.mouse.down();
    // Wait for drag start event to be processed
    await this.page
      .waitForFunction(() => document.querySelector('[data-dragging]') !== null, { timeout: 1000 })
      .catch(() => {});

    // Move to target with intermediate steps for smoother drag
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentX = sourceCenter.x + (targetCenter.x - sourceCenter.x) * progress;
      const currentY = sourceCenter.y + (targetCenter.y - sourceCenter.y) * progress;

      await this.page.mouse.move(currentX, currentY);
      // Small delay for smooth drag animation
      await this.page.waitForFunction(() => true, { timeout: 50 }).catch(() => {});
    }

    await this.page.mouse.up();
    // Wait for drop to complete by checking if drag state is cleared
    await this.page
      .waitForFunction(() => document.querySelector('[data-dragging]') === null, { timeout: 2000 })
      .catch(() => {});
  }

  async dragContainerBlockIntoCanvas(): Promise<void> {
    await test.step('Drag container block into canvas', async () => {
      // Wait for the container block to be visible first
      await this.containerBlock.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for canvas to be available - it might take time to render after Next button click
      await this.waitForCanvasToBeReady();

      // Ensure elements are stable before drag operation
      await this.containerBlock.waitFor({ state: 'attached' });
      await this.canvasContainer.waitFor({ state: 'attached' });

      try {
        // Try the standard dragTo method first
        await this.containerBlock.dragTo(this.canvasContainer, { timeout: 20000 });
      } catch (error) {
        console.log('Standard dragTo failed, trying alternative method:', error);

        // Alternative method using mouse events
        await this.performDragWithMouseEvents(this.containerBlock, this.canvasContainer);
      }
    });
  }

  async dragImageAndTextRowsTemplateIntoCanvas(): Promise<void> {
    await test.step('Drag Image and text rows template into canvas', async () => {
      // Try multiple selectors to find the Image and text rows template using constructor-assigned locators
      let imageTextRowsTemplate;

      try {
        // First try: div with role='button' (Selenium approach)
        imageTextRowsTemplate = this.dynamicImageTextRowsTemplate.filter({
          has: this.dynamicParagraphs.filter({ hasText: 'Image and text rows' }),
        });
        await imageTextRowsTemplate.waitFor({ state: 'visible', timeout: 5000 });
      } catch (error) {
        console.log('div[role="button"] selector failed, trying button element:', (error as Error).message);

        try {
          // Second try: button element with aria-label
          imageTextRowsTemplate = this.dynamicImageTextRowsTemplate.filter({ hasText: 'Image and text rows' });
          await imageTextRowsTemplate.waitFor({ state: 'visible', timeout: 5000 });
        } catch (error2) {
          console.log('button[aria-label] selector failed, trying button with paragraph:', (error2 as Error).message);

          // Third try: button element containing paragraph
          imageTextRowsTemplate = this.dynamicImageTextRowsTemplate.filter({
            has: this.dynamicParagraphs.filter({ hasText: 'Image and text rows' }),
          });
          await imageTextRowsTemplate.waitFor({ state: 'visible', timeout: 5000 });
        }
      }

      // Use the unified canvas locator used elsewhere in the page object
      const canvasElement = this.canvasContainer;

      // Wait for canvas to be fully ready (visibility + non-zero size)
      await this.waitForCanvasToBeReady();

      // Debug: Log available elements to help identify the correct selector
      const allButtons = await this.dynamicSaveButton.count();
      const allDivsWithRole = await this.dynamicImageTextRowsTemplate.count();
      const paragraphsWithText = await this.dynamicParagraphs.filter({ hasText: 'Image and text rows' }).count();

      console.log(
        `Debug - Found ${allButtons} buttons, ${allDivsWithRole} divs with role="button", ${paragraphsWithText} paragraphs with "Image and text rows"`
      );

      // Scroll canvas into view (similar to Selenium's scrollIntoView)
      await canvasElement.scrollIntoViewIfNeeded();

      // Wait for elements to be stable
      await Promise.all([
        imageTextRowsTemplate.waitFor({ state: 'attached' }),
        canvasElement.waitFor({ state: 'attached' }),
      ]);

      // Get bounding boxes for precise positioning
      const sourceBox = await imageTextRowsTemplate.boundingBox();
      const targetBox = await canvasElement.boundingBox();

      if (!sourceBox || !targetBox) {
        throw new Error('Could not get bounding boxes for drag operation');
      }

      // Calculate center point of canvas (similar to Selenium's offset calculation)
      const canvasCenterX = targetBox.x + targetBox.width / 2;
      const canvasCenterY = targetBox.y + targetBox.height / 2;

      // Calculate offset from source to target center
      const xOffset = canvasCenterX - (sourceBox.x + sourceBox.width / 2);
      const yOffset = canvasCenterY - (sourceBox.y + sourceBox.height / 2);

      // Perform drag operation using mouse events (similar to Selenium Actions)
      await this.page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
      await this.page.mouse.down();
      // Wait for drag start to be processed
      await this.page
        .waitForFunction(() => document.querySelector('[data-dragging]') !== null, { timeout: 1000 })
        .catch(() => {});

      await this.page.mouse.move(
        sourceBox.x + sourceBox.width / 2 + xOffset,
        sourceBox.y + sourceBox.height / 2 + yOffset
      );
      // Wait for drag movement to be processed
      await this.page.waitForFunction(() => true, { timeout: 200 }).catch(() => {});

      await this.page.mouse.up();
    });
  }

  async dragTextBlockToContainer(block: string): Promise<void> {
    await test.step(`Drag ${block} text block to container`, async () => {
      const textBlock = this.dynamicTextBlock.filter({ hasText: block });

      // Wait for the text block to be visible first
      await textBlock.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for container placeholder to be available
      await this.containerPlaceholder.waitFor({ state: 'visible', timeout: 15000 });

      // Ensure elements are stable before drag operation
      await textBlock.waitFor({ state: 'attached' });
      await this.containerPlaceholder.waitFor({ state: 'attached' });

      try {
        // Try the standard dragTo method first
        await textBlock.dragTo(this.containerPlaceholder, { timeout: 20000 });
      } catch (error) {
        console.log('Standard dragTo failed, trying alternative method:', error);

        // Alternative method using mouse events
        await this.performDragWithMouseEvents(textBlock, this.containerPlaceholder);
      }
    });
  }

  // Generic drag by visible text into canvas (simple and reusable like Selenium)
  async dragBlockByTextIntoCanvas(blockText: string): Promise<void> {
    await test.step(`Drag block/template with text "${blockText}" into canvas`, async () => {
      // Use constructor-assigned locator with filter for specific text
      const source = this.dynamicSourceLocator.filter({ hasText: blockText }).first();

      // Target is the shared canvas container used across the page object
      const target = this.canvasContainer;

      // Ensure both are ready
      await source.waitFor({ state: 'visible', timeout: 15000 });
      await this.waitForCanvasToBeReady();

      // Scroll target into view
      await target.scrollIntoViewIfNeeded();

      // Try native drag first, then robust mouse-event fallback
      try {
        await source.dragTo(target, { timeout: 20000 });
      } catch {
        await this.performDragWithMouseEvents(source, target);
      }
    });
  }

  // Canvas verification methods
  private async getSmallImagePlaceholderLocator(): Promise<Locator> {
    // Try primary data-testid first
    try {
      await this.smallImagePlaceholder.waitFor({ state: 'visible', timeout: 5000 });
      return this.smallImagePlaceholder;
    } catch {
      // Fallback: match by class used in Selenium implementation
      const fallback = this.dynamicFallbackPlaceholder;
      await fallback.waitFor({ state: 'visible', timeout: 10000 });
      return fallback;
    }
  }

  async getSmallImagePlaceholderSize(): Promise<{ width: number; height: number }> {
    const locator = await this.getSmallImagePlaceholderLocator();
    const boundingBox = await locator.boundingBox();
    return {
      // Round to absorb sub-pixel rendering/zoom differences (e.g., 99.83 -> 100)
      width: Math.round(boundingBox?.width || 0),
      height: Math.round(boundingBox?.height || 0),
    };
  }

  private async getImageRowContainerLocator(): Promise<Locator> {
    // Prefer explicit data-testid
    try {
      await this.imageRowContainer.waitFor({ state: 'visible', timeout: 5000 });
      return this.imageRowContainer;
    } catch {
      // Fallback: derive from the small image placeholder by walking ancestors
      const placeholder = await this.getSmallImagePlaceholderLocator();

      // Try semantic identifier first
      const semantic = placeholder.locator(
        "xpath=ancestor::div[contains(@data-testid,'image-row-container') or contains(@class,'imageRowContainer')][1]"
      );
      if (await semantic.isVisible({ timeout: 5000 }).catch(() => false)) {
        return semantic;
      }

      // Final fallback: find first ancestor div whose computed flex-direction is row
      for (let depth = 1; depth <= 6; depth++) {
        const candidate = placeholder.locator(`xpath=ancestor::div[${depth}]`);
        const isVisible = await candidate.isVisible().catch(() => false);
        if (!isVisible) continue;
        const dir = await candidate.evaluate(el => getComputedStyle(el as HTMLElement).flexDirection).catch(() => '');
        if (dir === 'row') {
          return candidate;
        }
      }

      // If nothing matched, return the closest visible ancestor
      const closest = placeholder.locator('xpath=ancestor::div[1]');
      await closest.waitFor({ state: 'visible', timeout: 5000 });
      return closest;
    }
  }

  async getImageContainerFlexDirection(): Promise<string> {
    const row = await this.getImageRowContainerLocator();
    return await row.evaluate(el => getComputedStyle(el).flexDirection);
  }

  async getImageContainerChildCount(): Promise<number> {
    // Count children by walking from the small image placeholder up to the nearest row flex container
    const placeholder = await this.getSmallImagePlaceholderLocator();
    return await placeholder.evaluate(el => {
      let p: HTMLElement | null = el as HTMLElement;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (p?.parentElement) {
        p = p.parentElement as HTMLElement;
        const style = getComputedStyle(p);
        if (style.display.includes('flex') && style.flexDirection === 'row') {
          return Array.from(p.children).length;
        }
      }
      return 0;
    });
  }

  private async getInnerTextContainerLocator(): Promise<Locator> {
    try {
      await this.innerTextContainer.waitFor({ state: 'visible', timeout: 5000 });
      return this.innerTextContainer;
    } catch {
      // Fallback: pick the column sibling of the image column within the row
      const row = await this.getImageRowContainerLocator();
      // Prefer a column that contains text elements (h3/p) which represents the inner text container
      let column = row.locator(':scope > div').filter({ has: this.dynamicTextElements }).first();
      // If not found, still exclude the image placeholder branch
      if ((await column.count()) === 0) {
        column = row.locator(':scope > div').filter({ hasNot: this.smallImagePlaceholder }).first();
      }
      await column.waitFor({ state: 'visible', timeout: 10000 });
      return column;
    }
  }

  async getInnerContainerFlexDirection(): Promise<string> {
    const container = await this.getInnerTextContainerLocator();
    return await container.evaluate(el => getComputedStyle(el).flexDirection);
  }

  async getInnerContainerChildCount(): Promise<number> {
    const container = await this.getInnerTextContainerLocator();
    // Count direct child blocks that contain a text component (h3 or p)
    return await container.locator(':scope > div').filter({ has: this.dynamicTextElements }).count();
  }

  async getHeadingComponentCount(): Promise<number> {
    return await this.innerTextContainers.locator('h3').count();
  }

  async getBodyComponentCount(): Promise<number> {
    return await this.innerTextContainer.locator('p').count();
  }

  async getImageRowY(): Promise<number> {
    const boundingBox = await this.imageRowContainer.boundingBox();
    return boundingBox?.y || 0;
  }

  async getDividerY(): Promise<number> {
    const boundingBox = await this.dividerHr.boundingBox();
    return boundingBox?.y || 0;
  }

  async getCanvasContainerChildCount(): Promise<number> {
    return await this.canvasComponentContainers.count();
  }

  async isLoopingEnabled(): Promise<boolean> {
    const classes = await this.canvasContainer.getAttribute('class');
    return classes?.includes('Enabled') || false;
  }

  async isOuterDirectionColumn(): Promise<boolean> {
    const flexDirection = await this.canvasContainer.evaluate(el => getComputedStyle(el).flexDirection);
    return flexDirection === 'column';
  }

  async isInCanvas(propertyKey: string): Promise<boolean> {
    const locator = this.dynamicPropertyLocator.filter({ hasText: propertyKey });
    return await locator.isVisible();
  }

  // Data tab functionality
  async clickDataTab(): Promise<void> {
    await test.step('Click data tab', async () => {
      await this.clickOnElement(this.dataTab);
    });
  }

  async clickTileBuilderTab(): Promise<void> {
    await test.step('Click tile builder tab', async () => {
      await this.clickOnElement(this.tileBuilderTab);
    });
  }

  async enableLoopDataToggle(_input: string): Promise<void> {
    await test.step('Enable loop data toggle', async () => {
      await this.clickOnElement(this.loopDataToggle);
    });
  }

  async selectArrayOption(option: string): Promise<void> {
    await test.step(`Select array option: ${option}`, async () => {
      await this.clickOnElement(this.arrayObjectDropdown);
      await this.clickOnElement(this.arrayOption.filter({ hasText: option }));
    });
  }

  async selectExpandTileToShowMore(_option: string): Promise<void> {
    await test.step('Select expand tile to show more', async () => {
      await this.clickOnElement(this.expandTileRadio);
    });
  }

  async selectNestedDropdownKeys(arrayKey: string, objectKey: string, finalKey: string): Promise<void> {
    await test.step(`Select nested dropdown keys: ${arrayKey} -> ${objectKey} -> ${finalKey}`, async () => {
      await this.clickOnElement(this.dropdownItem.filter({ hasText: arrayKey }));
      await this.clickOnElement(this.dropdownItem.filter({ hasText: objectKey }));
      await this.clickOnElement(this.dropdownItem.filter({ hasText: finalKey }));
    });
  }

  async enterExternalUrlButtonText(text: string): Promise<void> {
    await test.step(`Enter external URL button text: ${text}`, async () => {
      await this.fillInElement(this.externalUrlButtonText, text);
    });
  }

  async selectInitialDisplayCount(count: string): Promise<void> {
    await test.step(`Select initial display count: ${count}`, async () => {
      await this.clickOnElement(this.initialDisplayCountDropdown);
      await this.clickOnElement(this.displayCountOption.filter({ hasText: count }));
    });
  }

  async verifyLoopIterationCount(expectedCount: number): Promise<void> {
    await test.step(`Verify loop iteration count is ${expectedCount}`, async () => {
      const count = await this.loopContainers.count();
      this.expect(count).toBe(expectedCount);
    });
  }

  async verifyTileLoopIterationCount(expectedCount: number, tileName: string): Promise<void> {
    await test.step(`Verify tile loop iteration count is ${expectedCount} for tile: ${tileName}`, async () => {
      const tile = this.dynamicTileSection.filter({ hasText: tileName });
      const loops = tile.locator('[data-testid*="loop-container"]');
      const count = await loops.count();
      this.expect(count).toBe(expectedCount);
    });
  }

  // Image configuration
  async clickImageContainer(): Promise<void> {
    await test.step('Click image container', async () => {
      await this.clickOnElement(this.imageContainer);
    });
  }

  async selectImageSize(size: string): Promise<void> {
    await test.step(`Select image size: ${size}`, async () => {
      await this.clickOnElement(this.imageSizeDropdown);
      await this.clickOnElement(this.imageSizeOption.filter({ hasText: size }));
    });
  }

  async verifyImageContainerWidth(expectedWidth: string): Promise<void> {
    await test.step(`Verify image container width is ${expectedWidth}`, async () => {
      const actualWidth = await this.imageContainer.evaluate(el => getComputedStyle(el).width);
      this.expect(actualWidth).toBe(expectedWidth);
    });
  }

  async enterTargetUrl(url: string): Promise<void> {
    await test.step(`Enter target URL: ${url}`, async () => {
      await this.fillInElement(this.targetUrlInput, url);
    });
  }

  async clickOnImageWithHyperlink(): Promise<void> {
    await test.step('Click on image with hyperlink', async () => {
      await this.clickOnElement(this.imageWithHyperlink);
    });
  }

  async verifyNewTabUrlContains(expectedUrlPart: string): Promise<void> {
    await test.step(`Verify new tab URL contains: ${expectedUrlPart}`, async () => {
      const [newPage] = await Promise.all([this.page.context().waitForEvent('page'), this.clickOnImageWithHyperlink()]);

      await newPage.waitForLoadState();
      const currentUrl = newPage.url();
      this.expect(currentUrl).toContain(expectedUrlPart);
      await newPage.close();
    });
  }

  async uploadFile(fileName: string, fileType: 'image' | 'document' | 'other' = 'image'): Promise<void> {
    await test.step(`Upload ${fileType}: ${fileName}`, async () => {
      // Wait for the file input to be present and make it visible
      await this.imageUploadInput.waitFor({ state: 'attached', timeout: 10000 });

      // Make the file input visible using JavaScript (similar to Selenium approach)
      await this.imageUploadInput.evaluate((element: HTMLInputElement) => {
        element.style.display = 'block';
        element.style.visibility = 'visible';
        element.style.opacity = '1';
      });

      // Set the file input with dynamic path based on file type
      const filePath = this.getFilePath(fileName, fileType);
      await this.imageUploadInput.setInputFiles(filePath);

      // Wait for upload to complete
      await this.page.waitForTimeout(4000);
    });
  }

  private getFilePath(fileName: string, fileType: string): string {
    const basePath = 'src/modules/integrations/test-data/static-files';

    switch (fileType) {
      case 'image':
        return path.join(basePath, 'imageFiles', fileName);
      case 'document':
        return path.join(basePath, 'documents', fileName);
      default:
        return path.join(basePath, 'files', fileName);
    }
  }

  // Convenience method for backward compatibility
  async uploadImage(imageFileName: string): Promise<void> {
    await this.uploadFile(imageFileName, 'image');
  }

  async verifyParameterExists(parameterText: string): Promise<void> {
    await test.step(`Verify parameter "${parameterText}" exists`, async () => {
      // Wait for page to load completely
      await this.page.waitForLoadState('networkidle');

      // Look for the parameter text in any paragraph element
      const parameterElement = this.parameterLocator.filter({ hasText: parameterText });
      await this.expect(parameterElement).toBeVisible({ timeout: 50000 });
    });
  }

  // Form configuration
  async clickConfigureButton(): Promise<void> {
    await test.step('Click configure button', async () => {
      await this.clickOnElement(this.configureApiActionButton);
    });
  }

  async verifyToastMessage(message: string) {
    return this.appTileComponent.verifyToastMessageIsVisibleWithText(message);
  }

  async verifyFormInsideContainer(): Promise<void> {
    await test.step('Verify form is inside container', async () => {
      await this.expect(this.formContainerSubmitButton).toBeVisible();
    });
  }

  async verifyCanvasIsAutoPopulatedWithButton(): Promise<void> {
    await test.step('Verify canvas is auto-populated with button', async () => {
      await this.expect(this.formContainerButton).toBeVisible();
      const label = await this.formContainerButton.textContent();
      this.expect(label?.trim()).not.toBe('');
    });
  }

  async verifyInlineFormFieldsInTile(fieldsCsv: string): Promise<void> {
    await test.step(`Verify inline form fields in tile: ${fieldsCsv}`, async () => {
      const fields = fieldsCsv.split(',').map(f => f.trim());
      for (const field of fields) {
        if (field.toLowerCase() === 'submit') {
          await this.expect(this.formContainerSubmitButton).toBeVisible();
        } else {
          const fieldLabel = this.inlineTileFieldLabel.filter({ hasText: field });
          await this.expect(fieldLabel).toBeVisible();
        }
      }
    });
  }

  async verifyOverlayFormFieldsVisible(): Promise<void> {
    await test.step('Verify overlay form fields are visible', async () => {
      await this.clickOnElement(this.formContainerButton);
      await this.expect(this.overlayBody).toBeVisible();

      const fields = ['Email', 'Summary', 'Description'];
      for (const field of fields) {
        const fieldLabel = this.overlayFieldLabel.filter({ hasText: field });
        await this.expect(fieldLabel).toBeVisible();
      }
    });
  }

  // Success/Error handling
  async verifySuccessMessageWithTicketAndBotLink(): Promise<void> {
    await test.step('Verify success message with ticket and bot link', async () => {
      const successText = await this.successMessage.textContent();
      this.expect(successText).toContain('Ticket created successfully with ID:');
      this.expect(successText).toContain('BOT-');
      await this.expect(this.botLink).toBeVisible();
    });
  }

  async clickBotLinkAndVerifyRedirect(expectedUrl: string): Promise<void> {
    await test.step(`Click bot link and verify redirect to: ${expectedUrl}`, async () => {
      const [newPage] = await Promise.all([
        this.page.context().waitForEvent('page'),
        this.clickOnElement(this.botLink),
      ]);

      await newPage.waitForLoadState();
      const actualUrl = newPage.url();
      this.expect(actualUrl).toContain(expectedUrl);
      await newPage.close();
    });
  }

  // Tile management
  async clickThreeDotsForTileStartingWith(prefix: string): Promise<void> {
    await test.step(`Click three dots for tile starting with: ${prefix}`, async () => {
      // Get the first tile with the prefix to avoid strict mode violation
      const tileRow = this.dynamicTileRow.filter({ hasText: prefix }).first();
      const moreBtn = tileRow.locator('button[aria-label="Show more"]');
      await this.clickOnElement(moreBtn);
    });
  }

  async selectOptionFromTileMenuDropdown(option: string): Promise<void> {
    await test.step(`Select option from tile menu dropdown: ${option}`, async () => {
      // Wait for dropdown menu to be visible
      await this.page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 5000 });

      // Use constructor-assigned locator with filter for specific option
      const menuItem = this.dynamicMenuItem.filter({ hasText: option });
      await this.clickOnElement(menuItem);
    });
  }

  async clickConfirmDeleteButton(): Promise<void> {
    await test.step('Click confirm delete button', async () => {
      await this.clickOnElement(this.confirmDeleteButton);
    });
  }

  async deleteAllTilesWithPrefix(prefix: string): Promise<void> {
    await test.step(`Delete all tiles with prefix: ${prefix}`, async () => {
      let deletedCount = 0;
      const maxAttempts = 20; // Prevent infinite loop

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          // Get the first tile with the prefix
          const firstTile = this.dynamicTileRow.filter({ hasText: prefix }).first();

          // Check if any tiles with prefix still exist
          if (!(await firstTile.isVisible())) {
            console.log(`No more tiles with prefix "${prefix}" found. Deleted ${deletedCount} tiles.`);
            break;
          }

          console.log(`Deleting tile ${deletedCount + 1} with prefix "${prefix}"`);

          // Click the three dots menu
          await this.clickThreeDotsForTileStartingWith(prefix);
          // Wait for menu to appear
          await this.page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 5000 });

          // Select Delete option
          await this.selectOptionFromTileMenuDropdown('Delete');
          // Wait for confirmation dialog
          await this.confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });

          // Confirm deletion
          await this.clickConfirmDeleteButton();
          // Wait for deletion to complete by checking if tile is removed
          await this.page
            .waitForFunction(
              () => {
                const tiles = document.querySelectorAll('tr[data-testid^="dataGridRow-"]');
                return Array.from(tiles).every(tile => !tile.textContent?.includes(prefix)); // eslint-disable-line @typescript-eslint/no-unnecessary-condition
              },
              { timeout: 10000 }
            )
            .catch(() => {});

          deletedCount++;
        } catch (error) {
          console.error(`Deletion attempt ${attempt + 1} failed:`, error);

          // Try to close any open dropdowns or modals
          try {
            await this.page.keyboard.press('Escape');
            // Wait for any open modals/dropdowns to close
            await this.page
              .waitForFunction(() => document.querySelector('[role="menu"], [role="dialog"]') === null, {
                timeout: 2000,
              })
              .catch(() => {});
          } catch (closeError) {
            console.error('Failed to close dropdown/modal:', closeError);
          }

          // If we've tried multiple times, break
          if (attempt >= 2) {
            console.error('Too many deletion failures, stopping');
            break;
          }
        }
      }

      console.log(`Completed deletion process. Total tiles deleted: ${deletedCount}`);
    });
  }

  async verifySaveButtonIsEnabled(): Promise<void> {
    await test.step('Verify save button is enabled', async () => {
      await this.expect(this.saveButtonForVerification).toBeEnabled();
    });
  }

  async verifyNextButtonIsPrimary(): Promise<void> {
    await test.step('Verify next button is primary', async () => {
      await this.expect(this.nextButtonForVerification).toHaveClass(/Button-module__primary__/);
    });
  }

  async verifyCreatedTileStatus(status: string): Promise<void> {
    await test.step(`Verify created tile status is: ${status}`, async () => {
      // Find the first tile (most recently created) and verify its status
      const tileStatus = this.dynamicTileStatus.filter({ hasText: status });
      await this.expect(tileStatus).toBeVisible();
    });
  }

  async verifyTileIsOnTop(tileName: string): Promise<void> {
    await test.step(`Verify tile is on top: ${tileName}`, async () => {
      const topTile = await this.topTileName.textContent();
      this.expect(topTile?.trim()).toBe(tileName);
    });
  }

  async verifyTileHasFields(fields: string[]): Promise<void> {
    await test.step(`Verify tile has fields: ${fields.join(', ')}`, async () => {
      for (const field of fields) {
        let locator: Locator;
        switch (field.toLowerCase()) {
          case 'label':
            locator = this.tileFieldLabel;
            break;
          case 'link':
            locator = this.tileFieldLink;
            break;
          case 'image':
            locator = this.tileFieldImage;
            break;
          default:
            throw new Error(`Unknown field: ${field}`);
        }
        await this.expect(locator).toBeVisible();
      }
    });
  }

  // Utility methods
  async verifySaveAndNextDisabled(saveText: string, nextText: string): Promise<void> {
    await test.step(`Verify save and next buttons are disabled: ${saveText}, ${nextText}`, async () => {
      const saveBtn = this.dynamicSaveButton.filter({ hasText: saveText });
      const nextBtn = this.dynamicNextButton.filter({ hasText: nextText });

      await this.expect(saveBtn).toBeDisabled();
      await this.expect(nextBtn).toBeDisabled();
    });
  }

  async verifyDisplayDropdownOptions(option1: string, option2: string): Promise<void> {
    await test.step(`Verify display dropdown options: ${option1}, ${option2}`, async () => {
      const options = await this.formBehaviorDropdownOptions.allTextContents();
      const trimmedOptions = options.map(opt => opt.trim());

      this.expect(trimmedOptions).toContain(option1);
      this.expect(trimmedOptions).toContain(option2);
      this.expect(trimmedOptions.length).toBe(2);
    });
  }

  async selectDisplayOptionInFormBehaviour(option: string): Promise<void> {
    await test.step(`Select display option in form behaviour: ${option}`, async () => {
      await this.formBehaviorDropdown.selectOption(option);
    });
  }

  async verifyIncompleteSettingMessage(messageText: string): Promise<void> {
    await test.step(`Verify incomplete setting message: ${messageText}`, async () => {
      const message = this.incompleteSettingsMessageLocator.filter({ hasText: messageText });
      await this.expect(message).toBeVisible();
    });
  }

  async verifyChangeTileTypePopup(messageText: string): Promise<void> {
    await test.step(`Verify change tile type popup: ${messageText}`, async () => {
      const dialog = this.changeTileTypeDialog.filter({ hasText: messageText });
      await this.expect(dialog).toBeVisible();
    });
  }

  async verifyTileTypeChangeMessage(messageText: string): Promise<void> {
    await test.step(`Verify tile type change message: ${messageText}`, async () => {
      const message = this.changeTileTypeMessageLocator.filter({ hasText: messageText });
      await this.expect(message).toBeVisible();
    });
  }

  async verifyOldCanvasElementsAreCleared(): Promise<void> {
    await test.step('Verify old canvas elements are cleared', async () => {
      await this.expect(this.previousLinkLocator).not.toBeVisible();
      await this.expect(this.previousDividerLocator).not.toBeVisible();
    });
  }

  async verifyCanvasResetState(): Promise<void> {
    await test.step('Verify canvas reset state', async () => {
      await this.expect(this.formHeadingLocator).toBeVisible();
      await this.expect(this.configureButtonLocator).toBeVisible();
    });
  }

  async verifyTileIsNotDisplayed(tileName: string): Promise<void> {
    await test.step(`Verify tile is not displayed: ${tileName}`, async () => {
      const tileHeader = this.dynamicTileHeader.filter({ hasText: tileName });
      await this.expect(tileHeader).not.toBeVisible();
    });
  }

  async clickApiActionDropdownAndVerifyNoResults(): Promise<void> {
    await test.step('Click API action dropdown and verify no results', async () => {
      await this.clickOnElement(this.apiActionSelect);
      await this.expect(this.apiActionNoResults).toBeVisible();
    });
  }

  async verifySmallImagePlaceholderSize(expectedWidth: number, expectedHeight: number): Promise<void> {
    await test.step(`Verify small image placeholder size: ${expectedWidth}x${expectedHeight}`, async () => {
      const imageSize = await this.getSmallImagePlaceholderSize();
      this.expect(imageSize.width).toBe(expectedWidth);
      this.expect(imageSize.height).toBe(expectedHeight);
    });
  }

  async verifyImageContainerFlexDirection(expectedDirection: string): Promise<void> {
    await test.step(`Verify image container flex direction is: ${expectedDirection}`, async () => {
      const flexDirection = await this.getImageContainerFlexDirection();
      this.expect(flexDirection).toBe(expectedDirection);
    });
  }

  async verifyImageContainerChildCount(minCount: number): Promise<void> {
    await test.step(`Verify image container has at least ${minCount} children`, async () => {
      // Poll for children to appear, resilient to late hydration
      const deadline = Date.now() + 10000;
      let childCount = 0;
      do {
        childCount = await this.getImageContainerChildCount();
        if (childCount >= minCount) break;
        // Wait for DOM updates
        await this.page.waitForLoadState('domcontentloaded');
      } while (Date.now() < deadline);

      this.expect(childCount).toBeGreaterThanOrEqual(minCount);
    });
  }

  async verifyInnerContainerFlexDirection(expectedDirection: string): Promise<void> {
    await test.step(`Verify inner container flex direction is: ${expectedDirection}`, async () => {
      const innerFlexDirection = await this.getInnerContainerFlexDirection();
      this.expect(innerFlexDirection).toBe(expectedDirection);
    });
  }

  async verifyInnerContainerChildCount(expectedCount: number): Promise<void> {
    await test.step(`Verify inner container has ${expectedCount} text components`, async () => {
      const deadline = Date.now() + 10000;
      let count = 0;
      do {
        count = await this.getInnerContainerChildCount();
        if (count === expectedCount) break;
        // Wait for DOM updates
        await this.page.waitForLoadState('domcontentloaded');
      } while (Date.now() < deadline);

      this.expect(count).toBe(expectedCount);
    });
  }

  async verifyHeadingComponentCount(expectedCount: number): Promise<void> {
    await test.step(`Verify heading component count is: ${expectedCount}`, async () => {
      const headingCount = await this.getHeadingComponentCount();
      this.expect(headingCount).toBe(expectedCount);
    });
  }

  async verifyBodyComponentCount(expectedCount: number): Promise<void> {
    await test.step(`Verify body component count is: ${expectedCount}`, async () => {
      const bodyCount = await this.getBodyComponentCount();
      this.expect(bodyCount).toBe(expectedCount);
    });
  }

  async verifyDividerPositionBelowImageRow(): Promise<void> {
    await test.step('Verify divider is positioned below image row', async () => {
      const imageRowY = await this.getImageRowY();
      const dividerY = await this.getDividerY();
      this.expect(dividerY).toBeGreaterThan(imageRowY);
    });
  }

  async verifyLoopingIsEnabled(): Promise<void> {
    await test.step('Verify looping is enabled', async () => {
      const isLoopingEnabled = await this.isLoopingEnabled();
      this.expect(isLoopingEnabled).toBe(true);
    });
  }

  async verifyOuterDirectionIsColumn(): Promise<void> {
    await test.step('Verify outer direction is column', async () => {
      const isOuterDirectionColumn = await this.isOuterDirectionColumn();
      this.expect(isOuterDirectionColumn).toBe(true);
    });
  }

  async verifyDisplayDropdownIsDisabled(): Promise<void> {
    await test.step('Verify display dropdown is disabled', async () => {
      await this.expect(this.imageSizeDropdown).toBeDisabled();
    });
  }

  async selectRadioForField(optionText: string, fieldLabel: string): Promise<void> {
    await test.step(`Select "${optionText}" option from "${fieldLabel}"`, async () => {
      const radioElement = this.radioLocator
        .filter({
          has: this.fieldLabelLocator.filter({ hasText: fieldLabel }),
        })
        .filter({ hasText: 'userDefined' });
      await this.clickOnElement(radioElement, {
        stepInfo: `Select "${optionText}" option from "${fieldLabel}"`,
      });
    });
  }
}
