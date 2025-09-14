import { UKG_CREDS } from '@integrations/test-data/ukg-sync.test-data';
import { expect, Locator, Page } from '@playwright/test';

import { SYNCING } from '../constants/common';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class UkgSyncComponents extends BaseComponent {
  protected userSyncingDropdown(option?: string): Locator {
    return this.page.locator(`select[name="${option}"]`);
  }

  protected scheduledSourcesCheckbox(name: string): Locator {
    return this.page.getByText(`${name}`).locator('..').locator('..').locator('input');
  }

  protected inputField(source: string, field: string): Locator {
    return this.page.getByText(`${source}`).locator('..').locator('..').locator('..').getByPlaceholder(`${field}`);
  }

  protected spanText(name: string): Locator {
    return this.page.locator(`span:has-text("${name}")`);
  }

  protected optionText(name: string): Locator {
    return this.page.locator(`option:has-text("${name}")`);
  }

  protected syncDetailsCheckBox(option: string): Locator {
    return this.page.getByText(`${option}`).locator('..').locator('..').getByRole('combobox');
  }

  async syncDropdown(option: string): Promise<Locator> {
    return this.rootLocator.getByRole('option', { name: option });
  }

  async verifyCheckBox(name: string): Promise<void> {
    const actual: string = (await this.scheduledSourcesCheckbox(name).getAttribute('value')) ?? '';
    if (actual.includes('false')) {
      this.scheduledSourcesCheckbox(name).click();
    } else {
      console.log('Already checked');
    }
  }

  async clearInputField(source: string, username: string, password: string, url: string, key: string): Promise<void> {
    const fields = [
      { name: SYNCING.USERNAME, value: username },
      { name: SYNCING.PASSWORD, value: password },
      { name: SYNCING.BASE_URL, value: url },
      { name: SYNCING.KEY, value: key },
    ];

    for (const field of fields) {
      const inputElement = this.inputField(source, field.value);
      inputElement.clear();
      expect(inputElement, `${field.name} field should be empty`).toHaveValue('');
    }
  }

  async clickOnButton(text: string): Promise<void> {
    this.spanText(text).click();
  }

  async verifyErrorMessage(message: string): Promise<void> {
    const errorMessage = await this.spanText(message).first().textContent();
    expect(errorMessage, 'Not the correct error message').toContain(message);
  }

  async addInputField(source: string, field: string, value: string): Promise<void> {
    this.inputField(source, field).fill(value);
  }

  async verifyVisibility(name: string): Promise<void> {
    this.userSyncingDropdown(SYNCING.SYNC_DROPDOWN).click();
    const optionElement = await this.syncDropdown(name);
    expect(optionElement, `${name} is visible`).not.toBeVisible();
  }

  async selectDropdown(option: string): Promise<void> {
    this.userSyncingDropdown(option).click();
  }

  async addUkgConnectionDetails(
    source: string,
    username: string,
    password: string,
    url: string,
    key: string
  ): Promise<void> {
    const fields = [
      { name: UKG_CREDS.USERNAME, value: username },
      { name: UKG_CREDS.PASSWORD, value: password },
      { name: UKG_CREDS.BASE_URL, value: url },
      { name: UKG_CREDS.KEY, value: key },
    ];

    for (const field of fields) {
      const inputElement = this.inputField(source, field.value);
      inputElement.fill(field.name);
    }
  }

  async selectSyncOptions(name: string): Promise<void> {
    this.optionText(name).click();
  }

  async verifyDetailsCheckBoxVisibility(name: string): Promise<void> {
    expect(this.spanText(name), 'Detail checkbox option not visible').toBeVisible();
  }

  async selectDetailsSyncCheckBox(source: string, name: string): Promise<void> {
    this.syncDetailsCheckBox(source).click();
    this.optionText(name).click();
  }
}
