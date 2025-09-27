import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class WorkdaySyncComponent extends BaseComponent {
  readonly saveButton: () => Locator;
  readonly workdayFields: (text: string) => Locator;
  readonly errorMessage: (text: string) => Locator;
  readonly tabLocator: (text: string) => Locator;
  readonly syncSourceDropdown: () => Locator;
  readonly schedulerRunNowButton: (action: string) => Locator;
  readonly lastRunStatusCell: (action: string) => Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);

    this.saveButton = () => this.rootLocator.getByRole('button', { name: 'Save' });
    this.workdayFields = (text: string) => this.rootLocator.getByRole('textbox', { name: text });
    this.errorMessage = (text: string) => this.rootLocator.getByRole('alert').getByText(text);
    this.tabLocator = (text: string) => this.rootLocator.getByRole('tab', { name: text, exact: true });
    this.syncSourceDropdown = () => this.rootLocator.locator('#syncSource');
    this.schedulerRunNowButton = (action: string) =>
      this.rootLocator
        .locator('tr[data-testid="dataGridRow"]')
        .filter({ hasText: action })
        .getByRole('button', { name: 'Run now' });
    this.lastRunStatusCell = (action: string) =>
      this.rootLocator.locator('tr[data-testid="dataGridRow"]').filter({ hasText: action }).locator('td').nth(3); // Last run status is the 4th column (index 3)
  }

  async checkWorkdayCheckbox(): Promise<void> {
    await test.step('Force check workday checkbox (uncheck then check)', async () => {
      const workdayCheckbox = this.rootLocator.locator('#Workday_selected');
      const isChecked = await workdayCheckbox.isChecked();

      if (isChecked) {
        await workdayCheckbox.uncheck();
        console.log('Workday checkbox has been unchecked');
        await this.clickOnSaveButton();
        await workdayCheckbox.check();
        console.log('Workday checkbox has been checked again');
      } else {
        await workdayCheckbox.check();
        console.log('Workday checkbox has been checked');
      }
    });
  }

  async clickOnSaveButton(): Promise<void> {
    await test.step('Click on Save button', async () => {
      await this.saveButton().click();
      await this.page.waitForTimeout(10000);
    });
  }

  async verifyWorkdayFieldIsVisible(fieldName: string): Promise<void> {
    await test.step(`Verify workday field '${fieldName}' is visible`, async () => {
      await expect(this.workdayFields(fieldName), `expecting workday field '${fieldName}' to be visible`).toBeVisible();
    });
  }

  async verifyFieldRequiredError(fieldName: string, expectedError: string): Promise<void> {
    await test.step(`Verify error message '${expectedError}' for field '${fieldName}'`, async () => {
      const field = this.workdayFields(fieldName);
      const errorMessage = field.locator('xpath=..').locator('.Field-error span');
      await expect(errorMessage, `expecting error message for '${fieldName}' to be visible`).toBeVisible();
      await expect(errorMessage, `expecting error message to be '${expectedError}'`).toHaveText(expectedError);
    });
  }

  async fillAllWorkdayFields(fieldName: string, text: string): Promise<void> {
    await test.step('Fill all Workday input fields', async () => {
      await this.workdayFields(fieldName).click();
      await this.workdayFields(fieldName).fill(text);
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

  async clickOnTab(text: string): Promise<void> {
    await test.step(`Click on '${text}' tab`, async () => {
      await expect(this.tabLocator(text), `expecting ${text} tab to be visible`).toBeVisible();
      await this.tabLocator(text).click();
      await this.page.waitForTimeout(10000);
    });
  }

  async selectWorkdayAsSyncSource(source: string): Promise<void> {
    await test.step('Select Workday as syncing source', async () => {
      await expect(this.syncSourceDropdown(), 'expecting sync source dropdown to be visible').toBeVisible();
      await this.syncSourceDropdown().selectOption(source);
    });
  }

  async clickUserSyncingRunNow(action: string): Promise<void> {
    await test.step('Click User syncing Run now button', async () => {
      await this.schedulerRunNowButton(action).click();
    });
  }

  async refreshUntilSchedulerButtonEnabled(action: string, maxAttempts: number = 10): Promise<void> {
    await test.step(`Refresh page until ${action} Run now button is enabled`, async () => {
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          await expect(
            this.schedulerRunNowButton(action),
            `expecting ${action} Run now button to be enabled`
          ).toBeEnabled({ timeout: 5000 });
          break;
        } catch {
          attempts++;
          await this.page.reload();
          await this.page.waitForLoadState('domcontentloaded');
        }
      }
      if (attempts >= maxAttempts) {
        throw new Error(`${action} Run now button did not become enabled after ${maxAttempts} refresh attempts`);
      }
    });
  }

  async verifyLastRunStatus(action: string, expectedStatus: string): Promise<void> {
    await test.step(`Verify last run status for ${action} is ${expectedStatus}`, async () => {
      await expect(
        this.lastRunStatusCell(action),
        `expecting last run status cell for ${action} to be visible`
      ).toBeVisible();
      await expect(this.lastRunStatusCell(action), `expecting last run status to be ${expectedStatus}`).toHaveText(
        expectedStatus
      );
    });
  }
}
