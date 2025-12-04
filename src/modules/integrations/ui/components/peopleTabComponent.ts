import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { PEOPLE_TAB } from '@/src/modules/integrations/test-data/gamma-data-file';

export class PeopleTabComponent extends BaseComponent {
  readonly tabLocator: (text: string) => Locator;
  readonly provisioningSourceDropdown: () => Locator;
  readonly fieldLabel: (fieldName: string) => Locator;
  readonly syncingSourceDropdown: () => Locator;
  readonly bambooHRCheckbox: () => Locator;
  readonly saveButton: () => Locator;
  readonly workdayCheckbox: () => Locator;
  readonly fieldEditableCheckbox: (fieldName: string) => Locator;
  readonly fieldDisplayCheckbox: (fieldName: string) => Locator;
  readonly fieldSyncingCheckbox: (fieldName: string) => Locator;
  readonly workdayUsernameInput: () => Locator;
  readonly workdayPasswordInput: () => Locator;
  readonly tenantIdInput: () => Locator;
  readonly clientIdInput: () => Locator;
  readonly clientSecretInput: () => Locator;
  readonly refreshTokenInput: () => Locator;
  readonly wsdlUrlInput: () => Locator;
  readonly apiClientToggle: () => Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.tabLocator = (text: string) => this.rootLocator.getByRole('tab', { name: text, exact: true });
    this.provisioningSourceDropdown = () => this.rootLocator.locator('#provisioningSource');
    this.syncingSourceDropdown = () => this.rootLocator.locator('#syncSource');
    this.bambooHRCheckbox = () => this.rootLocator.locator('#Merge_3_selected');
    this.workdayCheckbox = () => this.rootLocator.locator('#Workday_selected');
    this.fieldLabel = (fieldName: string) => this.rootLocator.getByText(fieldName, { exact: true });
    this.fieldEditableCheckbox = (fieldName: string) => this.getFieldCheckbox(fieldName, 'editable');
    this.fieldDisplayCheckbox = (fieldName: string) => this.getFieldCheckbox(fieldName, 'display');
    this.fieldSyncingCheckbox = (fieldName: string) => this.getFieldCheckbox(fieldName, 'syncing');
    this.saveButton = () => this.rootLocator.getByRole('button', { name: 'Save' });
    // People data → Workday credentials inputs
    this.workdayUsernameInput = () => this.rootLocator.getByLabel(/Workday username/i);
    this.workdayPasswordInput = () => this.rootLocator.getByLabel(/Workday password/i);
    this.tenantIdInput = () => this.rootLocator.getByLabel(/Tenant ID/i);
    this.clientIdInput = () => this.rootLocator.getByLabel(/Client ID/i);
    this.clientSecretInput = () => this.rootLocator.getByLabel(/Client Secret/i);
    this.refreshTokenInput = () => this.rootLocator.getByLabel(/Refresh Token/i);
    this.wsdlUrlInput = () => this.rootLocator.getByLabel(/WSDL URL/i);
    this.apiClientToggle = () => this.rootLocator.getByLabel(/API client/i);
  }

  private getFieldCheckbox(fieldName: string, columnType: 'editable' | 'display' | 'syncing'): Locator {
    return this.rootLocator.locator(
      `li:has(.provisionSyncDisplay__labelText:has-text("${fieldName}")) .provisionSyncDisplay__${columnType} input[type="checkbox"]`
    );
  }

  async clickOnTab(text: string): Promise<void> {
    await test.step(`Click on '${text}' tab`, async () => {
      await this.tabLocator(text).click();
      await expect(this.tabLocator(text), `expecting '${text}' tab to be visible after click`).toBeVisible({
        timeout: 10000,
      });
    });
  }

  async verifyTabIsVisible(text: string): Promise<void> {
    await test.step(`Verify '${text}' tab is visible`, async () => {
      await expect(this.tabLocator(text), `expecting ${text} tab to be visible`).toBeVisible();
    });
  }

  async verifyNavigatedToPeoplePage(): Promise<void> {
    await test.step('Verify user navigated to manage/app/integrations/people page', async () => {
      await this.page.waitForURL(PAGE_ENDPOINTS.PEOPLE_DATA_PAGE, { timeout: 30_000 });
      expect(this.page.url()).toContain(PAGE_ENDPOINTS.PEOPLE_DATA_PAGE);
    });
  }

  async selectProvisioningSource(option: string): Promise<void> {
    await test.step('Select option as provisioning source', async () => {
      await expect(this.provisioningSourceDropdown(), 'expecting sync source dropdown to be visible').toBeVisible();
      await this.provisioningSourceDropdown().selectOption(option);
    });
  }

  async selectSyncingSource(option: string): Promise<void> {
    await test.step('Select option as syncing source', async () => {
      await expect(this.syncingSourceDropdown(), 'expecting sync source dropdown to be visible').toBeVisible();
      await this.syncingSourceDropdown().selectOption(option);
    });
  }

  async verifyAllUserFieldsAreDisplayed(): Promise<void> {
    await test.step('Verify all user fields are displayed', async () => {
      for (const field of PEOPLE_TAB.USER_FIELDS) {
        await expect(this.fieldLabel(field), `expecting field '${field}' to be visible`).toBeVisible();
      }
    });
  }

  async checkIntegrationIfNotChecked(): Promise<void> {
    await test.step('Check BambooHR checkbox if not checked', async () => {
      const checkbox = this.bambooHRCheckbox();
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.check();
        await this.saveButton().click();
      }
    });
  }

  async deselectWorkdayIfChecked(): Promise<void> {
    await test.step('Deselect Workday checkbox if checked and click Save', async () => {
      const checkbox = this.workdayCheckbox();
      await expect(checkbox, 'expecting Workday checkbox to be visible').toBeVisible();
      const isChecked = await checkbox.isChecked();
      if (isChecked) {
        await checkbox.uncheck();
        await this.saveButton().click();
      }
    });
  }

  async isFieldEditable(fieldName: string): Promise<string> {
    const checkbox = this.fieldEditableCheckbox(fieldName);
    const isChecked = await checkbox.isChecked();
    return isChecked ? 'true' : 'false';
  }

  async isFieldDisplayed(fieldName: string): Promise<string> {
    const checkbox = this.fieldDisplayCheckbox(fieldName);
    const isChecked = await checkbox.isChecked();
    return isChecked ? 'true' : 'false';
  }

  async isFieldSyncing(fieldName: string): Promise<boolean> {
    const checkbox = this.fieldSyncingCheckbox(fieldName);
    return await checkbox.isChecked();
  }

  async getEditableSettingForAllMergeFields(): Promise<Record<string, string>> {
    return await test.step('Get editable settings for all fields', async () => {
      const fieldValuesMerge: Record<string, string> = {};

      for (const fieldName of PEOPLE_TAB.USER_FIELDS) {
        try {
          const editableValue = await this.isFieldEditable(fieldName);
          fieldValuesMerge[fieldName] = editableValue;
          console.log(`${fieldName}: Editable=${editableValue}`);
        } catch (error) {
          console.log(`Error getting settings for field ${fieldName}: ${error}`);
          fieldValuesMerge[fieldName] = 'error';
        }
      }
      return fieldValuesMerge;
    });
  }

  async getEditableSettingForAllNonMergeFields(): Promise<Record<string, string>> {
    return await test.step('Get editable settings for all fields', async () => {
      const fieldValuesNonMerge: Record<string, string> = {};

      for (const fieldName of PEOPLE_TAB.USER_FIELDS) {
        try {
          const editableValue = await this.isFieldEditable(fieldName);
          fieldValuesNonMerge[fieldName] = editableValue;
          console.log(`${fieldName}: Editable=${editableValue}`);
        } catch (error) {
          console.log(`Error getting settings for field ${fieldName}: ${error}`);
          fieldValuesNonMerge[fieldName] = 'error';
        }
      }
      return fieldValuesNonMerge;
    });
  }

  async getDisplaySettingForNonMergeFields(): Promise<Record<string, string>> {
    return await test.step('Get display settings for all fields', async () => {
      const fieldValuesNonMerge: Record<string, string> = {};

      for (const fieldName of PEOPLE_TAB.USER_FIELDS) {
        try {
          const displayValue = await this.isFieldDisplayed(fieldName);
          fieldValuesNonMerge[fieldName] = displayValue;
          console.log(`${fieldName}: Displayed=${displayValue}`);
        } catch (error) {
          console.log(`Error getting settings for field ${fieldName}: ${error}`);
          fieldValuesNonMerge[fieldName] = 'error';
        }
      }
      return fieldValuesNonMerge;
    });
  }

  async getDisplaySettingForAllMergeFields(): Promise<Record<string, string>> {
    return await test.step('Get display settings for all fields', async () => {
      const fieldValuesMerge: Record<string, string> = {};

      for (const fieldName of PEOPLE_TAB.USER_FIELDS) {
        try {
          const displayValue = await this.isFieldDisplayed(fieldName);
          fieldValuesMerge[fieldName] = displayValue;
          console.log(`${fieldName}: Displayed=${displayValue}`);
        } catch (error) {
          console.log(`Error getting settings for field ${fieldName}: ${error}`);
          fieldValuesMerge[fieldName] = 'error';
        }
      }
      return fieldValuesMerge;
    });
  }

  async verifyBothValuesForEditableSetting(): Promise<void> {
    await test.step('Verify both values for editable setting are equal', async () => {
      const fieldValuesMerge = await this.getEditableSettingForAllMergeFields();
      const fieldValuesNonMerge = await this.getEditableSettingForAllNonMergeFields();
      const fieldValuesMergeJson = JSON.stringify(fieldValuesMerge, Object.keys(fieldValuesMerge).sort());
      const fieldValuesNonMergeJson = JSON.stringify(fieldValuesNonMerge, Object.keys(fieldValuesNonMerge).sort());
      const areEqual = fieldValuesMergeJson === fieldValuesNonMergeJson;
      expect(areEqual, 'Both field value sets should be equal').toBe(true);
    });
  }

  async verifyBothValuesForDisplaySetting(): Promise<void> {
    await test.step('Verify both values for display setting are equal', async () => {
      const fieldValuesMerge = await this.getDisplaySettingForAllMergeFields();
      const fieldValuesNonMerge = await this.getDisplaySettingForNonMergeFields();
      const fieldValuesMergeJson = JSON.stringify(fieldValuesMerge, Object.keys(fieldValuesMerge).sort());
      const fieldValuesNonMergeJson = JSON.stringify(fieldValuesNonMerge, Object.keys(fieldValuesNonMerge).sort());
      const areEqual = fieldValuesMergeJson === fieldValuesNonMergeJson;
      expect(areEqual, 'Both field value sets should be equal').toBe(true);
    });
  }

  async verifyDisableFieldsForSyncing(): Promise<void> {
    await test.step('Verify Extension and Name pronunciation fields are not checked in syncing column', async () => {
      const extensionIsChecked = await this.isFieldSyncing('Extension');
      const namePronunciationIsChecked = await this.isFieldSyncing('Name pronunciation');
      expect(extensionIsChecked, 'Extension field should not be checked in syncing column').toBe(false);
      expect(namePronunciationIsChecked, 'Name pronunciation field should not be checked in syncing column').toBe(
        false
      );
    });
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
    await test.step('Select Workday and enter credentials, then save', async () => {
      const workdayCheckbox = this.workdayCheckbox();
      await workdayCheckbox.check();
      await this.workdayUsernameInput().fill(params.username);
      await this.workdayPasswordInput().fill(params.password);
      await this.wsdlUrlInput().fill(params.wsdlUrl);
      await this.tenantIdInput().fill(params.tenantId);
      await this.apiClientToggle().click();
      await this.clientIdInput().fill(params.clientId);
      await this.clientSecretInput().fill(params.clientSecret);
      await this.refreshTokenInput().fill(params.refreshToken);
      await this.saveButton().click();
    });
  }
}
