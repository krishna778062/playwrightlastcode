import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class SubjectLineCustomizationComponent extends BaseComponent {
  readonly customSubjectLineOption: Locator;
  readonly defaultSubjectLineOption: Locator;
  readonly customSubjectTextarea: Locator;
  readonly defaultSubjectTextarea: Locator;

  constructor(page: Page) {
    super(page);
    this.customSubjectLineOption = page.getByLabel('Custom subject line');
    this.defaultSubjectLineOption = page.getByLabel('Default subject line');
    this.customSubjectTextarea = page.locator('#customSubjectTextarea');
    // Default subject line textarea - disabled textarea showing the template text
    this.defaultSubjectTextarea = page.locator('#defaultValue');
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
   * Verifies the default subject line is NOT selected
   */
  async verifyDefaultSubjectLineIsNotSelected(): Promise<void> {
    await test.step('Verify default subject line is not selected', async () => {
      await expect(this.defaultSubjectLineOption, 'Default subject line should not be checked').not.toBeChecked();
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
   * Verifies the custom subject textarea is hidden or disabled when default is selected
   */
  async verifyCustomSubjectTextareaIsHiddenOrDisabled(): Promise<void> {
    await test.step('Verify custom subject textarea is hidden or disabled', async () => {
      // When default is selected, the textarea should be hidden or disabled
      // Check if element exists first
      const count = await this.customSubjectTextarea.count();
      if (count === 0) {
        // Element doesn't exist, which means it's hidden - this is acceptable
        return;
      }
      // Check if it's hidden first, if not, check if it's disabled
      const isHidden = await this.customSubjectTextarea.isHidden();
      if (!isHidden) {
        await this.verifier.verifyTheElementIsDisabled(this.customSubjectTextarea, {
          assertionMessage: 'Custom subject textarea should be disabled when default is selected',
          timeout: TIMEOUTS.SHORT,
        });
      }
    });
  }

  /**
   * Verifies the default subject line text is displayed and matches the expected template text
   * @param expectedText - The expected default subject line text (e.g., "New Alert - {{message}}")
   */
  async verifyDefaultSubjectLineText(expectedText: string): Promise<void> {
    await test.step(`Verify default subject line text: ${expectedText}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.defaultSubjectTextarea, {
        assertionMessage: 'Default subject line textarea should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      const actualText = await this.defaultSubjectTextarea.inputValue();
      if (actualText !== expectedText) {
        throw new Error(`Expected default subject line to be "${expectedText}", but found "${actualText}"`);
      }
    });
  }

  /**
   * Verifies the default subject line textarea is read-only (non-editable/disabled)
   */
  async verifyDefaultSubjectLineIsReadOnly(): Promise<void> {
    await test.step('Verify default subject line is read-only', async () => {
      await this.verifier.verifyTheElementIsVisible(this.defaultSubjectTextarea, {
        assertionMessage: 'Default subject line textarea should be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.verifier.verifyTheElementIsDisabled(this.defaultSubjectTextarea, {
        assertionMessage: 'Default subject line textarea should be disabled (read-only)',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verifies the custom subject line option is selected
   */
  async verifyCustomSubjectLineIsSelected(): Promise<void> {
    await test.step('Verify custom subject line is selected', async () => {
      await expect(this.customSubjectLineOption, 'Custom subject line should be checked').toBeChecked();
    });
  }

  /**
   * Verifies the custom subject textarea is visible and editable
   */
  async verifyCustomSubjectTextareaIsVisibleAndEditable(): Promise<void> {
    await test.step('Verify custom subject textarea is visible and editable', async () => {
      await this.verifier.verifyTheElementIsVisible(this.customSubjectTextarea, {
        assertionMessage: 'Custom subject textarea should be visible',
      });
      await this.verifier.verifyTheElementIsEnabled(this.customSubjectTextarea, {
        assertionMessage: 'Custom subject textarea should be enabled (editable)',
      });
    });
  }
}
