import { AIRTABLE_AUTH_DATA } from '@integrations/test-data/app-tiles.test-data';
import { AppConnectorOptions, CustomAppsListComponent } from '@integrations-components/customAppsListComponent';
import { Locator, Page, test } from '@playwright/test';
import { expect } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export enum CustomAppType {
  CREATE_OWN_APP = 'Create your own app',
  ADD_PREBUILT_APP = 'Add prebuilt app',
}

export class CustomAppsIntegrationPage extends BasePage {
  readonly resultListAppTilesItemCountLocator: Locator;
  readonly customAppsListComponent: CustomAppsListComponent;
  readonly saveButton: Locator;
  readonly saveButtonSubmit: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE);
    this.resultListAppTilesItemCountLocator = page.locator('div[class*="ConnectorsList_resultCount"]');
    this.customAppsListComponent = new CustomAppsListComponent(page);
    this.saveButton = page.locator('button:has-text("Save")');
    this.saveButtonSubmit = page.locator('button[type="submit"]:has-text("Save")');
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.resultListAppTilesItemCountLocator, {
        timeout: 30_000,
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

      await expect(this.saveButton).toBeVisible({ timeout: 10000 });
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
    await expect(this.saveButton).toBeDisabled({ timeout: 10000 });
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
}
