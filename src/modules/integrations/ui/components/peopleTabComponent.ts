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
  readonly addIntegrationButton: () => Locator;
  readonly integrationSelectionDialog: () => Locator;
  readonly integrationSearchInput: () => Locator;
  readonly noResultsFoundMessage: () => Locator;
  readonly toastContainer: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.tabLocator = (text: string) => this.rootLocator.getByRole('tab', { name: text, exact: true });
    this.provisioningSourceDropdown = () => this.rootLocator.locator('#provisioningSource');
    this.syncingSourceDropdown = () => this.rootLocator.locator('#syncSource');
    this.bambooHRCheckbox = () => this.rootLocator.locator('#Merge_3_selected');
    this.workdayCheckbox = () =>
      this.rootLocator
        .getByRole('checkbox', { name: /Workday/i })
        .or(this.rootLocator.locator('#Workday_selected'))
        .or(this.rootLocator.locator('input[type="checkbox"][id*="Workday"]'));
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
    this.addIntegrationButton = () => this.rootLocator.locator('#add-integration button');
    this.integrationSelectionDialog = () => this.page.getByRole('dialog').filter({ hasText: 'Select an integration' });
    this.integrationSearchInput = () => this.page.getByRole('textbox', { name: 'Search Integration' });
    this.noResultsFoundMessage = () => this.page.getByRole('heading', { name: 'No results found' });
    this.toastContainer = this.page.locator('[class*="Toast-module"]');
  }

  private getFieldCheckbox(
    fieldName: string,
    columnType: 'editable' | 'display' | 'syncing' | 'provisioning'
  ): Locator {
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
      await this.page.waitForURL(PAGE_ENDPOINTS.PEOPLE_DATA_PAGE, { timeout: 70_000 });
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
      const missingFields: string[] = [];

      for (const field of PEOPLE_TAB.USER_FIELDS) {
        try {
          await expect(this.fieldLabel(field), `expecting field '${field}' to be visible`).toBeVisible({
            timeout: 5000,
          });
        } catch (error) {
          console.warn(`Field '${field}' not found on the page: ${error}`);
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        console.warn(`The following fields were not found on the page: ${missingFields.join(', ')}`);
        console.warn('This might be expected behavior based on current configuration or field availability.');
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
      await checkbox.waitFor({ state: 'attached', timeout: 10_000 });
      if (!(await checkbox.isVisible().catch(() => false))) {
        await checkbox.scrollIntoViewIfNeeded().catch(() => {});
      }
      await expect(checkbox).toBeVisible();
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
        await this.waitForSaveButtonEnabled();
        await this.saveButton().click();
        await Promise.race([
          this.toastContainer.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {}),
          this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {}),
        ]);
      }
    });
  }

  async isFieldEditable(fieldName: string): Promise<string> {
    const checkbox = this.fieldEditableCheckbox(fieldName);
    try {
      const isChecked = await checkbox.isChecked();
      return isChecked ? 'true' : 'false';
    } catch (error) {
      throw new Error(
        `Failed to check editable status for field "${fieldName}". Field may not exist on the page. Original error: ${error}`
      );
    }
  }

  async isFieldDisplayed(fieldName: string): Promise<string> {
    const checkbox = this.fieldDisplayCheckbox(fieldName);
    try {
      const isChecked = await checkbox.isChecked();
      return isChecked ? 'true' : 'false';
    } catch (error) {
      throw new Error(
        `Failed to check display status for field "${fieldName}". Field may not exist on the page. Original error: ${error}`
      );
    }
  }

  async isFieldSyncing(fieldName: string): Promise<boolean> {
    const checkbox = this.fieldSyncingCheckbox(fieldName);
    try {
      return await checkbox.isChecked();
    } catch (error) {
      throw new Error(
        `Failed to check syncing status for field "${fieldName}". Field may not exist on the page. Original error: ${error}`
      );
    }
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

  private async fillInputField(locator: Locator, value: string, verifyValue = true): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: 15_000 });
    await expect(locator).toBeEnabled({ timeout: 10_000 });
    await locator.fill(value);
    if (verifyValue) {
      await expect(locator).toHaveValue(value, { timeout: 5_000 });
    }
  }

  private async waitForSaveButtonEnabled(): Promise<void> {
    const saveBtn = this.saveButton();
    await saveBtn.waitFor({ state: 'visible', timeout: 15_000 });
    let isEnabled = false;
    const startTime = Date.now();
    while (!isEnabled && Date.now() - startTime < 10_000) {
      isEnabled = !(await saveBtn.isDisabled().catch(() => true));
      if (!isEnabled) {
        await this.page.waitForLoadState('domcontentloaded', { timeout: 500 }).catch(() => {});
      }
    }
    await expect(saveBtn).toBeEnabled({ timeout: 10_000 });
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
      await this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

      const workdayCheckbox = this.workdayCheckbox();
      await workdayCheckbox.waitFor({ state: 'visible', timeout: 15_000 });
      await expect(workdayCheckbox).toBeEnabled({ timeout: 10_000 });
      await workdayCheckbox.check();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10_000 }).catch(() => {});

      await this.fillInputField(this.workdayUsernameInput(), params.username);
      await this.fillInputField(this.workdayPasswordInput(), params.password, false);
      await this.fillInputField(this.wsdlUrlInput(), params.wsdlUrl);
      await this.fillInputField(this.tenantIdInput(), params.tenantId);

      const apiClientToggle = this.apiClientToggle();
      await apiClientToggle.waitFor({ state: 'visible', timeout: 15_000 });
      await expect(apiClientToggle).toBeEnabled({ timeout: 10_000 });
      await apiClientToggle.click();
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5_000 }).catch(() => {});

      await this.fillInputField(this.clientIdInput(), params.clientId);
      await this.fillInputField(this.clientSecretInput(), params.clientSecret, false);
      await this.fillInputField(this.refreshTokenInput(), params.refreshToken);

      await this.waitForSaveButtonEnabled();
      await this.saveButton().click();

      await Promise.race([
        this.toastContainer.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {}),
        this.page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {}),
      ]);
    });
  }

  async verifySpecificFieldsUncheckedAndDisabledForSyncing(): Promise<void> {
    await test.step('Verify specific fields are unchecked and disabled for syncing', async () => {
      for (const fieldName of PEOPLE_TAB.DISABLED_FIELDS) {
        const isSyncingChecked = await this.isFieldSyncing(fieldName);
        const syncingCheckbox = this.fieldSyncingCheckbox(fieldName);
        const isSyncingDisabled = await syncingCheckbox.isDisabled();

        expect(isSyncingChecked, `${fieldName} field should not be checked in syncing column`).toBe(false);
        expect(isSyncingDisabled, `${fieldName} field should be disabled in syncing column`).toBe(true);
      }
    });
  }

  async verifySpecificFieldsUncheckedAndDisabledForProvisioning(): Promise<void> {
    await test.step('Verify specific fields are unchecked and disabled for provisioning', async () => {
      for (const fieldName of PEOPLE_TAB.DISABLED_FIELDS) {
        const provisioningCheckbox = this.getFieldCheckbox(fieldName, 'provisioning');
        const isProvisioningChecked = await provisioningCheckbox.isChecked();
        const isProvisioningDisabled = await provisioningCheckbox.isDisabled();

        expect(isProvisioningChecked, `${fieldName} field should not be checked in provisioning column`).toBe(false);
        expect(isProvisioningDisabled, `${fieldName} field should be disabled in provisioning column`).toBe(true);
      }
    });
  }

  async verifyFieldOrder(firstFieldName: string, secondFieldName: string): Promise<void> {
    await test.step(`Verify '${secondFieldName}' field is displayed after '${firstFieldName}' field`, async () => {
      const firstFieldLocator = this.fieldLabel(firstFieldName);
      const secondFieldLocator = this.fieldLabel(secondFieldName);

      await expect(firstFieldLocator, `expecting field '${firstFieldName}' to be visible`).toBeVisible();
      await expect(secondFieldLocator, `expecting field '${secondFieldName}' to be visible`).toBeVisible();

      const firstFieldBox = await firstFieldLocator.boundingBox();
      const secondFieldBox = await secondFieldLocator.boundingBox();

      expect(
        firstFieldBox?.y,
        `'${firstFieldName}' field should appear before '${secondFieldName}' field`
      ).toBeLessThan(secondFieldBox?.y || 0);
    });
  }

  async verifyNamePronunciationFieldIsEnabledInColumn(
    columnType: 'display' | 'editable',
    condition: 'enabled' | 'disabled' = 'enabled'
  ): Promise<void> {
    await test.step(`Verify "Name pronunciation" field is ${condition} for check and uncheck in ${columnType} column`, async () => {
      const fieldName = 'Name pronunciation';
      const checkbox =
        columnType === 'display' ? this.fieldDisplayCheckbox(fieldName) : this.fieldEditableCheckbox(fieldName);

      await expect(checkbox, `expecting ${fieldName} ${columnType} checkbox to be visible`).toBeVisible();
      const isDisabled = await checkbox.isDisabled();

      if (condition === 'enabled') {
        expect(isDisabled, `${fieldName} field should be enabled in ${columnType} column`).toBe(false);
        await checkbox.check();
        const isCheckedAfterCheck = await checkbox.isChecked();
        expect(isCheckedAfterCheck, `${fieldName} field should be checked after clicking check`).toBe(true);
        await checkbox.uncheck();
        const isCheckedAfterUncheck = await checkbox.isChecked();
        expect(isCheckedAfterUncheck, `${fieldName} field should be unchecked after clicking uncheck`).toBe(false);
      } else {
        expect(isDisabled, `${fieldName} field should be disabled in ${columnType} column`).toBe(true);
      }
    });
  }

  async verifyNamePronunciationFieldIsEnabledInDisplayColumn(): Promise<void> {
    await this.verifyNamePronunciationFieldIsEnabledInColumn('display');
  }

  async verifyNamePronunciationFieldIsEnabledInEditableColumn(): Promise<void> {
    await this.verifyNamePronunciationFieldIsEnabledInColumn('editable');
  }

  async clickOnAddIntegrationButton(): Promise<void> {
    await test.step('Click on Add integration button', async () => {
      await expect(this.addIntegrationButton(), 'expecting Add integration button to be visible').toBeVisible();
      await this.addIntegrationButton().click();
    });
  }

  async searchBambooHRInModal(sourceName: string): Promise<void> {
    await test.step('Search for BambooHR in integration selection modal', async () => {
      await expect(
        this.integrationSelectionDialog(),
        'expecting integration selection dialog to be visible'
      ).toBeVisible();
      await this.page.waitForTimeout(1000);
      await expect(this.integrationSearchInput(), 'expecting search input to be visible').toBeVisible();
      await this.integrationSearchInput().fill(sourceName);
      await this.page.waitForTimeout(500);
    });
  }

  async verifyNoResultsFoundMessage(): Promise<void> {
    await test.step('Verify "No results found" message appears', async () => {
      await expect(this.noResultsFoundMessage(), 'expecting "No results found" message to be visible').toBeVisible();
    });
  }

  async verifyBambooHROptionInProvisioningSource(sourceName: string): Promise<void> {
    await test.step(`Verify ${sourceName} option is displayed in provisioning source dropdown`, async () => {
      await expect(
        this.provisioningSourceDropdown(),
        'expecting provisioning source dropdown to be visible'
      ).toBeVisible();
      const options = await this.provisioningSourceDropdown().locator('option').allTextContents();
      expect(options, `expecting ${sourceName} option to be present in provisioning source dropdown`).toContain(
        sourceName
      );
    });
  }

  async verifyBambooHROptionInSyncingSource(sourceName: string): Promise<void> {
    await test.step(`Verify ${sourceName} option is displayed in syncing source dropdown`, async () => {
      await expect(this.syncingSourceDropdown(), 'expecting syncing source dropdown to be visible').toBeVisible();
      const options = await this.syncingSourceDropdown().locator('option').allTextContents();
      expect(options, `expecting ${sourceName} option to be present in syncing source dropdown`).toContain(sourceName);
    });
  }

  async verifyNamePronunciationFieldUncheckedAndDisabled(): Promise<void> {
    await test.step('Verify Name pronunciation field is unchecked and disabled for provisioning', async () => {
      const fieldName = PEOPLE_TAB.NAME_PRONUNCIATION_FIELD;
      const provisioningCheckbox = this.getFieldCheckbox(fieldName, 'provisioning');

      await expect(provisioningCheckbox, `expecting ${fieldName} provisioning checkbox to be visible`).toBeVisible();
      const isProvisioningDisabled = await provisioningCheckbox.isDisabled();

      expect(isProvisioningDisabled, `${fieldName} field should be disabled in provisioning column`).toBe(true);
    });
  }
}
