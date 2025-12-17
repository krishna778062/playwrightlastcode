import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/ui/components/baseComponent';

export interface IReportPostModalActions {
  enterReportReason: (reason: string) => Promise<void>;
  clickReportButton: () => Promise<void>;
  clickCancelButton: () => Promise<void>;
}

export interface IReportPostModalAssertions {
  verifyModalVisible: () => Promise<void>;
  verifyReportButtonDisabled: () => Promise<void>;
  verifyReportButtonEnabled: () => Promise<void>;
  verifyModalClosed: () => Promise<void>;
}

export class ReportPostModalComponent
  extends BaseComponent
  implements IReportPostModalActions, IReportPostModalAssertions
{
  // Locators
  readonly modalContainer: Locator;
  readonly reportReasonInput: Locator;
  readonly reportButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page, modalType: 'post' | 'reply' = 'post') {
    super(page);

    // Handle both "Report post" and "Report reply" modals
    const dialogName = modalType === 'reply' ? 'Report reply' : 'Report post';
    this.modalContainer = this.page.getByRole('dialog', { name: dialogName }).first();

    // Initialize report reason input - textarea or input field
    this.reportReasonInput = this.modalContainer.getByRole('textbox', { name: 'Why are you reporting this?*' }).first();

    // Initialize report button - submit button
    this.reportButton = this.modalContainer.getByRole('button', { name: 'Report' }).first();

    // Initialize cancel button
    this.cancelButton = this.modalContainer.getByRole('button', { name: 'Cancel' }).first();
  }

  get actions(): IReportPostModalActions {
    return this;
  }

  get assertions(): IReportPostModalAssertions {
    return this;
  }

  /**
   * Verifies that the report modal is visible
   */
  async verifyModalVisible(): Promise<void> {
    await test.step('Verify report modal is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.modalContainer, {
        assertionMessage: 'Report modal should be visible',
      });
    });
  }

  /**
   * Verifies that the report modal is closed
   */
  async verifyModalClosed(): Promise<void> {
    await test.step('Verify report modal is closed', async () => {
      await expect(this.modalContainer).not.toBeVisible();
      await this.verifier.verifyTheElementIsNotVisible(this.modalContainer, {
        assertionMessage: 'Report modal should be closed',
      });
    });
  }

  /**
   * Verifies that the report button is disabled
   */
  async verifyReportButtonDisabled(): Promise<void> {
    await test.step('Verify report button is disabled', async () => {
      await expect(this.reportButton).toBeDisabled();
    });
  }

  /**
   * Verifies that the report button is enabled
   */
  async verifyReportButtonEnabled(): Promise<void> {
    await test.step('Verify report button is enabled', async () => {
      await expect(this.reportButton).toBeEnabled();
    });
  }

  /**
   * Enters the report reason in the input field
   * @param reason - The reason for reporting the post/comment/reply
   */
  async enterReportReason(reason: string): Promise<void> {
    await test.step(`Enter report reason: ${reason}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.reportReasonInput, {
        assertionMessage: 'Report reason input should be visible',
      });
      await this.fillInElement(this.reportReasonInput, reason);
    });
  }

  /**
   * Clicks the Report button to submit the report
   */
  async clickReportButton(): Promise<void> {
    await test.step('Click Report button', async () => {
      await this.clickOnElement(this.reportButton);
    });
  }

  /**
   * Clicks the Cancel button to close the modal
   */
  async clickCancelButton(): Promise<void> {
    await test.step('Click Cancel button', async () => {
      await this.clickOnElement(this.cancelButton);
    });
  }
}
