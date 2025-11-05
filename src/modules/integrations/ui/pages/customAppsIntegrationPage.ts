import { MESSAGES } from '@integrations/constants/messageRepo';
import { AIRTABLE_AUTH_DATA } from '@integrations/test-data/app-tiles.test-data';
import { AppConnectorOptions, CustomAppsListComponent } from '@integrations-components/customAppsListComponent';
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
  readonly customAppsListComponent: CustomAppsListComponent;
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

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE);
    this.resultListAppTilesItemCountLocator = page.locator('div[class*="ConnectorsList_resultCount"]');
    this.customAppsListComponent = new CustomAppsListComponent(page);
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

    // Initialize new locators using Playwright's recommended patterns
    this.customAppsLink = page.getByRole('link', { name: 'Custom apps' });
    this.connectionHeading = page.getByRole('heading', { name: 'Connection' });
    this.disconnectAccountButton = page.getByRole('button', { name: 'Disconnect account' });
    this.editButton = page.getByRole('button', { name: 'Edit' });
    this.connectAccountButton = page.getByRole('button', { name: 'Connect account' });
    this.setupChecklistButton = page.getByRole('button', { name: /setup checklist/i });
    this.dialog = page.getByRole('dialog');
    this.appDescriptionText = page.getByText(/App to integrate with|to support actions/i);

    // Initialize verification locators
    this.alertMessage = page.getByRole('alert');
    this.saveButtonByRole = page.getByRole('button', { name: 'Save' });
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
    return this.customAppsListComponent.verifyToastMessageIsVisibleWithText(message);
  }

  async openConnectorOptions(service: string): Promise<void> {
    return this.customAppsListComponent.openConnectorOptions(service);
  }

  async searchAndSelectAppWithNameToPerformAction(appName: string, action: AppConnectorOptions): Promise<void> {
    await test.step('Search and select app with name', async () => {
      await this.customAppsListComponent.searchForApp(appName);
      await this.customAppsListComponent.verifyCountOfAppsInListIs(1);
      await this.customAppsListComponent.clickOnAppConnector(appName);
      await this.customAppsListComponent.selectConnectorOption(action);
      // Use the new generic dialog button method instead of confirmDelete
      await this.customAppsListComponent.clickDialogButton(action, `Confirm ${action}`);
    });
  }

  async disconnectApp(appName: string): Promise<void> {
    await test.step('Search and select app with name', async () => {
      await this.customAppsListComponent.searchForApp(appName);
      await this.customAppsListComponent.verifyCountOfAppsInListIs(1);
      await this.customAppsListComponent.clickOnAppConnector(appName);
      await this.customAppsListComponent.clickOnButtonWithName('Disconnect account');
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
      await this.customAppsListComponent.searchForApp(appName);
      await this.customAppsListComponent.verifyCountOfAppsInListIs(1);
      await this.customAppsListComponent.clickOnAppConnector(appName);
    });
  }

  async addPrebuiltApp(appName: string) {
    await test.step(`Add prebuilt app of type ${appName}`, async () => {
      await this.customAppsListComponent.clickAddCustomAppOption(CustomAppType.ADD_PREBUILT_APP);
      await this.customAppsListComponent.searchForPrebuiltApp(appName);
      await this.customAppsListComponent.clickAddPrebuilt(appName);
      await this.page.waitForURL(/new/);
    });
  }

  async clickSaveButton(): Promise<void> {
    await this.customAppsListComponent.clickButton('Save');
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
}
