import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export enum PromotePageOptions {
  ADD_TO_HOME_CAROUSEL = 'Add to home carousel',
  ADD_TO_SITE_CAROUSEL = 'Add to site carousel',
  SEND_NOTIFICATION = 'Send notification',
}

export class PromotePageModal extends BaseComponent {
  readonly skipPromotionButton: Locator;
  readonly promoteButton: Locator;
  readonly promoteActions: (action: PromotePageOptions) => Locator;
  readonly closePromotePageModalButton: Locator;

  constructor(page: Page) {
    super(page);
    this.skipPromotionButton = page.locator('button', { hasText: 'Skip this step' });
    this.promoteButton = page.locator('button', { hasText: 'Promote' });
    this.promoteActions = (action: PromotePageOptions) => page.getByLabel(action);
    this.closePromotePageModalButton = page.getByLabel('Close');
  }

  /**
   * Verifies the promote page modal is visible
   */
  async verifyThePromotePageModalIsVisible() {
    await this.verifier.verifyTheElementIsVisible(this.promoteButton, {
      assertionMessage: 'Promote page modal should be visible',
    });
  }

  /**
   * Closes the promote page modal
   */
  async closePromotePageModal() {
    await this.clickOnElement(this.closePromotePageModalButton);
  }

  /**
   * Selects the promote action
   * @param action - The action to select
   */
  async selectPromoteAction(action: PromotePageOptions) {
    await this.clickOnElement(this.promoteActions(action));
  }

  /**
   * Skips the promotion
   */
  async clickOnSkipPromotionButton() {
    await this.clickOnElement(this.skipPromotionButton);
  }

  /**
   * Clicks on the promote button
   */
  async clickOnPromoteButton() {
    await this.clickOnElement(this.promoteButton);
  }

  /**
   * Handles the promotion
   * @param options - The options for handling the promotion
   */
  async handlePromotion(options?: { promoteAction?: PromotePageOptions }) {
    if (await this.verifier.isTheElementVisible(this.skipPromotionButton, { timeout: 10_000 })) {
      await this.clickOnSkipPromotionButton();
    }
  }
}
