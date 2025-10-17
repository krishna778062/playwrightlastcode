import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';

export class SubjectLineCustomizationComponent extends BaseComponent {
  readonly customSubjectLineOption: Locator;
  readonly defaultSubjectLineOption: Locator;
  constructor(page: Page) {
    super(page);
    this.customSubjectLineOption = page.getByLabel('Custom subject line');
    this.defaultSubjectLineOption = page.getByLabel('Default subject line');
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
      await this.page.locator('#customSubjectTextarea').fill(customSubjectLine);
    });
  }
}
