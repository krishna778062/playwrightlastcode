import { APP_LABELS } from '@integrations/constants/common';
import { expect, Locator, Page, test } from '@playwright/test';
import path from 'node:path';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

const TEST_DATA_IMAGE_FILES_PATH = path.join(__dirname, '../../test-data/static-files/imageFiles');

export enum AppConnectorOptions {
  Edit = 'Edit',
  Disable = 'Disable',
  Delete = 'Delete',
  Enable = 'Enable',
}

/**
 * Component for handling Custom Apps page functionality
 */
export class CustomAppsComponent extends BaseComponent {
  // Search and List locators
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly resultCountLocator: Locator;
  readonly resultListItems: Locator;
  readonly noResultsHeading: Locator;
  readonly noResultsDescription: Locator;
  readonly appLinks: Locator;

  // Prebuilt App Dialog locators
  readonly prebuiltAppDialog: Locator;
  readonly prebuiltAppSearchInput: Locator;

  // Add Custom App locators
  readonly addCustomAppDropdownButton: Locator;
  readonly addPrebuiltAppMenuItem: Locator;

  // Connector Options locators
  readonly connectorOptionsButton: Locator;
  readonly connectorOptionsMenu: Locator;
  readonly enableMenuItem: Locator;
  readonly enableConfirmButton: Locator;
  readonly disconnectModal: Locator;
  readonly disconnectConfirmButton: Locator;

  // Filter locators
  readonly statusFilterButton: Locator;
  readonly typeFilterButton: Locator;
  readonly typeFilterDropdownHeader: Locator;
  readonly sortDropdownButton: Locator;
  readonly menuContainer: Locator;

  // Create Custom App Form locators
  readonly appNameInput: Locator;
  readonly appDescriptionInput: Locator;
  readonly categorySelect: Locator;
  readonly fileInput: Locator;
  readonly logoPanelContainer: Locator;
  readonly logoImagePreview: Locator;
  readonly removeLogoButton: Locator;

  // OAuth Configuration locators
  readonly connectionTypeSelect: Locator;
  readonly authTypeSelect: Locator;
  readonly subAuthTypeSelect: Locator;

  // Action Button locators
  readonly saveButton: Locator;
  readonly connectAccountButton: Locator;
  readonly disconnectAccountButton: Locator;

  // Verification locators
  readonly toastAlert: Locator;
  readonly completedStepIndicator: Locator;

  constructor(page: Page) {
    super(page);

    // Search and List locators
    this.searchInput = page.locator('input[name="search"]').first();
    this.clearSearchButton = page.getByRole('button', { name: 'Clear' });
    this.resultCountLocator = page.locator('div[class*="ConnectorsList_resultCount"]');
    this.resultListItems = page.locator('div[class*="ConnectorListItem_itemContainer"]');
    this.noResultsHeading = page.getByRole('heading', { name: 'No results', level: 3 });
    this.noResultsDescription = page.getByText('Try adjusting search term or filters');
    this.appLinks = page.locator('a[class*="ConnectorListItem_navLink"]');

    // Prebuilt App Dialog locators
    this.prebuiltAppDialog = page.getByRole('dialog', { name: APP_LABELS.PREBUILT_APP_LABEL });
    this.prebuiltAppSearchInput = page.getByRole('textbox', { name: 'Search…', exact: true });

    // Add Custom App locators
    this.addCustomAppDropdownButton = page.locator('button[aria-label="Add custom app dropdown"]');
    this.addPrebuiltAppMenuItem = page.locator('[role="menuitem"]:has-text("Add prebuilt app")');

    // Connector Options locators
    this.connectorOptionsButton = page.getByRole('button', { name: 'connector options', exact: true });
    this.connectorOptionsMenu = page.getByRole('menu');
    this.enableMenuItem = page.getByRole('menuitem', { name: APP_LABELS.ENABLE_LABEL, exact: true });
    this.enableConfirmButton = page.getByRole('button', { name: APP_LABELS.ENABLE_LABEL, exact: true });
    this.disconnectModal = page.locator('form:has(p:has-text("Are you sure you want to disconnect"))');
    this.disconnectConfirmButton = page.locator('span:has-text("Disconnect")').locator('..').locator('button');

    // Filter locators
    this.statusFilterButton = page.getByRole('button', { name: 'Status' });
    this.typeFilterButton = page
      .locator('button')
      .filter({ hasText: /^Type$/ })
      .first();
    this.typeFilterDropdownHeader = page.locator('div[class*="TypesFilter_dropdownHeader"]');
    this.sortDropdownButton = page.locator('button').filter({ hasText: /^Sort:/ });
    this.menuContainer = page.locator('div[role="menu"]');

    // Create Custom App Form locators
    this.appNameInput = page.getByRole('textbox', { name: 'Custom app name*' });
    this.appDescriptionInput = page.getByRole('textbox', { name: 'Description*' });
    this.categorySelect = page.locator('select[name="category"]');
    this.fileInput = page.locator('input[type="file"]').first();
    this.logoPanelContainer = page.locator('div[class*="UploadLogoPanel_container"]');
    this.logoImagePreview = page.locator('img[class*="UploadLogoPanel_logo"]');
    this.removeLogoButton = page.locator('button[aria-label="Remove logo"]');

    // OAuth Configuration locators
    this.connectionTypeSelect = page.locator('select[name="connectionType"]');
    this.authTypeSelect = page.locator('select[name="authType"]');
    this.subAuthTypeSelect = page.locator('select[name="subAuthType"]');

    // Action Button locators
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.connectAccountButton = page.getByRole('button', { name: 'Connect account' });
    this.disconnectAccountButton = page.getByRole('button', { name: 'Disconnect account' });

    // Verification locators
    this.toastAlert = page.getByRole('alert');
    this.completedStepIndicator = page.locator('[data-testid="completedStepStatusIndicator"]');
  }

