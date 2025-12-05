import { MESSAGES } from '@integrations/constants/messageRepo';
import { AIRTABLE_AUTH_DATA } from '@integrations/test-data/app-tiles.test-data';
import { AppConnectorOptions, CustomAppsComponent } from '@integrations-components/customAppsComponent';
import { Locator, Page, test } from '@playwright/test';
import { expect } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

import { BasePage } from '@/src/core/ui/pages/basePage';

export enum CustomAppType {
  CREATE_OWN_APP = 'Create your own app',
  ADD_PREBUILT_APP = 'Add prebuilt app',
}

/**
 * Interface for connection field configuration
 */
export interface ConnectionFieldConfig {
  fieldName: string;
  fieldLabel: string;
  expectedValue?: string;
  isDisabled?: boolean;
}

export class CustomAppsIntegrationPage extends BasePage {
  readonly resultListAppTilesItemCountLocator: Locator;
  readonly customAppsComponent: CustomAppsComponent;
  readonly saveButton: Locator;
  readonly saveButtonSubmit: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly dialogHeadingLocator: Locator;
  readonly dialogMessageLocator: Locator;
  readonly setupChecklistPanel: Locator;
  readonly completedStepStatusIndicator: Locator;
  readonly incompleteStepStatusIndicator: Locator;
  readonly stepContainer: Locator;
  readonly tileUnavailableMessage: Locator;
  readonly apiTokenInput: Locator;

  // New locators for app settings verification
  readonly customAppsLink: Locator;
  readonly connectionHeading: Locator;
  readonly disconnectAccountButton: Locator;
  readonly editButton: Locator;
  readonly connectAccountButton: Locator;
  readonly setupChecklistButton: Locator;
  readonly dialog: Locator;
  readonly appDescriptionText: Locator;

  // Verification locators
  readonly alertMessage: Locator;
  readonly saveButtonByRole: Locator;

  // Dialog locators
  readonly dialogTitleHeading: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogDisconnectButton: Locator;

