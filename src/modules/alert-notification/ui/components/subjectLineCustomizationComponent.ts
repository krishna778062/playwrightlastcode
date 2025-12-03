import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class SubjectLineCustomizationComponent extends BaseComponent {
  readonly customSubjectLineOption: Locator;
  readonly defaultSubjectLineOption: Locator;
  readonly customSubjectTextarea: Locator;
  constructor(page: Page) {
    super(page);
    this.customSubjectLineOption = page.getByLabel('Custom subject line');
    this.defaultSubjectLineOption = page.getByLabel('Default subject line');
    this.customSubjectTextarea = page.locator('#customSubjectTextarea');
  }

  /**
   * Verifies the subject line customization component is loaded
   */
  async verifySubjectLineCustomizationComponentIsLoaded(): Promise<void> {
    await test.step('Verify subject line customization component is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.customSubjectLineOption, {
        assertionMessage: 'Verify custom subject line option is visible',
      });
    });
  }

  /**
   * Verifies the default subject line is selected
   */
  async verifyDefaultSubjectLineIsSelected(): Promise<void> {
    await test.step('Verify default subject line is selected', async () => {
      await expect(this.defaultSubjectLineOption, 'Default subject line should be checked').toBeChecked();
    });
  }

  /**
   * Clicks on the custom subject line option
   */
  async clickOnCustomSubjectLineOption(): Promise<void> {
    await test.step('Click on custom subject line option', async () => {
      await this.clickOnElement(this.customSubjectLineOption);
    });
  }

  /**
   * Fills in the custom subject line
   * @param customSubjectLine - The custom subject line to fill in
   */
  async fillCustomSubjectLine(customSubjectLine: string): Promise<void> {
    await test.step(`Fill custom subject line: ${customSubjectLine}`, async () => {
      await this.fillInElement(this.customSubjectTextarea, customSubjectLine);
    });
  }

  /**
   * Verifies the default subject line label is visible
   */
  async verifyDefaultSubjectLineIsVisible(): Promise<void> {
    await test.step('Verify default subject line label is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.defaultSubjectLineOption, {
        assertionMessage: 'Default subject line label should be visible',
      });
    });
  }

  /**
   * Verifies the custom subject line label is visible
   */
  async verifyCustomSubjectLineIsVisible(): Promise<void> {
    await test.step('Verify custom subject line label is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.customSubjectLineOption, {
        assertionMessage: 'Custom subject line label should be visible',
      });
    });
  }

  /**
   * Clears the custom subject line
   */
  async clearCustomSubjectLine(): Promise<void> {
    await test.step('Clear custom subject line', async () => {
      await this.customSubjectTextarea.clear();
    });
  }

  /**
   * Verifies inline error message is displayed
   * @param errorMessage - The expected error message
   */
  async verifyInlineErrorMessage(errorMessage: string): Promise<void> {
    await test.step(`Verify inline error message: ${errorMessage}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.page.getByText(errorMessage), {
        assertionMessage: `Inline error message should be visible: ${errorMessage}`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }
}