  // =====================
  // Dynamic Locator Getters
  // =====================

  /**
   * Get button locator by name (exact match)
   */
  getButton(name: string, exact = true): Locator {
    return this.page.getByRole('button', { name, exact });
  }

  /**
   * Get menu item locator by name
   */
  getMenuItem(name: string): Locator {
    return this.page.getByRole('menuitem', { name });
  }

  /**
   * Get radio option locator by name
   */
  getRadioOption(name: string): Locator {
    return this.page.getByRole('radio', { name });
  }

  /**
   * Get type filter label by id
   */
  getTypeFilterLabel(id: string): Locator {
    return this.page.locator(`label[for="${id}"]`);
  }

  /**
   * Get heading locator by name and level
   */
  getHeading(name: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 3): Locator {
    return this.page.getByRole('heading', { name, level });
  }

  /**
   * Get textbox locator by name
   */
  getTextbox(name: string): Locator {
    return this.page.getByRole('textbox', { name });
  }

  /**
   * Get text locator
   */
  getText(text: string): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get dialog locator
   */
  getDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  /**
   * Search for an app by entering text in the search field and pressing Enter
   * @param searchTerm - The search term to enter
   */
  async searchForApp(searchTerm: string): Promise<void> {
    await test.step(`Search for app: ${searchTerm}`, async () => {
      await this.typeInElement(this.searchInput, searchTerm, { timeout: 20000 });
      await this.searchInput.press('Enter');
    });
  }

  /**
   * Clear the search input field by clicking the clear button
   */
  async clearSearch(): Promise<void> {
    await test.step('Clear search field', async () => {
      await this.clearSearchButton.waitFor({ state: 'visible' });
      await this.clickOnElement(this.clearSearchButton, { timeout: 10000 });
      await this.searchInput.waitFor({ state: 'visible' });
    });
  }

  /**
   * Verify the result count text matches the expected value
   * @param expectedText - The expected text (e.g., "0 Apps", "1 Apps")
   */
  async verifyResultCountText(expectedText: string): Promise<void> {
    await test.step(`Verify result count text is "${expectedText}"`, async () => {
      await expect(this.resultCountLocator, `Expected result count text to contain "${expectedText}"`).toContainText(
        expectedText
      );
    });
  }

  /**
   * Verify count of apps in list
   * @param count - The expected count of apps in the list
   */
  async verifyCountOfAppsInListIs(count: number): Promise<void> {
    await test.step(`Verify count of apps in list is ${count}`, async () => {
      await expect(this.resultListItems, `Expected app list to have ${count} items`).toHaveCount(count);
    });
  }

