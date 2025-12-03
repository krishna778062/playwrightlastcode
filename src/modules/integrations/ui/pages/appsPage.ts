import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

export interface IAppsPageActions {
  navigateToAppsPage: () => Promise<void>;
  clickAddIntegrationButton: () => Promise<void>;
  searchForIntegration: (integrationName: string) => Promise<void>;
  selectIntegrationFromList: (integrationName: string) => Promise<void>;
  enterConnectionName: (connectionName: string) => Promise<void>;
  clickBrowseButton: () => Promise<void>;
  selectAudienceFromList: (audienceName: string) => Promise<void>;
  clickDoneButton: () => Promise<void>;
  clickAddButton: () => Promise<void>;
  clearConnectionName: () => Promise<void>;
  navigateToIntegrationsTab: () => Promise<void>;
  navigateToAppsTab: () => Promise<void>;
}

export interface IAppsPageAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyAddIntegrationButtonIsVisible: () => Promise<void>;
  verifySearchFieldIsVisible: () => Promise<void>;
  verifyConnectionNameFieldIsVisible: () => Promise<void>;
  verifyIntegrationIsAddedSuccessfully: (connectionName: string) => Promise<void>;
  verifyConnectionNameErrorMessage: () => Promise<void>;
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
  readonly integrationCardButton: (integrationName: string) => Locator;

  // Connection form elements
  readonly connectionNameField: Locator;
  readonly browseButton: Locator;
  readonly audienceDropdown: Locator;
  readonly doneButton: Locator;
  readonly addButton: Locator;

  // Validation elements
  readonly connectionNameErrorMessage: Locator;
  readonly successToastMessage: Locator;

  constructor(page: Page) {
    super(page, '/manage/app/integrations/apps');

    // Main navigation elements
    this.applicationSettingsMenuItem = page.getByRole('menuitem', { name: 'Application settings', exact: true });
    this.applicationButton = page.getByRole('button', { name: 'Application' });
    this.integrationsTab = page.getByRole('tab', { name: 'Integrations' });
    this.appsTab = page.getByRole('tab', { name: 'Apps', exact: true });
    this.addIntegrationButton = page.getByRole('button', { name: 'Add integration' });

    // Search and selection
    this.searchField = page.getByRole('textbox', { name: 'Search' });
    this.integrationCardButton = (integrationName: string) =>
      page.getByRole('button', { name: new RegExp(`.*${integrationName}.*`, 'i') });

    // Connection form
    this.connectionNameField = page.getByRole('textbox', { name: 'Connection name *' });
    this.browseButton = page.getByRole('button', { name: 'Browse' });
    this.audienceDropdown = page.locator('.css-19bb58m');
    this.doneButton = page.getByRole('button', { name: 'Done' });
    this.addButton = page.getByRole('button', { name: 'Add', exact: true });

    // Validation messages
    this.connectionNameErrorMessage = page.locator(
      'text=/Connection name is required|Please enter a connection name/i'
    );
    this.successToastMessage = page.locator('[role="alert"]');
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
      await this.verifier.verifyTheElementIsVisible(this.appsTab, {
        timeout: 15_000,
        assertionMessage: 'Verifying Apps tab is visible',
      });
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
      const integrationCard = this.integrationCardButton(integrationName);
      await this.clickOnElement(integrationCard, {
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
  async selectAudienceFromList(audienceName: string): Promise<void> {
    await test.step(`Select audience: "${audienceName}"`, async () => {
      await this.audienceDropdown.click();
      const audienceOption = this.page.getByRole('menuitem', { name: audienceName }).first();
      await this.clickOnElement(audienceOption, {
        stepInfo: `Selecting audience: ${audienceName}`,
      });
    });
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

      // Verify the integration appears in the list
      const integrationInList = this.page.locator(`text="${connectionName}"`);
      await this.verifier.verifyTheElementIsVisible(integrationInList, {
        timeout: 15_000,
        assertionMessage: `Integration "${connectionName}" should be visible in the list`,
      });
    });
  }

  /**
   * Add a complete integration with all required fields
   */
  async addIntegrationWithDetails(
    integrationName: string,
    connectionName: string,
    audienceName: string
  ): Promise<void> {
    await test.step(`Add integration: ${integrationName} with connection name: ${connectionName}`, async () => {
      await this.clickAddIntegrationButton();
      await this.searchForIntegration(integrationName);
      await this.selectIntegrationFromList(integrationName);
      await this.enterConnectionName(connectionName);
      await this.clickBrowseButton();
      await this.selectAudienceFromList(audienceName);
      await this.clickDoneButton();
      await this.clickAddButton();
    });
  }
}
