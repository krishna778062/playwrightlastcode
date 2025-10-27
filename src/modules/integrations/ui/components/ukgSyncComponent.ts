import { UKG_CREDS } from '@integrations/test-data/gamma-data-file';
import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { SYNCING } from '@/src/modules/integrations/test-data/gamma-data-file';

export class UkgSyncComponents extends BaseComponent {
  readonly syncSourceDropdown: () => Locator;
  readonly syncCheckBox: (text: string) => Locator;
  readonly userSyncingDropdown: (option: string) => Locator;
  readonly scheduledSourcesCheckbox: (name: string) => Locator;
  readonly inputField: (source: string, field: string) => Locator;
  readonly spanText: (name: string) => Locator;
  readonly optionText: (name: string) => Locator;
  readonly optionValue: (name: string) => Locator;
  readonly syncDetailsCheckBox: (option: string) => Locator;
  readonly syncDropdown: (option: string) => Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.syncSourceDropdown = () => this.rootLocator.locator('#syncSource');
    this.syncCheckBox = (text: string) =>
      this.rootLocator
        .getByRole('combobox')
        .filter({ hasText: text })
        .or(this.rootLocator.getByRole('listbox').filter({ hasText: text }));
    this.userSyncingDropdown = (option: string) =>
      this.rootLocator.getByRole('combobox', { name: new RegExp(option, 'i') });
    this.scheduledSourcesCheckbox = (name: string) =>
      this.rootLocator.getByText(`${name}`).locator('xpath=ancestor::div[3]//input');
    this.inputField = (source: string, field: string) =>
      this.rootLocator.getByText(`${source}`).locator(`xpath=ancestor::div[3]//input[contains(@name,"${field}")]`);
    this.spanText = (name: string) => this.rootLocator.locator(`span:has-text("${name}")`);
    this.optionText = (name: string) => this.rootLocator.locator(`option:has-text("${name}")`);
    this.optionValue = (name: string) => this.rootLocator.locator(`option[value="${name}"]`);
    this.syncDetailsCheckBox = (option: string) =>
      this.rootLocator
        .getByText(`${option}`)
        .locator('xpath=ancestor::div[2]')
        .locator('input[type="checkbox"]')
        .nth(2);
    this.syncDropdown = (option: string) => this.rootLocator.getByRole('option', { name: option });
  }

  /**
   * Verify the scheduled sources checkbox is checked or unchecked
   * @param name - The name of the scheduled source checkbox
   * @returns void
   */
  async verifyScheduledSourcesCheckBox(name: string): Promise<void> {
    await test.step(`Verify Scheduled Sources Checkbox: ${name}`, async () => {
      const checkbox = this.scheduledSourcesCheckbox(name).first();
      const status = await checkbox.isChecked();
      if (status) {
        await checkbox.click();
        await this.spanText('Save').click();
        await checkbox.click();
      } else {
        await checkbox.click();
        console.log('Checkbox is already unchecked');
      }
    });
  }

  async clearInputField(source: string, username: string, password: string, url: string, key: string): Promise<void> {
    await test.step(`Clear Input Field: ${source}`, async () => {
      const fields = [
        { name: SYNCING.USERNAME, value: username },
        { name: SYNCING.PASSWORD, value: password },
        { name: SYNCING.BASE_URL, value: url },
        { name: SYNCING.KEY, value: key },
      ];

      for (const field of fields) {
        const inputElement = this.inputField(source, field.value);
        await inputElement.clear();
        await expect(inputElement, `${field.name} field should be empty`).toHaveValue('');
      }
    });
  }

  async clickOnButton(text: string): Promise<void> {
    await test.step(`Click on span text button: ${text}`, async () => {
      await this.spanText(text).click();
    });
  }

  async verifyErrorMessage(message: string): Promise<void> {
    await test.step(`Verify Error Message: ${message}`, async () => {
      const errorMessage = await this.spanText(message).first().textContent();
      expect(errorMessage, 'Not the correct error message').toContain(message);
    });
  }

  async addInputField(source: string, field: string, value: string): Promise<void> {
    await test.step(`Add Input Field: ${source}`, async () => {
      await this.inputField(source, field).fill(value);
    });
  }

  async verifyVisibility(name: string): Promise<void> {
    await test.step(`Verify Visibility: ${name}`, async () => {
      const optionElement = this.syncDropdown(name).nth(1);
      await expect(optionElement, `${name} is visible`).not.toBeVisible();
    });
  }

  async selectDropdown(): Promise<void> {
    await test.step(`Select Dropdown`, async () => {
      await this.syncSourceDropdown().click();
    });
  }

  async addUkgConnectionDetails(
    source: string,
    username: string,
    password: string,
    url: string,
    key: string
  ): Promise<void> {
    await test.step(`Add Ukg Connection Details: ${source}`, async () => {
      const fields = [
        { name: UKG_CREDS.USERNAME, value: username },
        { name: UKG_CREDS.PASSWORD, value: password },
        { name: UKG_CREDS.BASE_URL, value: url },
        { name: UKG_CREDS.KEY, value: key },
      ];

      for (const field of fields) {
        const inputElement = this.inputField(source, field.value);
        await inputElement.fill(field.name);
      }
    });
  }

  async selectSyncOptions(name: string): Promise<void> {
    await test.step(`Select Sync Options: ${name}`, async () => {
      await this.syncSourceDropdown().selectOption(name);
    });
  }

  async verifyDetailsCheckBoxVisibility(name: string): Promise<void> {
    await test.step(`Verify Details CheckBox Visibility: ${name}`, async () => {
      await expect(this.spanText(name), 'Detail checkbox option not visible').toBeVisible();
    });
  }

  async selectDetailsSyncCheckBox(source: string, sync: string, name: string): Promise<void> {
    await test.step(`Select Details Sync CheckBox: ${source}`, async () => {
      await this.syncDetailsCheckBox(source).click();
      await this.syncCheckBox(sync).selectOption(name);
    });
  }

  async uncheckScheduledSourcesCheckBox(name: string): Promise<void> {
    await test.step(`Uncheck Scheduled Sources CheckBox: ${name}`, async () => {
      const actual: string = (await this.scheduledSourcesCheckbox(name).getAttribute('value')) ?? '';
      if (actual.includes('true')) {
        await this.scheduledSourcesCheckbox(name).click();
      } else {
        console.log('Already checked');
      }
    });
  }
}
