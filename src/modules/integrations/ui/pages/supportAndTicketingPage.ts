import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ConfluenceHelper } from '@/src/modules/integrations/apis/helpers/confluenceHelper';

export interface IConfluenceActions {
  connectConfluenceServiceAccount: () => Promise<void>;
  disconnectConfluenceServiceAccount: () => Promise<void>;
  toggleConfluenceIntegration: () => Promise<void>;
  selectCustomKnowledgeBaseWithName: (customKnowledgeBaseName: string) => Promise<void>;
  selectDefaultKnowledgeBase: () => Promise<void>;
  selectAllSpacesOption: () => Promise<void>;
  selectSpecificSpacesOption: () => Promise<void>;
  enterConfluenceUrl: () => Promise<void>;
  changeUserConfluenceServiceAccount: (invalidCredentials?: boolean) => Promise<void>;
  changeUserServiceNowServiceAccount: () => Promise<void>;
  reconnectConfluenceServiceAccount: () => Promise<void>;
  reconnectServiceNowServiceAccount: () => Promise<void>;
}

export interface IConfluenceAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyConfluenceServiceAccountConnected: () => Promise<void>;
  verifyConfluenceServiceAccountIsDisconnected: () => Promise<void>;
  verifyConfluenceIntegrationCheckboxState: (expectedState: boolean) => Promise<void>;
  verifyConfluenceUrlIsRequired: () => Promise<void>;
  verifyDefaultKnowledgeBaseIsSelected: () => Promise<void>;
  verifyCustomKnowledgeBaseNameIsRequired: () => Promise<void>;
  verifySearchSpaceSelectionIsRequired: () => Promise<void>;
  isConfluenceServiceAccountConnected: () => Promise<boolean>;
  verifyServiceNowReconnectButtonIsVisible: (isVisible: boolean) => Promise<void>;
  verifyConfluenceReconnectButtonIsVisible: (isVisible: boolean) => Promise<void>;
  verifyConfluenceChangeUserButtonIsVisible: (isVisible: boolean) => Promise<void>;
  verifyServiceNowChangeUserButtonIsVisible: (isVisible: boolean) => Promise<void>;
}

export class SupportAndTicketingPage extends BasePage implements IConfluenceActions, IConfluenceAssertions {
  readonly serviceNowButton: Locator;
  readonly serviceNowConsumerKey: Locator;
  readonly serviceNowSecretKey: Locator;
  readonly serviceNowUrl: Locator;
  readonly disconnectConfluenceButton: Locator;
  readonly confirmButton: Locator;
  readonly connectServiceAccountButton: Locator;
  readonly confluenceChangeuserButton: Locator;
  readonly serviceNowChangeUserButton: Locator;
  readonly confluenceUrlInput: Locator;
  readonly confluenceKnowledgeBaseHeader: Locator;
  readonly confluenceSpacesToDisplayHeader: Locator;
  readonly confluenceShowVPNWarningMessageHeader: Locator;
  readonly confluenceCheckbox: Locator;
  readonly saveButton: Locator;
  readonly confluenceEmptyUrlMessage: Locator;
  readonly confluenceUrl: string;
  readonly errorMessageForBlankCustomNameForConfluence: Locator;
  readonly errorMessageForNotSelectingSearchSpaceForConfluence: Locator;
  readonly confluenceCustomKnowledgeBaseRadioBtn: Locator;
  readonly confluenceDefaultKnowledgeBaseRadioBtn: Locator;
  readonly confluenceKnowledgeBaseNameInput: Locator;
  readonly confluenceAllSpacesRadioBtn: Locator;
  readonly confluenceSelectedSpacesRadioBtn: Locator;
  readonly serviceNowReconnectButton: Locator;
  readonly confluenceReconnectButton: Locator;
  readonly disconnectModalMessage: Locator;