  /**
   * Verify the "No results" heading is displayed
   */
  async verifyNoResultsHeadingIsDisplayed(): Promise<void> {
    await test.step('Verify "No results" heading is displayed', async () => {
      await expect(this.noResultsHeading, 'Expected "No results" heading to be visible').toBeVisible();
    });
  }

  /**
   * Verify the no results description is displayed
   * @param expectedText - Optional custom expected description text
   */
  async verifyNoResultsDescriptionIsDisplayed(expectedText?: string): Promise<void> {
    await test.step('Verify no results description is displayed', async () => {
      if (expectedText) {
        await expect(this.getText(expectedText), `Expected "${expectedText}" to be visible`).toBeVisible();
      } else {
        await expect(this.noResultsDescription, 'Expected no results description to be visible').toBeVisible();
      }
    });
  }

  /**
   * Verify that an app with the given name is displayed in the list
   * @param appName - The name of the app to verify
   */
  async verifyAppIsDisplayedInList(appName: string): Promise<void> {
    await test.step(`Verify app "${appName}" is displayed in list`, async () => {
      await expect(this.getText(appName).first(), `Expected app "${appName}" to be visible in the list`).toBeVisible();
    });
  }

  /**
   * Verify the search field is empty
   */
  async verifySearchFieldIsEmpty(): Promise<void> {
    await test.step('Verify search field is empty', async () => {
      await expect(this.searchInput, 'Expected search field to be empty').toHaveValue('');
    });
  }

  /**
   * Verify the search field contains the expected value
   * @param expectedValue - The expected value in the search field
   */
  async verifySearchFieldValue(expectedValue: string): Promise<void> {
    await test.step(`Verify search field contains "${expectedValue}"`, async () => {
      await expect(this.searchInput, `Expected search field to contain "${expectedValue}"`).toHaveValue(expectedValue);
    });
  }

  /**
   * Navigate to the Manage Integrations Custom page
   */
  async navigateToManageIntegrationsCustomPage(): Promise<void> {
    await test.step('Navigate to Manage Integrations Custom page', async () => {
      await this.page.goto('/manage/app/integrations/custom', { waitUntil: 'domcontentloaded' });
    });
  }

  /**
   * Search for an app in the prebuilt apps dialog
   */
  async searchForPrebuiltApp(appName: string): Promise<void> {
    await test.step(`Search for prebuilt app: ${appName}`, async () => {
      await this.prebuiltAppDialog.waitFor({ state: 'visible', timeout: 20000 });
      const input = this.prebuiltAppDialog.locator(this.prebuiltAppSearchInput);
      await input.fill(appName);
      await this.page.waitForTimeout(2000);
    });
  }

  /**
   * Click on an app connector by name
   */
  async clickOnAppConnector(appName: string): Promise<void> {
    await test.step(`Click on ${appName} connector`, async () => {
      await this.getText(appName).first().click();
    });
  }

  /**
   * Generic method to click any button by text
   */
  async clickButton(buttonText: string, stepName?: string): Promise<void> {
    const step = stepName || `Click ${buttonText} button`;
    await test.step(step, async () => {
      await this.clickOnElement(this.getButton(buttonText), { timeout: 30_000 });
    });
  }

  /**
   * Generic method to click any button by name
   */
  async clickOnButtonWithName(buttonName: string): Promise<void> {
    await this.clickButton(buttonName);
  }

  /**
   * Generic method to click any menu item by text
   */
  async clickMenuItem(itemText: string, stepName?: string): Promise<void> {
    const step = stepName || `Click ${itemText} menu item`;
    await test.step(step, async () => {
      await this.clickOnElement(this.getMenuItem(itemText), { timeout: 30_000 });
    });
  }

  /**
   * Generic method to interact with dialogs - click button in dialog
   */
  async clickDialogButton(buttonText: string, stepName?: string): Promise<void> {
    const step = stepName || `Click ${buttonText} in dialog`;
    await test.step(step, async () => {
      await this.clickOnElement(this.getDialog().getByRole('button', { name: buttonText }), { timeout: 30_000 });
    });
  }

  /**
   * Open connector options menu and select an option
   */
  async selectConnectorOption(option: AppConnectorOptions): Promise<void> {
    await test.step(`Select connector option: ${option}`, async () => {
      await this.clickOnElement(this.connectorOptionsButton, { timeout: 30_000 });
      await this.clickMenuItem(option);
    });
  }

