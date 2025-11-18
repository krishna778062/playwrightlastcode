import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class MustReadModalComponent extends BaseComponent {
  readonly mustReadModal: Locator;
  readonly mustReadModalCancelButton: Locator;
  readonly allOrganizationToggle: Locator;
  readonly makeMustReadButton: Locator;
  readonly mustReadHeaderBar: Locator;
  readonly mustReadConfirmButton: Locator;
  readonly mustReadConfirmBar: Locator;

  constructor(page: Page) {
    super(page);
    this.mustReadModal = page.getByRole('dialog', { name: "Make 'Must Read'" });
    this.mustReadModalCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.allOrganizationToggle = page.getByRole('radio', { name: 'Everyone in organization' });
    this.makeMustReadButton = page.getByRole('button', { name: 'Make must read' });
    this.mustReadHeaderBar = page.getByText('Must read from');
    this.mustReadConfirmButton = page.getByRole('button', { name: 'Confirm' });
    this.mustReadConfirmBar = page.getByText('Please confirm you have read');
  }

  /**
   * Clicks on the Cancel button in the Must Read modal
   */
  async clickOnMustReadModalCancelButton(): Promise<void> {
    await test.step('Click on Must Read modal cancel button', async () => {
      await this.clickOnElement(this.mustReadModalCancelButton);
    });
  }

  /**
   * Verifies that the Must Read modal is not visible
   */
  async verifyMustReadModalIsNotVisible(): Promise<void> {
    await test.step('Verify Must Read modal is not visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.mustReadModal, {
        assertionMessage: 'Must Read modal should not be visible',
      });
    });
  }

  /**
   * Verifies that the Must Read modal is visible
   */
  async verifyMustReadModalIsVisible(): Promise<void> {
    await test.step('Verify Must Read modal is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mustReadModal, {
        assertionMessage: 'Must Read modal should be visible',
      });
    });
  }

  /**
   * Selects the "All organization" toggle option
   */
  async selectAllOrganizationToggle(): Promise<void> {
    await test.step('Select All organization toggle', async () => {
      await this.allOrganizationToggle.check();
    });
  }

  /**
   * Clicks on the "Make must read" button in the modal
   */
  async clickOnMakeMustReadButton(): Promise<void> {
    await test.step('Click on Make must read button', async () => {
      await this.clickOnElement(this.makeMustReadButton);
    });
  }

  /**
   * Verifies that the content is must read
   */
  async verifyContentIsMustRead(): Promise<void> {
    await test.step('Verify content is must read', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mustReadHeaderBar, {
        assertionMessage: 'Content should be must read',
      });

      await this.verifier.verifyTheElementIsVisible(this.mustReadConfirmBar, {
        assertionMessage: 'Please confirm you have read',
      });

      await this.verifier.verifyTheElementIsVisible(this.mustReadConfirmButton, {
        assertionMessage: 'Confirm',
      });
    });
  }

  /**
   * Verifies that the Must Read modal is not visible
   */
  async verifyContentIsNotAMustRead(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.mustReadHeaderBar, {
      assertionMessage: 'Content should not be must read',
    });
    await this.verifier.verifyTheElementIsNotVisible(this.mustReadConfirmBar, {
      assertionMessage: 'Please confirm you have read',
    });
    await this.verifier.verifyTheElementIsNotVisible(this.mustReadConfirmButton, {
      assertionMessage: 'Confirm',
    });
  }
}
