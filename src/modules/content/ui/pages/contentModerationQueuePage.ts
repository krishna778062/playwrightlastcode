import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IContentModerationQueueActions {
  clickQueuesTab(): Promise<void>;
  dismissPost: (postText: string) => Promise<void>;
  removePost: (postText: string) => Promise<void>;
  dismissComment: (commentText: string) => Promise<void>;
  removeComment: (commentText: string) => Promise<void>;
}

export interface IContentModerationQueueAssertions {
  verifyPostInQueue: (postText: string) => Promise<void>;
  verifyCommentInQueue: (commentText: string) => Promise<void>;
  verifyPostNotInQueue: (postText: string) => Promise<void>;
  verifyCommentNotInQueue: (commentText: string) => Promise<void>;
}

export class ContentModerationQueuePage
  extends BasePage
  implements IContentModerationQueueActions, IContentModerationQueueAssertions
{
  // Locators
  readonly queueContainer: (text: string) => Locator;
  readonly dismissButton: (text: string) => Locator;
  readonly removeButton: (text: string) => Locator;
  readonly queuesTab: Locator;
  readonly emptyQueueMessage: Locator;

  constructor(page: Page) {
    super(page, '');

    this.queueContainer = (text: string) => this.page.locator('div').filter({ hasText: text }).first();
    this.queuesTab = this.page.getByRole('tab', { name: 'Queue' });

    // Action buttons - using role-based selectors
    this.dismissButton = (text: string) =>
      this.queueContainer(text)
        .getByRole('button', { name: /dismiss/i })
        .first();

    // Remove button can be "Remove comment" or "Remove post" depending on content type
    this.removeButton = (text: string) =>
      this.queueContainer(text)
        .getByRole('button', { name: /remove (comment|post)/i })
        .first();

    this.emptyQueueMessage = this.page.getByText(/nothing to show|no items|queue is empty/i);
  }

  get actions(): IContentModerationQueueActions {
    return this;
  }

  get assertions(): IContentModerationQueueAssertions {
    return this;
  }

  /**
   * Verifies that the content moderation queue page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify content moderation queue page is loaded', async () => {
      // Wait for either the queue container or empty message to be visible
      await this.verifier.verifyTheElementIsVisible(this.queueContainer('').or(this.emptyQueueMessage), {
        assertionMessage: 'Content moderation queue page should be loaded',
      });
    });
  }

  async clickQueuesTab(): Promise<void> {
    await test.step('Click queues tab', async () => {
      await this.clickOnElement(this.queuesTab);
    });
  }

  /**
   * Dismisses a post from the moderation queue
   * @param postText - The text content of the post to dismiss
   */
  async dismissPost(postText: string): Promise<void> {
    await test.step(`Dismiss post from moderation queue: ${postText}`, async () => {
      // Verify post is in queue first
      await this.verifyPostInQueue(postText);

      // Click dismiss button
      const dismissBtn = this.dismissButton(postText);
      await this.verifier.verifyTheElementIsVisible(dismissBtn, {
        assertionMessage: `Dismiss button should be visible for post "${postText}"`,
      });
      await this.clickOnElement(dismissBtn);
    });
  }

  /**
   * Removes a post from the moderation queue
   * @param postText - The text content of the post to remove
   */
  async removePost(postText: string): Promise<void> {
    await test.step(`Remove post from moderation queue: ${postText}`, async () => {
      // Verify post is in queue first
      await this.verifyPostInQueue(postText);

      // Click remove button
      const removeBtn = this.removeButton(postText);
      await this.verifier.verifyTheElementIsVisible(removeBtn, {
        assertionMessage: `Remove button should be visible for post "${postText}"`,
      });
      await this.clickOnElement(removeBtn);

      // Handle confirmation dialog - "Remove post?" dialog appears
      const confirmDialog = this.page.getByRole('dialog', { name: 'Remove post?' });
      await this.verifier.verifyTheElementIsVisible(confirmDialog, {
        assertionMessage: 'Remove post confirmation dialog should be visible',
      });

      // Click Remove button in the dialog
      const removeButton = confirmDialog.getByRole('button', { name: 'Remove' });
      await this.clickOnElement(removeButton);
    });
  }

  /**
   * Dismisses a comment from the moderation queue
   * @param commentText - The text content of the comment to dismiss
   */
  async dismissComment(commentText: string): Promise<void> {
    await test.step(`Dismiss comment from moderation queue: ${commentText}`, async () => {
      // Verify comment is in queue first
      await this.verifyCommentInQueue(commentText);

      // Click dismiss button
      const dismissBtn = this.dismissButton(commentText);
      await this.verifier.verifyTheElementIsVisible(dismissBtn, {
        assertionMessage: `Dismiss button should be visible for comment "${commentText}"`,
      });
      await this.clickOnElement(dismissBtn);
    });
  }

  /**
   * Removes a comment or reply from the moderation queue
   * @param commentText - The text content of the comment/reply to remove
   */
  async removeComment(commentText: string): Promise<void> {
    await test.step(`Remove comment/reply from moderation queue: ${commentText}`, async () => {
      // Verify comment/reply is in queue first
      await this.verifyCommentInQueue(commentText);

      // Click remove button
      const removeBtn = this.removeButton(commentText);
      await this.verifier.verifyTheElementIsVisible(removeBtn, {
        assertionMessage: `Remove button should be visible for comment/reply "${commentText}"`,
      });
      await this.clickOnElement(removeBtn);

      // Handle confirmation dialog - can be "Remove post?" or "Remove reply?" depending on content type
      // Try "Remove reply?" first (for replies), then fall back to "Remove post?" (for comments)
      let confirmDialog = this.page.getByRole('dialog', { name: 'Remove reply?' });
      const isReplyDialogVisible = await confirmDialog.isVisible().catch(() => false);

      if (!isReplyDialogVisible) {
        // If "Remove reply?" dialog is not visible, try "Remove post?" dialog
        confirmDialog = this.page.getByRole('dialog', { name: 'Remove post?' });
      }

      await this.verifier.verifyTheElementIsVisible(confirmDialog, {
        assertionMessage: 'Remove confirmation dialog should be visible',
      });

      // Click Remove button in the dialog
      const removeButton = confirmDialog.getByRole('button', { name: 'Remove' });
      await this.clickOnElement(removeButton);
    });
  }

  /**
   * Verifies that a post appears in the moderation queue
   * @param postText - The text content of the post to verify
   */
  async verifyPostInQueue(postText: string): Promise<void> {
    await test.step(`Verify post is in moderation queue: ${postText}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.queueContainer(postText), {
        assertionMessage: `Post "${postText}" should be visible in moderation queue`,
      });
    });
  }

  /**
   * Verifies that a comment appears in the moderation queue
   * @param commentText - The text content of the comment to verify
   */
  async verifyCommentInQueue(commentText: string): Promise<void> {
    await test.step(`Verify comment is in moderation queue: ${commentText}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.queueContainer(commentText), {
        assertionMessage: `Comment "${commentText}" should be visible in moderation queue`,
      });
    });
  }

  /**
   * Verifies that a post does NOT appear in the moderation queue
   * @param postText - The text content of the post to verify
   */
  async verifyPostNotInQueue(postText: string): Promise<void> {
    await test.step(`Verify post is not in moderation queue: ${postText}`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.queueContainer(postText), {
        assertionMessage: `Post "${postText}" should not be visible in moderation queue`,
      });
    });
  }

  /**
   * Verifies that a comment does NOT appear in the moderation queue
   * @param commentText - The text content of the comment to verify
   */
  async verifyCommentNotInQueue(commentText: string): Promise<void> {
    await test.step(`Verify comment is not in moderation queue: ${commentText}`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.queueContainer(commentText), {
        assertionMessage: `Comment "${commentText}" should not be visible in moderation queue`,
      });
    });
  }
}
