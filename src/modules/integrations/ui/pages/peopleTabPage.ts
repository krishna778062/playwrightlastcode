import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { PeopleTabComponent } from '@/src/modules/integrations/ui/components/peopleTabComponent';

export class PeopleTabPage extends BasePage {
  readonly userProvisioningHeading: Locator;
  readonly peopleTabComponent: PeopleTabComponent;
  readonly toastContainer: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.USER_SYNCING_PAGE);
    this.userProvisioningHeading = page.getByRole('heading', { name: 'User provisioning' });
    this.peopleTabComponent = new PeopleTabComponent(page);
    this.toastContainer = page.locator('[class*="Toast-module"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.userProvisioningHeading, {
        timeout: 30_000,
        assertionMessage: 'Verifying User provisioning heading is visible',
      });
    });
  }

  async clickOnTab(text: string): Promise<void> {
    await this.peopleTabComponent.clickOnTab(text);
  }

  async verifyNavigatedToPeoplePage(): Promise<void> {
    await this.peopleTabComponent.verifyNavigatedToPeoplePage();
  }

  async selectProvisioningSource(option: string): Promise<void> {
    await this.peopleTabComponent.selectProvisioningSource(option);
  }

  async verifyAllUserFieldsAreDisplayed(): Promise<void> {
    await this.peopleTabComponent.verifyAllUserFieldsAreDisplayed();
  }

  async selectSyncingSource(option: string): Promise<void> {
    await this.peopleTabComponent.selectSyncingSource(option);
  }

  async checkIntegrationIfNotChecked(): Promise<void> {
    await this.peopleTabComponent.checkIntegrationIfNotChecked();
  }

  async getEditableSettingForAllMergeFields(): Promise<Record<string, string>> {
    return await this.peopleTabComponent.getEditableSettingForAllMergeFields();
  }

  async getEditableSettingForAllNonMergeFields(): Promise<Record<string, string>> {
    return await this.peopleTabComponent.getEditableSettingForAllNonMergeFields();
  }

  async verifyBothValuesForEditableSetting(): Promise<void> {
    await this.peopleTabComponent.verifyBothValuesForEditableSetting();
  }

  async getDisplaySettingForAllMergeFields(): Promise<Record<string, string>> {
    return await this.peopleTabComponent.getDisplaySettingForAllMergeFields();
  }

  async isFieldDisplayed(fieldName: string): Promise<string> {
    return await this.peopleTabComponent.isFieldDisplayed(fieldName);
  }

  async getDisplaySettingForNonMergeFields(): Promise<Record<string, string>> {
    return await this.peopleTabComponent.getDisplaySettingForNonMergeFields();
  }

  async verifyBothValuesForDisplaySetting(): Promise<void> {
    await this.peopleTabComponent.verifyBothValuesForDisplaySetting();
  }

  async verifyDisableFieldsForSyncing(): Promise<void> {
    await this.peopleTabComponent.verifyDisableFieldsForSyncing();
  }

  async navigateToPeopleDataPage(): Promise<void> {
    await this.goToUrl(PAGE_ENDPOINTS.PEOPLE_DATA_PAGE);
    await this.peopleTabComponent.verifyNavigatedToPeoplePage();
  }

  async deselectWorkdayIfChecked(): Promise<void> {
    await this.peopleTabComponent.deselectWorkdayIfChecked();
  }

  async configureWorkdayCredentials(params: {
    username: string;
    password: string;
    wsdlUrl: string;
    tenantId: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }): Promise<void> {
    await this.peopleTabComponent.configureWorkdayCredentials(params);
  }

  async verifyToastMessage(message: string): Promise<void> {
    await test.step(`Verify toast message: ${message}`, async () => {
      await Promise.race([
        this.toastContainer.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {}),
        this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {}),
      ]);
      const toastMessage = this.toastContainer.locator('p').filter({ hasText: message }).first();
      await toastMessage.waitFor({ state: 'visible', timeout: 60_000 });
    });
  }

  async verifySpecificFieldsUncheckedAndDisabledForSyncing(): Promise<void> {
    await this.peopleTabComponent.verifySpecificFieldsUncheckedAndDisabledForSyncing();
  }

  async verifySpecificFieldsUncheckedAndDisabledForProvisioning(): Promise<void> {
    await this.peopleTabComponent.verifySpecificFieldsUncheckedAndDisabledForProvisioning();
  }

  async verifyFieldOrder(firstFieldName: string, secondFieldName: string): Promise<void> {
    await this.peopleTabComponent.verifyFieldOrder(firstFieldName, secondFieldName);
  }

  async verifyNamePronunciationFieldIsEnabledInColumn(
    columnType: 'display' | 'editable',
    condition: 'enabled' | 'disabled' = 'enabled'
  ): Promise<void> {
    await this.peopleTabComponent.verifyNamePronunciationFieldIsEnabledInColumn(columnType, condition);
  }

  async verifyNamePronunciationFieldIsEnabledInDisplayColumn(): Promise<void> {
    await this.peopleTabComponent.verifyNamePronunciationFieldIsEnabledInDisplayColumn();
  }

  async verifyNamePronunciationFieldIsEnabledInEditableColumn(): Promise<void> {
    await this.peopleTabComponent.verifyNamePronunciationFieldIsEnabledInEditableColumn();
  }

  async clickOnAddIntegrationButton(): Promise<void> {
    await this.peopleTabComponent.clickOnAddIntegrationButton();
  }

  async searchBambooHRInModal(sourceName: string): Promise<void> {
    await this.peopleTabComponent.searchBambooHRInModal(sourceName);
  }

  async verifyNoResultsFoundMessage(): Promise<void> {
    await this.peopleTabComponent.verifyNoResultsFoundMessage();
  }

  async verifyBambooHROptionInProvisioningSource(sourceName: string): Promise<void> {
    await this.peopleTabComponent.verifyBambooHROptionInProvisioningSource(sourceName);
  }

  async verifyBambooHROptionInSyncingSource(sourceName: string): Promise<void> {
    await this.peopleTabComponent.verifyBambooHROptionInSyncingSource(sourceName);
  }

  async verifyNamePronunciationFieldUncheckedAndDisabled(): Promise<void> {
    await this.peopleTabComponent.verifyNamePronunciationFieldUncheckedAndDisabled();
  }

  /**
   * Connect Workday with credentials
   * Handles the complete flow: deselecting if checked, configuring credentials, saving, and verifying success
   */
  async connectWorkday(params: {
    username: string;
    password: string;
    wsdlUrl: string;
    tenantId: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }): Promise<void> {
    await test.step('Connect Workday', async () => {
      await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
      await this.deselectWorkdayIfChecked();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10_000 }).catch(() => {});
      await this.configureWorkdayCredentials(params);
    });
  }
}
