import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class UnsupportedFileMessageDialogBox extends BaseComponent {
  readonly okButtonOfUnsupportedFileMessageDialogBox: Locator;
  readonly cancelButtonOfUnsupportedFileMessageDialogBox: Locator;
  constructor(
    page: Page,
    readonly rootLocator: Locator
  ) {
    super(page, rootLocator);
    this.okButtonOfUnsupportedFileMessageDialogBox = this.rootLocator.getByRole('button', {
      name: 'Ok',
    });
    this.cancelButtonOfUnsupportedFileMessageDialogBox = this.rootLocator.getByRole('button', {
      name: 'Close',
    });
  }

  /**
   * Verifies the unsupported file message is visible
   * @param options - The options to pass to the function
   * @param options.stepInfo - The step info to pass to the function
   * @param options.timeout - The timeout to pass to the function
   */
  async verifyTheUnsupportedFileMessageIsVisible(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo ?? `Verifying the unsupported file message is visible`, async () => {
      await expect(this.rootLocator, `expecting unsupported file message to be visible`).toBeVisible({
        timeout: options?.timeout ?? TIMEOUTS.DEFAULT,
      });
    });
  }

  /**
   * Clicks on the ok button to close the unsupported file message dialog box
   * @param options - The options to pass to the function
   * @param options.stepInfo - The step info to pass to the function
   */
  async clickOnOkButtonToCloseTheUnsupportedFileMessageDialogBox(options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Clicking on ok button`, async () => {
      await this.clickOnElement(this.okButtonOfUnsupportedFileMessageDialogBox.first());
    });
  }

  /**
   * Clicks on the cancel button to close the unsupported file message dialog box
   * @param options - The options to pass to the function
   * @param options.stepInfo - The step info to pass to the function
   */
  async clickOnCancelButtonToCloseTheUnsupportedFileMessageDialogBox(options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo ?? `Clicking on cancel button`, async () => {
      await this.clickOnElement(this.cancelButtonOfUnsupportedFileMessageDialogBox);
    });
  }

  /**
   * Verifies the unsupported file message is not visible
   * @param options - The options to pass to the function
   * @param options.stepInfo - The step info to pass to the function
   * @param options.timeout - The timeout to pass to the function
   */
  async verifyTheUnsupportedFileMessageIsNotVisible(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo ?? `Verifying the unsupported file message is not visible`, async () => {
      await expect(this.rootLocator, `expecting unsupported file message to be not visible`).not.toBeVisible({
        timeout: options?.timeout ?? TIMEOUTS.DEFAULT,
      });
    });
  }
}
