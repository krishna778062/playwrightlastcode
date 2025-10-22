import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ConfluenceHelper } from '@/src/modules/integrations/apis/helpers/confluenceHelper';

export class SupportAndTicketingPage extends BasePage {
  readonly serviceNowButton: Locator;
  readonly serviceNowConsumerKey: Locator;
  readonly serviceNowSecretKey: Locator;
  readonly serviceNowUrl: Locator;
  readonly disconnectConfluenceButton: Locator;
  readonly confirmButton: Locator;
  readonly connectServiceAccountButton: Locator;
  readonly confluenceChangeuserButton: Locator;
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
    this.confluenceChangeuserButton = page.locator(
      'h2:has-text("Atlassian Confluence") >> xpath=ancestor::div[contains(@class,"Panel-module__panel")]//button[contains(.,"Change user")]'
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
    this.confluenceCustomKnowledgeBaseRadioBtn = page.locator('#confluenceKnowledgeBaseNameRadiocustom');
    this.confluenceDefaultKnowledgeBaseRadioBtn = page.locator('#confluenceKnowledgeBaseNameRadiodefault');
    this.confluenceKnowledgeBaseNameInput = page.locator('#confluenceKnowledgeBaseName');
    this.confluenceAllSpacesRadioBtn = page.getByText('All spaces');
    this.confluenceSelectedSpacesRadioBtn = page.getByText('Select spaces');
    this.confluenceUrl = 'https://simpplrdev.atlassian.net';
  }

  async navigateToSupportAndTicketingPage(): Promise<void> {
    await test.step('Navigate to support and ticketing integrations page', async () => {
      const url = PAGE_ENDPOINTS.SUPPORT_TICKETING_PAGE;
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }

  async clickDisconnectConfluenceButton(): Promise<void> {
    await test.step('Click disconnect confluence button', async () => {
      await this.clickOnElement(this.disconnectConfluenceButton, {
        stepInfo: 'Click disconnect confluence button',
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
      await this.verifier.verifyTheElementIsVisible(this.disconnectConfluenceButton, {
        timeout: 15_000,
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

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify support and ticketing integrations page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.serviceNowButton, {
        timeout: 30_000,
        assertionMessage: 'Verifying support and ticketing integrations page is loaded',
      });
    });
  }

  async verifyConfluenceCheckboxState(state: boolean): Promise<void> {
    await test.step('Verify confluence checkbox is in the desired state', async () => {
      const isChecked = await this.confluenceCheckbox.isChecked();
      expect(isChecked).toBe(state);
    });
  }

  async clickOnConfluenceCheckbox(): Promise<void> {
    await test.step('Click on confluence checkbox', async () => {
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

  async verifyConfluenceEmptyUrlMessageVisible(): Promise<void> {
    await test.step('Verify confluence empty url message is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.confluenceEmptyUrlMessage, {
        timeout: 15_000,
        assertionMessage: 'Verifying confluence empty url message is visible',
      });
    });
  }

  async enterConfluenceUrl(): Promise<void> {
    await test.step('Enter confluence url', async () => {
      await this.confluenceUrlInput.waitFor({ state: 'visible', timeout: 15_000 });

      await this.confluenceUrlInput.fill(this.confluenceUrl);
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async verifyDefaultSelectedConfluenceKnowledgeBaseName(): Promise<void> {
    await test.step('Verify selected knowledge base name', async () => {
      const defaultSelectedKnowledgeBaseName = await this.confluenceDefaultKnowledgeBaseRadioBtn.isChecked();
      console.log('defaultSelectedKnowledgeBaseName', defaultSelectedKnowledgeBaseName);
      expect(defaultSelectedKnowledgeBaseName).toBe(true);
    });
  }

  async selectConfluenceCustomKnowledgeBaseRadioBtn(customKnowledgeBaseName: string): Promise<void> {
    await test.step('Select custom knowledge base radio button', async () => {
      await this.confluenceCustomKnowledgeBaseRadioBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceCustomKnowledgeBaseRadioBtn.click();
      await this.confluenceKnowledgeBaseNameInput.fill(customKnowledgeBaseName);
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async selectConfluenceDefaultKnowledgeBaseRadioBtn(): Promise<void> {
    await test.step('Select default knowledge base radio button', async () => {
      await this.confluenceDefaultKnowledgeBaseRadioBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceDefaultKnowledgeBaseRadioBtn.click();
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      if (await this.saveButton.isEnabled()) {
        await this.saveButton.click();
      }
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async selectConfluenceAllSpacesRadioBtn(): Promise<void> {
    await test.step('Select all spaces radio button', async () => {
      await this.confluenceAllSpacesRadioBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceAllSpacesRadioBtn.click();
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async selectConfluenceSelectedSpacesRadioBtn(): Promise<void> {
    await test.step('Select selected spaces radio button', async () => {
      await this.confluenceSelectedSpacesRadioBtn.waitFor({ state: 'visible', timeout: 15_000 });
      await this.confluenceSelectedSpacesRadioBtn.click();
      await this.saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.saveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async verifyBlankCustomNameForConfluence(): Promise<void> {
    await test.step('Verify blank custom name for confluence', async () => {
      await this.verifier.verifyTheElementIsVisible(this.errorMessageForBlankCustomNameForConfluence, {
        timeout: 15_000,
        assertionMessage: 'Verifying error message for blank custom name for confluence is visible',
      });
    });
  }

  async verifyNotSelectingSearchSpaceForConfluence(): Promise<void> {
    await test.step('Verify not selecting search space for confluence', async () => {
      await this.verifier.verifyTheElementIsVisible(this.errorMessageForNotSelectingSearchSpaceForConfluence, {
        timeout: 15_000,
        assertionMessage: 'Verifying error message for not selecting search space for confluence is visible',
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
}