  /**
   * Delete app using three dots menu
   */
  async deleteAppWithThreeDotsMenu(): Promise<void> {
    await test.step('Delete app using three dots menu', async () => {
      await this.selectConnectorOption(AppConnectorOptions.Delete);
      await this.verifyDeleteDialogVisible(APP_LABELS.DELETE_CUSTOM_APP_LABEL);
      await this.clickDialogButton(APP_LABELS.DELETE_LABEL, 'Confirm delete');
    });
  }

  /**
   * Verify delete custom dialog box is shown
   */
  async verifyDeleteDialogVisible(option: string): Promise<void> {
    await test.step('Verify delete custom dialog box is shown', async () => {
      await expect(this.getDialog().locator(`h2:has-text("${option}")`)).toBeVisible();
    });
  }

  /**
   * Get menu for any trigger - reusable method
   */
  private async getMenuForTrigger(trigger: Locator): Promise<Locator> {
    const triggerId = await trigger.getAttribute('id');
    return this.page.locator(`[role="menu"][aria-labelledby="${triggerId}"]`);
  }

  /**
   * Generic method to open dropdown and select option
   */
  async openDropdownAndSelect(triggerText: string, optionText: string, stepName?: string): Promise<void> {
    const step = stepName || `${triggerText} → ${optionText}`;
    await test.step(step, async () => {
      const trigger = this.getButton(triggerText);
      await this.clickOnElement(trigger, { timeout: 30_000 });
      await this.page.waitForTimeout(2000);
      const menu = await this.getMenuForTrigger(trigger);
      if (!(await menu.isVisible())) {
        await trigger.press('ArrowDown');
        await expect(menu).toBeVisible();
      }
      await this.clickMenuItem(optionText);
    });
  }

  /**
   * Open "Add custom app" dropdown and choose an option
   */
  async clickAddCustomAppOption(option: string): Promise<void> {
    await this.openDropdownAndSelect(APP_LABELS.ADD_CUSTOM_APP_LABEL, option, `Add custom app → ${option}`);
  }

  /**
   * Get add button for specific app - reusable method
   */
  private getAddButtonForApp(appName: string): Locator {
    return this.prebuiltAppDialog.locator(`div:has(p:text-is("${appName}"))`).getByRole('button', { name: 'Add' });
  }

  /**
   * Click on the "Add" button for an app
   */
  async clickAddPrebuilt(appName: string): Promise<void> {
    await test.step(`Add prebuilt app "${appName}"`, async () => {
      await expect(this.prebuiltAppDialog).toBeVisible();
      const addButton = this.getAddButtonForApp(appName);
      await expect(addButton).toBeVisible({ timeout: 15000 });
      await expect(addButton).toBeEnabled();
      await this.clickOnElement(addButton, { timeout: 30_000 });
    });
  }

  /**
   * Open connector options menu and select an option
   */
  async openConnectorOptions(service: string): Promise<void> {
    await test.step(`Open ${service} connector options`, async () => {
      const btn = this.connectorOptionsButton.last();
      await btn.click();
      await this.clickMenuItem(APP_LABELS.ENABLE_LABEL, 'Enable connector');
      const confirm = this.enableConfirmButton;
      if (await confirm.isVisible()) await this.clickButton(APP_LABELS.ENABLE_LABEL, 'Confirm enable');
    });
  }

  /**
   * Verify toast message is visible with expected text
   * @param message - The expected toast message text
   */
  async verifyToastMessageIsVisibleWithText(message: string): Promise<void> {
    await test.step(`Verify toast message: "${message}"`, async () => {
      const toast = this.toastAlert.filter({ hasText: message });
      await expect(toast, `Expected toast message "${message}" to be visible`).toBeVisible({ timeout: 10000 });
    });
  }

  // =====================
  // Filter Methods
  // =====================

  /**
   * Click on Status filter dropdown
   */
  async clickStatusFilter(): Promise<void> {
    await test.step('Click Status filter dropdown', async () => {
      await this.clickOnElement(this.statusFilterButton, { timeout: 10000 });
    });
  }

  /**
   * Select a status filter option
   * @param status - The status to filter by ('Enabled' or 'Disabled')
   */
  async selectStatusFilter(status: 'Enabled' | 'Disabled'): Promise<void> {
    await test.step(`Select status filter: ${status}`, async () => {
      await this.clickStatusFilter();
      await this.clickOnElement(this.getRadioOption(status), { timeout: 10000 });
      await this.page.keyboard.press('Escape');
    });
  }

