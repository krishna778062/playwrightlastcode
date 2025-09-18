import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class AwarenessCheckMenuComponent extends BaseComponent {
  // Menu elements
  readonly threeDotIcon: Locator;
  readonly moreButton: Locator;
  readonly mustReadOption: Locator;
  readonly editButton: Locator;
  readonly updateButton: Locator;
  readonly removeButton: Locator;
  readonly confirmRemoveButton: Locator;
  readonly mustReadHistoryButton: Locator;
  constructor(page: Page) {
    super(page);
    this.threeDotIcon = this.page.locator('button[aria-label="Category option"]').first();
    this.moreButton = this.page.getByRole('button', { name: 'More' });
    this.mustReadOption = this.page.getByRole('button', { name: "Make 'must read'" });
    this.editButton = this.page.getByRole('menuitem', { name: 'Edit' });
    this.updateButton = this.page.getByRole('button', { name: 'Update' });
    this.removeButton = this.page.getByRole('menuitem', { name: 'Remove' });
    this.confirmRemoveButton = this.page.getByRole('button', { name: 'Remove' });
    this.mustReadHistoryButton = this.page.getByRole('button', { name: "'Must read' history" });
  }

  /**
   * Click three dot menu icon (More button)
   */
  async hoverOverThreeDotIcon(): Promise<void> {
    await this.threeDotIcon.hover({
      force: true,
    });
  }

  /**
   * Click more button
   */
  async clickMoreButton(): Promise<void> {
    await this.moreButton.click();
  }

  /**
   * Select must read option from menu
   */
  async selectMustReadOption(): Promise<void> {
    await this.mustReadOption.click();
  }

  /**
   * Click edit button
   */
  async clickEditButton(): Promise<void> {
    await this.editButton.click();
  }

  /**
   * Check if three dot icon is visible
   */
  async isThreeDotIconVisible(): Promise<boolean> {
    return await this.threeDotIcon.isVisible();
  }

  /**
   * Check if edit button is visible
   */
  async isEditButtonVisible(): Promise<boolean> {
    return await this.editButton.isVisible();
  }

  /**
   * Click update button
   */
  async clickUpdateButton(): Promise<void> {
    await this.updateButton.click();
  }

  /**
   * Click remove button
   */
  async clickRemoveButton(): Promise<void> {
    await this.removeButton.click();
  }

  /**
   * Click confirm remove button
   */
  async clickConfirmRemoveButton(): Promise<void> {
    await this.confirmRemoveButton.click();
  }

  /**
   * Click must read history button
   */
  async clickMustReadHistoryButton(): Promise<void> {
    await this.mustReadHistoryButton.click();
  }
}
