import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { SERVICE_NOW_VALUES } from '@/src/modules/integrations/test-data/app-tiles.test-data';

export enum IntegrationStatus {
  ENABLED = 'Enabled',
  DISABLED = 'Disabled',
}

export interface IAppsPageActions {
  navigateToAppsPage: () => Promise<void>;
  clickAddIntegrationButton: () => Promise<void>;
  searchForIntegration: (integrationName: string) => Promise<void>;
  selectIntegrationFromList: (integrationName: string) => Promise<void>;
  enterConnectionName: (connectionName: string) => Promise<void>;
  clickBrowseButton: () => Promise<void>;
  selectAudience: () => Promise<void>;
  clickDoneButton: () => Promise<void>;
  clickAddButton: () => Promise<void>;
  clearConnectionName: () => Promise<void>;
  navigateToIntegrationsTab: () => Promise<void>;
  navigateToAppsTab: () => Promise<void>;
  addIntegration: (integrationName: string, connectionName: string) => Promise<void>;
}

export interface IAppsPageAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyAddIntegrationButtonIsVisible: () => Promise<void>;
  verifySearchFieldIsVisible: () => Promise<void>;
  verifyConnectionNameFieldIsVisible: () => Promise<void>;
  verifyIntegrationIsAddedSuccessfully: (connectionName: string) => Promise<void>;
  verifyConnectionNameErrorMessage: () => Promise<void>;
  verifyIntegrationStatus: (connectionName: string, expectedStatus: IntegrationStatus) => Promise<void>;
  getIntegrationStatus: (connectionName: string) => Promise<IntegrationStatus>;
  isIntegrationEnabled: (connectionName: string) => Promise<boolean>;
}

export class AppsPage extends BasePage implements IAppsPageActions, IAppsPageAssertions {
  // Main page elements
  readonly applicationSettingsMenuItem: Locator;
  readonly applicationButton: Locator;
  readonly integrationsTab: Locator;
  readonly appsTab: Locator;
  readonly addIntegrationButton: Locator;

  // Search and selection elements
  readonly searchField: Locator;

  // Connection form elements
  readonly connectionNameField: Locator;
  readonly browseButton: Locator;
  readonly selectAudienceButton: Locator;
  readonly doneButton: Locator;
  readonly addButton: Locator;

  // Validation elements
  readonly connectionNameErrorMessage: Locator;
  readonly successToastMessage: Locator;

  // ServiceNow credentials elements
  readonly serviceNowConsumerKey: Locator;
  readonly serviceNowSecretKey: Locator;
  readonly serviceNowUrl: Locator;
  readonly saveButton: Locator;
  readonly serviceNowUserName: Locator;
  readonly serviceNowPassword: Locator;
  readonly serviceNowLoginButton: Locator;
  readonly allowAccessButton: Locator;
  readonly serviceNowConnectServiceAccountButton: Locator;
  readonly serviceNowDisconnectServiceAccountButton: Locator;

  // Integration card in the list (dynamic locator)
  readonly integrationCard: (connectionName: string) => Locator;
  readonly integrationCardEnabled: (connectionName: string) => Locator;
  readonly integrationCardDisabled: (connectionName: string) => Locator;

