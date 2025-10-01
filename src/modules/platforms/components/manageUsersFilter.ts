import { BaseComponent } from '@/src/core/components/baseComponent';
import { Page, Locator, expect } from '@playwright/test';

export class ManageUsersFilter extends BaseComponent {
  private filterName: (name: string) => Locator;
  private filterDialog: Locator;
  private closeButton: Locator;
  private searchInputBox: (name: string) => Locator;
  private checkBox: (name: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.filterDialog = page.locator('[class*="athena"]').filter({ hasText: 'Filters' });
    this.closeButton = this.filterDialog.getByRole('button', { name: 'Close' });
    this.filterName = (name: string) => this.filterDialog.getByRole('button', { name: name });
    this.searchInputBox = (name: string) =>
      page
        .locator('[class*="Accordion-module__AccordionItem"]')
        .filter({ hasText: name })
        .getByPlaceholder('Select...');
    this.checkBox = (name: string) =>
      page
        .locator('[class*="CheckboxWithIconAndCount-module__label"]')
        .filter({ hasText: name })
        .locator('[type=checkbox]');
  }

  /**
   * Clicks on the filter attribute.
   * @param name - Name of the attribute to be clicked.
   */
  async clickOnFilterAttributeByName(name: string) {
    await this.clickOnElement(this.filterName(name));
  }

  /**
   * Clicks on the Close button.
   */
  async clickOnCloseButton(): Promise<void> {
    await this.clickOnElement(this.closeButton);
  }

  /**
   * Checks the value in the attribute.
   * @param attributeName - Name of the attribute for which the value needs to be checked.
   * @param valueName - Name of the value to be checked.
   */
  async checkValue(attributeName: string, valueName: string) {
    const searchBox = this.searchInputBox(attributeName);
    if (await this.verifier.isTheElementVisible(searchBox)) {
      await this.fillInElement(searchBox, valueName);
    }
    await expect(this.checkBox(valueName)).toBeVisible();
    if (!(await this.checkBox(valueName).isChecked())) {
      await this.clickOnElement(this.checkBox(valueName));
    }
  }

  /**
   * Unchecks the value in the attribute.
   * @param attributeName - Name of the attribute for which the value needs to be unchecked.
   * @param valueName - Name of the value to be unchecked.
   */
  async unCheckValue(attributeName: string, valueName: string) {
    const searchBox = this.searchInputBox(attributeName);
    if (await this.verifier.isTheElementVisible(searchBox)) {
      await this.fillInElement(searchBox, valueName);
    }
    await expect(this.checkBox(valueName)).toBeVisible();
    if (await this.checkBox(valueName).isChecked()) {
      await this.clickOnElement(this.checkBox(valueName));
    }
  }
}
