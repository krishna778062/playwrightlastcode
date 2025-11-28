import { faker } from '@faker-js/faker';
import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AzureSyncingComponent extends BaseComponent {
  readonly tabLocator: (text: string) => Locator;
  readonly loginIdentifierCheckbox: (id: string) => Locator;
  readonly buttonLocator: (buttonText: string) => Locator;
  readonly dialog: Locator;
  readonly dialogOkButton: Locator;
  readonly dataGridRows: Locator;
  readonly userRowByFirstname: (firstname: string) => Locator;
  readonly moreButtonInRow: (row: Locator) => Locator;
  readonly searchInputBox: Locator;
  readonly editUserBtn: (text: string) => Locator;
  readonly formFieldInput: (fieldName: string) => Locator;
  readonly syncSourceDropdown: Locator;
  readonly fieldRowByLabel: (fieldLabel: string) => Locator;
  readonly syncCheckboxInRow: (row: Locator) => Locator;
  readonly schedulerRunNowButton: (action: string) => Locator;
  readonly errorMessage: (text: string) => Locator;
  readonly userSyncingRow: (action: string) => Locator;
  readonly userSyncingStatus: (action: string) => Locator;
  readonly alternateIdentifierDropdown: Locator;
  readonly question1Dropdown: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);

    this.tabLocator = (text: string) => this.rootLocator.getByRole('tab', { name: text, exact: true });
    this.loginIdentifierCheckbox = (id: string) => this.rootLocator.locator(`#${id}`);
    this.buttonLocator = (buttonText: string) => this.rootLocator.getByRole('button', { name: buttonText });
    this.dialog = this.page.getByRole('dialog');
    this.dialogOkButton = this.dialog.getByRole('button', { name: 'OK' });
    this.dataGridRows = this.page.locator('[data-testid*="dataGridRow"]');
    this.userRowByFirstname = (firstname: string) =>
      this.dataGridRows.filter({ has: this.page.locator('p').filter({ hasText: firstname }) });
    this.moreButtonInRow = (row: Locator) => row.getByRole('button', { name: 'More' });
    this.searchInputBox = this.page.locator('#searchTerm');
    this.editUserBtn = (text: string) => this.page.getByRole('button', { name: text });
    this.formFieldInput = (fieldName: string) => this.page.locator(`#${fieldName}`);
    this.syncSourceDropdown = this.page.locator('#syncSource');
    this.fieldRowByLabel = (fieldLabel: string) => {
      return this.page
        .locator('.provisionSyncDisplay__listItem')
        .filter({
          has: this.page.locator('.provisionSyncDisplay__labelText').getByText(fieldLabel, { exact: true }),
        })
        .first();
    };
    this.syncCheckboxInRow = (row: Locator) => row.locator('.provisionSyncDisplay__syncing input[type="checkbox"]');
    this.schedulerRunNowButton = (action: string) =>
      this.rootLocator
        .locator('tr[data-testid="dataGridRow"]')
        .filter({ hasText: action })
        .getByRole('button', { name: 'Run now' });
    this.errorMessage = (text: string) => this.rootLocator.getByRole('alert').getByText(text);
    this.userSyncingRow = (action: string) =>
      this.rootLocator.locator('tr[data-testid="dataGridRow"]').filter({ hasText: action });
    this.userSyncingStatus = (action: string) =>
      this.userSyncingRow(action).locator('td').filter({ hasText: 'Success' });
    this.alternateIdentifierDropdown = this.page.getByText('Employee number (Recommended)', { exact: false });
    this.question1Dropdown = this.page
      .locator('div')
      .filter({ hasText: /^Question 1$/ })
      .nth(2);
  }

  async clickOnTab(text: string): Promise<void> {
    await test.step(`Click on '${text}' tab`, async () => {
      await expect(this.tabLocator(text), `expecting ${text} tab to be visible`).toBeVisible();
      await this.tabLocator(text).click();
    });
  }

  private async handleDisableLoginIdentifierDialog(): Promise<void> {
    try {
      const isDialogVisible = await this.dialog.isVisible({ timeout: 2000 });
      if (isDialogVisible) {
        await test.step('Handle disable login identifier dialog', async () => {
          await expect(this.dialogOkButton, 'OK button should be visible in dialog').toBeVisible();
          await this.dialogOkButton.click();
          await expect(this.dialog, 'Dialog should be closed').not.toBeVisible({ timeout: 5000 });
        });
      }
    } catch {
      console.log('Dialog not visible, continuing');
    }
  }

  async selectPhoneAsAlternateIdentifier(): Promise<void> {
    await test.step('Select Phone from alternate identifier dropdown', async () => {
      await expect(this.alternateIdentifierDropdown, 'Alternate identifier dropdown should be visible').toBeVisible({
        timeout: 10000,
      });
      await this.alternateIdentifierDropdown.click();

      const phoneOption = this.page.getByText('Phone', { exact: true });
      await expect(phoneOption, 'Phone option should be visible').toBeVisible({ timeout: 5000 });
      await phoneOption.click();

      await this.handleDisableLoginIdentifierDialog();
    });
  }

  async selectQuestionValue(questionValue: string): Promise<void> {
    await test.step(`Select ${questionValue} from Question 1 dropdown`, async () => {
      await expect(this.question1Dropdown, 'Question 1 dropdown should be visible').toBeVisible();
      await this.question1Dropdown.click();

      const questionOption = this.page.getByText(questionValue);
      await expect(questionOption, `${questionValue} option should be visible`).toBeVisible({ timeout: 5000 });
      await questionOption.click();
    });
  }

  async setCheckboxState(checkboxId: string, shouldBeChecked: boolean): Promise<void> {
    await test.step(`${shouldBeChecked ? 'Check' : 'Uncheck'} ${checkboxId} checkbox`, async () => {
      const checkbox = this.loginIdentifierCheckbox(checkboxId);
      const isChecked = await checkbox.isChecked();

      if (isChecked === shouldBeChecked) {
        await test.step(`${checkboxId} checkbox is already ${shouldBeChecked ? 'checked' : 'unchecked'}, skipping`, async () => {});
        return;
      }

      if (shouldBeChecked) {
        await checkbox.check();
        console.log(`${checkboxId} checkbox has been checked`);
      } else {
        await checkbox.uncheck();
        console.log(`${checkboxId} checkbox has been unchecked`);
        await this.handleDisableLoginIdentifierDialog();
      }
    });
  }

  async clickOnButton(buttonText: string): Promise<void> {
    await test.step(`Click on '${buttonText}' button`, async () => {
      const button = this.buttonLocator(buttonText);
      await expect(button, `expecting ${buttonText} button to be visible`).toBeVisible();
      const isEnabled = await button.isEnabled();
      if (isEnabled) {
        await button.click();
      } else {
        console.log(`${buttonText} button is disabled, skipping click and continuing`);
      }
    });
  }

  async searchForUser(searchValue: string): Promise<void> {
    await test.step(`Search for user: ${searchValue}`, async () => {
      await expect(this.searchInputBox, 'Search input box should be visible').toBeVisible();
      await this.searchInputBox.fill(searchValue);
      await this.searchInputBox.press('Enter');
    });
  }

  async verifyFirstnameAndClickMoreButton(firstname: string): Promise<void> {
    await test.step(`Verify firstname "${firstname}" and click More button`, async () => {
      const userRow = this.userRowByFirstname(firstname);
      const moreButton = this.moreButtonInRow(userRow);

      await expect(userRow, `Row with firstname "${firstname}" should be visible`).toBeVisible();

      await expect(moreButton, 'More button should be visible').toBeVisible();
      await moreButton.click();
    });
  }

  async clickDropdownMenuItem(text: string): Promise<void> {
    await test.step(`Click on "${text}" in dropdown menu`, async () => {
      const menuItem = this.editUserBtn(text);
      await expect(menuItem, `${text} option should be visible in dropdown`).toBeVisible();
      await menuItem.click();
    });
  }

  async enterRandomTextInUserInformation(field: string): Promise<void> {
    await test.step(`Enter random text in ${field} field`, async () => {
      const inputField = this.formFieldInput(field);
      let randomValue: string;

      if (field.toLowerCase() === 'zipcode') {
        const random = Math.floor(Math.random() * 90000) + 10000;
        randomValue = random.toString();
      } else {
        randomValue = faker.lorem.words(2);
      }

      await expect(inputField, `${field} field should be visible`).toBeVisible();
      await inputField.clear();
      await inputField.fill(randomValue);
    });
  }

  async enterRandomTextInMultipleUserInformationFields(fields: string[]): Promise<void> {
    await test.step(`Enter random text in multiple user information fields: ${fields.join(', ')}`, async () => {
      for (const field of fields) {
        await this.enterRandomTextInUserInformation(field);
      }
    });
  }

  async selectSyncSource(optionText: string): Promise<void> {
    await test.step(`Select '${optionText}' from sync source dropdown`, async () => {
      await expect(this.syncSourceDropdown, 'Sync source dropdown should be visible').toBeVisible();
      await this.syncSourceDropdown.selectOption({ label: optionText });
      await expect(this.syncSourceDropdown, 'Sync source dropdown should be enabled after selection').toBeEnabled();
    });
  }

  async uncheckCheckboxIfChecked(checkboxId: string): Promise<void> {
    await test.step(`Uncheck ${checkboxId} checkbox if checked`, async () => {
      const checkbox = this.page.locator(`#${checkboxId}`);
      await expect(checkbox, `${checkboxId} checkbox should be visible`).toBeVisible();
      const isChecked = await checkbox.isChecked();

      if (isChecked) {
        await checkbox.uncheck();
        console.log(`${checkboxId} checkbox has been unchecked`);
      } else {
        console.log(`${checkboxId} checkbox is already unchecked, skipping`);
      }
    });
  }

  async checkSyncCheckboxForField(fieldLabel: string): Promise<void> {
    await test.step(`Check sync checkbox for ${fieldLabel} field`, async () => {
      const fieldRow = this.fieldRowByLabel(fieldLabel);
      const syncCheckbox = this.syncCheckboxInRow(fieldRow);

      await expect(fieldRow, `Field row for "${fieldLabel}" should be visible`).toBeVisible();
      await expect(syncCheckbox, `Sync checkbox for "${fieldLabel}" should be visible`).toBeVisible();

      const isChecked = await syncCheckbox.isChecked();
      if (!isChecked) {
        await syncCheckbox.check();
        console.log(`Sync checkbox for "${fieldLabel}" has been checked`);
      } else {
        console.log(`Sync checkbox for "${fieldLabel}" is already checked, skipping`);
      }
    });
  }

  async checkSyncCheckboxesForMultipleFields(fieldLabels: string[]): Promise<void> {
    await test.step(`Check sync checkboxes for multiple fields: ${fieldLabels.join(', ')}`, async () => {
      for (const fieldLabel of fieldLabels) {
        const fieldRow = this.fieldRowByLabel(fieldLabel);
        const syncCheckbox = this.syncCheckboxInRow(fieldRow);

        await expect(fieldRow, `Field row for "${fieldLabel}" should be visible`).toBeVisible();
        await expect(syncCheckbox, `Sync checkbox for "${fieldLabel}" should be visible`).toBeVisible();

        const isChecked = await syncCheckbox.isChecked();
        if (!isChecked) {
          await syncCheckbox.check();
          console.log(`Sync checkbox for "${fieldLabel}" has been checked`);
        } else {
          console.log(`Sync checkbox for "${fieldLabel}" is already checked, skipping`);
        }
      }
    });
  }

  async clickUserSyncingRunNow(action: string, timeout: number = 30000): Promise<void> {
    await test.step('Click User syncing Run now button', async () => {
      const button = this.schedulerRunNowButton(action);
      await expect(button, 'Run now button should be visible').toBeVisible();

      try {
        await expect(button, `Run now button for ${action} should be enabled`).toBeEnabled({ timeout });
        await button.click();
        await this.page.waitForTimeout(1000);
      } catch (error) {
        const isEnabled = await button.isEnabled().catch(() => false);
        if (!isEnabled) {
          console.log(
            `Run now button for ${action} is still disabled after ${timeout}ms, skipping click and continuing`
          );
        } else {
          throw error;
        }
      }
    });
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await test.step(`Verify error message: ${expectedMessage}`, async () => {
      await expect(this.errorMessage(expectedMessage), 'expecting error message to be visible').toBeVisible();
      await expect(this.errorMessage(expectedMessage), 'expecting error message text to match').toHaveText(
        expectedMessage
      );
    });
  }

  async verifyFieldValueInDeskless(fieldName: string, expectedValue: string): Promise<void> {
    await test.step(`Verify ${fieldName} is updated as "${expectedValue}" in deskless`, async () => {
      const fieldInput = this.formFieldInput(fieldName);
      await expect(fieldInput, `${fieldName} field should be visible`).toBeVisible();
      await expect(fieldInput, `${fieldName} should have value "${expectedValue}"`).toHaveValue(expectedValue);
    });
  }

  async verifyAllExpectedSyncedValues(expectedValues: Record<string, string>): Promise<void> {
    await test.step('Verify all expected synced values in deskless', async () => {
      for (const [fieldName, expectedValue] of Object.entries(expectedValues)) {
        await this.verifyFieldValueInDeskless(fieldName, expectedValue);
      }
    });
  }

  async waitForUserSyncingSuccess(action: string, maxAttempts: number = 3): Promise<void> {
    await test.step(`Wait for success status in ${action} scheduler`, async () => {
      let attempts = 0;
      let successFound = false;

      while (attempts < maxAttempts && !successFound) {
        attempts++;
        console.log(`Attempt ${attempts}: Waiting 20 seconds for success status...`);

        try {
          const statusCell = this.userSyncingStatus(action);
          await expect(statusCell, `Success status should be visible for ${action}`).toBeVisible({ timeout: 20000 });
          const statusText = await statusCell.textContent();
          if (statusText?.trim() === 'Success') {
            successFound = true;
            console.log(`Success status found in ${action} scheduler on attempt ${attempts}`);
            break;
          }
        } catch {
          console.log(`Success status not found on attempt ${attempts}`);
        }

        if (!successFound && attempts < maxAttempts) {
          console.log(`Refreshing page and retrying...`);
          await this.page.reload();
          await this.page.waitForTimeout(2000);
        }
      }

      if (!successFound) {
        throw new Error(
          `Success status not found for ${action} scheduler after ${maxAttempts} attempts (${maxAttempts * 20} seconds)`
        );
      }
    });
  }
}