  constructor(page: Page) {
    super(page, '/manage/app/integrations/apps');

    // Main navigation elements
    this.applicationSettingsMenuItem = page.getByRole('menuitem', { name: 'Application settings', exact: true });
    this.applicationButton = page.getByRole('button', { name: 'Application' });
    this.integrationsTab = page.getByRole('tab', { name: 'Integrations' });
    this.appsTab = page.getByRole('tab', { name: 'Apps', exact: true });
    this.addIntegrationButton = page.getByRole('button', { name: 'Add integration' });
    this.serviceNowConsumerKey = page.getByPlaceholder('Enter ServiceNow consumer key');
    this.serviceNowSecretKey = page.getByPlaceholder('Enter ServiceNow secret key');
    this.serviceNowUrl = page.getByPlaceholder('Enter ServiceNow URL');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.serviceNowUserName = page.locator('#user_name');
    this.serviceNowPassword = page.locator('#user_password');
    this.serviceNowLoginButton = page.locator('[id="sysverb_login"]');
    this.allowAccessButton = page.locator('[name="oauth_auth_check_action"]').nth(1);
    this.serviceNowConnectServiceAccountButton = page.locator(
      'h2:has-text("ServiceNow") >> xpath=ancestor::div[contains(@class,"Distribute-module")]//button[contains(.,"Connect service account")]'
    );
    this.serviceNowDisconnectServiceAccountButton = page.locator(
      'h2:has-text("ServiceNow") >> xpath=ancestor::div[contains(@class,"Distribute-module")]//button[contains(.,"Disconnect account")]'
    );

    // Search and selection
    this.searchField = page.getByRole('textbox', { name: 'Search' });

    // Connection form
    this.connectionNameField = page.getByPlaceholder('Enter connection name');
    this.browseButton = page.getByRole('button', { name: 'Browse' });
    this.selectAudienceButton = page.getByRole('switch');
    this.doneButton = page.getByRole('button', { name: 'Done' });
    this.addButton = page.getByRole('button', { name: 'Add', exact: true });

    // Validation messages
    this.connectionNameErrorMessage = page.locator(
      'text=/Connection name is required|Please enter a connection name/i'
    );
    this.successToastMessage = page.locator('[role="alert"]');

    // Integration card in the list - matches button with aria-label containing connection name
    // Element: <button aria-label="Servicenow Test12 - Enabled" ...>
    this.integrationCard = (connectionName: string) =>
      page.getByRole('button', { name: new RegExp(`${connectionName}.*`, 'i') });

    // Integration card with Enabled status
    // Matches: aria-label="ConnectionName - Enabled"
    this.integrationCardEnabled = (connectionName: string) =>
      page.getByRole('button', { name: new RegExp(`${connectionName}\\s*-\\s*Enabled`, 'i') });

    // Integration card with Disabled status
    // Matches: aria-label="ConnectionName - Disabled"
    this.integrationCardDisabled = (connectionName: string) =>
      page.getByRole('button', { name: new RegExp(`${connectionName}\\s*-\\s*Disabled`, 'i') });
  }

  get actions(): IAppsPageActions {
    return this;
  }

  get assertions(): IAppsPageAssertions {
    return this;
  }