  /**
   * Clear the status filter
   */
  async clearStatusFilter(): Promise<void> {
    await test.step('Clear status filter', async () => {
      await this.clickStatusFilter();
      await this.clickOnElement(this.clearSearchButton.first(), { timeout: 10000 });
    });
  }

  /**
   * Click on Type filter dropdown
   */
  async clickTypeFilter(): Promise<void> {
    await test.step('Click Type filter dropdown', async () => {
      await this.clickOnElement(this.typeFilterButton, { timeout: 10000 });
    });
  }

  /**
   * Select a type filter option
   * @param type - The type to filter by ('Prebuilt' or 'Custom')
   */
  async selectTypeFilter(type: 'Prebuilt' | 'Custom'): Promise<void> {
    await test.step(`Select type filter: ${type}`, async () => {
      await this.clickTypeFilter();
      const radioId = type === 'Prebuilt' ? 'hybrid' : 'custom';
      await this.clickOnElement(this.getTypeFilterLabel(radioId), { timeout: 10000 });
      await this.page.keyboard.press('Escape');
    });
  }

  /**
   * Clear the type filter
   */
  async clearTypeFilter(): Promise<void> {
    await test.step('Clear type filter', async () => {
      await this.clickTypeFilter();
      const clearButton = this.typeFilterDropdownHeader.getByRole('button', { name: 'Clear' });
      await this.clickOnElement(clearButton, { timeout: 10000 });
    });
  }

  // =====================
  // Sort Methods
  // =====================

  /**
   * Click on Sort dropdown
   */
  async clickSortDropdown(): Promise<void> {
    await test.step('Click Sort dropdown', async () => {
      await this.clickOnElement(this.sortDropdownButton, { timeout: 10000 });
    });
  }

  /**
   * Select a sort by option
   * @param sortBy - The sort by option ('Last used', 'Date created', or 'Name')
   */
  async selectSortBy(sortBy: 'Last used' | 'Date created' | 'Name'): Promise<void> {
    await test.step(`Select sort by: ${sortBy}`, async () => {
      await this.clickSortDropdown();
      await this.clickOnElement(this.menuContainer.getByRole('menuitem', { name: sortBy }), { timeout: 10000 });
    });
  }

  /**
   * Select a sort order option
   * @param order - The sort order ('Newest first' or 'Oldest first')
   */
  async selectSortOrder(order: 'Newest first' | 'Oldest first'): Promise<void> {
    await test.step(`Select sort order: ${order}`, async () => {
      await this.clickSortDropdown();
      await this.clickOnElement(this.menuContainer.getByRole('menuitem', { name: order }), { timeout: 10000 });
    });
  }

  /**
   * Verify app status in the list
   * @param appName - The name of the app
   * @param expectedStatus - Expected status ('Enabled' or 'Disabled')
   */
  async verifyAppStatus(appName: string, expectedStatus: 'Enabled' | 'Disabled'): Promise<void> {
    await test.step(`Verify app "${appName}" has status "${expectedStatus}"`, async () => {
      const appRow = this.resultListItems.filter({ hasText: appName });
      const statusText = appRow.getByText(expectedStatus);
      await expect(statusText, `Expected app "${appName}" to have status "${expectedStatus}"`).toBeVisible();
    });
  }

  /**
   * Verify app type in the list
   * @param appName - The name of the app
   * @param expectedType - Expected type ('Prebuilt' or 'Custom')
   */
  async verifyAppType(appName: string, expectedType: 'Prebuilt' | 'Custom'): Promise<void> {
    await test.step(`Verify app "${appName}" has type "${expectedType}"`, async () => {
      const appRow = this.resultListItems.filter({ hasText: appName });
      const typeText = appRow.getByText(expectedType);
      await expect(typeText, `Expected app "${appName}" to have type "${expectedType}"`).toBeVisible();
    });
  }

