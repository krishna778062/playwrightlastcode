import { Page, test } from '@playwright/test';

import { PromotePageModal } from '../components/promotePageModal';

import { BasePage } from '@/src/core/pages/basePage';

export interface IPreviewPageActions {
  handlePromotionPageStep: () => Promise<void>;
}

export interface IPreviewPageAssertions {
  verifyContentPublishedSuccessfully: (title: string) => Promise<void>;
}

export class PreviewPage extends BasePage implements IPreviewPageActions, IPreviewPageAssertions {
  // Additional locators for promotion and verification
  readonly contentTitleHeading = (title: string) => this.page.locator('h1', { hasText: title });
  readonly successMessage = (message: string) =>
    this.page.locator('div[class*="Toast-module"] p', { hasText: message });
  readonly promotePageModal: PromotePageModal;

  constructor(page: Page) {
    super(page);
    this.promotePageModal = new PromotePageModal(page);
  }

  // Actions
  get actions(): IPreviewPageActions {
    return this;
  }

  // Assertions
  get assertions(): IPreviewPageAssertions {
    return this;
  }

  /**
   * Verifies the preview page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify preview page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Handles the promotion page step by calling the promote page modal
   */
  async handlePromotionPageStep(): Promise<void> {
    await test.step('Handling promotion page step', async () => {
      await this.promotePageModal.handlePromotion();
    });
  }

  /**
   * Verifies that the content was published successfully
   * @param title - The title of the content to verify
   */
  async verifyContentPublishedSuccessfully(title: string): Promise<void> {
    await test.step(`Verifying content was published successfully`, async () => {
      // Verify success message is visible
      await this.verifier.verifyTheElementIsVisible(this.successMessage("Created page successfully - it's published"), {
        assertionMessage: 'Success message should be visible after publishing',
      });

      await this.verifier.verifyTheElementIsVisible(this.contentTitleHeading(title), {
        assertionMessage: `Content title "${title}" should be visible in heading`,
      });
    });
  }
}
