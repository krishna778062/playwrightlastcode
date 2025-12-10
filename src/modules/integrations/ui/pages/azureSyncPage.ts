import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { AzureSyncingComponent } from '@/src/modules/integrations/ui/components/azureSyncComponent';

export class AzureSyncingPage extends BasePage {
  readonly azureSyncingComponent: AzureSyncingComponent;
  readonly scheduledSources: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PEOPLE_DATA_PAGE);
    this.scheduledSources = page.getByRole('heading', { name: 'Scheduled sources' });
    this.azureSyncingComponent = new AzureSyncingComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.scheduledSources, {
        timeout: 30_000,
        assertionMessage: 'Verifying the page is loaded',
      });
    });
  }

  async clickOnTab(text: string): Promise<void> {
    return this.azureSyncingComponent.clickOnTab(text);
  }

  async setLoginIdentifierState(checkboxId: string, shouldBeChecked: boolean): Promise<void> {
    return this.azureSyncingComponent.setCheckboxState(checkboxId, shouldBeChecked);
  }

  async clickOnSaveButton(buttonText: string): Promise<void> {
    return this.azureSyncingComponent.clickOnButton(buttonText);
  }

  async searchForUser(searchValue: string): Promise<void> {
    return this.azureSyncingComponent.searchForUser(searchValue);
  }

  async verifyFirstnameAndClickMoreButton(firstname: string): Promise<void> {
    return this.azureSyncingComponent.verifyFirstnameAndClickMoreButton(firstname);
  }

  async clickDropdownMenuItem(text: string): Promise<void> {
    return this.azureSyncingComponent.clickDropdownMenuItem(text);
  }

  async enterRandomTextInMultipleUserInformationFields(fields: string[]): Promise<void> {
    return this.azureSyncingComponent.enterRandomTextInMultipleUserInformationFields(fields);
  }

  async selectSyncSource(optionText: string): Promise<void> {
    return this.azureSyncingComponent.selectSyncSource(optionText);
  }

  async uncheckCheckboxIfChecked(checkboxId: string): Promise<void> {
    return this.azureSyncingComponent.uncheckCheckboxIfChecked(checkboxId);
  }

  async checkSyncCheckboxesForMultipleFields(fieldLabels: string[]): Promise<void> {
    return this.azureSyncingComponent.checkSyncCheckboxesForMultipleFields(fieldLabels);
  }

  async clickUserSyncingRunNow(action: string, timeout?: number): Promise<void> {
    return this.azureSyncingComponent.clickUserSyncingRunNow(action, timeout);
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    return this.azureSyncingComponent.verifyErrorMessage(expectedMessage);
  }

  async waitForUserSyncingSuccess(action: string, maxAttempts?: number): Promise<void> {
    return this.azureSyncingComponent.waitForUserSyncingSuccess(action, maxAttempts);
  }

  async verifyFieldValueInDeskless(fieldName: string, expectedValue: string): Promise<void> {
    return this.azureSyncingComponent.verifyFieldValueInDeskless(fieldName, expectedValue);
  }

  async verifyAllExpectedSyncedValues(expectedValues: Record<string, string>): Promise<void> {
    return this.azureSyncingComponent.verifyAllExpectedSyncedValues(expectedValues);
  }

  async selectPhoneAsAlternateIdentifier(): Promise<void> {
    return this.azureSyncingComponent.selectPhoneAsAlternateIdentifier();
  }

  async selectQuestionValue(questionValue: string): Promise<void> {
    return this.azureSyncingComponent.selectQuestionValue(questionValue);
  }
}