  /**
   * Verify all visible apps have the expected status
   * @param expectedStatus - Expected status ('Enabled' or 'Disabled')
   */
  async verifyAllAppsHaveStatus(expectedStatus: 'Enabled' | 'Disabled'): Promise<void> {
    await test.step(`Verify all apps have status "${expectedStatus}"`, async () => {
      const count = await this.resultListItems.count();
      for (let i = 0; i < count; i++) {
        const statusText = this.resultListItems.nth(i).getByText(expectedStatus);
        await expect(statusText, `Expected app at index ${i} to have status "${expectedStatus}"`).toBeVisible();
      }
    });
  }

  /**
   * Verify all visible apps have the expected type
   * @param expectedType - Expected type ('Prebuilt' or 'Custom')
   */
  async verifyAllAppsHaveType(expectedType: 'Prebuilt' | 'Custom'): Promise<void> {
    await test.step(`Verify all apps have type "${expectedType}"`, async () => {
      const count = await this.resultListItems.count();
      for (let i = 0; i < count; i++) {
        const typeText = this.resultListItems.nth(i).getByText(expectedType);
        await expect(typeText, `Expected app at index ${i} to have type "${expectedType}"`).toBeVisible();
      }
    });
  }

  /**
   * Get the first app name in the list
   * @returns The name of the first app
   */
  async getFirstAppName(): Promise<string> {
    const firstAppName = this.resultListItems.first().locator('h3, p').first();
    return (await firstAppName.textContent()) || '';
  }

  /**
   * Get all app names in the list
   * @returns Array of app names
   */
  async getAllAppNames(): Promise<string[]> {
    const appNames: string[] = [];
    const count = await this.appLinks.count();
    for (let i = 0; i < count; i++) {
      const nameElement = this.appLinks.nth(i).locator('p.Typography-module__boldWeight__OGpiQ').first();
      const name = await nameElement.textContent();
      if (name) {
        appNames.push(name.trim());
      }
    }
    return appNames;
  }

  /**
   * Verify apps are sorted alphabetically A-Z
   */
  async verifyAppsSortedAlphabeticallyAZ(): Promise<void> {
    await test.step('Verify apps are sorted alphabetically A-Z', async () => {
      const appNames = await this.getAllAppNames();
      const sortedNames = [...appNames].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      expect(appNames, 'Expected apps to be sorted alphabetically A-Z').toEqual(sortedNames);
    });
  }

  /**
   * Verify apps are sorted alphabetically Z-A
   */
  async verifyAppsSortedAlphabeticallyZA(): Promise<void> {
    await test.step('Verify apps are sorted alphabetically Z-A', async () => {
      const appNames = await this.getAllAppNames();
      const sortedNames = [...appNames].sort((a, b) => b.toLowerCase().localeCompare(a.toLowerCase()));
      expect(appNames, 'Expected apps to be sorted alphabetically Z-A').toEqual(sortedNames);
    });
  }

  // =====================
  // Create Custom App Methods
  // =====================

  /**
   * Enter app name in the create custom app form
   * @param name - The name of the app
   */
  async enterAppName(name: string): Promise<void> {
    await test.step(`Enter app name: ${name}`, async () => {
      await this.appNameInput.waitFor({ state: 'visible' });
      await this.appNameInput.fill(name);
    });
  }

  /**
   * Enter app description in the create custom app form
   * @param description - The description of the app
   */
  async enterAppDescription(description: string): Promise<void> {
    await test.step(`Enter app description: ${description}`, async () => {
      await this.appDescriptionInput.waitFor({ state: 'visible' });
      await this.appDescriptionInput.fill(description);
    });
  }

  /**
   * Select app category from dropdown
   * @param category - The category to select (e.g., 'Other', 'Calendar', 'CRM', etc.)
   */
  async selectAppCategory(category: string): Promise<void> {
    await test.step(`Select app category: ${category}`, async () => {
      await this.categorySelect.waitFor({ state: 'visible' });
      await this.categorySelect.selectOption({ label: category });
    });
  }

  /**
   * Upload a logo file for the custom app
   * @param fileName - The file name to upload (e.g., 'Jira_Custom_App.jpg')
   */
  async uploadLogoFile(fileName: string): Promise<void> {
    await test.step(`Upload logo file: ${fileName}`, async () => {
      const filePath = path.join(TEST_DATA_IMAGE_FILES_PATH, fileName);
      await this.fileInput.setInputFiles(filePath);
    });
  }