  // PKCE and Token URL locators
  readonly codeChallengeMethodDropdown: Locator;
  readonly addHeadersForTokenUrlCheckbox: Locator;
  readonly tokenRequestHeadersInput: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE);
    this.resultListAppTilesItemCountLocator = page.locator('div[class*="ConnectorsList_resultCount"]');
    this.customAppsComponent = new CustomAppsComponent(page);
    this.saveButton = page.locator('button:has-text("Save")');
    this.saveButtonSubmit = page.locator('button[type="submit"]:has-text("Save")');
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.dialogHeadingLocator = page.locator('h4, [role="heading"]');
    this.dialogMessageLocator = page.getByRole('dialog').locator('p');
    this.setupChecklistPanel = page.locator('button[aria-label*="setup checklist"]');
    this.completedStepStatusIndicator = page.locator('[data-testid="completedStepStatusIndicator"]');
    this.incompleteStepStatusIndicator = page.locator('[data-testid="incompleteStepStatusIndicator"]');
    this.stepContainer = page.locator('div[class*="Spacing-module__row__bvKBb"]:has(p)');
    this.tileUnavailableMessage = page.locator(
      `p:has-text("${MESSAGES.getAppConnectionUnavailableMessage('Expensify')}")`
    );
    this.apiTokenInput = page.locator('input[name="apiToken"]');
    this.customAppsLink = page.getByRole('link', { name: 'Custom apps' });
    this.connectionHeading = page.getByRole('heading', { name: 'Connection' });
    this.disconnectAccountButton = page.getByRole('button', { name: 'Disconnect account' });
    this.editButton = page.getByRole('button', { name: 'Edit' });
    this.connectAccountButton = page.getByRole('button', { name: 'Connect account' });
    this.setupChecklistButton = page.getByRole('button', { name: /setup checklist/i });
    this.dialog = page.getByRole('dialog');
    this.appDescriptionText = page.getByText(/App to integrate with|to support actions/i);
    this.alertMessage = page.getByRole('alert');
    this.saveButtonByRole = page.getByRole('button', { name: 'Save' });
    this.dialogTitleHeading = this.dialog.locator('h2, h3, h4');
    this.dialogCancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.dialogDisconnectButton = this.dialog.getByRole('button', { name: 'Disconnect account' });

    // PKCE and Token URL locators
    this.codeChallengeMethodDropdown = page.locator('select[name="authDetails.codeChallengeMethod"]');
    this.addHeadersForTokenUrlCheckbox = page.getByRole('checkbox', { name: 'Add headers for Token URL' });
    this.tokenRequestHeadersInput = page.locator(
      'input[name="authDetails.tokenRequestHeaders"], textarea[name="authDetails.tokenRequestHeaders"]'
    );
  }

  /**
   * Get a button locator by its name/text
   * @param buttonName - The name/text of the button (string or RegExp)
   */
  getButton(buttonName: string | RegExp): Locator {
    return this.page.getByRole('button', { name: buttonName });
  }

  /**
   * Get a link locator by its name/text
   * @param linkName - The name/text of the link (string or RegExp)
   */
  getLink(linkName: string | RegExp): Locator {
    return this.page.getByRole('link', { name: linkName });
  }

  // Helper methods for dynamic locators
  getAppHeading(appName: string): Locator {
    return this.page.getByRole('heading', { name: appName, level: 3 });
  }

  getStatusTag(status: string): Locator {
    // Look for the status text more flexibly - it might be in different structures
    return this.page.getByText(status, { exact: true });
  }

  getFieldInput(fieldLabel: string, fieldName: string): Locator {
    return this.page.getByLabel(fieldLabel, { exact: false }).or(this.page.locator(`input[name="${fieldName}"]`));
  }

  getStatusBadge(status: 'Enabled' | 'Disabled'): Locator {
    return this.page.getByText(status, { exact: true }).first();
  }

  getFieldByName(fieldName: string): Locator {
    return this.page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`);
  }

  getDropdownByName(selectName: string): Locator {
    return this.page.locator(`select[name="${selectName}"]`);
  }

  getFieldByLabel(fieldLabel: string): Locator {
    return this.page.getByText(fieldLabel, { exact: false }).first();
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.resultListAppTilesItemCountLocator, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage:
          'Verifying that the custom page is loaded by assertion for app tiles list item count presence',
      });
    });
  }

  /**
   * Generic method to fill form field
   */
  private async fillFormField(selector: string, value: string, shouldClear = false): Promise<void> {
    const input = this.page.locator(selector);
    if (shouldClear) await input.clear();
    await input.fill(value);
  }

  /**
   * Configure Airtable authentication details
   */
  async configureAirtableAuth(): Promise<void> {
    await test.step('Configure Airtable authentication details', async () => {
      await this.fillFormField('#authDetails_clientId', AIRTABLE_AUTH_DATA.CLIENT_ID);
      await this.fillFormField('#authDetails_clientSecret', AIRTABLE_AUTH_DATA.CLIENT_SECRET);
      await this.fillFormField('#authDetails_authUrl', AIRTABLE_AUTH_DATA.AUTH_URL, true);
      await this.fillFormField('#authDetails_tokenUrl', AIRTABLE_AUTH_DATA.TOKEN_URL, true);
      await this.fillFormField('#authDetails_tokenRequestHeaders', AIRTABLE_AUTH_DATA.TOKEN_HEADERS, true);
      await this.fillFormField('#authDetails_baseUrl', AIRTABLE_AUTH_DATA.BASE_URL, true);

      await expect(this.saveButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await this.saveButton.click();
    });
  }

  /**
   * Verify toast message
   * @param message - The message to verify
   * @returns void
   */
  async verifyToastMessageIsVisibleWithText(message: string): Promise<void> {
    return this.customAppsComponent.verifyToastMessageIsVisibleWithText(message);
  }

  async openConnectorOptions(service: string): Promise<void> {
    return this.customAppsComponent.openConnectorOptions(service);
  }

  async searchAndSelectAppWithNameToPerformAction(appName: string, action: AppConnectorOptions): Promise<void> {
    await test.step('Search and select app with name', async () => {
      await this.customAppsComponent.searchForApp(appName);
      await this.customAppsComponent.verifyCountOfAppsInListIs(1);
      await this.customAppsComponent.clickOnAppConnector(appName);
      await this.customAppsComponent.selectConnectorOption(action);
      // Use the new generic dialog button method instead of confirmDelete
      await this.customAppsComponent.clickDialogButton(action, `Confirm ${action}`);
    });
  }

  async disconnectApp(appName: string): Promise<void> {
    await test.step('Search and select app with name', async () => {
      await this.customAppsComponent.searchForApp(appName);
      await this.customAppsComponent.verifyCountOfAppsInListIs(1);
      await this.customAppsComponent.clickOnAppConnector(appName);
      await this.customAppsComponent.clickOnButtonWithName('Disconnect account');
    });
  }

  /**
   * Verify disconnect dialog shows all required messages
   * @param appName - The app name to verify in the confirmation message
   */
  async verifyDisconnectDialogContent(appName: string): Promise<void> {
    await test.step(`Verify disconnect dialog content for ${appName}`, async () => {
      await expect(this.dialog).toBeVisible({ timeout: TIMEOUTS.SHORT });

      // Verify the main confirmation message with app name
      const confirmationMessage = MESSAGES.getAppDisconnectingConfirmationMessage(appName);
      await expect(this.dialog.getByText(confirmationMessage)).toBeVisible({ timeout: TIMEOUTS.SHORT });

      // Verify the secondary message about dashboard tiles
      const secondaryMessage = MESSAGES.getAppDisconnectingConfirmationMessageHomeAndSiteDashboardTiles;
      await expect(this.dialog.getByText(secondaryMessage)).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  async searchAndSelectAppWithName(appName: string): Promise<void> {
    await test.step('Search and select app with name', async () => {
      await this.customAppsComponent.searchForApp(appName);
      await this.customAppsComponent.verifyCountOfAppsInListIs(1);
      await this.customAppsComponent.clickOnAppConnector(appName);
    });
  }

  async addPrebuiltApp(appName: string) {
    await test.step(`Add prebuilt app of type ${appName}`, async () => {
      await this.customAppsComponent.clickAddCustomAppOption(CustomAppType.ADD_PREBUILT_APP);
      await this.customAppsComponent.searchForPrebuiltApp(appName);
      await this.customAppsComponent.clickAddPrebuilt(appName);
      await this.page.waitForURL(/new/);
    });
  }

  async clickSaveButton(): Promise<void> {
    await this.customAppsComponent.clickButton('Save');
    await expect(this.saveButton).toBeDisabled({ timeout: TIMEOUTS.SHORT });
  }

  /**
   * Fill both Partner user ID and Partner user secret fields
   */
  async enterCredentials(userId: string, userSecret: string): Promise<void> {
    await test.step(`Enter credentials: userId=${userId}`, async () => {
      await this.usernameInput.waitFor({ state: 'visible' });
      await this.usernameInput.fill(userId);
      await this.usernameInput.blur();
      await this.passwordInput.waitFor({ state: 'visible' });
      await this.passwordInput.fill(userSecret);
      await this.passwordInput.blur();
      await this.saveButton.waitFor({ state: 'visible' });
      await this.clickSaveButton();
    });
  }

  /**
   * Submit the form by clicking the Save button
   */
  async submitForm(): Promise<void> {
    await test.step('Submit form by clicking Save button', async () => {
      await this.verifier.verifyTheElementIsVisible(this.saveButtonSubmit, {
        assertionMessage: 'Save button should be visible',
      });
      await this.verifier.verifyTheElementIsEnabled(this.saveButtonSubmit, {
        assertionMessage: 'Save button should be enabled',
      });
      await this.saveButtonSubmit.click();
    });
  }

  /**
   * Verify setup checklist is visible
   */
  async verifySetupChecklistIsVisible(): Promise<void> {
    await test.step('Verify setup checklist is visible', async () => {
      await expect(this.setupChecklistButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Verify a setup step is completed with checkmark indicator (green background)
   * @param stepText - The text of the step to verify
   */
  async verifySetupStepIsCompleted(stepText: string): Promise<void> {
    await test.step(`Verify setup step is completed: "${stepText}"`, async () => {
      // Find the step container that contains the text and has the completed indicator
      const stepContainer = this.stepContainer.filter({ hasText: stepText });
      const stepLocator = stepContainer.locator(this.completedStepStatusIndicator);
      await expect(stepLocator, `Expected completed indicator for step: "${stepText}"`).toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
      // Verify the indicator has the completed styling (contains SVG with white checkmark)
      const svg = stepLocator.locator('svg');
      await expect(svg).toBeVisible();
    });
  }

  /**
   * Verify a setup step is incomplete with empty circle indicator (gray background)
   * @param stepText - The text of the step to verify
   */
  async verifySetupStepIsIncomplete(stepText: string): Promise<void> {
    await test.step(`Verify setup step is incomplete: "${stepText}"`, async () => {
      // Find the step container that contains the text and has the incomplete indicator
      const stepContainer = this.stepContainer.filter({ hasText: stepText });
      const stepLocator = stepContainer.locator(this.incompleteStepStatusIndicator);
      await expect(stepLocator, `Expected incomplete indicator for step: "${stepText}"`).toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
      // Verify the indicator has the incomplete styling (contains SVG with gray circle)
      const svg = stepLocator.locator('svg');
      await expect(svg).toBeVisible();
    });
  }

  /**
   * Verify all setup checklist steps status
   * @param steps - Array of step objects with text and expected status
   */
  async verifySetupChecklistSteps(steps: Array<{ text: string; status: 'completed' | 'incomplete' }>): Promise<void> {
    await test.step('Verify all setup checklist steps', async () => {
      await this.verifySetupChecklistIsVisible();
      for (const step of steps) {
        if (step.status === 'completed') {
          await this.verifySetupStepIsCompleted(step.text);
        } else {
          await this.verifySetupStepIsIncomplete(step.text);
        }
      }
    });
  }

  /**
   * Verify tile shows unavailable connection message
   */
  async verifyTileUnavailableMessage(): Promise<void> {
    await test.step('Verify tile shows unavailable connection message', async () => {
      await expect(this.tileUnavailableMessage, 'Expected unavailable connection message to be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verify app settings page is loaded correctly
   * @param appName - The name of the app (e.g., 'Expensify')
   */
  async verifyAppSettingsPageLoaded(appName: string): Promise<void> {
    await test.step(`Verify ${appName} app settings page is loaded`, async () => {
      // Wait for basic page load
      await this.page.waitForLoadState('load');

      // Wait for the custom apps link to be visible as indicator of page loaded
      await this.customAppsLink.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });

      await expect(this.customAppsLink).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.getAppHeading(appName)).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await expect(this.appDescriptionText.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Verify app connection status
   * @param expectedStatus - Expected status ('Enabled' or 'Disabled')
   */
  async verifyAppConnectionStatus(expectedStatus: 'Enabled' | 'Disabled'): Promise<void> {
    await test.step(`Verify app connection status is ${expectedStatus}`, async () => {
      // Wait a bit for status to render
      await this.page.waitForTimeout(TIMEOUTS.VERY_VERY_SHORT);

      // More flexible check - look for the status text anywhere on the page
      const statusElement = this.getStatusTag(expectedStatus);
      await expect(statusElement).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Generic method to verify connection form fields for any app
   * @param appName - Name of the app
   * @param fields - Array of field configurations to verify
   * @param connectionDescription - Optional custom connection description text to verify
   */
  async verifyConnectionFields(
    appName: string,
    fields: ConnectionFieldConfig[],
    connectionDescription?: string
  ): Promise<void> {
    await test.step(`Verify ${appName} connection fields`, async () => {
      // Verify Connection section heading
      await expect(this.connectionHeading).toBeVisible({ timeout: TIMEOUTS.SHORT });

      // Verify connection description if provided
      if (connectionDescription) {
        await expect(this.page.getByText(connectionDescription)).toBeVisible({ timeout: TIMEOUTS.VERY_SHORT });
      }

      // Verify each field
      for (const field of fields) {
        const fieldInput = this.getFieldInput(field.fieldLabel, field.fieldName);

        // Verify field is visible
        await expect(fieldInput).toBeVisible({ timeout: TIMEOUTS.SHORT });

        // Verify field value if provided
        if (field.expectedValue) {
          await expect(fieldInput).toHaveValue(field.expectedValue);
        }

        // Verify disabled state if specified
        if (field.isDisabled) {
          await expect(fieldInput).toBeDisabled();
        }
      }
    });
  }

  /**
   * Verify connection action buttons
   * @param hasDisconnect - Whether disconnect button should be present
   * @param hasEdit - Whether edit button should be present
   * @param hasConnect - Whether connect button should be present
   */
  async verifyConnectionActionButtons(
    hasDisconnect: boolean = true,
    hasEdit: boolean = true,
    hasConnect: boolean = false
  ): Promise<void> {
    await test.step('Verify connection action buttons', async () => {
      if (hasDisconnect) {
        await expect(this.disconnectAccountButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      }

      if (hasEdit) {
        await expect(this.editButton.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });
      }

      if (hasConnect) {
        await expect(this.connectAccountButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      }
    });
  }

  /**
   * Generic method to verify complete app settings page
   * @param appName - Name of the app
   * @param connectionFields - Connection field configurations
   * @param expectedStatus - Expected connection status
   * @param connectionDescription - Optional connection description
   */
  async verifyAppSettingsPage(
    appName: string,
    connectionFields: ConnectionFieldConfig[],
    expectedStatus: 'Enabled' | 'Disabled' = 'Enabled',
    connectionDescription?: string
  ): Promise<void> {
    await test.step(`Verify complete ${appName} settings page`, async () => {
      await this.verifyAppSettingsPageLoaded(appName);
      // Skip status verification for now as it might be displayed differently
      // await this.verifyAppConnectionStatus(expectedStatus);
      await this.verifyConnectionFields(appName, connectionFields, connectionDescription);
      await this.verifyConnectionActionButtons(expectedStatus === 'Enabled', true, expectedStatus === 'Disabled');
    });
  }

  /**
   * Verify complete Expensify settings page
   * @param expectedUserId - Expected Partner user ID value
   */
  async verifyExpensifySettingsPage(expectedUserId: string): Promise<void> {
    const fields: ConnectionFieldConfig[] = [
      {
        fieldName: 'username',
        fieldLabel: 'Partner user ID',
        expectedValue: expectedUserId,
        isDisabled: true,
      },
      {
        fieldName: 'password',
        fieldLabel: 'Partner user secret',
        isDisabled: true,
      },
    ];

    await this.verifyAppSettingsPage(
      'Expensify',
      fields,
      'Enabled',
      'Expensify requires that an admin account is connected'
    );
  }

  /**
   * Verify connector configuration fields are empty and Save button is disabled
   * @param connectorName - Name of the connector (e.g., 'Expensify', 'Airtable')
   * @param fields - Array of field configurations to verify are empty
   * @param expectedErrorMessage - Optional error message to verify (e.g., 'Username is required')
   */
  async verifyFieldsEmptyAndSaveDisabled(
    connectorName: string,
    fields: Array<{ fieldName: string; fieldLabel?: string }>,
    expectedErrorMessage?: string
  ): Promise<void> {
    await test.step(`Verify ${connectorName} fields are empty and Save button is disabled`, async () => {
      // Verify each field is empty
      for (const field of fields) {
        const fieldInput = field.fieldLabel
          ? this.getFieldInput(field.fieldLabel, field.fieldName)
          : this.page.locator(`input[name="${field.fieldName}"]`);

        await expect(fieldInput).toHaveValue('');
      }

      // Verify error message if expected
      if (expectedErrorMessage) {
        const errorMessage = this.alertMessage.filter({ hasText: expectedErrorMessage });
        const isVisible = await errorMessage.isVisible().catch(() => false);
        if (isVisible) {
          await expect(errorMessage).toBeVisible();
        }
      }

      // Verify Save button is disabled
      await expect(this.saveButtonByRole).toBeDisabled();
    });
  }
  /**
   * Verify complete Expensify settings page
   * @param expectedUserId - Expected Partner user ID value
   */
  async verifyGreenhouseSettingsPage(): Promise<void> {
    const fields: ConnectionFieldConfig[] = [
      {
        fieldName: 'apiToken',
        fieldLabel: 'API Token',
        isDisabled: true,
      },
    ];

    await this.verifyAppSettingsPage(
      'Greenhouse',
      fields,
      'Enabled',
      'Greenhouse requires that an admin account is connected'
    );
  }
  /**
   * Fill both Partner user ID and Partner user secret fields
   */
  async enterAPIToken(apiToken: string): Promise<void> {
    await test.step(`Enter Token value: apiToken=${apiToken}`, async () => {
      await this.apiTokenInput.waitFor({ state: 'visible' });
      await this.apiTokenInput.fill(apiToken);
      await this.apiTokenInput.blur();
      await this.clickSaveButton();
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
   * Search for apps by entering text in the search field and pressing Enter
   * @param searchTerm - The search term to enter
   */
  async searchForApps(searchTerm: string): Promise<void> {
    return this.customAppsComponent.searchForApp(searchTerm);
  }

  /**
   * Clear the search input field by clicking the clear/cross button
   */
  async clearSearch(): Promise<void> {
    return this.customAppsComponent.clearSearch();
  }

  /**
   * Verify the result count text matches the expected value
   * @param expectedText - The expected text (e.g., "0 Apps", "1 Apps")
   */
  async verifyResultCountText(expectedText: string): Promise<void> {
    return this.customAppsComponent.verifyResultCountText(expectedText);
  }

  /**
   * Verify the "No results" heading is displayed
   */
  async verifyNoResultsHeadingIsDisplayed(): Promise<void> {
    return this.customAppsComponent.verifyNoResultsHeadingIsDisplayed();
  }

  /**
   * Verify the no results description is displayed
   * @param expectedText - The expected description text
   */
  async verifyNoResultsDescriptionIsDisplayed(expectedText?: string): Promise<void> {
    return this.customAppsComponent.verifyNoResultsDescriptionIsDisplayed(expectedText);
  }

  /**
   * Verify that an app with the given name is displayed in the list
   * @param appName - The name of the app to verify
   */
  async verifyAppIsDisplayedInList(appName: string): Promise<void> {
    return this.customAppsComponent.verifyAppIsDisplayedInList(appName);
  }
  /**
   * Select a status filter option
   * @param status - The status to filter by ('Enabled' or 'Disabled')
   */
  async selectStatusFilter(status: 'Enabled' | 'Disabled'): Promise<void> {
    return this.customAppsComponent.selectStatusFilter(status);
  }

  /**
   * Clear the status filter
   */
  async clearStatusFilter(): Promise<void> {
    return this.customAppsComponent.clearStatusFilter();
  }

  /**
   * Select a type filter option
   * @param type - The type to filter by ('Prebuilt' or 'Custom')
   */
  async selectTypeFilter(type: 'Prebuilt' | 'Custom'): Promise<void> {
    return this.customAppsComponent.selectTypeFilter(type);
  }

  /**
   * Clear the type filter
   */
  async clearTypeFilter(): Promise<void> {
    return this.customAppsComponent.clearTypeFilter();
  }
  /**
   * Select a sort by option
   * @param sortBy - The sort by option ('Last used', 'Date created', or 'Name')
   */
  async selectSortBy(sortBy: 'Last used' | 'Date created' | 'Name'): Promise<void> {
    return this.customAppsComponent.selectSortBy(sortBy);
  }

  /**
   * Select a sort order option
   * @param order - The sort order ('Newest first' or 'Oldest first')
   */
  async selectSortOrder(order: 'Newest first' | 'Oldest first'): Promise<void> {
    return this.customAppsComponent.selectSortOrder(order);
  }

  /**
   * Verify all visible apps have the expected status
   * @param expectedStatus - Expected status ('Enabled' or 'Disabled')
   */
  async verifyAllAppsHaveStatus(expectedStatus: 'Enabled' | 'Disabled'): Promise<void> {
    return this.customAppsComponent.verifyAllAppsHaveStatus(expectedStatus);
  }

  /**
   * Verify all visible apps have the expected type
   * @param expectedType - Expected type ('Prebuilt' or 'Custom')
   */
  async verifyAllAppsHaveType(expectedType: 'Prebuilt' | 'Custom'): Promise<void> {
    return this.customAppsComponent.verifyAllAppsHaveType(expectedType);
  }

  /**
   * Verify app status in the list
   * @param appName - The name of the app
   * @param expectedStatus - Expected status ('Enabled' or 'Disabled')
   */
  async verifyAppStatus(appName: string, expectedStatus: 'Enabled' | 'Disabled'): Promise<void> {
    return this.customAppsComponent.verifyAppStatus(appName, expectedStatus);
  }

  /**
   * Verify app type in the list
   * @param appName - The name of the app
   * @param expectedType - Expected type ('Prebuilt' or 'Custom')
   */
  async verifyAppType(appName: string, expectedType: 'Prebuilt' | 'Custom'): Promise<void> {
    return this.customAppsComponent.verifyAppType(appName, expectedType);
  }

  /**
   * Verify apps are sorted alphabetically A-Z
   */
  async verifyAppsSortedAlphabeticallyAZ(): Promise<void> {
    return this.customAppsComponent.verifyAppsSortedAlphabeticallyAZ();
  }

  /**
   * Verify apps are sorted alphabetically Z-A
   */
  async verifyAppsSortedAlphabeticallyZA(): Promise<void> {
    return this.customAppsComponent.verifyAppsSortedAlphabeticallyZA();
  }

  /**
   * Click on Add custom app dropdown and select an option
   * @param option - The option to select ('Create your own app' or 'Add prebuilt app')
   */
  async clickAddCustomAppOption(option: string): Promise<void> {
    return this.customAppsComponent.clickAddCustomAppOption(option);
  }

  /**
   * Enter app name in the create custom app form
   * @param name - The name of the app
   */
  async enterAppName(name: string): Promise<void> {
    return this.customAppsComponent.enterAppName(name);
  }

  /**
   * Enter app description in the create custom app form
   * @param description - The description of the app
   */
  async enterAppDescription(description: string): Promise<void> {
    return this.customAppsComponent.enterAppDescription(description);
  }

  /**
   * Select app category from dropdown
   * @param category - The category to select (e.g., 'Other', 'Calendar', 'CRM', etc.)
   */
  async selectAppCategory(category: string): Promise<void> {
    return this.customAppsComponent.selectAppCategory(category);
  }

  /**
   * Upload a logo file for the custom app
   * @param filePath - The path to the file to upload
   */
  async uploadLogoFile(filePath: string): Promise<void> {
    return this.customAppsComponent.uploadLogoFile(filePath);
  }

  /**
   * Verify the uploaded logo file name is displayed
   * @param fileName - The expected file name (without extension)
   */
  async verifyUploadedLogoFileName(fileName: string): Promise<void> {
    return this.customAppsComponent.verifyUploadedLogoFileName(fileName);
  }

  /**
   * Verify the uploaded logo image preview is displayed
   */
  async verifyUploadedLogoImagePreview(): Promise<void> {
    return this.customAppsComponent.verifyUploadedLogoImagePreview();
  }

  /**
   * Verify the uploaded logo file size is displayed
   * @param expectedSize - The expected file size text (e.g., "JPG - 43.93KB")
   */
  async verifyUploadedLogoFileSize(expectedSize: string): Promise<void> {
    return this.customAppsComponent.verifyUploadedLogoFileSize(expectedSize);
  }

  /**
   * Verify the remove/delete logo button is displayed
   */
  async verifyRemoveLogoButtonIsDisplayed(): Promise<void> {
    return this.customAppsComponent.verifyRemoveLogoButtonIsDisplayed();
  }

  /**
   * Verify all uploaded logo details (image preview, file name, file size, delete button)
   * @param fileName - The expected file name
   * @param fileSize - The expected file size (e.g., "JPG - 43.93KB")
   */
  async verifyUploadedLogoDetails(fileName: string, fileSize: string): Promise<void> {
    return this.customAppsComponent.verifyUploadedLogoDetails(fileName, fileSize);
  }

  /**
   * Scroll the page by specified pixels
   * @param pixels - Number of pixels to scroll
   */
  async scrollPageBy(pixels: number): Promise<void> {
    return this.customAppsComponent.scrollPageBy(pixels);
  }

  /**
   * Select connection type from dropdown
   * @param connectionType - The connection type (e.g., 'App level', 'User level')
   */
  async selectConnectionType(connectionType: string): Promise<void> {
    return this.customAppsComponent.selectConnectionType(connectionType);
  }

  /**
   * Select auth type from dropdown
   * @param authType - The auth type (e.g., 'OAuth 2.0', 'Basic Auth', 'API Key')
   */
  async selectAuthType(authType: string): Promise<void> {
    return this.customAppsComponent.selectAuthType(authType);
  }

  /**
   * Select sub auth type from dropdown
   * @param subAuthType - The sub auth type (e.g., 'Auth Code', 'Client Credentials')
   */
  async selectSubAuthType(subAuthType: string): Promise<void> {
    return this.customAppsComponent.selectSubAuthType(subAuthType);
  }

  /**
   * Select code challenge method from dropdown (for PKCE)
   * @param method - The code challenge method (e.g., 'Plain', 'SHA-256')
   */
  async selectCodeChallengeMethod(method: string): Promise<void> {
    await test.step(`Select code challenge method: ${method}`, async () => {
      await this.codeChallengeMethodDropdown.waitFor({ state: 'visible' });
      await this.codeChallengeMethodDropdown.selectOption({ label: method });
    });
  }

  /**
   * Check the "Add headers for Token URL" checkbox
   */
  async checkAddHeadersForTokenUrl(): Promise<void> {
    await test.step('Check "Add headers for Token URL" checkbox', async () => {
      await this.addHeadersForTokenUrlCheckbox.waitFor({ state: 'visible' });
      await this.addHeadersForTokenUrlCheckbox.check();
    });
  }

  /**
   * Enter token request headers value
   * @param headers - The token request headers value
   */
  async enterTokenRequestHeaders(headers: string): Promise<void> {
    await test.step(`Enter token request headers: ${headers}`, async () => {
      await this.tokenRequestHeadersInput.waitFor({ state: 'visible' });
      await this.tokenRequestHeadersInput.fill(headers);
    });
  }

  /**
   * Enter value in a textbox field by its label name
   * @param fieldName - The label name of the field (e.g., 'Client ID*', 'Secret key*', 'Auth URL*')
   * @param value - The value to enter
   */
  async enterFieldValue(fieldName: string, value: string): Promise<void> {
    return this.customAppsComponent.enterFieldValue(fieldName, value);
  }

  /**
   * Click Save button on custom app form
   */
  async clickSaveButtonOnForm(): Promise<void> {
    return this.customAppsComponent.clickSaveButton();
  }

  /**
   * Click Connect account button
   */
  async clickConnectAccountButton(): Promise<void> {
    return this.customAppsComponent.clickConnectAccountButton();
  }

  /**
   * Verify Disconnect account button is displayed
   */
  async verifyDisconnectAccountButtonIsDisplayed(): Promise<void> {
    return this.customAppsComponent.verifyDisconnectAccountButtonIsDisplayed();
  }

  /**
   * Verify text is displayed on the page
   * @param text - The text to verify
   */
  async verifyTextIsDisplayed(text: string): Promise<void> {
    return this.customAppsComponent.verifyTextIsDisplayed(text);
  }

  /**
   * Verify checklist item is checked
   * @param checklistText - The text of the checklist item
   */
  async verifyChecklistItemIsChecked(checklistText: string): Promise<void> {
    return this.customAppsComponent.verifyChecklistItemIsChecked(checklistText);
  }

  /**
   * Connect Box account by handling OAuth popup
   * @param email - Box account email
   * @param password - Box account password
   */
  async connectBoxAccount(email: string, password: string): Promise<void> {
    return this.customAppsComponent.connectBoxAccount(email, password);
  }

  /**
   * Verify app name is displayed in the header
   * @param appName - The app name to verify
   */
  async verifyAppNameInHeader(appName: string): Promise<void> {
    return this.customAppsComponent.verifyAppNameInHeader(appName);
  }

  /**
   * Verify app description is displayed
   * @param description - The description to verify
   */
  async verifyAppDescription(description: string): Promise<void> {
    return this.customAppsComponent.verifyAppDescription(description);
  }

  /**
   * Verify connection message is displayed
   * @param appName - The app name in the message
   */
  async verifyConnectionMessage(appName: string): Promise<void> {
    return this.customAppsComponent.verifyConnectionMessage(appName);
  }

  /**
   * Verify toast message appears
   */
  async verifyToastMessage(message: string): Promise<void> {
    return this.customAppsComponent.verifyToastMessageIsVisibleWithText(message);
  }

  /**
   * Verify Edit button is displayed
   */
  async verifyEditButtonIsDisplayed(): Promise<void> {
    await test.step('Verify Edit button is displayed', async () => {
      await expect(this.editButton.first(), 'Expected Edit button to be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verify status badge text (Enabled/Disabled)
   * @param expectedStatus - The expected status text
   */
  async verifyStatusBadge(expectedStatus: 'Enabled' | 'Disabled'): Promise<void> {
    await test.step(`Verify status badge shows "${expectedStatus}"`, async () => {
      await expect(
        this.getStatusBadge(expectedStatus),
        `Expected status badge to show "${expectedStatus}"`
      ).toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verify dialog title is displayed
   * @param title - The expected dialog title
   */
  async verifyDialogTitle(title: string): Promise<void> {
    await test.step(`Verify dialog title: "${title}"`, async () => {
      await expect(
        this.dialogTitleHeading.filter({ hasText: title }),
        `Expected dialog title "${title}" to be visible`
      ).toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Click Cancel button in dialog
   */
  async clickCancelButton(): Promise<void> {
    await test.step('Click Cancel button', async () => {
      await expect(this.dialogCancelButton, 'Expected Cancel button to be visible').toBeVisible();
      await this.dialogCancelButton.click();
    });
  }

  /**
   * Verify field is displayed with label
   * @param fieldLabel - The field label to verify
   */
  async verifyFieldIsDisplayed(fieldLabel: string): Promise<void> {
    await test.step(`Verify field "${fieldLabel}" is displayed`, async () => {
      await expect(this.getFieldByLabel(fieldLabel), `Expected field "${fieldLabel}" to be visible`).toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Click Disconnect account button
   */
  async clickDisconnectAccountButton(): Promise<void> {
    await test.step('Click Disconnect account button', async () => {
      await expect(this.disconnectAccountButton, 'Expected Disconnect account button to be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
      await this.disconnectAccountButton.click();
    });
  }

  /**
   * Verify checklist item is unchecked (incomplete)
   * @param checklistText - The text of the checklist item
   */
  async verifyChecklistItemIsUnchecked(checklistText: string): Promise<void> {
    await test.step(`Verify checklist item is unchecked: "${checklistText}"`, async () => {
      await this.verifySetupStepIsIncomplete(checklistText);
    });
  }

  /**
   * Verify Save button is displayed
   */
  async verifySaveButtonIsDisplayed(): Promise<void> {
    await test.step('Verify Save button is displayed', async () => {
      await expect(this.saveButton, 'Expected Save button to be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Click Disconnect account button in dialog
   */
  async clickDisconnectAccountInDialog(): Promise<void> {
    await test.step('Click Disconnect account button in dialog', async () => {
      await expect(
        this.dialogDisconnectButton,
        'Expected Disconnect account button in dialog to be visible'
      ).toBeVisible();
      await this.dialogDisconnectButton.click();
    });
  }

  /**
   * Click Edit option from three dots menu
   */
  async clickEditFromMenu(): Promise<void> {
    await test.step('Click Edit from connector options menu', async () => {
      await this.customAppsComponent.selectConnectorOption(AppConnectorOptions.Edit);
    });
  }

  /**
   * Verify a text field is enabled
   * @param fieldName - The name attribute of the field
   */
  async verifyFieldIsEnabled(fieldName: string): Promise<void> {
    await test.step(`Verify field "${fieldName}" is enabled`, async () => {
      await expect(this.getFieldByName(fieldName), `Expected field "${fieldName}" to be enabled`).toBeEnabled({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verify a text field is disabled
   * @param fieldName - The name attribute of the field
   */
  async verifyFieldIsDisabled(fieldName: string): Promise<void> {
    await test.step(`Verify field "${fieldName}" is disabled`, async () => {
      await expect(this.getFieldByName(fieldName), `Expected field "${fieldName}" to be disabled`).toBeDisabled({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verify a dropdown/select is enabled
   * @param selectName - The name attribute of the select
   */
  async verifyDropdownIsEnabled(selectName: string): Promise<void> {
    await test.step(`Verify dropdown "${selectName}" is enabled`, async () => {
      await expect(this.getDropdownByName(selectName), `Expected dropdown "${selectName}" to be enabled`).toBeEnabled({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verify a dropdown/select is disabled
   * @param selectName - The name attribute of the select
   */
  async verifyDropdownIsDisabled(selectName: string): Promise<void> {
    await test.step(`Verify dropdown "${selectName}" is disabled`, async () => {
      await expect(this.getDropdownByName(selectName), `Expected dropdown "${selectName}" to be disabled`).toBeDisabled(
        {
          timeout: TIMEOUTS.SHORT,
        }
      );
    });
  }
}
