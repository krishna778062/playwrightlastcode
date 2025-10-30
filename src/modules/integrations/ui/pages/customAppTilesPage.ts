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

  // Selector strings for reusable components
  readonly showMoreButtonSelector: string;

  // Page header elements
  readonly pageTitle: Locator;
  readonly createCustomAppTileButton: Locator;
  readonly backToTilesListLink: Locator;

  // Search elements
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;

  // Apps dropdown elements
  readonly appsDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly statusFilterLabels: Locator;
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
  readonly tileBuilderStepper: Locator;

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
  readonly fieldContainer: Locator;

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

    // Initialize selector strings
    this.showMoreButtonSelector = 'button[aria-label="Show more"]';

    // Page header elements
    this.pageTitle = page.locator('h1', { hasText: 'Custom app tiles' });
    this.createCustomAppTileButton = page.getByRole('link', { name: 'Create custom app tile' });
    this.backToTilesListLink = page.getByRole('link', { name: 'Custom app tiles' });

    // Search elements
    this.searchInput = page.locator('#search');
    this.clearSearchButton = page.locator('button[aria-label="Clear"]');

    // Apps dropdown elements
    this.appsDropdown = page.locator('button', { hasText: 'Apps' });
    this.statusDropdown = page.locator('button.FilterGroup-module__pill__a50KR', { hasText: 'Status' });
    this.statusFilterLabels = page.locator('label');
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
    this.tileMoreButton = page.locator(this.showMoreButtonSelector);
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
    this.tileBuilderStepper = page.getByText('Tile builder', { exact: true });

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
    this.fieldContainer = page.locator('[data-testid^="field-"]');

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

  /**
   * Verify that the Custom App Tiles page is fully loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Custom App Tiles page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageTitle, {
        timeout: 30_000,
        assertionMessage: 'Page title should be visible',
      });
    });
  }

  /**
   * Click the Create custom app tile button
   */
  async clickCreateCustomAppTileButton(): Promise<void> {
    await test.step('Click on Create custom app tile button', async () => {
      await this.clickOnElement(this.createCustomAppTileButton, {
        stepInfo: 'Click Create custom app tile button',
      });
    });
  }

  /**
   * Navigate back to tiles list by clicking the back link
   */
  async clickBackToTilesList(): Promise<void> {
    await test.step('Navigate back to tiles list', async () => {
      await this.clickOnElement(this.backToTilesListLink, {
        stepInfo: 'Click back link to return to tiles list',
      });
    });
  }

  /**
   * Verify that the Tile Builder step is active and visible
   */
  async verifyTileBuilderStepIsActive(): Promise<void> {
    await test.step('Verify Tile Builder step is active', async () => {
      await this.expect(this.tileBuilderStepper, 'Expected Tile Builder step to be visible').toBeVisible({
        timeout: 10000,
      });
    });
  }

  /**
   * Click on a tile by its name to navigate to the edit page
   * @param tileName - The name of the tile to click
   */
  async clickOnTileByName(tileName: string): Promise<void> {
    await test.step(`Click on tile: ${tileName}`, async () => {
      const tileLocator = this.tileHeadingByPrefix.filter({ hasText: tileName }).first();
      await this.clickOnElement(tileLocator, {
        stepInfo: `Click on tile "${tileName}" to edit it`,
      });
    });
  }

  /**
   * Verify we are on the Edit page (not Create page)
   */
  async verifyOnEditPage(): Promise<void> {
    await test.step('Verify we are on the Edit page', async () => {
      const editPageTitle = this.page.getByText('Edit custom app tile', { exact: true });
      await this.expect(editPageTitle, 'Expected to be on Edit custom app tile page').toBeVisible({
        timeout: 10000,
      });
    });
  }

  /**
   * Set up dialog handler and return dialog information
   * @returns Promise that resolves to dialog message and dismiss function
   */
  async setupDialogHandler(timeout = 10000): Promise<{ message: string; dismiss: () => Promise<void> }> {
    return new Promise<{ message: string; dismiss: () => Promise<void> }>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Dialog did not appear within timeout'));
      }, timeout);

      this.page.once('dialog', dialog => {
        clearTimeout(timer);
        resolve({
          message: dialog.message(),
          dismiss: async () => await dialog.dismiss(),
        });
      });
    });
  }

  /**
   * Verify button status using tile operations component
   */
  async verifyButtonStatus(status: string, buttonName: string): Promise<void> {
    await test.step(`Verify ${buttonName} button is ${status}`, async () => {
      const locator = this.buttonByRole.filter({ hasText: buttonName });
      await expect(locator).toBeVisible();
      status.toLowerCase() === 'enabled' ? await expect(locator).toBeEnabled() : await expect(locator).toBeDisabled();
    });
  }

  /**
   * Enter the tile name in the input field
   * @param tileName - The name of the tile to enter
   */
  async enterTileName(tileName: string): Promise<void> {
    await test.step(`Enter tile name: ${tileName}`, async () => {
      await this.fillInElement(this.tileNameInput, tileName, {
        stepInfo: `Enter tile name: ${tileName}`,
      });
    });
  }

  /**
   * Enter the tile description in the input field
   * @param description - The description of the tile to enter
   */
  async enterTileDescription(description: string): Promise<void> {
    await test.step(`Enter tile description: ${description}`, async () => {
      await this.fillInElement(this.tileDescriptionInput, description, {
        stepInfo: `Enter tile description: ${description}`,
      });
    });
  }

  /**
   * Select a tile type from the dropdown
   * @param option - The tile type option to select
   */
  async selectTileType(option: string): Promise<void> {
    await test.step(`Select tile type: ${option}`, async () => {
      await this.tileTypeSelect.selectOption(option);
    });
  }

  /**
   * Verify the available tile type options
   * @param expectedOptions - Array of expected tile type options
   */
  async verifyTileTypeOptions(expectedOptions: string[]): Promise<void> {
    await test.step(`Verify tile type options: ${expectedOptions.join(', ')}`, async () => {
      const options = await this.tileTypeSelect.locator('option').allTextContents();

      for (const expectedOption of expectedOptions) {
        this.expect(options, `Expected option "${expectedOption}" to be in the list`).toContain(expectedOption);
      }
    });
  }

  /**
   * Select an app from the dropdown
   * @param appName - The name of the app to select
   */
  async selectApp(appName: string): Promise<void> {
    await test.step(`Select app: ${appName}`, async () => {
      await this.appSelect.click();
      await this.appOptionByRole.filter({ hasText: appName }).click();
    });
  }

  /**
   * Select an API action from the dropdown
   * @param actionName - The name of the API action to select
   */
  async selectApiAction(actionName: string): Promise<void> {
    await test.step(`Select API action: ${actionName}`, async () => {
      await this.apiActionSelect.click();
      await this.apiActionOptionByRole.filter({ hasText: actionName }).click();
    });
  }

  async clickButton(buttonName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${buttonName}`;
    await test.step(stepName, async () => {
      // Try button first with name
      try {
        const button = this.page.getByRole('button', { name: buttonName });
        await this.clickOnElement(button, { timeout });
      } catch {
        // If button not found, try as link with name
        const link = this.page.getByRole('link', { name: buttonName });
        await this.clickOnElement(link, { timeout });
      }
    });
  }

  /**
   * Click the Cancel link
   * This will trigger the unsaved changes dialog if there are unsaved changes
   */
  async clickCancelLink(): Promise<void> {
    await test.step('Click Cancel link', async () => {
      // Look for Cancel link by href attribute first
      const cancelLink = this.page.locator('a[href="/manage/custom-app-tiles"]').filter({ hasText: 'Cancel' });

      try {
        await cancelLink.waitFor({ state: 'visible', timeout: 5000 });
        await cancelLink.dispatchEvent('click', { timeout: 1000 });
      } catch {
        // If not found by href, try by role
        const cancelByRole = this.page.getByRole('link', { name: 'Cancel' });
        await cancelByRole.waitFor({ state: 'visible', timeout: 5000 });
        await cancelByRole.dispatchEvent('click', { timeout: 1000 });
      }
    });
  }

  /**
   * Verify the states of all buttons in the footer (Cancel, Save, Next)
   */
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
  /**
   * Search for tiles using the provided search term
   * @param searchTerm - The term to search for in the tiles list
   */
  async searchForTiles(searchTerm: string): Promise<void> {
    await test.step(`Search for tiles with term: ${searchTerm}`, async () => {
      // Click on search field to ensure it's focused
      await this.clickOnElement(this.searchInput, {
        stepInfo: `Click on search field`,
      });

      // Clear any existing text first
      await this.searchInput.fill('');

      // Type the search term (if not empty)
      if (searchTerm) {
        await this.fillInElement(this.searchInput, searchTerm, {
          stepInfo: `Search for tiles with term: ${searchTerm}`,
        });

        // Wait for the search input to have some value (it may be truncated due to maxlength)
        await this.expect(this.searchInput, 'Expected search input to have a value').not.toHaveValue('', {
          timeout: 5000,
        });
      }
    });
  }

  /**
   * Clear the search input field
   */
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

  /**
   * Verify that the search field is empty
   */
  async verifySearchFieldIsEmpty(): Promise<void> {
    await test.step('Verify search field is empty', async () => {
      await this.expect(this.searchInput, 'Expected search field to be empty').toHaveValue('');
    });
  }

  /**
   * Verify the result count matches the expected value
   * @param expectedCount - The expected number of tiles in the results
   */
  async verifyResultCount(expectedCount: number): Promise<void> {
    await test.step(`Verify result count is ${expectedCount}`, async () => {
      // Wait for the result count to match expected value (search may take time to complete)
      await this.expect(this.resultCount, `Expected result count to be ${expectedCount} tiles`).toHaveText(
        new RegExp(`^${expectedCount}\\s+tile`),
        { timeout: 15000 }
      );
    });
  }

  /**
   * Verify that all app tiles are visible on the page
   */
  async verifyAllAppTilesVisible(): Promise<void> {
    await test.step('Verify all app tiles are visible', async () => {
      // Wait for tiles to load after search is cleared
      await this.tileRows.first().waitFor({ state: 'visible', timeout: 10000 });
      const tiles = this.tileRows;
      await this.expect(tiles.first(), 'Expected at least one tile to be visible').toBeVisible();
      const count = await tiles.count();
      this.expect(count, 'Expected tile count to be greater than 0').toBeGreaterThan(0);
    });
  }

  /**
   * Verify the no results message text
   * @param expectedText - The expected text to be displayed when there are no results
   */
  async verifyNoResultsText(expectedText: string): Promise<void> {
    await test.step(`Verify no results text: ${expectedText}`, async () => {
      await this.expect(this.noResultsHeading, 'Expected "No results" heading to be visible').toBeVisible();
      await this.expect(this.noResultsDescription, 'Expected no results description to be visible').toBeVisible();
      const actualText = `${await this.noResultsHeading.textContent()} ${await this.noResultsDescription.textContent()}`;
      this.expect(actualText.trim(), `Expected text to be "${expectedText}"`).toBe(expectedText);
    });
  }

  // Apps dropdown functionality
  /**
   * Verify that the custom apps count is at most the specified maximum
   * @param maxCount - The maximum expected count of custom apps
   */
  async verifyCustomAppsCountAtMost(maxCount: number): Promise<void> {
    await test.step(`Verify custom apps count is at most ${maxCount}`, async () => {
      await this.clickOnElement(this.appsDropdown);
      const count = await this.appOptionLabels.count();
      this.expect(count, `Expected app count to be at most ${maxCount}`).toBeLessThanOrEqual(maxCount);
      await this.page.keyboard.press('Escape');
    });
  }

  /**
   * Select apps in the apps dropdown
   * @param appNames - Array of app names to select
   */
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

              // Wait for the search input to have the value
              await this.expect(
                this.appsSearchInput,
                `Expected search input to have value "${trimmedAppName}"`
              ).toHaveValue(trimmedAppName, { timeout: 2000 });

              // Wait for the specific app option to appear by checking for the text in the options
              // The search should filter the results
              const searchedOption = this.appOptionLabels.filter({ hasText: trimmedAppName });

              // Wait for the filtered option to become visible (Playwright will retry)
              await this.expect(
                searchedOption.first(),
                `Expected app option "${trimmedAppName}" to be visible`
              ).toBeVisible({ timeout: 5000 });

              // Get the count after search
              optionCount = await searchedOption.count();
              appOption = searchedOption;
            } catch {
              // Continue without searching
            }
          }
        }

        if (optionCount === 0) {
          throw new Error(`App "${trimmedAppName}" not found in dropdown. Available apps: ${availableApps.join(', ')}`);
        }

        await this.clickOnElement(appOption);
      }
    });
  }

  /**
   * Verify that the specified apps are visible in the tile list
   * @param expectedApps - Array of app names that should be visible
   */
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
        this.expect(trimmedActual, `Expected visible apps to contain "${expectedApp}"`).toContain(expectedApp);
      }
    });
  }

  /**
   * Close the apps dropdown using the Escape key
   */
  async closeAppsDropdownWithEscapeKey(): Promise<void> {
    await test.step('Close apps dropdown with Escape key', async () => {
      await this.page.keyboard.press('Escape');
    });
  }

  /**
   * Select a status filter (Draft or Published)
   * @param status - The status to filter by
   */
  async selectStatusFilter(status: 'Draft' | 'Published'): Promise<void> {
    await test.step(`Select status filter: ${status}`, async () => {
      await this.clickOnElement(this.statusDropdown);

      // Find and click the label containing the status text
      const statusLabel = this.statusFilterLabels.filter({ hasText: status });
      await this.expect(statusLabel, `Expected "${status}" label to be visible`).toBeVisible({ timeout: 10000 });
      await statusLabel.click();

      await this.page.keyboard.press('Escape');
    });
  }

  /**
   * Clear the status filter
   */
  async clearStatusFilter(): Promise<void> {
    await test.step('Clear status filter', async () => {
      await this.clickOnElement(this.statusDropdown);
      await this.clearButtonByRole.click();
      await this.page.keyboard.press('Escape');
    });
  }

  /**
   * Click on the apps dropdown to open it
   */
  async clickOnAppsDropdown(): Promise<void> {
    await test.step('Click on apps dropdown', async () => {
      await this.clickOnElement(this.appsDropdown);
    });
  }

  /**
   * Type text into the apps search field
   * @param text - The text to search for
   */
  async typeInAppsSearch(text: string): Promise<void> {
    await test.step(`Type in apps search: ${text}`, async () => {
      await this.fillInElement(this.appsSearchInput, text);
    });
  }

  /**
   * Click the search field cross/clear button
   */
  async clickSearchFieldCross(): Promise<void> {
    await test.step('Click search field cross button', async () => {
      await this.clickOnElement(this.clearSearchButton);
    });
  }

  /**
   * Verify that the apps search field is empty
   */
  async verifySearchFieldIsNill(): Promise<void> {
    await test.step('Verify search field is empty', async () => {
      await this.expect(this.appsSearchInput, 'Expected apps search field to be empty').toHaveValue('');
    });
  }

  /**
   * Click the clear button above the search field
   */
  async clickClearButtonAboveSearch(): Promise<void> {
    await test.step('Click clear button above search', async () => {
      await this.clickOnElement(this.appsClearButton);
    });
  }

  /**
   * Verify that the apps filter is applied with the expected number of apps selected
   * @param expectedAppCount - The expected number of apps selected in the filter
   */
  async verifyAppsFilterApplied(expectedAppCount: number): Promise<void> {
    await test.step(`Verify apps filter is applied with ${expectedAppCount} apps selected`, async () => {
      // Wait for the filter to apply by waiting for the table to update
      await this.tileRows.first().waitFor({ state: 'visible', timeout: 10000 });

      // Check if the apps dropdown shows the selected count
      const appsDropdownText = await this.appsDropdown.textContent();

      // The dropdown should show the count of selected apps
      this.expect(appsDropdownText, `Expected dropdown text to show count ${expectedAppCount}`).toContain(
        expectedAppCount.toString()
      );
    });
  }

  /**
   * Clear the apps filter and wait for the page to update
   */
  async clearAppsFilterAndWait(): Promise<void> {
    await test.step('Clear apps filter and wait for page to update', async () => {
      await this.clickOnAppsDropdown();
      await this.clickClearButtonAboveSearch();
      await this.closeAppsDropdownWithEscapeKey();

      // Wait for page to update by waiting for tiles to be visible
      await this.tileRows.first().waitFor({ state: 'visible', timeout: 10000 });
    });
  }

  /**
   * Verify that no app checkbox is selected
   */
  async verifyNoAppCheckboxIsSelected(): Promise<void> {
    await test.step('Verify no app checkbox is selected', async () => {
      const count = await this.checkboxes.count();
      for (let i = 0; i < count; i++) {
        const isChecked = await this.checkboxes.nth(i).isChecked();
        this.expect(isChecked, `Expected checkbox ${i + 1} to be unchecked`).toBe(false);
      }
    });
  }

  // Show more functionality
  /**
   * Verify the "Show more" button is visible if tile count is above threshold
   * @param threshold - The threshold count for showing the "Show more" button
   */
  async verifyShowMoreIsVisibleIfAboveThreshold(threshold: number): Promise<void> {
    await test.step(`Verify show more is visible if above threshold: ${threshold}`, async () => {
      const tileCount = await this.getRenderedTileCount();

      if (tileCount > threshold) {
        await this.expect(
          this.showMoreButton,
          'Expected "Show more" button to be visible when above threshold'
        ).toBeVisible();
      }
    });
  }

  /**
   * Click the "Show more" button
   */
  async clickShowMore(): Promise<void> {
    await test.step('Click show more button', async () => {
      await this.clickOnElement(this.showMoreButton);
    });
  }

  /**
   * Verify that the "Show more" button is not visible
   */
  async verifyShowMoreIsNotVisible(): Promise<void> {
    await test.step('Verify show more button is not visible', async () => {
      await this.expect(this.showMoreButton, 'Expected "Show more" button to not be visible').not.toBeVisible();
    });
  }

  /**
   * Get the count of rendered tiles on the page
   * @returns The number of tiles currently visible
   */
  async getRenderedTileCount(): Promise<number> {
    return await this.tileRows.count();
  }

  // Enhanced tile creation methods
  /**
   * Enter a dynamic answer with a random suffix
   * @param fieldLabel - The label of the field (unused)
   * @param baseAnswer - The base answer string
   * @returns The final answer with random suffix
   */
  async enterDynamicAnswer(fieldLabel: string, baseAnswer: string): Promise<string> {
    const suffix = Math.random().toString(36).substring(2, 7);
    const finalAnswer = `${baseAnswer}_${suffix}`;
    await this.fillInElement(this.tileNameInput, finalAnswer);
    return finalAnswer;
  }

  /**
   * Verify that the API action dropdown is disabled
   */
  async verifyApiActionDisabled(): Promise<void> {
    await test.step('Verify API action dropdown is disabled', async () => {
      await this.apiActionWrapperDisabled.waitFor({ state: 'visible', timeout: 10000 });
      await this.expect(this.apiActionWrapperDisabled, 'Expected API action wrapper to be visible').toBeVisible();
    });
  }

  /**
   * Verify that the API action dropdown is enabled
   */
  async verifyApiActionEnabled(): Promise<void> {
    await test.step('Verify API action dropdown is enabled', async () => {
      // Wait for the API action wrapper to be visible
      await this.apiActionWrapper.waitFor({ state: 'visible', timeout: 10000 });

      // Check if the control is not disabled by looking for enabled state
      // or by checking that aria-disabled is not "true"
      const isDisabled = await this.apiActionWrapper.getAttribute('aria-disabled');
      this.expect(isDisabled, 'Expected API action wrapper to not be disabled').not.toBe('true');

      // Also verify the input is not disabled
      const inputDisabled = await this.reactSelectInput.getAttribute('disabled');
      this.expect(inputDisabled, 'Expected input to not be disabled').toBeNull();
    });
  }

  /**
   * Click the "Add custom app" link
   */
  async clickAddCustomAppLink(): Promise<void> {
    await test.step('Click Add custom app link', async () => {
      await this.clickOnElement(this.addCustomAppLink, {
        stepInfo: 'Click Add custom app link',
      });
    });
  }

  /**
   * Click the "Create API action" link
   */
  async clickCreateApiActionLink(): Promise<void> {
    await test.step('Click Create API action link', async () => {
      await this.clickOnElement(this.createApiActionLink, {
        stepInfo: 'Click Create API action link',
      });
    });
  }

  /**
   * Click a link and verify redirect to expected URL
   * @param linkType - The type of link to click ('addCustomApp' or 'createApiAction')
   * @param expectedUrlPattern - The expected URL pattern to redirect to
   */
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
      await this.expect(this.page, `Expected page to redirect to URL containing "${expectedUrlPattern}"`).toHaveURL(
        new RegExp(`.*${expectedUrlPattern}`)
      );
    });
  }

  /**
   * Click a create button and verify redirect
   * @param buttonText - The text of the button to click
   * @param expectedEndpoint - The expected endpoint to redirect to
   */
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

      // Wait for the new page to load by checking URL instead of networkidle
      await newPage.waitForURL(`**${expectedEndpoint}**`, { timeout: 30000 });
      await this.expect(newPage, `Expected new page to redirect to "${expectedEndpoint}"`).toHaveURL(
        new RegExp(`.*${expectedEndpoint}`)
      );

      // Close the new tab
      await newPage.close();
    });
  }

  /**
   * Verify redirect to custom apps page
   */
  async verifyRedirectToCustomAppsPage(): Promise<void> {
    await test.step('Verify redirect to custom apps page', async () => {
      await this.page.waitForURL(`**${PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE}**`);
      await this.expect(this.page, `Expected page to redirect to custom apps page`).toHaveURL(
        new RegExp(`.*${PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE}`)
      );
    });
  }

  /**
   * Verify redirect to API actions page
   */
  async verifyRedirectToApiActionsPage(): Promise<void> {
    await test.step('Verify redirect to API actions page', async () => {
      await this.page.waitForURL(`**${PAGE_ENDPOINTS.API_ACTIONS_PAGE}**`);
      await this.expect(this.page, `Expected page to redirect to API actions page`).toHaveURL(
        new RegExp(`.*${PAGE_ENDPOINTS.API_ACTIONS_PAGE}`)
      );
    });
  }

  // Canvas and drag-drop functionality
  /**
   * Drag an image and text rows block into the canvas
   * @param imageBlock - The name of the image block to drag
   */
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
      } catch {
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

  /**
   * Drag a container block into the canvas
   */
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
      } catch {
        // Alternative method using mouse events
        await this.performDragWithMouseEvents(this.containerBlock, this.canvasContainer);
      }
    });
  }

  /**
   * Drag a text block to the container
   * @param block - The name of the text block to drag
   */
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
      } catch {
        // Alternative method using mouse events
        await this.performDragWithMouseEvents(textBlock, this.containerPlaceholder);
      }
    });
  }

  // Generic drag by visible text into canvas (simple and reusable like Selenium)
  /**
   * Drag a block by its text into the canvas
   * @param blockText - The text of the block to drag
   */
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

  /**
   * Get the size of the small image placeholder
   * @returns The width and height of the image placeholder
   */
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

  /**
   * Get the flex direction of the image container
   * @returns The flex direction (e.g., 'row', 'column')
   */
  async getImageContainerFlexDirection(): Promise<string> {
    const row = await this.getImageRowContainerLocator();
    return await row.evaluate(el => getComputedStyle(el).flexDirection);
  }

  /**
   * Get the child count of the image container
   * @returns The number of children in the image container
   */
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

  /**
   * Get the flex direction of the inner text container
   * @returns The flex direction of the inner container
   */
  async getInnerContainerFlexDirection(): Promise<string> {
    const container = await this.getInnerTextContainerLocator();
    return await container.evaluate(el => getComputedStyle(el).flexDirection);
  }

  /**
   * Get the child count of the inner text container
   * @returns The number of children in the inner container
   */
  async getInnerContainerChildCount(): Promise<number> {
    const container = await this.getInnerTextContainerLocator();
    // Count direct child blocks that contain a text component (h3 or p)
    return await container.locator(':scope > div').filter({ has: this.dynamicTextElements }).count();
  }

  /**
   * Get the count of heading components (h3 elements)
   * @returns The number of heading components
   */
  async getHeadingComponentCount(): Promise<number> {
    return await this.innerTextContainers.locator('h3').count();
  }

  /**
   * Get the count of body components (p elements)
   * @returns The number of body components
   */
  async getBodyComponentCount(): Promise<number> {
    return await this.innerTextContainer.locator('p').count();
  }

  /**
   * Get the Y position of the image row
   * @returns The Y coordinate of the image row
   */
  async getImageRowY(): Promise<number> {
    const boundingBox = await this.imageRowContainer.boundingBox();
    return boundingBox?.y || 0;
  }

  /**
   * Get the Y position of the divider
   * @returns The Y coordinate of the divider
   */
  async getDividerY(): Promise<number> {
    const boundingBox = await this.dividerHr.boundingBox();
    return boundingBox?.y || 0;
  }

  /**
   * Get the child count of the canvas container
   * @returns The number of children in the canvas container
   */
  async getCanvasContainerChildCount(): Promise<number> {
    return await this.canvasComponentContainers.count();
  }

  /**
   * Check if looping is enabled
   * @returns True if looping is enabled, false otherwise
   */
  async isLoopingEnabled(): Promise<boolean> {
    const classes = await this.canvasContainer.getAttribute('class');
    return classes?.includes('Enabled') || false;
  }

  /**
   * Check if the outer direction is column
   * @returns True if the outer direction is column
   */
  async isOuterDirectionColumn(): Promise<boolean> {
    const flexDirection = await this.canvasContainer.evaluate(el => getComputedStyle(el).flexDirection);
    return flexDirection === 'column';
  }

  /**
   * Check if a property is visible in the canvas
   * @param propertyKey - The property key to check
   * @returns True if the property is in the canvas
   */
  async isInCanvas(propertyKey: string): Promise<boolean> {
    const locator = this.dynamicPropertyLocator.filter({ hasText: propertyKey });
    return await locator.isVisible();
  }

  // Data tab functionality
  /**
   * Click the Data tab
   */
  async clickDataTab(): Promise<void> {
    await test.step('Click data tab', async () => {
      await this.clickOnElement(this.dataTab);
    });
  }

  /**
   * Click the Tile Builder tab
   */
  async clickTileBuilderTab(): Promise<void> {
    await test.step('Click tile builder tab', async () => {
      await this.clickOnElement(this.tileBuilderTab);
    });
  }

  /**
   * Enable the loop data toggle
   */
  async enableLoopDataToggle(_input: string): Promise<void> {
    await test.step('Enable loop data toggle', async () => {
      await this.clickOnElement(this.loopDataToggle);
    });
  }

  /**
   * Select an array option from the dropdown
   * @param option - The array option to select
   */
  async selectArrayOption(option: string): Promise<void> {
    await test.step(`Select array option: ${option}`, async () => {
      await this.clickOnElement(this.arrayObjectDropdown);
      await this.clickOnElement(this.arrayOption.filter({ hasText: option }));
    });
  }

  /**
   * Select the expand tile to show more option
   */
  async selectExpandTileToShowMore(_option: string): Promise<void> {
    await test.step('Select expand tile to show more', async () => {
      await this.clickOnElement(this.expandTileRadio);
    });
  }

  /**
   * Select nested dropdown keys
   * @param arrayKey - The array key to select
   * @param objectKey - The object key to select
   * @param finalKey - The final key to select
   */
  async selectNestedDropdownKeys(arrayKey: string, objectKey: string, finalKey: string): Promise<void> {
    await test.step(`Select nested dropdown keys: ${arrayKey} -> ${objectKey} -> ${finalKey}`, async () => {
      await this.clickOnElement(this.dropdownItem.filter({ hasText: arrayKey }));
      await this.clickOnElement(this.dropdownItem.filter({ hasText: objectKey }));
      await this.clickOnElement(this.dropdownItem.filter({ hasText: finalKey }));
    });
  }

  /**
   * Enter the external URL button text
   * @param text - The button text to enter
   */
  async enterExternalUrlButtonText(text: string): Promise<void> {
    await test.step(`Enter external URL button text: ${text}`, async () => {
      await this.fillInElement(this.externalUrlButtonText, text);
    });
  }

  /**
   * Select the initial display count
   * @param count - The count value to select
   */
  async selectInitialDisplayCount(count: string): Promise<void> {
    await test.step(`Select initial display count: ${count}`, async () => {
      await this.clickOnElement(this.initialDisplayCountDropdown);
      await this.clickOnElement(this.displayCountOption.filter({ hasText: count }));
    });
  }

  /**
   * Verify the loop iteration count matches the expected value
   * @param expectedCount - The expected number of loop iterations
   */
  async verifyLoopIterationCount(expectedCount: number): Promise<void> {
    await test.step(`Verify loop iteration count is ${expectedCount}`, async () => {
      const count = await this.loopContainers.count();
      this.expect(count, `Expected loop iteration count to be ${expectedCount}`).toBe(expectedCount);
    });
  }

  /**
   * Verify the tile loop iteration count for a specific tile
   * @param expectedCount - The expected number of loop iterations
   * @param tileName - The name of the tile to verify
   */
  async verifyTileLoopIterationCount(expectedCount: number, tileName: string): Promise<void> {
    await test.step(`Verify tile loop iteration count is ${expectedCount} for tile: ${tileName}`, async () => {
      const tile = this.dynamicTileSection.filter({ hasText: tileName });
      const loops = tile.locator('[data-testid*="loop-container"]');
      const count = await loops.count();
      this.expect(count, `Expected loop iteration count to be ${expectedCount} for tile ${tileName}`).toBe(
        expectedCount
      );
    });
  }

  // Image configuration
  /**
   * Click on the image container
   */
  async clickImageContainer(): Promise<void> {
    await test.step('Click image container', async () => {
      await this.clickOnElement(this.imageContainer);
    });
  }

  /**
   * Select an image size
   * @param size - The image size to select
   */
  async selectImageSize(size: string): Promise<void> {
    await test.step(`Select image size: ${size}`, async () => {
      await this.clickOnElement(this.imageSizeDropdown);
      await this.clickOnElement(this.imageSizeOption.filter({ hasText: size }));
    });
  }

  /**
   * Verify the image container width matches the expected value
   * @param expectedWidth - The expected width of the image container (e.g., '100px')
   */
  async verifyImageContainerWidth(expectedWidth: string): Promise<void> {
    await test.step(`Verify image container width is ${expectedWidth}`, async () => {
      const actualWidth = await this.imageContainer.evaluate(el => getComputedStyle(el).width);
      this.expect(actualWidth, `Expected image container width to be ${expectedWidth}`).toBe(expectedWidth);
    });
  }

  /**
   * Enter a target URL
   * @param url - The target URL to enter
   */
  async enterTargetUrl(url: string): Promise<void> {
    await test.step(`Enter target URL: ${url}`, async () => {
      await this.fillInElement(this.targetUrlInput, url);
    });
  }

  /**
   * Click on an image with hyperlink
   */
  async clickOnImageWithHyperlink(): Promise<void> {
    await test.step('Click on image with hyperlink', async () => {
      await this.clickOnElement(this.imageWithHyperlink);
    });
  }

  /**
   * Verify that a new tab URL contains the expected part
   * @param expectedUrlPart - The expected URL part to verify
   */
  async verifyNewTabUrlContains(expectedUrlPart: string): Promise<void> {
    await test.step(`Verify new tab URL contains: ${expectedUrlPart}`, async () => {
      const [newPage] = await Promise.all([this.page.context().waitForEvent('page'), this.clickOnImageWithHyperlink()]);

      await newPage.waitForLoadState();
      const currentUrl = newPage.url();
      this.expect(currentUrl, `Expected new tab URL to contain "${expectedUrlPart}"`).toContain(expectedUrlPart);
      await newPage.close();
    });
  }

  /**
   * Upload a file to the tile
   * @param fileName - The name of the file to upload
   * @param fileType - The type of file (image, document, or other)
   */
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
  /**
   * Upload an image file
   * @param imageFileName - The name of the image file to upload
   */
  async uploadImage(imageFileName: string): Promise<void> {
    await this.uploadFile(imageFileName, 'image');
  }

  /**
   * Verify that a parameter exists on the page
   * @param parameterText - The parameter text to verify
   */
  async verifyParameterExists(parameterText: string): Promise<void> {
    await test.step(`Verify parameter "${parameterText}" exists`, async () => {
      // Wait for page to load completely
      await this.page.waitForLoadState('networkidle');

      // Look for the parameter text in any paragraph element
      const parameterElement = this.parameterLocator.filter({ hasText: parameterText });
      await this.expect(parameterElement, `Expected parameter "${parameterText}" to be visible`).toBeVisible({
        timeout: 50000,
      });
    });
  }

  // Form configuration
  /**
   * Click the configure button
   */
  async clickConfigureButton(): Promise<void> {
    await test.step('Click configure button', async () => {
      await this.clickOnElement(this.configureApiActionButton);
    });
  }

  /**
   * Verify a toast message is visible
   * @param message - The message to verify
   */
  async verifyToastMessage(message: string) {
    return this.appTileComponent.verifyToastMessageIsVisibleWithText(message);
  }

  /**
   * Verify the form is inside a container
   */
  async verifyFormInsideContainer(): Promise<void> {
    await test.step('Verify form is inside container', async () => {
      await this.expect(this.formContainerSubmitButton, 'Expected form submit button to be visible').toBeVisible();
    });
  }

  /**
   * Verify the canvas is auto-populated with a button
   */
  async verifyCanvasIsAutoPopulatedWithButton(): Promise<void> {
    await test.step('Verify canvas is auto-populated with button', async () => {
      await this.expect(this.formContainerButton, 'Expected form button to be visible').toBeVisible();
      const label = await this.formContainerButton.textContent();
      this.expect(label?.trim(), 'Expected button label to not be empty').not.toBe('');
    });
  }

  /**
   * Verify inline form fields in a tile
   * @param fieldsCsv - Comma-separated list of field names to verify
   */
  async verifyInlineFormFieldsInTile(fieldsCsv: string): Promise<void> {
    await test.step(`Verify inline form fields in tile: ${fieldsCsv}`, async () => {
      const fields = fieldsCsv.split(',').map(f => f.trim());
      for (const field of fields) {
        if (field.toLowerCase() === 'submit') {
          await this.expect(this.formContainerSubmitButton, `Expected "${field}" field to be visible`).toBeVisible();
        } else {
          const fieldLabel = this.inlineTileFieldLabel.filter({ hasText: field });
          await this.expect(fieldLabel, `Expected field label "${field}" to be visible`).toBeVisible();
        }
      }
    });
  }

  /**
   * Verify that overlay form fields are visible
   */
  async verifyOverlayFormFieldsVisible(): Promise<void> {
    await test.step('Verify overlay form fields are visible', async () => {
      await this.clickOnElement(this.formContainerButton);
      await this.expect(this.overlayBody, 'Expected overlay body to be visible').toBeVisible();

      const fields = ['Email', 'Summary', 'Description'];
      for (const field of fields) {
        const fieldLabel = this.overlayFieldLabel.filter({ hasText: field });
        await this.expect(fieldLabel, `Expected overlay field "${field}" to be visible`).toBeVisible();
      }
    });
  }

  // Success/Error handling
  /**
   * Verify the success message with ticket and bot link
   */
  async verifySuccessMessageWithTicketAndBotLink(): Promise<void> {
    await test.step('Verify success message with ticket and bot link', async () => {
      const successText = await this.successMessage.textContent();
      this.expect(successText, 'Expected success text to contain "Ticket created successfully with ID:"').toContain(
        'Ticket created successfully with ID:'
      );
      this.expect(successText, 'Expected success text to contain "BOT-"').toContain('BOT-');
      await this.expect(this.botLink, 'Expected bot link to be visible').toBeVisible();
    });
  }

  /**
   * Click bot link and verify redirect
   * @param expectedUrl - The expected URL to redirect to
   */
  async clickBotLinkAndVerifyRedirect(expectedUrl: string): Promise<void> {
    await test.step(`Click bot link and verify redirect to: ${expectedUrl}`, async () => {
      const [newPage] = await Promise.all([
        this.page.context().waitForEvent('page'),
        this.clickOnElement(this.botLink),
      ]);

      await newPage.waitForLoadState();
      const actualUrl = newPage.url();
      this.expect(actualUrl, `Expected URL to contain "${expectedUrl}"`).toContain(expectedUrl);
      await newPage.close();
    });
  }

  // Tile management
  /**
   * Click the three dots menu for a tile starting with the given prefix
   * @param prefix - The prefix to match tiles
   */
  async clickThreeDotsForTileStartingWith(prefix: string): Promise<void> {
    await test.step(`Click three dots for tile starting with: ${prefix}`, async () => {
      // Get the first tile with the prefix to avoid strict mode violation
      const tileRow = this.dynamicTileRow.filter({ hasText: prefix }).first();
      const moreBtn = tileRow.locator(this.showMoreButtonSelector);
      await this.clickOnElement(moreBtn);
    });
  }

  /**
   * Select an option from the tile menu dropdown
   * @param option - The menu option to select
   */
  async selectOptionFromTileMenuDropdown(option: string): Promise<void> {
    await test.step(`Select option from tile menu dropdown: ${option}`, async () => {
      // Wait for dropdown menu to be visible
      await this.page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 5000 });

      // Use constructor-assigned locator with filter for specific option
      const menuItem = this.dynamicMenuItem.filter({ hasText: option });
      await this.clickOnElement(menuItem);
    });
  }

  /**
   * Click the confirm delete button
   */
  async clickConfirmDeleteButton(): Promise<void> {
    await test.step('Click confirm delete button', async () => {
      await this.clickOnElement(this.confirmDeleteButton);
    });
  }

  /**
   * Delete all tiles that start with the given prefix or match a pattern
   * @param prefix - The prefix to match tiles for deletion, or empty string for pattern matching
   * @param pattern - Optional regex pattern to match tile names (e.g., /Test\s[a-zA-Z0-9]{6}$/)
   */
  async deleteAllTilesWithPrefix(prefix: string, pattern?: RegExp): Promise<void> {
    await test.step(`Delete all tiles with prefix: ${prefix}`, async () => {
      let deletedCount = 0;
      const maxAttempts = 30;

      while (deletedCount < maxAttempts) {
        try {
          // Find matching tile
          let matchingTile: Locator | null = null;
          let tileName = '';

          if (pattern) {
            // Pattern matching: find first tile matching pattern
            const count = await this.tileHeadingByPrefix.count();
            for (let i = 0; i < count; i++) {
              const text = await this.tileHeadingByPrefix.nth(i).textContent();
              if (text && pattern.test(text.trim())) {
                tileName = text.trim();
                matchingTile = this.tileRows.filter({ hasText: tileName }).first();
                if (await matchingTile.isVisible({ timeout: 2000 }).catch(() => false)) break;
              }
            }
          } else {
            matchingTile = this.tileRows.filter({ hasText: prefix }).first();
          }

          if (!matchingTile || !(await matchingTile.isVisible({ timeout: 2000 }).catch(() => false))) {
            console.log(`No more matching tiles found. Deleted ${deletedCount} tiles.`);
            break;
          }

          // Get tile name for logging
          if (!tileName) {
            tileName =
              (await matchingTile
                .locator('h3')
                .first()
                .textContent()
                .catch(() => '')) || '';
          }

          // Delete the tile
          await matchingTile.locator(this.showMoreButtonSelector).first().click();
          await this.page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 5000 });
          await this.selectOptionFromTileMenuDropdown('Delete');
          await this.confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
          await this.clickConfirmDeleteButton();
          await this.confirmDeleteButton.waitFor({ state: 'hidden', timeout: 10000 });

          // Wait for tile to be removed from DOM
          await matchingTile.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
          await this.page.waitForTimeout(500); // Small delay for DOM update

          deletedCount++;
          console.log(`Deleted tile ${deletedCount}: ${tileName}`);
        } catch (error) {
          console.error(`Deletion attempt ${deletedCount + 1} failed:`, error);
          await this.page.keyboard.press('Escape').catch(() => {});

          // Reload periodically or if many failures
          if (deletedCount > 0 && deletedCount % 5 === 0 && !this.page.isClosed()) {
            await this.page.reload({ waitUntil: 'domcontentloaded' });
            await this.tileRows
              .first()
              .waitFor({ state: 'attached', timeout: 10000 })
              .catch(() => {});
          } else if (deletedCount === 0) {
            // If first attempt fails, check if no tiles exist
            const hasTiles = await this.tileRows
              .first()
              .isVisible({ timeout: 2000 })
              .catch(() => false);
            if (!hasTiles) break;
          }
        }
      }

      console.log(`Completed. Total tiles deleted: ${deletedCount}`);
    });
  }

  /**
   * Verify the save button is enabled
   */
  async verifySaveButtonIsEnabled(): Promise<void> {
    await test.step('Verify save button is enabled', async () => {
      await this.expect(this.saveButtonForVerification, 'Expected save button to be enabled').toBeEnabled();
    });
  }

  /**
   * Verify the next button is primary (has primary class)
   */
  async verifyNextButtonIsPrimary(): Promise<void> {
    await test.step('Verify next button is primary', async () => {
      await this.expect(this.nextButtonForVerification, 'Expected next button to have primary class').toHaveClass(
        /Button-module__primary__/
      );
    });
  }

  /**
   * Verify the status of the created tile
   * @param status - The expected status of the tile (e.g., 'Draft', 'Published')
   */
  async verifyCreatedTileStatus(status: string): Promise<void> {
    await test.step(`Verify created tile status is: ${status}`, async () => {
      const tileStatus = this.firstTileRow.getByText(status);
      await this.expect(tileStatus, `Expected tile status to be "${status}"`).toBeVisible();
    });
  }

  /**
   * Verify that a tile is on top of the list
   * @param tileName - The name of the tile that should be on top
   */
  async verifyTileIsOnTop(tileName: string): Promise<void> {
    await test.step(`Verify tile is on top: ${tileName}`, async () => {
      const topTile = await this.topTileName.textContent();
      this.expect(topTile?.trim(), `Expected top tile name to be "${tileName}"`).toBe(tileName);
    });
  }

  /**
   * Verify that a tile has the specified fields
   * @param fields - Array of field names to verify (e.g., 'label', 'link', 'image')
   */
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
        await this.expect(locator, `Expected field "${field}" to be visible`).toBeVisible();
      }
    });
  }

  // Utility methods
  /**
   * Verify that save and next buttons are disabled
   * @param saveText - The save button text
   * @param nextText - The next button text
   */
  async verifySaveAndNextDisabled(saveText: string, nextText: string): Promise<void> {
    await test.step(`Verify save and next buttons are disabled: ${saveText}, ${nextText}`, async () => {
      const saveBtn = this.dynamicSaveButton.filter({ hasText: saveText });
      const nextBtn = this.dynamicNextButton.filter({ hasText: nextText });

      await this.expect(saveBtn, `Expected save button "${saveText}" to be disabled`).toBeDisabled();
      await this.expect(nextBtn, `Expected next button "${nextText}" to be disabled`).toBeDisabled();
    });
  }

  /**
   * Verify display dropdown options
   * @param option1 - The first expected option
   * @param option2 - The second expected option
   */
  async verifyDisplayDropdownOptions(option1: string, option2: string): Promise<void> {
    await test.step(`Verify display dropdown options: ${option1}, ${option2}`, async () => {
      const options = await this.formBehaviorDropdownOptions.allTextContents();
      const trimmedOptions = options.map(opt => opt.trim());

      this.expect(trimmedOptions, `Expected dropdown options to contain "${option1}"`).toContain(option1);
      this.expect(trimmedOptions, `Expected dropdown options to contain "${option2}"`).toContain(option2);
      this.expect(trimmedOptions.length, 'Expected exactly 2 dropdown options').toBe(2);
    });
  }

  /**
   * Select a display option in form behavior dropdown
   * @param option - The option to select
   */
  async selectDisplayOptionInFormBehaviour(option: string): Promise<void> {
    await test.step(`Select display option in form behaviour: ${option}`, async () => {
      await this.formBehaviorDropdown.selectOption(option);
    });
  }

  /**
   * Verify the incomplete settings message
   * @param messageText - The expected message text
   */
  async verifyIncompleteSettingMessage(messageText: string): Promise<void> {
    await test.step(`Verify incomplete setting message: ${messageText}`, async () => {
      const message = this.incompleteSettingsMessageLocator.filter({ hasText: messageText });
      await this.expect(message, `Expected incomplete settings message "${messageText}" to be visible`).toBeVisible();
    });
  }

  /**
   * Verify the change tile type popup
   * @param messageText - The expected popup message text
   */
  async verifyChangeTileTypePopup(messageText: string): Promise<void> {
    await test.step(`Verify change tile type popup: ${messageText}`, async () => {
      const dialog = this.changeTileTypeDialog.filter({ hasText: messageText });
      await this.expect(dialog, `Expected change tile type dialog "${messageText}" to be visible`).toBeVisible();
    });
  }

  /**
   * Verify the tile type change message
   * @param messageText - The expected message text
   */
  async verifyTileTypeChangeMessage(messageText: string): Promise<void> {
    await test.step(`Verify tile type change message: ${messageText}`, async () => {
      const message = this.changeTileTypeMessageLocator.filter({ hasText: messageText });
      await this.expect(message, `Expected tile type change message "${messageText}" to be visible`).toBeVisible();
    });
  }

  /**
   * Verify old canvas elements are cleared
   */
  async verifyOldCanvasElementsAreCleared(): Promise<void> {
    await test.step('Verify old canvas elements are cleared', async () => {
      await this.expect(this.previousLinkLocator, 'Expected previous link to not be visible').not.toBeVisible();
      await this.expect(this.previousDividerLocator, 'Expected previous divider to not be visible').not.toBeVisible();
    });
  }

  /**
   * Verify canvas reset state
   */
  async verifyCanvasResetState(): Promise<void> {
    await test.step('Verify canvas reset state', async () => {
      await this.expect(this.formHeadingLocator, 'Expected form heading to be visible').toBeVisible();
      await this.expect(this.configureButtonLocator, 'Expected configure button to be visible').toBeVisible();
    });
  }

  /**
   * Verify that a tile is not displayed
   * @param tileName - The name of the tile that should not be displayed
   */
  async verifyTileIsNotDisplayed(tileName: string): Promise<void> {
    await test.step(`Verify tile is not displayed: ${tileName}`, async () => {
      const tileHeader = this.dynamicTileHeader.filter({ hasText: tileName });
      await this.expect(tileHeader, `Expected tile "${tileName}" to not be visible`).not.toBeVisible();
    });
  }

  /**
   * Click API action dropdown and verify no results message
   */
  async clickApiActionDropdownAndVerifyNoResults(): Promise<void> {
    await test.step('Click API action dropdown and verify no results', async () => {
      await this.clickOnElement(this.apiActionSelect);
      await this.expect(this.apiActionNoResults, 'Expected "no results" message to be visible').toBeVisible();
    });
  }

  /**
   * Verify the small image placeholder size
   * @param expectedWidth - The expected width
   * @param expectedHeight - The expected height
   */
  async verifySmallImagePlaceholderSize(expectedWidth: number, expectedHeight: number): Promise<void> {
    await test.step(`Verify small image placeholder size: ${expectedWidth}x${expectedHeight}`, async () => {
      const imageSize = await this.getSmallImagePlaceholderSize();
      this.expect(imageSize.width, `Expected image width to be ${expectedWidth}`).toBe(expectedWidth);
      this.expect(imageSize.height, `Expected image height to be ${expectedHeight}`).toBe(expectedHeight);
    });
  }

  /**
   * Verify the image container flex direction
   * @param expectedDirection - The expected flex direction
   */
  async verifyImageContainerFlexDirection(expectedDirection: string): Promise<void> {
    await test.step(`Verify image container flex direction is: ${expectedDirection}`, async () => {
      const flexDirection = await this.getImageContainerFlexDirection();
      this.expect(flexDirection, `Expected flex direction to be ${expectedDirection}`).toBe(expectedDirection);
    });
  }

  /**
   * Verify the image container has at least the minimum child count
   * @param minCount - The minimum expected child count
   */
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

      this.expect(childCount, `Expected child count to be at least ${minCount}`).toBeGreaterThanOrEqual(minCount);
    });
  }

  /**
   * Verify the inner container flex direction
   * @param expectedDirection - The expected flex direction
   */
  async verifyInnerContainerFlexDirection(expectedDirection: string): Promise<void> {
    await test.step(`Verify inner container flex direction is: ${expectedDirection}`, async () => {
      const innerFlexDirection = await this.getInnerContainerFlexDirection();
      this.expect(innerFlexDirection, `Expected inner flex direction to be ${expectedDirection}`).toBe(
        expectedDirection
      );
    });
  }

  /**
   * Verify the inner container child count
   * @param expectedCount - The expected child count
   */
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

      this.expect(count, `Expected child count to be ${expectedCount}`).toBe(expectedCount);
    });
  }

  /**
   * Verify the heading component count
   * @param expectedCount - The expected heading component count
   */
  async verifyHeadingComponentCount(expectedCount: number): Promise<void> {
    await test.step(`Verify heading component count is: ${expectedCount}`, async () => {
      const headingCount = await this.getHeadingComponentCount();
      this.expect(headingCount, `Expected heading component count to be ${expectedCount}`).toBe(expectedCount);
    });
  }

  /**
   * Verify the body component count
   * @param expectedCount - The expected body component count
   */
  async verifyBodyComponentCount(expectedCount: number): Promise<void> {
    await test.step(`Verify body component count is: ${expectedCount}`, async () => {
      const bodyCount = await this.getBodyComponentCount();
      this.expect(bodyCount, `Expected body component count to be ${expectedCount}`).toBe(expectedCount);
    });
  }

  /**
   * Verify the divider is positioned below the image row
   */
  async verifyDividerPositionBelowImageRow(): Promise<void> {
    await test.step('Verify divider is positioned below image row', async () => {
      const imageRowY = await this.getImageRowY();
      const dividerY = await this.getDividerY();
      this.expect(dividerY, 'Expected divider Y position to be greater than image row Y').toBeGreaterThan(imageRowY);
    });
  }

  /**
   * Verify that looping is enabled
   */
  async verifyLoopingIsEnabled(): Promise<void> {
    await test.step('Verify looping is enabled', async () => {
      const isLoopingEnabled = await this.isLoopingEnabled();
      this.expect(isLoopingEnabled, 'Expected looping to be enabled').toBe(true);
    });
  }

  /**
   * Verify that the outer direction is column
   */
  async verifyOuterDirectionIsColumn(): Promise<void> {
    await test.step('Verify outer direction is column', async () => {
      const isOuterDirectionColumn = await this.isOuterDirectionColumn();
      this.expect(isOuterDirectionColumn, 'Expected outer direction to be column').toBe(true);
    });
  }

  /**
   * Verify that the display dropdown is disabled
   */
  async verifyDisplayDropdownIsDisabled(): Promise<void> {
    await test.step('Verify display dropdown is disabled', async () => {
      await this.expect(this.imageSizeDropdown, 'Expected display dropdown to be disabled').toBeDisabled();
    });
  }

  /**
   * Verify that tile menu options are visible
   */
  async verifyTileMenuOptionsVisible(): Promise<void> {
    await test.step('Verify tile menu options are visible', async () => {
      await this.expect(this.tileMenuOption, 'Expected tile menu option to be visible').toBeVisible();
    });
  }

  /**
   * Select a radio option for a field
   * @param optionText - The radio option text to select
   * @param fieldLabel - The field label to select the option in
   */
  async selectRadioForField(optionText: string, fieldLabel: string): Promise<void> {
    await test.step(`Select "${optionText}" option from "${fieldLabel}"`, async () => {
      // Find the field container by data-testid
      const fieldContainer = this.fieldContainer.filter({ hasText: fieldLabel });

      // Use Playwright's getByRole to find the radio by its label text within the container
      const radioElement = fieldContainer.getByRole('radio', { name: optionText, exact: true });

      await this.clickOnElement(radioElement, {
        stepInfo: `Select "${optionText}" option from "${fieldLabel}"`,
      });
    });
  }
}
