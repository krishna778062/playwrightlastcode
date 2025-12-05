import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class EditContactComponent extends BaseComponent {
  readonly timezoneSelect: Locator;
  readonly saveButton: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.timezoneSelect = this.page.getByTestId('SelectInput');
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
  }

  /**
   * Selects a timezone option by value
   * @param value - The timezone value to select (e.g., '318')
   */
  async selectTimezone(value: string): Promise<void> {
    await this.timezoneSelect.selectOption(value);
  }
  async clickOnSaveButton(): Promise<void> {
    await this.saveButton.click();
  }
}