  /**
   * Verify the uploaded logo file name is displayed
   * @param fileName - The expected file name (without extension)
   */
  async verifyUploadedLogoFileName(fileName: string): Promise<void> {
    await test.step(`Verify uploaded logo file name: ${fileName}`, async () => {
      const fileNameElement = this.logoPanelContainer.locator('p.Typography-module__paragraph__OGpiQ').first();
      await expect(fileNameElement, `Expected file name "${fileName}" to be visible`).toContainText(fileName);
    });
  }

  /**
   * Verify the uploaded logo image preview is displayed
   */
  async verifyUploadedLogoImagePreview(): Promise<void> {
    await test.step('Verify uploaded logo image preview is displayed', async () => {
      await expect(this.logoImagePreview, 'Expected logo image preview to be visible').toBeVisible({ timeout: 10000 });
    });
  }

  /**
   * Verify the uploaded logo file size is displayed
   * @param expectedSize - The expected file size text (e.g., "JPG - 43.93KB")
   */
  async verifyUploadedLogoFileSize(expectedSize: string): Promise<void> {
    await test.step(`Verify uploaded logo file size: ${expectedSize}`, async () => {
      const fileSizeElement = this.logoPanelContainer.locator('p.Typography-module__secondary__OGpiQ').first();
      await expect(fileSizeElement, `Expected file size "${expectedSize}" to be visible`).toContainText(expectedSize);
    });
  }

  /**
   * Verify the remove/delete logo button is displayed
   */
  async verifyRemoveLogoButtonIsDisplayed(): Promise<void> {
    await test.step('Verify remove logo button is displayed', async () => {
      await expect(this.removeLogoButton, 'Expected remove logo button to be visible').toBeVisible({ timeout: 10000 });
    });
  }

  /**
   * Verify all uploaded logo details (image preview, file name, file size, delete button)
   * @param fileName - The expected file name
   * @param fileSize - The expected file size (e.g., "JPG - 43.93KB")
   */
  async verifyUploadedLogoDetails(fileName: string, fileSize: string): Promise<void> {
    await test.step(`Verify uploaded logo details: ${fileName}`, async () => {
      await this.verifyUploadedLogoImagePreview();
      await this.verifyUploadedLogoFileName(fileName);
      await this.verifyUploadedLogoFileSize(fileSize);
      await this.verifyRemoveLogoButtonIsDisplayed();
    });
  }

  /**
   * Scroll the page by specified pixels
   * @param pixels - Number of pixels to scroll
   */
  async scrollPageBy(pixels: number): Promise<void> {
    await test.step(`Scroll page by ${pixels} pixels`, async () => {
      await this.page.evaluate(scrollAmount => {
        window.scrollBy(0, scrollAmount);
      }, pixels);
      await this.page.waitForTimeout(500);
    });
  }

  // =====================
  // OAuth2 App Configuration Methods
  // =====================

  /**
   * Select connection type from dropdown
   * @param connectionType - The connection type (e.g., 'App level', 'User level')
   */
  async selectConnectionType(connectionType: string): Promise<void> {
    await test.step(`Select connection type: ${connectionType}`, async () => {
      await this.connectionTypeSelect.waitFor({ state: 'visible' });
      await this.connectionTypeSelect.selectOption({ label: connectionType });
    });
  }

  /**
   * Select auth type from dropdown
   * @param authType - The auth type (e.g., 'OAuth 2.0', 'Basic Auth', 'API Key')
   */
  async selectAuthType(authType: string): Promise<void> {
    await test.step(`Select auth type: ${authType}`, async () => {
      await this.authTypeSelect.waitFor({ state: 'visible' });
      await this.authTypeSelect.selectOption({ label: authType });
    });
  }

  /**
   * Select sub auth type from dropdown
   * @param subAuthType - The sub auth type (e.g., 'Auth Code', 'Client Credentials')
   */
  async selectSubAuthType(subAuthType: string): Promise<void> {
    await test.step(`Select sub auth type: ${subAuthType}`, async () => {
      await this.subAuthTypeSelect.waitFor({ state: 'visible' });
      await this.subAuthTypeSelect.selectOption({ label: subAuthType });
    });
  }

  /**
   * Enter value in a textbox field by its label name
   * @param fieldName - The label name of the field (e.g., 'Client ID*', 'Secret key*', 'Auth URL*')
   * @param value - The value to enter
   */
  async enterFieldValue(fieldName: string, value: string): Promise<void> {
    await test.step(`Enter ${fieldName}: ${value}`, async () => {
      const fieldInput = this.getTextbox(fieldName);
      await fieldInput.waitFor({ state: 'visible' });
      await fieldInput.fill(value);
    });
  }

