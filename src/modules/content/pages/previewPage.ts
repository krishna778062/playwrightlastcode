import { Page, test } from '@playwright/test';

import { PromotePageModal } from '../components/promotePageModal';

import { BasePage } from '@/src/core/pages/basePage';

export interface IPreviewPageActions {
  handlePromotionPageStep: () => Promise<void>;
  openSendFeedbackTab: () => Promise<void>;
  closeFeedbackModal: () => Promise<void>;
  openVersionHistory: () => Promise<void>;
  clickOptionMenuDropdown: () => Promise<void>;
  clickUnpublishButton: () => Promise<void>;
  clickDeleteButton: () => Promise<void>;
  confirmDelete: () => Promise<void>;
  fetchContentTypeDetailsUrl: () => Promise<string>;
  navigateToSiteContentTab: () => Promise<void>;
}

export interface IPreviewPageAssertions {
  verifyContentPublishedSuccessfully: (title: string, successMessage: string) => Promise<void>;
  verifySendHistoryTabPopup: () => Promise<void>;
  verifyVersionHistoryTabPopup: () => Promise<void>;
  verifyAlbumUnpublishFunctionality: () => Promise<void>;
  verifyAlbumDeleteFunctionality: () => Promise<void>;
}

export class PreviewPage extends BasePage implements IPreviewPageActions, IPreviewPageAssertions {
  // Additional locators for promotion and verification
  readonly contentTitleHeading = (title: string) => this.page.locator('h1', { hasText: title });
  readonly successMessage = (message: string) =>
    this.page.locator('div[class*="Toast-module"] p', { hasText: message });

  // Action locators
  readonly sendFeedbackTab = this.page.locator('[data-testid="send-feedback-tab"]');
  readonly closeModalButton = this.page.locator('[data-testid="close-modal-button"]');
  readonly versionHistoryButton = this.page.locator('button:has-text("Version history")');
  readonly optionMenuDropdown = this.page.locator('[data-testid="option-menu-dropdown"]');
  readonly unpublishButton = this.page.locator('button:has-text("Unpublish")');
  readonly deleteButton = this.page.locator('button:has-text("Delete")');
  readonly siteContentTab = this.page.locator(
    'a[href*="/content"], button:has-text("Content"), [data-testid="content-tab"]'
  );

  // Assertion locators
  readonly sendHistoryPopup = this.page.locator('[data-testid="send-history-popup"]');
  readonly versionHistoryPopup = this.page.locator('[data-testid="version-history-popup"]');

  // Page components
  readonly promotePageModal: PromotePageModal;

  constructor(page: Page) {
    super(page);
    this.promotePageModal = new PromotePageModal(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // Empty implementation - preview page doesn't need specific loading verification
  }

  get actions(): IPreviewPageActions {
    return this;
  }

  get assertions(): IPreviewPageAssertions {
    return this;
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
   * @param successMessage - The expected success message to verify
   */
  async verifyContentPublishedSuccessfully(
    title: string,
    successMessage: string = "Created page successfully - it's published"
  ): Promise<void> {
    await test.step(`Verifying content was published successfully`, async () => {
      // Verify success message is visible
      await this.verifier.verifyTheElementIsVisible(this.successMessage(successMessage), {
        assertionMessage: 'Success message should be visible after publishing',
      });

      await this.verifier.verifyTheElementIsVisible(this.contentTitleHeading(title), {
        assertionMessage: `Content title "${title}" should be visible in heading`,
      });
    });
  }

  // Action method implementations
  async openSendFeedbackTab(): Promise<void> {
    await this.clickOnElement(this.sendFeedbackTab, {
      stepInfo: 'Click send feedback tab',
    });
  }

  async closeFeedbackModal(): Promise<void> {
    await this.clickOnElement(this.closeModalButton, {
      stepInfo: 'Click close modal button',
    });
  }

  async openVersionHistory(): Promise<void> {
    await this.clickOnElement(this.versionHistoryButton, {
      stepInfo: 'Click version history button',
    });
  }

  async clickOptionMenuDropdown(): Promise<void> {
    await this.clickOnElement(this.optionMenuDropdown, {
      stepInfo: 'Click option menu dropdown',
    });
  }

  async clickUnpublishButton(): Promise<void> {
    await this.clickOnElement(this.unpublishButton, {
      stepInfo: 'Click unpublish button',
    });
  }

  async clickDeleteButton(): Promise<void> {
    await this.clickOnElement(this.deleteButton, {
      stepInfo: 'Click delete button',
    });
  }

  async confirmDelete(): Promise<void> {
    await this.clickOnElement(this.deleteButton, {
      stepInfo: 'Confirm delete action',
    });
  }

  async fetchContentTypeDetailsUrl(): Promise<string> {
    return this.page.url();
  }

  async navigateToSiteContentTab(): Promise<void> {
    await this.clickOnElement(this.siteContentTab, {
      stepInfo: 'Navigate to site content tab',
    });
  }

  // Assertion method implementations
  async verifySendHistoryTabPopup(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.sendHistoryPopup, {
      assertionMessage: 'Send history popup should be visible',
    });
  }

  async verifyVersionHistoryTabPopup(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.versionHistoryPopup, {
      assertionMessage: 'Version history popup should be visible',
    });
  }

  async verifyAlbumUnpublishFunctionality(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator('text=Album unpublished successfully'), {
      assertionMessage: 'Album unpublished success message should be visible',
    });
  }

  async verifyAlbumDeleteFunctionality(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator('text=Album deleted successfully'), {
      assertionMessage: 'Album deleted success message should be visible',
    });
  }
}
