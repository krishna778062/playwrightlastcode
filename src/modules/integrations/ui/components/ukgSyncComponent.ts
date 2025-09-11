import { expect, Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class UkgSyncComponents extends BaseComponent {
  readonly userSyncingDropdown: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.userSyncingDropdown = this.rootLocator.locator('select[name="syncSource"]');
  }

  async scheduledSourcesCheckbox(name: string): Promise<Locator> {
    return this.rootLocator
      .getByRole('checkbox', { name: name })
      .or(this.rootLocator.locator(`#${name} input[type="checkbox"]`))
      .or(this.rootLocator.locator(`[data-testid="${name}"] input[type="checkbox"]`))
      .or(this.rootLocator.locator(`input[type="checkbox"][name="${name}"]`));
  }

  async inputField(source: string, field: string): Promise<Locator> {
    return this.rootLocator
      .getByPlaceholder(new RegExp(source, 'i'))
      .or(this.rootLocator.getByLabel(new RegExp(field, 'i')))
      .or(this.rootLocator.locator(`input[placeholder*="${field}"]`))
      .or(this.rootLocator.locator(`input[id*="${field}"][placeholder*="${field}"]`));
  }

  async spanText(name: string): Promise<Locator> {
    return this.rootLocator.locator(`span:has-text("${name}")`);
  }

  async verifyCheckBox(name: string, status: string): Promise<void> {
    const checkboxLocator = await this.scheduledSourcesCheckbox(name);
    const value: string = (await checkboxLocator.getAttribute('value')) ?? '';
    if (!value) {
      (await this.scheduledSourcesCheckbox(name)).click();
    } else {
      console.log('Already checked');
    }
  }

  async clearInputField(name: string, field: string): Promise<void> {
    const inputElement = await this.inputField(name, field);
    await inputElement.clear();

    // Verify field is empty
    await expect(inputElement).toHaveValue('');
  }

  async clickOnButton(text: string): Promise<void> {
    (await this.spanText(text)).click();
  }

  async verifyErrorMessage(message: string): Promise<void> {
    const errorMessage = await this.spanText(message);
    expect(errorMessage, 'Not the correct error message').toContainText(message);
  }

  async addInputField(source: string, field: string, value: string): Promise<void> {
    (await this.inputField(source, field)).fill(value);
  }

  async verifyVisibility(name: string, status: string): Promise<void> {
    await this.userSyncingDropdown.click();
    const option = dropdown.locator(`option:has-text("${optionText}")`);
    await expect(option, `Option "${optionText}" should not exist in dropdown`).not.toBeVisible();
  }
}
