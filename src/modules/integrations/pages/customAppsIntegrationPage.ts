import { Locator, Page, test } from '@playwright/test';
import { expect } from '@playwright/test';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';
import { AppConnectorOptions, CustomAppsListComponent } from '@integrations/components/customAppsListComponent';
import { AIRTABLE_AUTH_DATA } from '@integrations/test-data/app-tiles.test-data';

export enum CustomAppType {
  CREATE_OWN_APP = 'Create your own app',
  ADD_PREBUILT_APP = 'Add prebuilt app',
}

export class CustomAppsIntegrationPage extends BasePage {
  readonly resultListAppTilesItemCountLocator: Locator;
  readonly customAppsListComponent: CustomAppsListComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CUSTOM_APPS_INTEGRATION_PAGE);
    this.resultListAppTilesItemCountLocator = page.locator('div[class*="ConnectorsList_resultCount"]');
    this.customAppsListComponent = new CustomAppsListComponent(page);
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

      const saveButton = this.page.locator('button:has-text("Save")');
      await expect(saveButton).toBeVisible({ timeout: 10000 });
      await saveButton.click();
    });
  }

  /**
   * Verify toast message
   * @param message - The message to verify
   * @returns void
   */
  async verifyToastMessage(message: string): Promise<void> {
    return this.customAppsListComponent.verifyToastMessage(message);
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

  async addPrebuiltApp(appName: string) {
    await test.step(`Add prebuilt app of type ${appName}`, async () => {
      await this.customAppsListComponent.clickAddCustomAppOption(CustomAppType.ADD_PREBUILT_APP);
      await this.customAppsListComponent.searchForPrebuiltApp(appName);
      await this.customAppsListComponent.clickAddPrebuilt(appName);
      await this.page.waitForURL(/new/);
    });
  }
}
