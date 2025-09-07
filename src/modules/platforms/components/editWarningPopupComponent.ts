import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class EditWarningPopupComponent extends BaseComponent {
  // Locators
  readonly editPopupTitle: Locator;
  readonly editWarningMessage: Locator;
  readonly managersLoseAccessMessage: Locator;
  readonly adminsLoseAccessMessage: Locator;
  readonly contentMoveMessage: Locator;
  readonly analyticsDiscrepanciesMessage: Locator;
  readonly editPopupCrossButton: Locator;
  readonly editPopupCancelButton: Locator;
  readonly editPopupContinueButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize all popup locators
    this.editPopupTitle = page.getByText('Edit access control group');
    this.editWarningMessage = page
      .locator('[class*="Typography-module__paragraph"][class*="Typography-module__boldWeight"]')
      .filter({ hasText: 'Editing this access control group may result in the following:' });
    this.managersLoseAccessMessage = page.getByText('Managers might lose access to this group or entire feature');
    this.adminsLoseAccessMessage = page.getByText('Admins might lose access to this group or entire feature');
    this.contentMoveMessage = page.getByText('Feature that loses its association');
    this.analyticsDiscrepanciesMessage = page.getByText('There may be discrepancies on any analytics pages');
    this.editPopupCrossButton = page.getByLabel('Close');
    this.editPopupCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.editPopupContinueButton = page.getByRole('button', { name: 'Continue' });
  }

  /**
   * Verifies all elements in the edit warning popup are visible
   */
  async verifyAllElements(): Promise<void> {
    await test.step('Verify all elements in edit warning popup', async () => {
      // Verify popup title
      await this.verifier.verifyTheElementIsVisible(this.editPopupTitle, {
        assertionMessage: 'Edit access control group popup title should be visible',
      });

      // Verify warning message
      await this.verifier.verifyTheElementIsVisible(this.editWarningMessage, {
        assertionMessage: 'Edit warning message should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.managersLoseAccessMessage, {
        assertionMessage: 'Managers lose access warning should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.adminsLoseAccessMessage, {
        assertionMessage: 'Admins lose access warning should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.contentMoveMessage, {
        assertionMessage: 'Content move warning should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.analyticsDiscrepanciesMessage, {
        assertionMessage: 'Analytics discrepancies warning should be visible',
      });

      // Verify popup buttons
      await this.verifier.verifyTheElementIsVisible(this.editPopupCrossButton, {
        assertionMessage: 'Edit popup close button should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.editPopupCancelButton, {
        assertionMessage: 'Edit popup cancel button should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.editPopupContinueButton, {
        assertionMessage: 'Edit popup continue button should be visible',
      });
    });
  }

  /**
   * Clicks the Continue button to proceed with edit
   */
  async clickContinue(): Promise<void> {
    await test.step('Click Continue button in edit warning popup', async () => {
      await this.clickOnElement(this.editPopupContinueButton);
    });
  }

  /**
   * Clicks the Cancel button to abort edit
   */
  async clickCancel(): Promise<void> {
    await test.step('Click Cancel button in edit warning popup', async () => {
      await this.clickOnElement(this.editPopupCancelButton);
    });
  }

  /**
   * Clicks the Close (X) button to close popup
   */
  async clickClose(): Promise<void> {
    await test.step('Click Close button in edit warning popup', async () => {
      await this.clickOnElement(this.editPopupCrossButton);
    });
  }
}