  /**
   * Click Save button
   */
  async clickSaveButton(): Promise<void> {
    await test.step('Click Save button', async () => {
      await this.saveButton.waitFor({ state: 'visible' });
      await this.clickOnElement(this.saveButton, { timeout: 10000 });
    });
  }

  /**
   * Click Connect account button
   */
  async clickConnectAccountButton(): Promise<void> {
    await test.step('Click Connect account button', async () => {
      await this.connectAccountButton.waitFor({ state: 'visible' });
      await this.clickOnElement(this.connectAccountButton, { timeout: 10000 });
    });
  }

  /**
   * Verify Disconnect account button is displayed
   */
  async verifyDisconnectAccountButtonIsDisplayed(): Promise<void> {
    await test.step('Verify Disconnect account button is displayed', async () => {
      await expect(this.disconnectAccountButton, 'Expected Disconnect account button to be visible').toBeVisible({
        timeout: 10000,
      });
    });
  }

  /**
   * Verify text is displayed on the page
   * @param text - The text to verify
   */
  async verifyTextIsDisplayed(text: string): Promise<void> {
    await test.step(`Verify text is displayed: ${text}`, async () => {
      await expect(this.getText(text).first(), `Expected text "${text}" to be visible`).toBeVisible({ timeout: 10000 });
    });
  }

  /**
   * Verify app name is displayed in the header
   * @param appName - The app name to verify
   */
  async verifyAppNameInHeader(appName: string): Promise<void> {
    await test.step(`Verify app name in header: ${appName}`, async () => {
      await expect(this.getHeading(appName, 3), `Expected app name "${appName}" to be visible in header`).toBeVisible({
        timeout: 10000,
      });
    });
  }

  /**
   * Verify app description is displayed
   * @param description - The description to verify
   */
  async verifyAppDescription(description: string): Promise<void> {
    await test.step(`Verify app description: ${description}`, async () => {
      await expect(
        this.getText(description).first(),
        `Expected description "${description}" to be visible`
      ).toBeVisible({
        timeout: 10000,
      });
    });
  }

  /**
   * Verify connection message is displayed
   * @param appName - The app name in the message
   */
  async verifyConnectionMessage(appName: string): Promise<void> {
    await test.step(`Verify connection message for: ${appName}`, async () => {
      await expect(
        this.getText(`${appName} requires that an admin account is connected`),
        'Expected connection message to be visible'
      ).toBeVisible({ timeout: 10000 });
    });
  }

  /**
   * Verify checklist item is checked
   * @param checklistText - The text of the checklist item
   */
  async verifyChecklistItemIsChecked(checklistText: string): Promise<void> {
    await test.step(`Verify checklist item is checked: ${checklistText}`, async () => {
      await expect(
        this.getText(checklistText).first(),
        `Expected checklist item "${checklistText}" to be visible`
      ).toBeVisible();
      await expect(this.completedStepIndicator.first(), 'Expected checkmark to be visible').toBeVisible();
    });
  }

  /**
   * Connect Box account by handling OAuth popup
   * @param email - Box account email
   * @param password - Box account password
   */
  async connectBoxAccount(email: string, password: string): Promise<void> {
    await test.step('Connect Box account via OAuth', async () => {
      // Click Connect account button and wait for popup
      const popupPromise = this.page.context().waitForEvent('page');
      await this.clickConnectAccountButton();

      // Handle Box OAuth popup
      const popup = await popupPromise;
      await popup.waitForLoadState();

      // Enter Box credentials if login form is present
      const emailInput = popup.locator('input[name="login"]');
      if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await emailInput.fill(email);
        const passwordInput = popup.locator('input[name="password"]');
        await passwordInput.fill(password);
        const submitButton = popup.locator('input[name="login_submit"]');
        await submitButton.click();
      }

      // Click Grant Access to Box button
      const grantAccessButton = popup.getByRole('button', { name: 'Grant Access to Box' });
      await grantAccessButton.click({ timeout: 15000 });

      // Wait for popup to close
      await popup.waitForEvent('close', { timeout: 30000 }).catch(() => {});
    });
  }
}