  readonly serviceNowCustomNameRadioButton: Locator;
  readonly serviceNowDefaultNameRadioButton: Locator;
  readonly serviceNowCustomNameInput: Locator;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SUPPORT_TICKETING_PAGE);
    this.serviceNowButton = page.locator('[id="servicenow"]');
    this.serviceNowConsumerKey = page.locator('[data-testid="field-ServiceNow consumer key"]');
    this.serviceNowSecretKey = page.locator('[data-testid="field-ServiceNow secret key"]');
    this.serviceNowUrl = page.locator('[data-testid="field-ServiceNow URL"]');
    this.disconnectConfluenceButton = page.locator(
      'h2:has-text("Atlassian Confluence") >> xpath=ancestor::div[contains(@class,"Panel-module__panel")]//button[contains(.,"Disconnect account")]'
    );
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.connectServiceAccountButton = page.getByRole('button', { name: 'Connect service account' });
    this.serviceNowDefaultNameRadioButton = page.locator('#serviceNowTicketingNameRadiodefault'); // locator for the default name field in the ServiceNow Tickets Page
    this.serviceNowCustomNameRadioButton = page.locator('#serviceNowTicketingNameRadiocustom'); // locator for the custom name field in the ServiceNow Tickets Page
    this.serviceNowCustomNameInput = page.locator('#serviceNowTicketingName'); // locator for the custom name input field in the ServiceNow Tickets Page
    this.confluenceChangeuserButton = page.locator(
      'h2:has-text("Atlassian Confluence") >> xpath=ancestor::div[contains(@class,"Panel-module__panel")]//button[contains(.,"Change user")]'
    );
    this.serviceNowChangeUserButton = page.locator(
      'h2:has-text("ServiceNow") >> xpath=ancestor::div[contains(@class,"Panel-module__panel")]//button[contains(.,"Change user")]'
    );
    this.confluenceUrlInput = page.getByPlaceholder('Enter Atlassian Confluence URL');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.confluenceKnowledgeBaseHeader = page.locator('h5:has-text("Name of Confluence knowledge base")');
    this.confluenceSpacesToDisplayHeader = page.locator('h5:has-text("Spaces to display")');
    this.confluenceShowVPNWarningMessageHeader = page.locator('h5:has-text("Show VPN warning message")');
    this.confluenceCheckbox = page.locator('#confluenceIntegrated');
    this.confluenceEmptyUrlMessage = page.locator('p:has-text("Atlassian Confluence URL is a required field)');
    this.errorMessageForBlankCustomNameForConfluence = page.locator(
      'p:has-text("Confluence knowledge base name is a required field")'
    );
    this.errorMessageForNotSelectingSearchSpaceForConfluence = page.locator(
      'p:has-text("You must select at least one Confluence Space")'
    );
    this.disconnectModalMessage = page.locator(
      'h4:has-text("Disconnecting will permanently remove the main connection and all associated user-level connections. Users will need to reconnect individually after this action. Are you sure you want to continue?")'
    );
    this.confluenceCustomKnowledgeBaseRadioBtn = page.locator('#confluenceKnowledgeBaseNameRadiocustom');
    this.confluenceDefaultKnowledgeBaseRadioBtn = page.locator('#confluenceKnowledgeBaseNameRadiodefault');
    this.confluenceKnowledgeBaseNameInput = page.locator('#confluenceKnowledgeBaseName');
    this.confluenceAllSpacesRadioBtn = page.getByText('All spaces');
    this.confluenceSelectedSpacesRadioBtn = page.getByText('Select spaces');
    this.serviceNowReconnectButton = page.locator(
      'p:has-text("Your ServiceNow connection expired. ") >> button[text="Reconnect"]'
    );
    this.confluenceReconnectButton = page.locator(
      'p:has-text("Your Atlassian Confluence connection expired. ") >> button[text="Reconnect"]'
    );
    this.confluenceUrl = 'https://simpplrdev.atlassian.net';
  }

  get actions(): IConfluenceActions {
    return this;
  }

  get assertions(): IConfluenceAssertions {
    return this;
  }

  async navigateToSupportAndTicketingPage(): Promise<void> {
    await test.step('Navigate to support and ticketing integrations page', async () => {
      const url = PAGE_ENDPOINTS.SUPPORT_TICKETING_PAGE;
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify support and ticketing integrations page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.serviceNowButton, {
        timeout: 30_000,
        assertionMessage: 'Verifying support and ticketing integrations page is loaded',
      });
    });
  }

  async disconnectConfluenceServiceAccount(): Promise<void> {
    await test.step('Click disconnect confluence button', async () => {
      await this.clickOnElement(this.disconnectConfluenceButton, {
        stepInfo: 'Click disconnect confluence button',
      });
      await this.verifier.verifyTheElementIsVisible(this.disconnectModalMessage, {
        timeout: 15_000,
        assertionMessage: 'Verifying disconnect modal message',
      });
      await this.clickOnElement(this.confirmButton, {
        stepInfo: 'Click confirm button',
      });
    });
  }

  async connectConfluenceServiceAccount(): Promise<void> {
    await test.step('Connect confluence service account', async () => {
      await this.confluenceUrlInput.fill(this.confluenceUrl);
      // click save button if enabled
      if (await this.saveButton.isEnabled()) {
        await this.saveButton.click();
      }
      await this.connectServiceAccountButton.click();

      const confluenceHelper = new ConfluenceHelper(this.page);
      await confluenceHelper.handleConfluenceLogin();
    });
  }

  async verifyConfluenceServiceAccountConnected(): Promise<void> {
    await test.step('Verify confluence service account is connected', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.verifier.verifyTheElementIsVisible(this.disconnectConfluenceButton, {
        timeout: 30_000,
        assertionMessage: 'Verifying confluence service account is connected',
      });

      await this.verifier.verifyTheElementIsVisible(this.confluenceChangeuserButton, {
        timeout: 15_000,
        assertionMessage: 'Verifying change user button is visible',
      });

      await this.verifier.verifyTheElementIsVisible(this.confluenceKnowledgeBaseHeader, {
        timeout: 15_000,
        assertionMessage: 'Verifying knowledge base header is visible',
      });

      await this.verifier.verifyTheElementIsVisible(this.confluenceSpacesToDisplayHeader, {
        timeout: 15_000,
        assertionMessage: 'Verifying spaces to display header is visible',
      });

      await this.verifier.verifyTheElementIsVisible(this.confluenceShowVPNWarningMessageHeader, {
        timeout: 15_000,
        assertionMessage: 'Verifying show VPN warning message header is visible',
      });
    });
  }

  async verifyConfluenceServiceAccountIsDisconnected(): Promise<void> {
    await test.step('Verify Atlassian Confluence is disconnected', async () => {
      await this.verifier.verifyTheElementIsVisible(this.connectServiceAccountButton, {
        timeout: 15_000,
        assertionMessage: 'Verifying connect confluence service account button is visible',
      });

      await this.verifier.verifyTheElementIsNotVisible(this.confluenceChangeuserButton, {
        timeout: 15_000,
        assertionMessage: 'Verifying change user button is not visible',
      });
    });
  }

  async isConfluenceServiceAccountConnected(): Promise<boolean> {
    return await test.step('Verify confluence service account is connected', async () => {
      return await this.confluenceChangeuserButton.isVisible();
    });
  }

  async verifyConfluenceIntegrationCheckboxState(expectedState: boolean): Promise<void> {
    await test.step(`Verify Confluence integration checkbox is ${expectedState ? 'checked' : 'unchecked'}`, async () => {
      const isChecked = await this.confluenceCheckbox.isChecked();
      expect(isChecked, `Confluence integration checkbox should be ${expectedState ? 'checked' : 'unchecked'}`).toBe(
        expectedState
      );
    });
  }

  async toggleConfluenceIntegration(): Promise<void> {
    await test.step('Toggle Confluence integration checkbox', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.confluenceCheckbox.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceCheckbox.click({ force: true });
      const isCheckedAfterClick = await this.confluenceCheckbox.isChecked();
      if (isCheckedAfterClick) {
        await this.enterConfluenceUrl();
        return;
      }
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async verifyConfluenceUrlIsRequired(): Promise<void> {
    await test.step('Verify Confluence URL is required', async () => {
      await this.verifier.verifyTheElementIsVisible(this.confluenceEmptyUrlMessage, {
        timeout: 15_000,
        assertionMessage: 'Confluence URL field should show validation error when left empty',
      });
    });
  }

  async enterConfluenceUrl(): Promise<void> {
    await test.step(`Enter Confluence URL: "${this.confluenceUrl}"`, async () => {
      await this.confluenceUrlInput.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceUrlInput.fill(this.confluenceUrl);
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async verifyDefaultKnowledgeBaseIsSelected(): Promise<void> {
    await test.step('Verify default knowledge base option is selected', async () => {
      const isDefaultSelected = await this.confluenceDefaultKnowledgeBaseRadioBtn.isChecked();
      expect(isDefaultSelected, 'Default knowledge base radio button should be selected').toBe(true);
    });
  }

  async selectCustomKnowledgeBaseWithName(customKnowledgeBaseName: string): Promise<void> {
    await test.step(`Select custom knowledge base option with name: "${customKnowledgeBaseName}"`, async () => {
      await this.confluenceCustomKnowledgeBaseRadioBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceCustomKnowledgeBaseRadioBtn.click();
      await this.confluenceKnowledgeBaseNameInput.fill(customKnowledgeBaseName);
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async selectDefaultKnowledgeBase(): Promise<void> {
    await test.step('Select default knowledge base option', async () => {
      await this.confluenceDefaultKnowledgeBaseRadioBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceDefaultKnowledgeBaseRadioBtn.click();
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      if (await this.saveButton.isEnabled()) {
        await this.saveButton.click();
      }
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async selectAllSpacesOption(): Promise<void> {
    await test.step('Select "All spaces" option for Confluence spaces', async () => {
      await this.confluenceAllSpacesRadioBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceAllSpacesRadioBtn.click();
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async selectSpecificSpacesOption(): Promise<void> {
    await test.step('Select "Select spaces" option for Confluence spaces', async () => {
      await this.confluenceSelectedSpacesRadioBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceSelectedSpacesRadioBtn.click();
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async verifyCustomKnowledgeBaseNameIsRequired(): Promise<void> {
    await test.step('Verify custom knowledge base name is required', async () => {
      await this.verifier.verifyTheElementIsVisible(this.errorMessageForBlankCustomNameForConfluence, {
        timeout: 15_000,
        assertionMessage: 'Custom knowledge base name field should show validation error when left blank',
      });
    });
  }

  async changeUserConfluenceServiceAccount(invalidCredentials: boolean = false): Promise<void> {
    await test.step('Change user confluence service account', async () => {
      await this.confluenceChangeuserButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      const confluenceHelper = new ConfluenceHelper(this.page);
      await confluenceHelper.handleConfluenceLogin(invalidCredentials);
      if (invalidCredentials) {
        await this.navigateToSupportAndTicketingPage();
      }
    });
  }

  async changeUserServiceNowServiceAccount(): Promise<void> {
    await test.step('Change user service now service account', async () => {
      await this.serviceNowChangeUserButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async reconnectConfluenceServiceAccount(): Promise<void> {
    await test.step('Reconnect confluence service account', async () => {
      await this.confluenceReconnectButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      const confluenceHelper = new ConfluenceHelper(this.page);
      await confluenceHelper.handleConfluenceLogin();
    });
  }

  async reconnectServiceNowServiceAccount(): Promise<void> {
    await test.step('Reconnect service now service account', async () => {
      await this.serviceNowReconnectButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async verifyConfluenceChangeUserButtonIsVisible(isVisible: boolean): Promise<void> {
    await test.step('Verify confluence change user button is visible', async () => {
      if (isVisible) {
        await this.verifier.verifyTheElementIsVisible(this.confluenceChangeuserButton, {
          timeout: 15_000,
          assertionMessage: 'Verifying confluence change user button is visible',
        });
      } else {
        await this.verifier.verifyTheElementIsNotVisible(this.confluenceChangeuserButton, {
          timeout: 15_000,
          assertionMessage: 'Verifying confluence change user button is not visible',
        });
      }
    });
  }

  async verifyServiceNowChangeUserButtonIsVisible(isVisible: boolean): Promise<void> {
    await test.step('Verify service now change user button is visible', async () => {
      if (isVisible) {
        await this.verifier.verifyTheElementIsVisible(this.serviceNowChangeUserButton, {
          timeout: 15_000,
          assertionMessage: 'Verifying service now change user button is visible',
        });
      } else {
        await this.verifier.verifyTheElementIsNotVisible(this.serviceNowChangeUserButton, {
          timeout: 15_000,
          assertionMessage: 'Verifying service now change user button is not visible',
        });
      }
    });
  }

  async verifyServiceNowReconnectButtonIsVisible(isVisible: boolean): Promise<void> {
    await test.step('Verify service now reconnect button is visible', async () => {
      if (isVisible) {
        await this.verifier.verifyTheElementIsVisible(this.serviceNowReconnectButton, {
          timeout: 15_000,
          assertionMessage: 'Verifying service now reconnect button is visible',
        });
      } else {
        await this.verifier.verifyTheElementIsNotVisible(this.serviceNowReconnectButton, {
          timeout: 15_000,
          assertionMessage: 'Verifying service now reconnect button is not visible',
        });
      }
    });
  }

  async verifyConfluenceReconnectButtonIsVisible(isVisible: boolean): Promise<void> {
    await test.step('Verify confluence reconnect button is visible', async () => {
      if (isVisible) {
        await this.verifier.verifyTheElementIsVisible(this.confluenceReconnectButton, {
          timeout: 15_000,
          assertionMessage: 'Verifying confluence reconnect button is visible',
        });
      } else {
        await this.verifier.verifyTheElementIsNotVisible(this.confluenceReconnectButton, {
          timeout: 15_000,
          assertionMessage: 'Verifying confluence reconnect button is not visible',
        });
      }
    });
  }

  async verifySearchSpaceSelectionIsRequired(): Promise<void> {
    await test.step('Verify at least one search space must be selected', async () => {
      await this.verifier.verifyTheElementIsVisible(this.errorMessageForNotSelectingSearchSpaceForConfluence, {
        timeout: 15_000,
        assertionMessage: 'Search space selection should show validation error when no space is selected',
      });
    });
  }

  async verifyServiceNowFieldsVisible(): Promise<void> {
    await test.step('Verify ServiceNow configuration fields are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.serviceNowConsumerKey, {
        timeout: 15_000,
        assertionMessage: 'Verifying ServiceNow consumer key field is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.serviceNowSecretKey, {
        timeout: 15_000,
        assertionMessage: 'Verifying ServiceNow secret key field is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.serviceNowUrl, {
        timeout: 15_000,
        assertionMessage: 'Verifying ServiceNow URL field is visible',
      });
    });
  }

  async selectCustomNameAndFillValue(customName: string): Promise<void> {
    await test.step(`Select custom name option and fill value: ${customName}`, async () => {
      // Wait for elements to be ready
      await this.serviceNowCustomNameRadioButton.waitFor({ state: 'visible', timeout: 10_000 });
      await this.serviceNowCustomNameInput.waitFor({ state: 'visible', timeout: 10_000 });
      await this.serviceNowDefaultNameRadioButton.waitFor({ state: 'visible', timeout: 10_000 });

      // Check if custom is already selected - if so, switch to default first
      const isCustomAlreadyChecked = await this.serviceNowCustomNameRadioButton.isChecked();

      if (isCustomAlreadyChecked) {
        await test.step('Custom is already selected - switching to default first', async () => {
          await this.serviceNowDefaultNameRadioButton.check();
          await expect(this.serviceNowDefaultNameRadioButton).toBeChecked();
          await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
          if (await this.saveButton.isEnabled()) {
            await this.saveButton.click();
            await this.page.waitForLoadState('domcontentloaded');
          }
        });
      }

      // Now select custom name option
      await this.serviceNowCustomNameRadioButton.check();

      // Verify radio button is selected
      await expect(this.serviceNowCustomNameRadioButton).toBeChecked();

      // Fill the custom name input
      await this.serviceNowCustomNameInput.clear();
      await this.serviceNowCustomNameInput.fill(customName);

      // Verify the value was entered correctly
      await expect(this.serviceNowCustomNameInput).toHaveValue(customName);

      // Wait for save button to be enabled and click
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      if (await this.saveButton.isEnabled()) {
        await this.saveButton.click();
        await this.page.waitForLoadState('domcontentloaded');
      }
    });
  }

  async selectDefaultName(): Promise<void> {
    await test.step('Select default name option', async () => {
      await this.serviceNowDefaultNameRadioButton.waitFor({ state: 'visible', timeout: 15_000 });
      await this.serviceNowDefaultNameRadioButton.click();
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      if (await this.saveButton.isEnabled()) {
        await this.saveButton.click();
        await this.page.waitForLoadState('domcontentloaded');
      }
    });
  }
}
