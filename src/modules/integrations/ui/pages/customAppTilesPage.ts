import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { TagComponent } from '@integrations-components/tagComponent';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { expect, Locator, Page, test } from '@playwright/test';
import path from 'path';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { CUSTOM_APP_TILES_TEST_DATA } from '../../test-data/customAppTiles.test-data';

import { BasePage } from '@/src/core/ui/pages/basePage';

// Timeout constants for better maintainability
const TIMEOUTS = {
  SHORT_WAIT: 500,
  MEDIUM_WAIT: 1000,
  LONG_WAIT: 1500,
  EXTRA_LONG_WAIT: 2000,
  ANIMATION_WAIT: 500,
  TRANSITION_WAIT: 1000,
  SAVE_WAIT: 2000,
  ELEMENT_VISIBLE: 5000,
  ELEMENT_LOAD: 10000,
} as const;

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
  readonly tagComponent: TagComponent;

  // Selector strings for reusable components
  readonly showMoreButtonSelector: string;
  readonly pageTitle: Locator;
  readonly createCustomAppTileButton: Locator;
  readonly backToTilesListLink: Locator;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly appsDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly statusFilterLabels: Locator;
  readonly appsSearchInput: Locator;
  readonly appOptionLabels: Locator;
  readonly tileRows: Locator;
  readonly noResultsHeading: Locator;
  readonly noResultsDescription: Locator;
  readonly showMoreButton: Locator;
  readonly resultCount: Locator;
  readonly tileMoreButton: Locator;
  readonly tileMenuOption: Locator;
  readonly confirmDeleteButton: Locator;
  readonly tileHeadingByPrefix: Locator;
  readonly tileStatusByName: Locator;
  readonly topTileName: Locator;
  readonly tileNameInput: Locator;
  readonly tileDescriptionInput: Locator;
  readonly tileTypeSelect: Locator;
  readonly appSelect: Locator;
  readonly apiActionSelect: Locator;
  readonly tileBuilderStepper: Locator;
  readonly canvasContainer: Locator;
  readonly imageTextRowsBlock: Locator;
  readonly containerBlock: Locator;
  readonly textBlock: Locator;
  readonly imageBlock: Locator;
  readonly formContainer: Locator;
  readonly formContainerSubmitButton: Locator;
  readonly formContainerButton: Locator;
  readonly dataTab: Locator;
  readonly tileBuilderTab: Locator;
  readonly initialDisplayCountDropdown: Locator;
  readonly imageSizeDropdown: Locator;
  readonly imageContainer: Locator;
  readonly targetUrlInput: Locator;
  readonly imageWithHyperlink: Locator;
  readonly selectFromComputerButton: Locator;
  readonly imageUploadInput: Locator;
  readonly configureApiActionButton: Locator;
  readonly apiActionWrapper: Locator;
  readonly apiActionWrapperEnabled: Locator;
  readonly apiActionWrapperDisabled: Locator;
  readonly addCustomAppLink: Locator;
  readonly createApiActionLink: Locator;
  readonly formBehaviorDropdown: Locator;
  readonly dialogTitle: Locator;
  readonly dialogModule: Locator;
  readonly dialogFooterButtonSelector: string;
  readonly firstTileRow: Locator;
  readonly cancelButtonForVerification: Locator;
  readonly formBehaviorDropdownOptions: Locator;
  readonly incompleteSettingsMessageLocator: Locator;
  readonly appColumns: Locator;
  readonly checkboxes: Locator;
  readonly reactSelectInput: Locator;
  readonly buttonElement: Locator;
  readonly tileRowByPrefix: Locator;
  readonly fieldContainer: Locator;
  readonly fieldSelector: string;
  readonly fieldRequiredError: string;
  readonly displayCountOption: Locator;
  readonly imageSizeOption: Locator;
  readonly formBehaviorOption: Locator;
  readonly dynamicSourceLocator: Locator;
  readonly dynamicTileRow: Locator;
  readonly dynamicMoreButton: Locator;
  readonly dynamicMenuItem: Locator;
  readonly dynamicTileStatus: Locator;
  readonly dynamicTileHeader: Locator;
  readonly dynamicSaveButton: Locator;
  readonly dynamicNextButton: Locator;
  readonly dynamicAppColumns: Locator;
  readonly optionByRole: Locator;
  readonly buttonByRole: Locator;
  readonly clearButtonByRole: Locator;
  readonly cancelLinkButton: Locator;
  readonly backToEditingButton: Locator;
  readonly editCustomAppTileHeader: Locator;
  readonly createCustomAppTileHeader: Locator;
  readonly tileBuilderStep: Locator;
  readonly detailsStep: Locator;
  readonly radioButtonSelector: string;
  readonly tabSelectorWithPanel: string;
  readonly tabSelectorWithoutPanel: string;
  readonly accordionTriggerSelector: string;
  readonly buttonRole: string;
  readonly linkRole: string;
  readonly headingRole: string;
  readonly apiResponseDialog: Locator;
  readonly apiResponseStatusContainer: Locator;
  readonly apiResponseSuccessIndicator: Locator;
  readonly apiResponseDoneButton: Locator;
  readonly apiResponseBody: Locator;
  readonly changeTileTypeDialog: Locator;
  readonly changeTileTypeDialogTitle: Locator;
  readonly appsClearButton: Locator;
  readonly styleDropdownSelectedValue: Locator;
  readonly styleDropdownControl: Locator;
  readonly styleDropdownOptions: Locator;
  readonly reactSelectOptions: Locator;
  readonly enabledTextComponent: Locator;
  readonly editableTextElements: Locator;
  readonly textContainerElements: Locator;
  readonly imageSelectDropdown: Locator;
  readonly detailsButton: Locator;
  readonly getApiResponseButton: Locator;
  readonly menuLocator: Locator;
  readonly menuItemLocator: Locator;
  readonly arrowTriggerLocator: Locator;
  readonly transformValueDialog: Locator;
  readonly transformValueDialogDescription: Locator;
  readonly transformValueMoreIcon: Locator;
  readonly transformValueOpenMenu: Locator;
  readonly transformValueMenuItem: Locator;
  readonly transformValueOption: Locator;
  readonly transformValueCaseFormatPlaceholder: Locator;
  readonly transformValueDateFormatPlaceholder: Locator;
  readonly transformValueReactSelectControl: Locator;
  readonly transformValueListbox: Locator;
  readonly transformValueSaveButton: Locator;
  readonly transformValueCancelButton: Locator;
  readonly transformValueCloseButton: Locator;
  readonly transformValueDateRadio: Locator;
  readonly transformValueCaseRadio: Locator;
  readonly transformValueMappingRadio: Locator;
  readonly transformValueDefaultValueLabel: Locator;
  readonly transformValueDefaultValueRequired: Locator;
  readonly transformValueAddMappingRuleButton: Locator;
  readonly transformValueLabelFor: Locator;

  /**
   * Get a button locator by its name/text
   * @param buttonName - The name/text of the button (string or RegExp)
   */
  getButton(buttonName: string | RegExp): Locator {
    return this.page.getByRole(this.buttonRole as any, { name: buttonName });
  }

  /**
   * Get a radio button by value
   * @param value - The value of the radio button
   */
  getRadioByValue(value: string): Locator {
    const selector = this.radioButtonSelector.replace('{value}', value);
    return this.page.locator(selector);
  }

  /**
   * Get a link locator by its name/text
   * @param linkName - The name/text of the link (string or RegExp)
   */
  getLink(linkName: string | RegExp): Locator {
    return this.page.getByRole(this.linkRole as any, { name: linkName });
  }

  /**
   * Get a heading locator by its text and optional level
   * @param headingText - The text of the heading
   * @param level - Optional heading level (1-6)
   */
  getHeading(headingText: string, level?: number): Locator {
    return level
      ? this.page.getByRole(this.headingRole as any, { name: headingText, level })
      : this.page.getByRole(this.headingRole as any, { name: headingText });
  }

  /**
   * Get an element by test id
   * @param testId - The data-testid value
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get dialog buttons (Cancel, Confirm, etc) within a specific dialog
   * @param dialogLocator - The dialog container locator
   * @param buttonName - The button name
   */
  getDialogButton(dialogLocator: Locator, buttonName: string): Locator {
    return dialogLocator.getByRole(this.buttonRole as any, { name: buttonName });
  }

  /**
   * Get an element by label
   * @param label - The label text
   * @param exact - Whether to match exactly
   */
  getByLabel(label: string, exact: boolean = true): Locator {
    return this.page.getByLabel(label, { exact });
  }

  /**
   * Get an element by text
   * @param text - The text to match
   * @param exact - Whether to match exactly
   */
  getByText(text: string, exact: boolean = true): Locator {
    return this.page.getByText(text, { exact });
  }

  /**
   * Get element by role
   * @param role - The role type
   * @param options - Additional options like name, level, etc.
   */
  getByRole(role: string, options?: any): Locator {
    return this.page.getByRole(role as any, options);
  }

  /**
   * Get a locator by selector
   * @param selector - The CSS/XPath selector
   */
  getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get tab locator based on tab name and optional panel context
   * @param tabName - The name of the tab
   * @param panelName - Optional panel name for context
   */
  getTabLocator(tabName: string, panelName?: string): Locator {
    if (panelName) {
      const selector = this.tabSelectorWithPanel.replace('{panelName}', panelName).replace('{tabName}', tabName);
      return this.page.locator(selector).first();
    }
    const selector = this.tabSelectorWithoutPanel.replace('{tabName}', tabName);
    return this.page.locator(selector).first();
  }

  /**
   * Get accordion button locator by title
   * @param accordionTitle - The title of the accordion (e.g., "Target URL", "Image source")
   */
  getAccordionLocator(accordionTitle: string): Locator {
    const selector = this.accordionTriggerSelector.replace('{accordionTitle}', accordionTitle);
    return this.page.locator(selector).first();
  }

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CUSTOM_APP_TILES_PAGE);

    this.appTileComponent = new BaseAppTileComponent(page);

    // Initialize role strings first (before any methods that use them)
    this.buttonRole = 'button';
    this.linkRole = 'link';
    this.headingRole = 'heading';

    // Initialize selector patterns
    this.radioButtonSelector = 'input[type="radio"][value="{value}"]';
    this.tabSelectorWithPanel = 'div:has(h3:text-is("{panelName}")) button[role="tab"]:has-text("{tabName}")';
    this.tabSelectorWithoutPanel = 'button[role="tab"]:has-text("{tabName}")';
    this.accordionTriggerSelector = 'button[class*="AccordionTrigger"]:has(p:has-text("{accordionTitle}"))';
    this.fieldSelector = '[data-testid="field-{fieldName}"]';
    this.fieldRequiredError = ' is a required field';

    // Initialize component instances
    this.tagComponent = new TagComponent(page, this.fieldSelector);

    // Initialize selector strings
    this.showMoreButtonSelector = 'button[aria-label="Show more"]';
    this.pageTitle = this.getLocator('h1').filter({ hasText: 'Custom app tiles' });
    // Use getLink helper for consistency
    this.createCustomAppTileButton = this.getLink('Create custom app tile');
    this.backToTilesListLink = this.getLink('Custom app tiles');
    this.searchInput = this.getByRole('searchbox').or(this.getLocator('#search'));
    // Use getButton helper
    this.clearSearchButton = this.getButton('Clear').first();
    // Be more specific to avoid matching "Apps & links" button
    this.appsDropdown = this.getByTestId('pageContainer-page').getByRole(this.buttonRole as any, { name: 'Apps' });
    this.statusDropdown = this.getLocator('button.FilterGroup-module__pill__a50KR').filter({
      hasText: /Status/i,
    });
    this.statusFilterLabels = this.getLocator('label');
    this.appsSearchInput = this.getLocator('input[aria-label="Search…"]');
    this.appOptionLabels = this.getLocator('label.CheckboxWithIconAndCount-module__label__iBhDy');
    this.tileRows = this.getLocator('tr[data-testid^="dataGridRow-"]');
    // Use getHeading helper
    this.noResultsHeading = this.getHeading('No results', 3);
    this.noResultsDescription = this.getByText('Try adjusting search term or filters');
    // Use getButton helper - be specific to avoid matching tile row menu "Show more" buttons
    // The pagination Show more button would NOT be inside a table cell (td element)
    // Use locator directly to avoid the menu buttons
    this.showMoreButton = this.getLocator('button:has-text("Show more"):not([aria-haspopup="menu"])');
    this.resultCount = this.getLocator('.TilesList_resultCount--kEOjb');
    // Reuse showMoreButtonSelector for consistency
    this.tileMoreButton = this.getLocator(this.showMoreButtonSelector);
    this.tileMenuOption = this.getLocator(
      '[role="menuitem"], .dropdown-menu-item, [data-testid*="menu-item"], [data-testid*="option"]'
    ).first();
    // Use getButton helper
    this.confirmDeleteButton = this.getButton('Delete');
    this.tileHeadingByPrefix = this.getLocator('h3.Typography-module__heading3__OGpiQ');
    this.tileStatusByName = this.getLocator('span.StatusTag-module__statusTag__NNFTa');
    this.topTileName = this.tileHeadingByPrefix.first();
    this.tileNameInput = this.getByLabel('Tile name', false).or(this.getLocator('#tileName'));
    this.tileDescriptionInput = this.getByLabel('Description', false).or(this.getLocator('#tileDescription'));
    this.tileTypeSelect = this.getByLabel('Tile type', false).or(this.getLocator('#tileType'));
    this.appSelect = this.getByLabel('App', true);
    this.apiActionSelect = this.page.getByRole('combobox', { name: 'API action' });
    this.tileBuilderStepper = this.getByText('Tile builder', true);
    this.canvasContainer = this.getByTestId('container');
    this.imageTextRowsBlock = this.getByTestId('image-text-rows-block');
    this.containerBlock = this.getByTestId('container-block');
    this.textBlock = this.getByTestId('text-block');
    this.imageBlock = this.getByTestId('image-block');
    this.formContainer = this.getByTestId('form-container');
    this.formContainerSubmitButton = this.getByTestId('form-container-submit-button');
    this.formContainerButton = this.getLocator('div[data-testid="formContainer"] button');
    this.dataTab = this.getByTestId('data-tab');
    // Use getButton helper
    this.tileBuilderTab = this.getButton('Tile builder');
    // Use getByTestId helper
    this.initialDisplayCountDropdown = this.getByTestId('initial-display-count-dropdown');
    this.imageSizeDropdown = this.getLocator(
      '[data-testid="image-size-dropdown"], select[aria-label*="size"], select[aria-label*="Size"]'
    );
    this.imageContainer = this.getLocator(
      '[data-testid="image-container"], ._imageContainer_1kgp0_1, [class*="imageContainer"]'
    );
    this.targetUrlInput = this.page.locator('textarea[placeholder="Add target URL…"]');
    // Locator for the anchor tag with href inside the image container
    this.imageWithHyperlink = this.page.locator("div[class*='_imageContainer'] a[href]").first();
    // Use getButton helper
    this.selectFromComputerButton = this.getButton('select from computer');
    this.imageUploadInput = this.getLocator('input[type="file"][aria-labelledby*="dropzone"]');
    this.configureApiActionButton = this.getByTestId('configure-api-action-button');
    this.apiActionWrapper = this.getLocator('div[data-testid="field-API action"]');
    this.apiActionWrapperEnabled = this.getLocator('div[data-testid="field-API action"] [aria-disabled="false"]');
    this.apiActionWrapperDisabled = this.getLocator('div[data-testid="field-API action"] [aria-disabled="true"]');
    // Use getLink helper
    this.addCustomAppLink = this.getLink(/App not available\? Add custom app/i);
    this.createApiActionLink = this.getLink(/API action not available\? Create API action/i);
    this.formBehaviorDropdown = this.getLocator('select[aria-label="Form behavior"]');
    this.dialogTitle = this.getByTestId('dialog-title');
    this.dialogModule = this.getLocator('[class*="Dialog-module"]');
    this.dialogFooterButtonSelector = '[class*="Dialog-module__footer"] button';
    this.firstTileRow = this.getLocator('tbody tr').first();
    // Will be set after cancelLinkButton is initialized
    this.cancelButtonForVerification = this.getByRole(this.linkRole, { name: 'Cancel' });
    this.formBehaviorDropdownOptions = this.getLocator('select[aria-label="Form behavior"] option:not([disabled])');
    // Reuse existing locator instead of duplicating
    this.incompleteSettingsMessageLocator = this.getByTestId('incomplete-settings-message');
    this.appColumns = this.getLocator('td:nth-child(2) p');
    this.checkboxes = this.getLocator('input[type="checkbox"]');
    this.reactSelectInput = this.getLocator('#react-select-4-input');
    this.buttonElement = this.getLocator('a, button');
    this.tileRowByPrefix = this.getLocator('tr');
    this.fieldContainer = this.getLocator('[data-testid^="field-"]');
    this.displayCountOption = this.getByTestId('display-count-option');
    this.imageSizeOption = this.getByTestId('image-size-option').or(this.getLocator('option'));
    this.formBehaviorOption = this.getLocator('select[aria-label="Form behavior"] option');
    this.dynamicSourceLocator = this.getLocator("xpath=//button[@draggable='true'] | //div[@role='button']");
    // Reuse existing locators instead of duplicating
    this.dynamicTileRow = this.tileRowByPrefix;
    this.dynamicMoreButton = this.tileMoreButton; // Reuse existing tileMoreButton
    this.dynamicMenuItem = this.getByRole('menuitem');
    this.dynamicTileStatus = this.tileStatusByName;
    this.dynamicTileHeader = this.tileHeadingByPrefix;
    // These already use helper methods - good practice
    this.dynamicSaveButton = this.getButton('Save');
    this.dynamicNextButton = this.getButton('Next');
    this.dynamicAppColumns = this.getLocator('td:nth-child(2)');
    this.optionByRole = this.getByRole('option');
    this.buttonByRole = this.getByRole(this.buttonRole);
    // Reuse existing locator instead of duplicating
    this.clearButtonByRole = this.clearSearchButton;
    // Use getLink helper for consistency
    this.cancelLinkButton = this.getByRole(this.linkRole, { name: 'Cancel', exact: true });
    // Use getButton helper for consistency
    this.backToEditingButton = this.getButton('Back to editing');
    // Use getHeading helper for consistency
    this.editCustomAppTileHeader = this.getHeading('Edit custom app tile');
    this.createCustomAppTileHeader = this.getHeading('Create custom app tile');
    // Use getButton helper
    this.tileBuilderStep = this.getButton('Tile builder');
    this.detailsStep = this.getButton('Details').and(this.getLocator(':not([disabled])'));
    this.apiResponseDialog = this.getByRole('dialog').filter({ hasText: 'API action response' });
    this.apiResponseStatusContainer = this.getLocator('[class*="statusContainer"]');
    this.apiResponseSuccessIndicator = this.getLocator('[class*="successIndicator"]');
    this.apiResponseDoneButton = this.getDialogButton(this.apiResponseDialog, 'Done');
    this.apiResponseBody = this.getLocator('#responseBody, [class*="jsonContent"], pre').first();
    this.changeTileTypeDialog = this.getByRole('dialog').filter({ hasText: 'Change tile type' });
    this.changeTileTypeDialogTitle = this.changeTileTypeDialog.getByRole('heading', { level: 2 });

    // Apps dropdown specific locators
    this.appsClearButton = this.getLocator('button[type="reset"]:has-text("Clear")');

    // Text style selection locators
    this.styleDropdownSelectedValue = this.page.locator('.css-910r8z-singleValue');
    this.styleDropdownControl = this.page.locator('.css-1bbetpp-control');
    this.styleDropdownOptions = this.page.locator('.css-1n7v3ny-option, [class*="option"]');
    this.reactSelectOptions = this.page.locator('[id^="react-select"][id$="-option"]');
    this.enabledTextComponent = this.canvasContainer.locator('div._enabled_1pgot_1._component-selected_124ez_1');
    this.editableTextElements = this.canvasContainer.locator('h3, p, span[contenteditable="true"]');
    this.textContainerElements = this.page.locator('[data-testid="container"]').locator('h3, p, span, div');

    // Inline locators moved to constructor
    this.imageSelectDropdown = this.page.locator('select:visible').first();
    this.detailsButton = this.page.locator('button').filter({ hasText: 'Details' }).first();
    this.getApiResponseButton = page.getByLabel('Data').getByRole('button', { name: 'Get API response' });
    this.cancelButtonForVerification = this.cancelLinkButton;
    this.menuLocator = this.page.getByRole('menu');
    this.menuItemLocator = this.page.getByRole('menuitem');
    this.arrowTriggerLocator = this.page.getByTestId('i-arrowRight');

    // Transform value dialog locators
    this.transformValueDialog = this.page.getByRole('dialog', { name: 'Transform value' });
    this.transformValueDialogDescription = this.transformValueDialog.getByText(
      'Format or map a dynamic value to make it user-friendly when displayed in the tile'
    );
    this.transformValueMoreIcon = this.page.getByTestId('i-more');
    this.transformValueOpenMenu = this.page.locator('[role="menu"][data-state="open"]');
    this.transformValueMenuItem = this.page.getByRole('menuitem');
    this.transformValueOption = this.transformValueMenuItem.filter({
      has: this.page.getByText('Transform value', { exact: true }),
    });
    this.transformValueCaseFormatPlaceholder = this.transformValueDialog
      .locator('[id*="react-select"][id*="placeholder"]')
      .filter({ hasText: 'Select case…' });
    this.transformValueDateFormatPlaceholder = this.transformValueDialog
      .locator('[id*="react-select"][id*="placeholder"]')
      .filter({ hasText: 'Select date…' });
    this.transformValueReactSelectControl = this.transformValueDialog.locator('div[class*="css-1bbetpp-control"]');
    this.transformValueListbox = this.page.locator('[id^="react-select"][id$="-listbox"], [role="listbox"]').first();
    this.transformValueSaveButton = this.transformValueDialog.getByRole('button', { name: 'Save' });
    this.transformValueCancelButton = this.transformValueDialog.getByRole('button', { name: 'Cancel' });
    this.transformValueCloseButton = this.transformValueDialog.getByRole('button', { name: 'Close' });
    this.transformValueDateRadio = this.transformValueDialog.getByRole('radio', { name: 'Date format' });
    this.transformValueCaseRadio = this.transformValueDialog.getByRole('radio', { name: 'Case format' });
    this.transformValueMappingRadio = this.transformValueDialog.getByRole('radio', { name: 'Value mapping' });
    this.transformValueDefaultValueLabel = this.transformValueDialog.getByText(/Default value/i);
    this.transformValueDefaultValueRequired = this.transformValueDefaultValueLabel.locator('span[class*="required"]');
    this.transformValueAddMappingRuleButton = this.transformValueDialog
      .getByRole('button')
      .filter({ hasText: /Add mapping rule/i })
      .first();
    this.transformValueLabelFor = this.transformValueDialog.locator('label[for]').first();
  }

  private getTabByRole(tabName: string): Locator {
    return this.page.getByRole('tab', { name: tabName });
  }

  private getButtonInTabLocator(tabName: string, buttonName: string): Locator {
    return this.page.getByLabel(tabName).getByRole('button', { name: buttonName });
  }

  private getMenuItemByTypeAndField(type: string, fieldName: string, menu?: Locator): Locator {
    const menuContainer = menu || this.menuLocator.first();
    const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = `${escapedType}\\s+${escapedFieldName}(?=\\s|$|[^\\w])`;
    return menuContainer.getByRole('menuitem').filter({ hasText: new RegExp(pattern, 'i') });
  }

  private getMenuItemByText(fieldText: string, menu?: Locator): Locator {
    const menuContainer = menu || this.menuLocator.first();
    return menuContainer.getByRole('menuitem').getByText(fieldText, { exact: false });
  }

  private parseFieldText(fieldText: string): { type: string; fieldName: string } | null {
    const match = fieldText.match(/^(\w+)\s+(.+)$/);
    return match ? { type: match[1], fieldName: match[2] } : null;
  }

  private async findMenuItemInMenus(
    allMenus: Locator,
    type: string,
    fieldName: string,
    useTypeAndField: boolean
  ): Promise<Locator | null> {
    const menuCount = await allMenus.count();
    for (let i = 0; i < menuCount; i++) {
      const menu = allMenus.nth(i);
      const item = useTypeAndField
        ? this.getMenuItemByTypeAndField(type, fieldName, menu)
        : this.getMenuItemByText(`${type} ${fieldName}`, menu);
      if ((await item.count()) > 0) return item.first();
    }
    return null;
  }

  private async openNestedMenu(parentMenuItem: Locator): Promise<void> {
    const arrowTrigger = parentMenuItem.first().locator(this.arrowTriggerLocator).first();
    try {
      await expect(arrowTrigger).toBeVisible({ timeout: 2000 });
      await arrowTrigger.hover();
    } catch {
      await parentMenuItem.first().hover();
    }
    await this.page.waitForTimeout(300);
  }

  async selectDataBindingFieldByType(
    type: string,
    fieldName: string,
    parentType?: string,
    parentFieldName?: string
  ): Promise<void> {
    await test.step(`Select data binding field: ${type} ${fieldName}${parentType && parentFieldName ? ` under ${parentType} ${parentFieldName}` : ''}`, async () => {
      const menu = this.menuLocator.first();
      await expect(menu).toBeVisible({ timeout: 10000 });
      await this.page.waitForTimeout(300);

      if (parentType && parentFieldName) {
        const parentMenuItem = this.getMenuItemByTypeAndField(parentType, parentFieldName, menu);
        await expect(parentMenuItem).toBeVisible({ timeout: 10000 });
        await parentMenuItem.hover();
        await this.page.waitForTimeout(300);
      }

      const targetMenuItem = this.getMenuItemByTypeAndField(type, fieldName, menu);
      await expect(targetMenuItem).toBeVisible({ timeout: 10000 });
      await this.clickOnElement(targetMenuItem);
    });
  }

  async selectDataBindingField(parentField: string, childField?: string): Promise<void> {
    await test.step(`Select data binding field: ${parentField}${childField ? ` > ${childField}` : ''}`, async () => {
      const allMenus = this.menuLocator;
      await expect(allMenus.first()).toBeVisible({ timeout: 10000 });
      await expect(allMenus.first().getByRole('menuitem').first()).toBeVisible({ timeout: 5000 });
      await this.page.waitForTimeout(500);

      const parentParsed = this.parseFieldText(parentField);
      const parentMenuItem = await this.findMenuItemInMenus(
        allMenus,
        parentParsed?.type || parentField,
        parentParsed?.fieldName || '',
        !!parentParsed
      );

      if (!parentMenuItem) {
        throw new Error(`Parent field "${parentField}" not found in any visible menu`);
      }

      await expect(parentMenuItem.first()).toBeVisible({ timeout: 10000 });

      if (childField) {
        const childParsed = this.parseFieldText(childField);
        await this.openNestedMenu(parentMenuItem);

        const childMenuItem = await this.findMenuItemInMenus(
          this.menuLocator,
          childParsed?.type || childField,
          childParsed?.fieldName || '',
          !!childParsed
        );

        if (!childMenuItem) {
          throw new Error(`Child field "${childField}" not found in nested menu`);
        }

        await expect(childMenuItem).toBeVisible({ timeout: 5000 });
        await this.clickOnElement(childMenuItem);
      } else {
        await this.clickOnElement(parentMenuItem.first());
      }
    });
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
   * Click Cancel link when there are unsaved changes and handle the dialog
   * @returns Promise with dialog message
   */
  async clickCancelLinkWithUnsavedChanges(): Promise<{ message: string; dismiss: () => Promise<void> }> {
    return await test.step('Click Cancel link with unsaved changes and handle dialog', async () => {
      // Set up dialog handler before clicking Cancel
      const dialogPromise = new Promise<{ message: string; dismiss: () => Promise<void> }>(resolve => {
        this.page.once('dialog', async dialog => {
          resolve({
            message: dialog.message(),
            dismiss: async () => await dialog.dismiss(),
          });
        });
      });

      // Wait for Cancel link to be visible
      await expect(this.cancelLinkButton).toBeVisible({ timeout: 5000 });

      // Click the Cancel link without waiting for it to complete (dialog will block it)
      // Use Promise.all to handle both the click and dialog together
      const [dialog] = await Promise.all([
        dialogPromise,
        this.cancelLinkButton.click({ timeout: 1000 }).catch(() => {
          // Ignore timeout error - the dialog blocks the click from completing
        }),
      ]);

      // Return the dialog information
      return dialog;
    });
  }

  /**
   * Verify unsaved changes dialog appears with the expected message
   * @param dialog The dialog object returned from clickCancelLinkWithUnsavedChanges
   * @param expectedMessage The expected message to verify
   */
  async verifyUnsavedChangesDialog(
    dialog: { message: string; dismiss: () => Promise<void> },
    expectedMessage: string
  ): Promise<void> {
    await test.step('Verify unsaved changes dialog message', async () => {
      expect(dialog.message).toBe(expectedMessage);
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
      await this.optionByRole.filter({ hasText: appName }).click();
    });
  }

  /**
   * Select an API action from the dropdown
   * @param actionName - The name of the API action to select
   */
  async selectApiAction(actionName: string): Promise<void> {
    await test.step(`Select API action: ${actionName}`, async () => {
      await this.apiActionSelect.click();
      await this.optionByRole.filter({ hasText: actionName }).click();
    });
  }

  async clickButton(buttonName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${buttonName}`;
    await test.step(stepName, async () => {
      // Try button first with name
      try {
        const button = this.getButton(buttonName);
        await this.clickOnElement(button, { timeout });
      } catch {
        // If button not found, try as link with name
        const link = this.getLink(buttonName);
        await this.clickOnElement(link, { timeout });
      }
    });
  }

  /**
   * Click on a text element by its text content
   * @param text - The text to click on
   * @param exact - Whether to match exactly (default: false for partial matching)
   * @param step - Optional custom step information for logging
   * @param timeout - Optional timeout in milliseconds (default: 30_000)
   * @param container - Optional container locator to scope the search (default: canvas container)
   */
  async clickText(
    text: string,
    exact: boolean = false,
    step?: string,
    timeout = 30_000,
    container?: Locator
  ): Promise<void> {
    const stepName = step || `Click text: ${text}`;
    await test.step(stepName, async () => {
      // Use provided container or default to canvas container to avoid matching elements outside the canvas
      const searchContainer = container || this.canvasContainer;
      const textElement = searchContainer.getByText(text, { exact });
      await this.clickOnElement(textElement, { timeout });
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
      const saveButton = this.getButton('Save');
      await this.verifier.verifyTheElementIsVisible(saveButton, {
        assertionMessage: 'Save button should be visible',
      });
      await this.verifyButtonIsDisabled(saveButton, 'Save button should be disabled');

      // Verify Next button is disabled
      const nextButton = this.getButton('Next');
      await this.verifier.verifyTheElementIsVisible(nextButton, {
        assertionMessage: 'Next button should be visible',
      });
      await this.verifyButtonIsDisabled(nextButton, 'Next button should be disabled');
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
      // Wait for status dropdown to be visible before clicking
      await this.expect(this.statusDropdown, 'Status dropdown should be visible').toBeVisible({ timeout: 10000 });
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
      // Wait for status dropdown to be visible before clicking
      await this.expect(this.statusDropdown, 'Status dropdown should be visible').toBeVisible({ timeout: 10000 });
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
   * Drag a block by its text into the canvas
   * @param blockText - The text of the block to drag
   */
  async dragToCanvas(blockText: string): Promise<void> {
    await test.step(`Drag block/template with text "${blockText}" into canvas`, async () => {
      const source = this.dynamicSourceLocator.filter({ hasText: blockText }).first();

      // Target is the shared canvas container
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

  // Image configuration
  /**
   * Select an image size
   * @param size - The image size to select
   */
  async selectImageSize(size: string): Promise<void> {
    await test.step(`Select image size: ${size}`, async () => {
      // Click on image to open configuration panel
      const image = this.canvasContainer.locator('img').first();
      await image.click();

      // Wait for dropdown to be visible
      await this.imageSelectDropdown.waitFor({ state: 'visible', timeout: 5000 });

      // Select the size (dropdown values are lowercase)
      await this.imageSelectDropdown.selectOption(size.toLowerCase());
    });
  }

  /**
   * Verify text style heights change correctly for all sizes
   * @returns Promise<void>
   */
  async verifyTextStyleHeights(): Promise<void> {
    await test.step('Verify text style heights change for all sizes', async () => {
      const styles = [
        { name: 'Data large', expectedMinHeight: 45 },
        { name: 'Data medium', expectedMinHeight: 30 },
        { name: 'Data small', expectedMinHeight: 20 },
      ];

      const heights: Record<string, number> = {};

      // Get the dropdown selector for verification
      const selectedValue = this.styleDropdownSelectedValue;

      for (const style of styles) {
        // Select the style
        await this.selectTextSize(style.name);

        // Verify the dropdown shows the selected style
        await expect(selectedValue).toHaveText(style.name, { timeout: 5000 });

        // Get the text element
        const textElement = this.textContainerElements.filter({ hasText: /Text/ }).first();

        // Get the height
        const bounds = await textElement.boundingBox();
        expect(bounds).toBeTruthy();
        const height = bounds?.height || 0;
        heights[style.name] = height;

        // Verify minimum height expectation
        expect(height).toBeGreaterThan(style.expectedMinHeight);

        console.log(`✓ ${style.name}: height=${height.toFixed(2)}px`);
      }

      // Verify the heights are in descending order: large > medium > small
      expect(heights['Data large']).toBeGreaterThan(heights['Data medium']);
      expect(heights['Data medium']).toBeGreaterThan(heights['Data small']);

      console.log(
        `✓ Height hierarchy verified: Data large (${heights['Data large'].toFixed(2)}px) > Data medium (${heights['Data medium'].toFixed(2)}px) > Data small (${heights['Data small'].toFixed(2)}px)`
      );
    });
  }

  /**
   * Select a text size/style
   * @param size - The text style to select (e.g., "Data large", "Heading small")
   */
  async selectTextSize(size: string): Promise<void> {
    await test.step(`Select text size: ${size}`, async () => {
      // Click on text element to select it
      const textElement = this.editableTextElements.first();
      await textElement.click();

      // Wait for configuration panel to load
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM_WAIT);

      // Click on the Style dropdown (react-select component)
      const styleDropdown = this.styleDropdownControl.first();
      await styleDropdown.click();

      // Wait for dropdown menu to be visible
      await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);

      // Wait for the menu to appear and select the option
      const menuOption = this.styleDropdownOptions.filter({ hasText: size });

      // If the menu option is not immediately visible, try alternative selectors
      if (!(await menuOption.isVisible())) {
        // Try selecting by exact text in the dropdown menu
        const alternativeOption = this.reactSelectOptions.filter({ hasText: size });
        if (await alternativeOption.isVisible()) {
          await alternativeOption.click();
        } else {
          // Fallback to clicking on any visible element with the text
          const fallbackOption = this.page.getByText(size).first();
          await fallbackOption.click();
        }
      } else {
        await menuOption.click();
      }

      // Wait for selection to apply
      await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
    });
  }

  /**
   * Switch aspect ratio for images or media elements
   * @param ratio - The aspect ratio to select ('16:9' or '1:1')
   */
  async switchAspectRatio(ratio: '16:9' | '1:1'): Promise<void> {
    await test.step(`Switch aspect ratio to: ${ratio}`, async () => {
      // Convert ratio to the format used in element IDs (16/9 or 1/1)
      const ratioValue = ratio.replace(':', '/');

      // Click the radio button for the selected aspect ratio
      await this.getRadioByValue(ratioValue).click();

      // Wait for the selection to be applied
      await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
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
   * Click on a tab in a panel or globally
   * @param tabName - Tab name (e.g., "Data", "Appearance")
   * @param panelName - Optional: Panel name (e.g., "Image", "Container")
   * @example
   */
  async clickTab(tabName: string, panelName?: string): Promise<void> {
    await test.step(`Click "${tabName}" tab${panelName ? ` in "${panelName}" panel` : ''}`, async () => {
      await this.clickOnElement(this.getTabLocator(tabName, panelName));
    });
  }

  /**
   * Handle accordion actions (expand/collapse/toggle)
   * @param title - The accordion title (e.g., "Target URL", "Image source")
   * @param action - Action to perform: "expand" (default), "collapse", or "toggle"
   */
  async accordion(title: string, action: 'expand' | 'collapse' | 'toggle' = 'expand'): Promise<void> {
    await test.step(`${action} "${title}" accordion`, async () => {
      const accordion = this.getAccordionLocator(title);
      await accordion.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });
      const isExpanded = (await accordion.getAttribute('aria-expanded')) === 'true';

      if ((action === 'expand' && !isExpanded) || (action === 'collapse' && isExpanded) || action === 'toggle') {
        await this.clickOnElement(accordion);
        // Wait for accordion animation and content to be ready
        await this.page.waitForTimeout(TIMEOUTS.TRANSITION_WAIT);
      }
    });
  }

  /**
   * Enter a target URL
   * @param url - The target URL to enter
   */
  async enterTargetUrl(url: string): Promise<void> {
    await test.step(`Enter target URL: ${url}`, async () => {
      await this.accordion('Target URL');
      await this.targetUrlInput.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_VISIBLE });
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

  /**
   * Verify a toast message is visible
   * @param message - The message to verify
   */
  async verifyToastMessage(message: string) {
    return this.appTileComponent.verifyToastMessageIsVisibleWithText(message);
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
   * Click the three dots menu for a tile starting with the given prefix
   * @param prefix - The prefix to match tiles
   */
  async clickThreeDotsForTileStartingWith(prefix: string): Promise<void> {
    await test.step(`Click three dots for tile starting with: ${prefix}`, async () => {
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
      const maxAttempts = 100;

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
      await this.expect(this.getButton('Save'), 'Expected save button to be enabled').toBeEnabled();
    });
  }

  /**
   * Verify the next button is primary (has primary class)
   */
  async verifyNextButtonIsPrimary(): Promise<void> {
    await test.step('Verify next button is primary', async () => {
      await this.expect(this.getButton('Next'), 'Expected next button to have primary class').toHaveClass(
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
   * Verify that tile menu options are visible
   */
  async verifyTileMenuOptionsVisible(): Promise<void> {
    await test.step('Verify tile menu options are visible', async () => {
      await this.expect(this.tileMenuOption, 'Expected tile menu option to be visible').toBeVisible();
    });
  }

  /**
   * Click a button within a specific dialog box
   * This generic method helps distinguish buttons within dialogs from other buttons on the page
   * @param dialogTitle - The title/heading text of the dialog (e.g., "Configure API action")
   * @param buttonName - The name/text of the button to click (e.g., "Save", "Cancel", "Confirm")
   * @param stepInfo - Optional custom step information for logging
   */
  async clickButtonInDialog(dialogTitle: string, buttonName: string, stepInfo?: string): Promise<void> {
    const stepName = stepInfo || `Click ${buttonName} button in ${dialogTitle} dialog`;
    await test.step(stepName, async () => {
      // Wait for dialog to be visible
      const dialog = this.dialogModule.first();
      await dialog.waitFor({ state: 'visible', timeout: 10000 });
      const button = this.page.locator(`${this.dialogFooterButtonSelector}:text("${buttonName}")`).last();
      // Wait for button to be visible and enabled
      await button.waitFor({ state: 'visible', timeout: 10000 });
      await this.expect(button).toBeEnabled({ timeout: 10000 });
      await this.clickOnElement(button, { stepInfo: stepName });
    });
  }

  /**
   * Verify Back to editing button is visible
   */
  async verifyBackToEditingButtonVisible(): Promise<void> {
    await test.step('Verify Back to editing button is visible', async () => {
      await expect(this.backToEditingButton, 'Back to editing button should be visible').toBeVisible({
        timeout: TIMEOUTS.ELEMENT_LOAD,
      });
    });
  }

  /**
   * Click Back to editing button
   */
  async clickBackToEditingButton(): Promise<void> {
    await test.step('Click Back to editing button', async () => {
      await expect(this.backToEditingButton, 'Back to editing button should be visible before clicking').toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
      });
      await this.backToEditingButton.click();
      // Wait for the edit page to load by checking for the header
      await this.page.waitForTimeout(TIMEOUTS.TRANSITION_WAIT);
    });
  }

  /**
   * Verify Tile builder step is active
   */
  async verifyTileBuilderStepIsActive(): Promise<void> {
    await test.step('Verify Tile builder step is active', async () => {
      // Check if Tile builder step button exists and has aria-current="true" attribute
      await expect(this.tileBuilderStep, 'Tile builder step should be visible').toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
      });
      await expect(this.tileBuilderStep, 'Tile builder step should be active').toHaveAttribute('aria-current', 'true', {
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
      });
    });
  }

  /**
   * Verify API response status in the API action response dialog
   * @param expectedStatus - Expected status text (e.g., "200 OK")
   */
  async verifyAPIResponseStatus(expectedStatus: string = '200 OK'): Promise<void> {
    await test.step(`Verify API response status is ${expectedStatus}`, async () => {
      // Verify dialog and status elements are visible
      await expect(this.apiResponseDialog, 'API action response dialog should be visible').toBeVisible({
        timeout: 10000,
      });
      await expect(this.apiResponseSuccessIndicator, 'Success indicator should be visible').toBeVisible({
        timeout: 5000,
      });
      await expect(
        this.apiResponseStatusContainer.locator(`text=/Status.*${expectedStatus}/i`),
        `Status should show "${expectedStatus}"`
      ).toBeVisible({
        timeout: 5000,
      });
    });
  }

  /**
   * Verify API response body contains expected content
   * @param expectedContent - Expected content in the response body (string or regex)
   */
  async verifyAPIResponseBodyContains(expectedContent: string | RegExp): Promise<void> {
    await test.step(`Verify API response body contains: ${expectedContent}`, async () => {
      await expect(this.apiResponseBody, 'API response body should be visible').toBeVisible({
        timeout: 5000,
      });
      await expect(this.apiResponseBody, `Response body should contain: ${expectedContent}`).toContainText(
        expectedContent,
        {
          timeout: 5000,
        }
      );
    });
  }

  /**
   * Get and verify API response with 200 OK status
   * @param expectedBodyContent - Optional array of content to verify in response body
   */
  async getAndVerifySuccessfulAPIResponse(expectedBodyContent?: Array<string | RegExp>): Promise<void> {
    await this.clickButton('Get API response');
    await this.clickButton('Next');
    await this.clickButton('Run');
    await this.verifyAPIResponseStatus('200 OK');

    if (expectedBodyContent) {
      for (const content of expectedBodyContent) {
        await this.verifyAPIResponseBodyContains(content);
      }
    }

    await this.clickButton('Done');
  }

  /**
   * Create a new custom app tile
   * @param tileName - Name of the tile
   * @param tileDescription - Description of the tile
   * @param tileType - Type of tile (Display/Action/Form)
   * @param app - App to select
   * @param apiAction - API action to select
   */
  async createCustomAppTile(
    tileName: string,
    tileDescription: string,
    tileType: string,
    app: string,
    apiAction: string
  ): Promise<void> {
    await this.clickButton('Create custom app tile');
    await this.enterTileName(tileName);
    await this.enterTileDescription(tileDescription);
    await this.selectTileType(tileType);
    await this.selectApp(app);
    await this.selectApiAction(apiAction);
    await this.clickButton('Next');
  }

  /**
   * Verify Edit page is loaded
   */
  async verifyEditPageIsLoaded(): Promise<void> {
    await test.step('Verify Edit/Create custom app tile page is loaded', async () => {
      // Verify either Edit or Create custom app tile header is visible
      const editHeaderVisible = await this.editCustomAppTileHeader
        .isVisible({ timeout: TIMEOUTS.MEDIUM_WAIT })
        .catch(() => false);
      const createHeaderVisible = await this.createCustomAppTileHeader
        .isVisible({ timeout: TIMEOUTS.MEDIUM_WAIT })
        .catch(() => false);

      expect(
        editHeaderVisible || createHeaderVisible,
        'Either Edit or Create custom app tile header should be visible'
      ).toBeTruthy();

      // Verify URL contains either /edit or /create
      const currentUrl = this.page.url();
      const isEditOrCreatePage = currentUrl.includes('/edit') || currentUrl.includes('/create');
      expect(isEditOrCreatePage, 'URL should contain /edit or /create').toBeTruthy();
    });
  }

  /**
   * Common method to verify we're on the edit/create page with tile builder active
   * This is useful after navigating back from preview or other pages
   */
  async verifyOnEditPageWithTileBuilder(): Promise<void> {
    await test.step('Verify on edit/create page with tile builder active', async () => {
      // Verify we're on the edit/create page
      await this.verifyEditPageIsLoaded();

      // Verify the tile builder step is active
      await this.verifyTileBuilderStepIsActive();
    });
  }

  /**
   * Navigate back from preview to edit page
   */
  async navigateBackToEditPage(): Promise<void> {
    await this.clickBackToEditingButton();
    await this.verifyOnEditPageWithTileBuilder();
  }

  /**
   * Select a radio option for a field
   * @param optionText - The radio option text to select
   * @param fieldLabel - The field label to select the option in
   */
  async selectRadioForField(optionText: string, fieldLabel: string): Promise<void> {
    await test.step(`Select "${optionText}" option from "${fieldLabel}"`, async () => {
      const fieldContainer = this.fieldContainer.filter({ hasText: fieldLabel });
      const radioElement = fieldContainer.getByRole('radio', { name: optionText, exact: true });
      await this.clickOnElement(radioElement, {
        stepInfo: `Select "${optionText}" option from "${fieldLabel}"`,
      });
    });
  }

  /**
   * Configure form fields as "Get from user"
   * @param fieldNames - Array of field names to configure
   */
  async configureFormFieldsAsUserInput(formName: string, fieldNames: string[]): Promise<void> {
    for (const fieldName of fieldNames) {
      await this.selectRadioForField(formName, fieldName);
    }
    await this.clickButton('Save');
  }

  /**
   * Force click on Details step button using direct selector
   */
  async forceClickDetailsStep(): Promise<void> {
    await test.step('Force click Details step', async () => {
      await this.detailsButton.waitFor({ state: 'attached', timeout: TIMEOUTS.ELEMENT_LOAD });
      await this.detailsButton.click({ force: true });
      await this.page.waitForTimeout(TIMEOUTS.LONG_WAIT);
    });
  }

  /**
   * Verify Change Tile Type confirmation dialog
   * @param expectedMessage - Expected message in the dialog
   */
  async verifyChangeTileTypeDialog(expectedMessage?: string): Promise<void> {
    await test.step('Verify Change Tile Type dialog', async () => {
      const defaultMessage = MESSAGES.CHANGE_TILE_TYPE_MESSAGE;
      const message = expectedMessage || defaultMessage;

      // Wait for dialog to appear
      await expect(this.changeTileTypeDialog, 'Change tile type dialog should be visible').toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
      });

      // Verify dialog title
      await expect(this.changeTileTypeDialogTitle, 'Dialog title should be visible').toBeVisible();
      await expect(this.changeTileTypeDialogTitle, 'Dialog title should show correct text').toHaveText(
        MESSAGES.CHANGE_TILE_TYPE
      );

      // Verify dialog message
      const dialogMessage = this.changeTileTypeDialog.locator(`text="${message}"`);
      await expect(dialogMessage, 'Dialog message should be visible').toBeVisible();

      // Verify buttons are present in the dialog
      const cancelButtonInDialog = this.getDialogButton(this.changeTileTypeDialog, 'Cancel');
      const confirmButtonInDialog = this.getDialogButton(this.changeTileTypeDialog, 'Confirm');
      await expect(cancelButtonInDialog, 'Cancel button should be visible').toBeVisible();
      await expect(confirmButtonInDialog, 'Confirm button should be visible').toBeVisible();
    });
  }

  /**
   * Handle Change Tile Type confirmation dialog
   * @param action - 'confirm' or 'cancel'
   */
  async handleChangeTileTypeDialog(action: 'confirm' | 'cancel'): Promise<void> {
    await test.step(`${action === 'confirm' ? 'Confirm' : 'Cancel'} Change Tile Type dialog`, async () => {
      if (action === 'confirm') {
        await this.getDialogButton(this.changeTileTypeDialog, 'Confirm').click();
      } else {
        await this.getDialogButton(this.changeTileTypeDialog, 'Cancel').click();
      }

      // Wait for dialog to close
      await expect(this.changeTileTypeDialog, 'Change tile type dialog should be closed').not.toBeVisible({
        timeout: TIMEOUTS.ELEMENT_VISIBLE,
      });
    });
  }

  /**
   * Change tile type after saving - navigates back to Details step and changes the type
   * @param newTileType - The new tile type to select
   * @param confirmChange - Whether to confirm the change (default: true)
   */
  async changeTileTypeAfterSaving(newTileType: string, confirmChange: boolean = true): Promise<void> {
    // Save current configuration
    await this.clickButton('Save');
    await this.page.waitForTimeout(TIMEOUTS.SAVE_WAIT);
    await this.forceClickDetailsStep();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM_WAIT);
    // Change tile type
    await this.selectTileType(newTileType);
    await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
    await this.verifyChangeTileTypeDialog();
    await this.handleChangeTileTypeDialog(confirmChange ? 'confirm' : 'cancel');
  }

  /**
   * Get a specific field locator by field name
   * @param fieldName - The name of the field (e.g., 'Description', 'Email', 'Summary')
   * @returns Locator for the field
   */
  getFieldLocator(fieldName: string): Locator {
    const selector = this.fieldSelector.replace('{fieldName}', fieldName);
    return this.page.locator(selector);
  }

  /**
   * Get the required field error message for a specific field
   * @param fieldName - The name of the field (e.g., 'Description', 'Email', 'Summary')
   * @returns Locator for the required field error message
   */
  getRequiredFieldError(fieldName: string): Locator {
    return this.getFieldLocator(fieldName).getByText(`${fieldName}${this.fieldRequiredError}`);
  }

  /**
   * Verify that a required field error is visible
   * @param fieldName - The name of the field (e.g., 'Description', 'Email', 'Summary')
   */
  async verifyRequiredFieldError(fieldName: string): Promise<void> {
    await test.step(`Verify ${fieldName} required field error is visible`, async () => {
      await expect(this.getRequiredFieldError(fieldName)).toBeVisible();
    });
  }

  async clickButtonInTab(tabName: string = 'Data', fieldNameOrButton?: string, buttonName?: string): Promise<void> {
    const actualFieldName = buttonName ? fieldNameOrButton : undefined;
    const actualButtonName = buttonName || fieldNameOrButton || 'Get API response';

    await test.step(`Click ${actualButtonName} button in ${tabName} tab${actualFieldName ? ` (${actualFieldName} field)` : ''}`, async () => {
      const tab = this.getTabByRole(tabName);
      if (await tab.isVisible()) {
        const isTabActive = await tab.getAttribute('aria-selected');
        if (isTabActive !== 'true') {
          await tab.click();
        }
      }

      let button: Locator;
      if (actualFieldName) {
        const tabContent = this.page.getByLabel(tabName);
        const fieldRegion = tabContent.getByRole('region', { name: actualFieldName });
        await expect(fieldRegion).toBeVisible({ timeout: 5000 });
        button = fieldRegion.getByRole('button', { name: actualButtonName });
      } else {
        button = this.getButtonInTabLocator(tabName, actualButtonName);
      }

      await expect(button).toBeVisible();
      await this.clickOnElement(button);
    });
  }

  /**
   * Click transform value option for a dynamic value in a specific field
   * @param tabName - The tab name (e.g., 'Data')
   * @param fieldName - The field name (e.g., 'Text', 'URL')
   */
  async clickTransformValue(tabName: string = 'Data', fieldName: string): Promise<void> {
    await test.step(`Click Transform value for ${fieldName} field in ${tabName} tab`, async () => {
      const tab = this.getTabByRole(tabName);
      if (await tab.isVisible()) {
        const isTabActive = await tab.getAttribute('aria-selected');
        if (isTabActive !== 'true') {
          await tab.click();
        }
      }

      const tabContent = this.page.getByLabel(tabName);
      const fieldRegion = tabContent.getByRole('region', { name: fieldName });
      await expect(fieldRegion).toBeVisible({ timeout: 5000 });

      // Find the three dots button (more options) within the field region
      const threeDotsButton = fieldRegion
        .getByRole('button', { name: /menu/i })
        .filter({ has: fieldRegion.getByTestId('i-more') })
        .first();
      await expect(threeDotsButton).toBeVisible({ timeout: 5000 });
      await this.clickOnElement(threeDotsButton);

      // Wait for the dropdown menu to appear - wait for menu with data-state="open"
      const menu = this.transformValueOpenMenu.first();
      await expect(menu).toBeVisible({ timeout: 5000 });

      // Wait a bit for the menu to be fully rendered
      await this.page.waitForTimeout(300);

      // Click "Transform value" - find the menuitem wrapper that contains the text
      const transformValueOption = this.transformValueOption.first();

      await expect(transformValueOption).toBeVisible({ timeout: 5000 });
      await this.clickOnElement(transformValueOption);
    });
  }

  /**
   * Get Transform value dialog locator
   */
  getTransformValueDialog(): Locator {
    return this.transformValueDialog;
  }

  /**
   * Get case format placeholder locator
   */
  getCaseFormatPlaceholder(): Locator {
    return this.transformValueCaseFormatPlaceholder;
  }

  /**
   * Get date format placeholder locator
   */
  getDateFormatPlaceholder(): Locator {
    return this.transformValueDateFormatPlaceholder;
  }

  /**
   * Verify Transform value dialog is visible
   */
  async verifyTransformValueDialogVisible(): Promise<void> {
    await test.step('Verify Transform value dialog is visible', async () => {
      const dialog = this.transformValueDialog;
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(this.transformValueDialogDescription).toBeVisible();
    });
  }

  /**
   * Select a transform type in the Transform value dialog
   * @param transformType - The transform type: 'Date format', 'Case format', or 'Value mapping'
   */
  async selectTransformType(transformType: 'Date format' | 'Case format' | 'Value mapping'): Promise<void> {
    await test.step(`Select ${transformType} in Transform value dialog`, async () => {
      const dialog = this.transformValueDialog;
      const radioButton = dialog.getByRole('radio', { name: transformType });
      await expect(radioButton).toBeVisible({ timeout: 5000 });

      // Check if the radio button is already selected
      const isChecked = await radioButton.isChecked().catch(() => false);

      if (!isChecked) {
        // Try to find and click the label associated with the radio button
        // This avoids interception by overlapping dropdown elements
        const radioId = await radioButton.getAttribute('id').catch(() => null);

        if (radioId) {
          // Try clicking the label using the 'for' attribute
          const label = dialog.locator(`label[for="${radioId}"]`).first();
          const labelVisible = await label.isVisible({ timeout: 2000 }).catch(() => false);

          if (labelVisible) {
            await this.clickOnElement(label);
          } else {
            // Fallback: click the radio button with force to bypass interception
            await radioButton.click({ force: true });
          }
        } else {
          // Fallback: click the radio button with force
          await radioButton.click({ force: true });
        }

        // Wait for the radio button to be checked
        await expect(radioButton, `${transformType} radio button should be checked`).toBeChecked({ timeout: 5000 });
      } else {
        // Already selected, just wait a bit for UI to stabilize
        await this.page.waitForTimeout(300);
      }
    });
  }

  /**
   * Select a case format option in the Transform value dialog
   * @param caseOption - The case option: 'Sentence case', 'Uppercase', or 'Lowercase'
   */
  async selectCaseFormat(caseOption: 'Sentence case' | 'Uppercase' | 'Lowercase'): Promise<void> {
    await test.step(`Select ${caseOption} in Case format dropdown`, async () => {
      // Wait a bit for the dropdown to render after selecting Case format
      await this.page.waitForTimeout(500);

      // Find the react-select control div - it may show "Select case…" or a selected value like "Uppercase"
      // The control div has class "css-1bbetpp-control"
      // Since "Case format" is already selected, there should only be one react-select control in the dialog
      const clickableControl = this.transformValueReactSelectControl.first();

      // Wait for the control to be visible (it might take a moment to render)
      await expect(clickableControl, 'Case format control should be visible').toBeVisible({ timeout: 5000 });

      // Click the control div to open dropdown
      await this.clickOnElement(clickableControl);

      // Wait for menu to appear
      await this.page.waitForTimeout(300);

      // Wait for options to appear and select the option
      const menu = this.transformValueListbox;
      await expect(menu).toBeVisible({ timeout: 5000 });

      const option = menu.getByText(caseOption, { exact: true });
      await expect(option).toBeVisible({ timeout: 5000 });
      await this.clickOnElement(option);
    });
  }

  /**
   * Select a date format option in the Transform value dialog
   * @param dateFormat - The date format option (e.g., 'MM/DD/YYYY', 'Month Day, Year')
   */
  async selectDateFormat(dateFormat: string): Promise<void> {
    await test.step(`Select ${dateFormat} in Date format dropdown`, async () => {
      // Wait a bit for the dropdown to render after selecting Date format
      await this.page.waitForTimeout(500);

      // Find the react-select control div - it may show "Select date…" or a selected value like "MM/DD/YYYY"
      // The control div has class "css-1bbetpp-control"
      // Since "Date format" is already selected, there should only be one react-select control in the dialog
      const clickableControl = this.transformValueReactSelectControl.first();

      // Wait for the control to be visible (it might take a moment to render)
      await expect(clickableControl, 'Date format control should be visible').toBeVisible({ timeout: 5000 });

      // Click the control div to open dropdown
      await this.clickOnElement(clickableControl);

      // Wait for menu to appear
      await this.page.waitForTimeout(300);

      // Wait for options to appear and select the option
      const menu = this.transformValueListbox;
      await expect(menu).toBeVisible({ timeout: 5000 });

      const option = menu.getByText(dateFormat, { exact: true });
      await expect(option).toBeVisible({ timeout: 5000 });
      await this.clickOnElement(option);
    });
  }

  /**
   * Click Save button in Transform value dialog
   */
  async clickTransformValueSave(): Promise<void> {
    await test.step('Click Save button in Transform value dialog', async () => {
      const dialog = this.transformValueDialog;
      await expect(this.transformValueSaveButton).toBeVisible({ timeout: 5000 });
      await this.transformValueSaveButton.click();

      // Wait for dialog to close
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });
  }

  /**
   * Click Cancel button in Transform value dialog
   */
  async clickTransformValueCancel(): Promise<void> {
    await test.step('Click Cancel button in Transform value dialog', async () => {
      const dialog = this.transformValueDialog;
      await expect(this.transformValueCancelButton).toBeVisible({ timeout: 5000 });
      await this.transformValueCancelButton.click();

      // Wait for dialog to close
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });
  }

  /**
   * Verify all transform type radio buttons are visible
   */
  async verifyTransformTypeOptionsVisible(): Promise<void> {
    await test.step('Verify all transform type options are visible', async () => {
      await expect(this.transformValueDateRadio).toBeVisible();
      await expect(this.transformValueCaseRadio).toBeVisible();
      await expect(this.transformValueMappingRadio).toBeVisible();
    });
  }

  /**
   * Verify case format placeholder is visible
   */
  async verifyCaseFormatPlaceholderVisible(): Promise<void> {
    await test.step('Verify case format placeholder is visible', async () => {
      await expect(this.getCaseFormatPlaceholder()).toBeVisible({ timeout: 5000 });
    });
  }

  /**
   * Verify date format placeholder is visible
   */
  async verifyDateFormatPlaceholderVisible(): Promise<void> {
    await test.step('Verify date format placeholder is visible', async () => {
      await expect(this.getDateFormatPlaceholder()).toBeVisible({ timeout: 5000 });
    });
  }

  /**
   * Verify Transform value dialog is closed
   */
  async verifyTransformValueDialogClosed(): Promise<void> {
    await test.step('Verify Transform value dialog is closed', async () => {
      await expect(this.getTransformValueDialog()).not.toBeVisible({ timeout: 3000 });
    });
  }

  /**
   * Verify Value mapping default value field is visible
   */
  async verifyValueMappingDefaultValueFieldVisible(): Promise<void> {
    await test.step('Verify Value mapping default value field is visible', async () => {
      const dialog = this.transformValueDialog;
      await expect(dialog.getByLabel(/Default value/i)).toBeVisible();
    });
  }

  /**
   * Verify default value field is required (has asterisk)
   */
  async verifyDefaultValueFieldRequired(): Promise<void> {
    await test.step('Verify default value field is required', async () => {
      await expect(this.transformValueDefaultValueLabel).toBeVisible();
      await expect(this.transformValueDefaultValueRequired).toBeVisible();
    });
  }

  /**
   * Verify Add mapping rule button is visible
   */
  async verifyAddMappingRuleButtonVisible(): Promise<void> {
    await test.step('Verify Add mapping rule button is visible', async () => {
      await expect(this.transformValueAddMappingRuleButton).toBeVisible({ timeout: 5000 });
    });
  }

  /**
   * Verify Value mapping radio button is visible
   */
  async verifyValueMappingRadioVisible(): Promise<void> {
    await test.step('Verify Value mapping radio button is visible', async () => {
      await expect(this.transformValueMappingRadio).toBeVisible();
    });
  }

  /**
   * Verify Transform value dialog close button is visible and click it
   */
  async verifyAndClickTransformValueDialogCloseButton(): Promise<void> {
    await test.step('Verify and click Transform value dialog close button', async () => {
      const dialog = this.transformValueDialog;
      await expect(this.transformValueCloseButton).toBeVisible();
      await this.transformValueCloseButton.click();
      await expect(dialog).not.toBeVisible({ timeout: 3000 });
    });
  }

  /**
   * Get and verify API response with 200 OK status
   * @param expectedBodyContent - Optional array of content to verify in response body
   */
  async getAndVerifySuccessfulAPIResponseInTab(expectedBodyContent?: Array<string | RegExp>): Promise<void> {
    await this.clickButtonInTab('Data', 'Get API response');
    await this.clickButton('Run');
    await this.verifyAPIResponseStatus('200 OK');

    if (expectedBodyContent) {
      for (const content of expectedBodyContent) {
        await this.verifyAPIResponseBodyContains(content);
      }
    }

    await this.clickButton('Done');
  }

  async createcustom(tileName: string, tileDescription: string, tileType: string, app: string, apiAction: string) {
    await this.clickCreateCustomAppTileButton();
    await this.enterTileName(tileName);
    await this.enterTileDescription(tileDescription);
    await this.selectTileType(tileType);
    await this.selectApp(app);
    await this.selectApiAction(apiAction);
    await this.clickButton(CUSTOM_APP_TILES_TEST_DATA.BUTTONS.NEXT);
  }
}