  /**
   * Navigate to the Apps page under Integrations
   */
  async navigateToAppsPage(): Promise<void> {
    await test.step('Navigate to Apps page under Integrations', async () => {
      await this.applicationSettingsMenuItem.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.applicationButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.integrationsTab.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.appsTab.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Navigate to Integrations tab
   */
  async navigateToIntegrationsTab(): Promise<void> {
    await test.step('Navigate to Integrations tab', async () => {
      await this.integrationsTab.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Navigate to Apps tab
   */
  async navigateToAppsTab(): Promise<void> {
    await test.step('Navigate to Apps tab', async () => {
      await this.appsTab.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Verify the Apps page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the Apps page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addIntegrationButton, {
        timeout: 15_000,
        assertionMessage: 'Verifying Add Integration button is visible',
      });
    });
  }

  /**
   * Verify Add Integration button is visible
   */
  async verifyAddIntegrationButtonIsVisible(): Promise<void> {
    await test.step('Verify Add Integration button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addIntegrationButton, {
        timeout: 10_000,
        assertionMessage: 'Add Integration button should be visible',
      });
    });
  }

  /**
   * Click on Add Integration button
   */
  async clickAddIntegrationButton(): Promise<void> {
    await test.step('Click on Add Integration button', async () => {
      await this.clickOnElement(this.addIntegrationButton, {
        stepInfo: 'Clicking Add Integration button',
      });
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Verify search field is visible
   */
  async verifySearchFieldIsVisible(): Promise<void> {
    await test.step('Verify search field is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.searchField, {
        timeout: 10_000,
        assertionMessage: 'Search field should be visible',
      });
    });
  }

  /**
   * Search for an integration by name
   */
  async searchForIntegration(integrationName: string): Promise<void> {
    await test.step(`Search for integration: "${integrationName}"`, async () => {
      await this.searchField.waitFor({ state: 'visible', timeout: 10_000 });
      await this.searchField.click();
      await this.searchField.fill(integrationName);
      await this.page.waitForTimeout(1000); // Wait for search results to filter
    });
  }

  /**
   * Select an integration from the search results
   */
  async selectIntegrationFromList(integrationName: string): Promise<void> {
    await test.step(`Select integration: "${integrationName}"`, async () => {
      const integrationCardButton = this.integrationCard(integrationName);
      await this.clickOnElement(integrationCardButton, {
        stepInfo: `Clicking on ${integrationName} integration card`,
      });
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Verify connection name field is visible
   */
  async verifyConnectionNameFieldIsVisible(): Promise<void> {
    await test.step('Verify connection name field is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.connectionNameField, {
        timeout: 10_000,
        assertionMessage: 'Connection name field should be visible',
      });
    });
  }

  /**
   * Enter connection name
   */
  async enterConnectionName(connectionName: string): Promise<void> {
    await test.step(`Enter connection name: "${connectionName}"`, async () => {
      await this.connectionNameField.waitFor({ state: 'visible', timeout: 10_000 });
      await this.connectionNameField.click();
      await this.connectionNameField.fill(connectionName);
    });
  }

  /**
   * Clear connection name field
   */
  async clearConnectionName(): Promise<void> {
    await test.step('Clear connection name field', async () => {
      await this.connectionNameField.waitFor({ state: 'visible', timeout: 10_000 });
      await this.connectionNameField.click();
      await this.connectionNameField.clear();
    });
  }

  /**
   * Click on Browse button to select audience
   */
  async clickBrowseButton(): Promise<void> {
    await test.step('Click on Browse button', async () => {
      await this.clickOnElement(this.browseButton, {
        stepInfo: 'Clicking Browse button to select audience',
      });
      await this.page.waitForTimeout(500);
    });
  }

  /**
   * Select audience from the dropdown list
   */
  async selectAudience(): Promise<void> {
    await this.clickOnElement(this.selectAudienceButton, {
      stepInfo: 'Clicking Select Audience button to select audience',
    });
    await this.page.waitForTimeout(500); // Wait for audience to be selected
  }

  /**
   * Click Done button
   */
  async clickDoneButton(): Promise<void> {
    await test.step('Click Done button', async () => {
      await this.clickOnElement(this.doneButton, {
        stepInfo: 'Clicking Done button',
      });
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Click Add button to submit the form
   */
  async clickAddButton(): Promise<void> {
    await test.step('Click Add button to create integration', async () => {
      await this.clickOnElement(this.addButton, {
        stepInfo: 'Clicking Add button to submit integration',
      });
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Verify connection name error message is displayed
   */
  async verifyConnectionNameErrorMessage(): Promise<void> {
    await test.step('Verify connection name error message is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.connectionNameErrorMessage, {
        timeout: 10_000,
        assertionMessage: 'Connection name error message should be visible',
      });
    });
  }

  /**
   * Verify integration is added successfully
   */
  async verifyIntegrationIsAddedSuccessfully(connectionName: string): Promise<void> {
    await test.step(`Verify integration "${connectionName}" is added successfully`, async () => {
      // Wait for success message or page to update
      await this.page.waitForTimeout(2000);
      await this.page.waitForLoadState('domcontentloaded');

      // Verify the integration appears in the list using the integrationCard locator
      const integrationInList = this.integrationCard(connectionName);
      await this.verifier.verifyTheElementIsVisible(integrationInList, {
        timeout: 15_000,
        assertionMessage: `Integration "${connectionName}" should be visible in the list`,
      });
    });
  }

  async addIntegration(integrationName: string, connectionName: string): Promise<void> {
    await test.step(`Add integration: ${integrationName} with connection name: ${connectionName}`, async () => {
      await this.clickAddIntegrationButton();
      await this.searchForIntegration(integrationName);
      await this.selectIntegrationFromList(integrationName);
      await this.enterConnectionName(connectionName);
      await this.clickBrowseButton();
      await this.selectAudience();
      await this.clickDoneButton();
      await this.clickAddButton();
    });
  }

  async enterServiceNowCredentials(credentials: {
    consumerKey: string;
    secretKey: string;
    url: string;
  }): Promise<void> {
    await test.step('Enter ServiceNow credentials', async () => {
      await this.serviceNowConsumerKey.waitFor({ state: 'visible', timeout: 15_000 });
      await this.serviceNowConsumerKey.fill(credentials.consumerKey);

      await this.serviceNowSecretKey.waitFor({ state: 'visible', timeout: 15_000 });
      await this.serviceNowSecretKey.fill(credentials.secretKey);

      await this.serviceNowUrl.waitFor({ state: 'visible', timeout: 15_000 });
      await this.serviceNowUrl.fill(credentials.url);

      if (await this.saveButton.isEnabled()) {
        await this.saveButton.click();
        await this.page.waitForLoadState('domcontentloaded');
      }
    });
  }

  async connectServiceNowAccount(): Promise<void> {
    await test.step('Connect ServiceNow account', async () => {
      await this.serviceNowConnectServiceAccountButton.waitFor({ state: 'visible', timeout: 15_000 });
      await this.serviceNowConnectServiceAccountButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.serviceNowUserName.waitFor({ state: 'visible', timeout: 15_000 });
      await this.serviceNowUserName.fill(SERVICE_NOW_VALUES.USER_NAME);
      await this.serviceNowPassword.waitFor({ state: 'visible', timeout: 15_000 });
      await this.serviceNowPassword.fill(SERVICE_NOW_VALUES.PASSWORD);
      await this.serviceNowLoginButton.waitFor({ state: 'visible', timeout: 15_000 });
      await this.serviceNowLoginButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.allowAccessButton.waitFor({ state: 'visible', timeout: 15_000 });
      await this.allowAccessButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      await expect(this.serviceNowDisconnectServiceAccountButton).toBeVisible({ timeout: 10_000 });
    });
  }

  /**
   * Verify the integration status (Enabled/Disabled)
   * Checks the aria-label of the integration card button
   * @param connectionName - The name of the integration connection
   * @param expectedStatus - Expected status (IntegrationStatus.ENABLED or IntegrationStatus.DISABLED)
   */
  async verifyIntegrationStatus(connectionName: string, expectedStatus: IntegrationStatus): Promise<void> {
    await test.step(`Verify integration "${connectionName}" status is ${expectedStatus}`, async () => {
      await this.page.waitForLoadState('domcontentloaded');

      const integrationCard =
        expectedStatus === IntegrationStatus.ENABLED
          ? this.integrationCardEnabled(connectionName)
          : this.integrationCardDisabled(connectionName);

      await this.verifier.verifyTheElementIsVisible(integrationCard, {
        timeout: 15_000,
        assertionMessage: `Integration "${connectionName}" should have status: ${expectedStatus}`,
      });
    });
  }

  /**
   * Get the current status of an integration (Enabled/Disabled)
   * @param connectionName - The name of the integration connection
   * @returns IntegrationStatus.ENABLED or IntegrationStatus.DISABLED
   */
  async getIntegrationStatus(connectionName: string): Promise<IntegrationStatus> {
    return await test.step(`Get integration "${connectionName}" status`, async () => {
      await this.page.waitForLoadState('domcontentloaded');

      const enabledCard = this.integrationCardEnabled(connectionName);
      const isEnabled = await enabledCard.isVisible({ timeout: 5000 }).catch(() => false);

      return isEnabled ? IntegrationStatus.ENABLED : IntegrationStatus.DISABLED;
    });
  }

  /**
   * Check if an integration is enabled
   * @param connectionName - The name of the integration connection
   * @returns true if enabled, false if disabled
   */
  async isIntegrationEnabled(connectionName: string): Promise<boolean> {
    return await test.step(`Check if integration "${connectionName}" is enabled`, async () => {
      const status = await this.getIntegrationStatus(connectionName);
      return status === IntegrationStatus.ENABLED;
    });
  }
}
