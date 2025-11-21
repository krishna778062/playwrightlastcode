import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/ui/components/baseComponent';

export interface IInappropriateContentWarningPopupActions {
  clickCancel: () => Promise<void>;
  clickContinue: () => Promise<void>;
  clickClose: () => Promise<void>;
}

export interface IInappropriateContentWarningPopupAssertions {
  verifyWarningPopupVisible: () => Promise<void>;
  verifyWarningMessage: (expectedMessage?: string) => Promise<void>;
}

export class InappropriateContentWarningPopupComponent
  extends BaseComponent
  implements IInappropriateContentWarningPopupActions, IInappropriateContentWarningPopupAssertions
{
  // Locators
  readonly popupContainer: Locator;
  readonly popupTitle: Locator;
  readonly warningMessage: Locator;
  readonly closeButton: Locator;
  readonly cancelButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize popup container - using dialog role pattern
    this.popupContainer = this.page.getByRole('dialog', { name: 'Inappropriate content detected' });

    // Initialize popup title - flexible selector for warning title
    this.popupTitle = this.popupContainer.getByText('Inappropriate content detected');

    // Initialize warning message - flexible selector for warning content
    this.warningMessage = this.popupContainer.getByText(/inappropriate|content|warning|abusive/i).first();

    // Initialize buttons
    this.closeButton = this.popupContainer.getByRole('button', { name: 'Close' });

    this.cancelButton = this.popupContainer.getByRole('button', { name: 'Cancel' });

    this.continueButton = this.popupContainer.getByRole('button', { name: 'Post anyway' });
  }

  get actions(): IInappropriateContentWarningPopupActions {
    return this;
  }

  get assertions(): IInappropriateContentWarningPopupAssertions {
    return this;
  }

  /**
   * Verifies that the warning popup is visible
   */
  async verifyWarningPopupVisible(): Promise<void> {
    await test.step('Verify inappropriate content warning popup is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.popupContainer, {
        assertionMessage: 'Inappropriate content warning popup should be visible',
      });
    });
  }

  /**
   * Verifies the warning message content
   * @param expectedMessage - Optional expected message text to verify
   */
  async verifyWarningMessage(expectedMessage?: string): Promise<void> {
    await test.step('Verify inappropriate content warning message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.warningMessage, {
        assertionMessage: 'Warning message should be visible in inappropriate content popup',
      });

      if (expectedMessage) {
        await this.verifier.verifyTheElementIsVisible(
          this.popupContainer.getByText(expectedMessage, { exact: false }),
          {
            assertionMessage: `Warning message should contain: ${expectedMessage}`,
          }
        );
      }
    });
  }

  /**
   * Clicks the Cancel button to close the popup without posting
   */
  async clickCancel(): Promise<void> {
    await test.step('Click Cancel button in inappropriate content warning popup', async () => {
      await this.clickOnElement(this.cancelButton);
    });
  }

  /**
   * Clicks the Continue button to proceed with posting (if available)
   */
  async clickContinue(): Promise<void> {
    await test.step('Click Continue button in inappropriate content warning popup', async () => {
      await this.clickOnElement(this.continueButton);
    });
  }

  /**
   * Clicks the Close (X) button to close the popup
   */
  async clickClose(): Promise<void> {
    await test.step('Click Close button in inappropriate content warning popup', async () => {
      await this.clickOnElement(this.closeButton);
    });
  }
}
