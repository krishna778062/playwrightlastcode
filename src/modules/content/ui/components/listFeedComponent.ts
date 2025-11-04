import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ListFeedComponent extends BaseComponent {
  // Post options section
  readonly deleteButton: Locator;
  readonly deleteConfirmDialog: Locator;
  readonly deleteConfirmButton: Locator;
  readonly closeButton: Locator;
  readonly inlineImagePreview: Locator;
  readonly favoriteButton: Locator;
  readonly unfavoriteButton: Locator;
  readonly likeButton: Locator;
  readonly editButton: Locator;
  readonly replyButton: Locator;
  readonly replyInput: Locator;
  readonly submitReplyButton: Locator;
  readonly replyEditor: Locator;
  readonly replyShowMoreButton: Locator;
  readonly postsIFollow: Locator;
  readonly sortByRecentActivity: Locator;
  readonly feedLinkWithDescription = (description: string) => this.page.locator('p').filter({ hasText: description });
  readonly sharefeedLink = (linkText: string) => this.page.locator('a').filter({ hasText: linkText });
  readonly shareSocialCampaignButton = (description: string) =>
    this.page.locator(`xpath=//p[text()='${description}']/../../..//span[text()='Share']`);
  // Like/Unlike locators
  /**
   * Gets the like button locator for a post
   * @param postText - The text of the post
   * @returns Locator for the like button
   */
  likeButtonForPost(postText: string): Locator {
    // "React" (when not liked) or "Remove your reaction" (when liked)
    const postContainer = this.getPostContainer(postText);

    // Find button in action row with aria-label containing "React" or "Remove"
    return postContainer
      .locator(
        'xpath=.//div[contains(@class, "_actionRow_")]//button[contains(@class, "_actionBtn_") and (contains(@aria-label, "React") or contains(@aria-label, "Remove"))]'
      )
      .first();
  }

  /**
   * Gets the like button locator for a reply
   * @param replyText - The text of the reply
   * @returns Locator for the like button
   */
  likeButtonForReply(replyText: string): Locator {
    const replyContainer = this.getReplyContainer(replyText);

    // Find button in action bar with class _replyButton_ or aria-label containing "React"/"Remove"
    return replyContainer
      .locator(
        'xpath=.//div[contains(@class, "_actionBar_")]//button[(contains(@class, "_replyButton_") or contains(@aria-label, "React") or contains(@aria-label, "Remove"))]'
      )
      .first();
  }

  /**
   * Gets the like count locator for a post
   * @param postText - The text of the post
   * @returns Locator for the like count element
   */
  likeCountLocator(postText: string): Locator {
    const postContainer = this.getPostContainer(postText);

    // Find the reaction button in stats row that contains the count
    return postContainer
      .locator('xpath=.//div[contains(@class, "_statsRow_")]//button[contains(@class, "_reactionButton_")]')
      .first();
  }

  /**
   * Gets the like count locator for a reply
   * @param replyText - The text of the reply
   * @returns Locator for the like count element
   */
  likeCountLocatorForReply(replyText: string): Locator {
    const replyContainer = this.getReplyContainer(replyText);

    return replyContainer
      .locator(
        'xpath=.//div[contains(@class, "_actionBar_")]//button[contains(@class, "type--tertiary") and contains(@class, "type--b5")]'
      )
      .first();
  }
  // Dynamic locator functions
  /**
   * Gets a locator for the post text content
   * @param text - The text content to find
   * @returns Locator for the post text
   */
  readonly getFeedTextLocator = (text: string): Locator =>
    this.page.locator("div[class*='postContent']").filter({ hasText: text });

  readonly successMessage = (message: string) =>
    this.page.locator('div[class*="Toast-module"] p', { hasText: message });
  readonly versionImageLocator = (fileId: string): Locator => this.page.locator(`img[src*="${fileId}"]`);

  /**
   * Gets a locator for the post timestamp
   * @param postText - The text of the post to find timestamp for
   * @returns Locator for the post timestamp
   */
  readonly getPostTimestampLocator = (postText: string): Locator =>
    this.page.locator(
      `xpath=//p[text()='${postText}']/ancestor::div[4]//div[contains(@class,'nameAndStatement')]/following-sibling::p/a`
    );
  readonly imageButton = this.page.locator("button[aria-label='Open image in lightbox']");
  readonly infoIcon = this.page.getByTestId('i-info');

  readonly postTextLocator = (postText: string): Locator => this.page.locator('p').filter({ hasText: postText });

  readonly replyLocator = (replyText: string): Locator =>
    this.page.locator('div[class*="replyContent"] p').filter({ hasText: replyText }).first();

  /**
   * Gets a locator for the post attachments
   * @param postText - The text of the post to find attachments for
   * @returns Locator for the post attachments
   */
  readonly getPostAttachmentsLocator = (postText: string): Locator =>
    this.page.locator(`div[class*='postContent']`).filter({ hasText: postText }).locator('li');

  /**
   * Gets a locator for the lightbox button on images
   * @param postText - The text of the post to find lightbox button for
   * @returns Locator for the lightbox button
   */
  readonly getLightboxButtonLocator = (postText: string): Locator =>
    this.page
      .locator('p')
      .filter({ hasText: postText })
      .locator('xpath=./ancestor::div[3]')
      .locator("button[aria-label='Open image in lightbox']");

  /**
   * Gets a locator for the post options menu
   * @param postText - The text of the post to find options menu for
   * @returns Locator for the options menu button
   */
  readonly getPostOptionsMenuLocator = (postText: string): Locator =>
    this.page
      .locator('p')
      .filter({ hasText: postText })
      .locator('xpath=./ancestor::div[4]')
      .locator("button[class*='optionlauncher']")
      .first();

  /**
   * Gets a locator for the favorited state indicator for a specific post
   * @param postText - The text of the post to check favorite state for
   * @returns Locator for the favorited state indicator
   */
  readonly getFavoritedStateLocator = (postText: string): Locator =>
    this.page
      .locator('p')
      .filter({ hasText: postText })
      .locator('xpath=./ancestor::div[4]')
      .locator("button[aria-label*='liked'], button[class*='liked'], svg[class*='liked'], .liked")
      .first();

  constructor(page: Page) {
    super(page);
    this.favoriteButton = this.page.getByRole('button', { name: 'Favorite this post' });
    this.deleteButton = this.page.locator("div:text('Delete')");
    this.editButton = this.page.locator("div:text('Edit')");
    this.deleteConfirmDialog = this.page.locator('div[role="dialog"]');
    this.deleteConfirmButton = this.page.getByRole('button', { name: 'Delete' });
    this.closeButton = this.page.locator("button[class*='closeBtn']");
    this.inlineImagePreview = this.page.locator("div[class*='gallerySlide'] img");
    this.unfavoriteButton = this.page.getByRole('button', { name: 'Unfavorite this post' });
    this.likeButton = this.page.getByRole('button', { name: 'React to this post' });
    this.replyButton = this.page.getByRole('button', { name: 'Reply on this post' }).first();
    this.replyButton = this.page.locator('p').filter({ hasText: 'Reply' }).first();
    this.replyInput = this.page.locator('div[class*="ProseMirror"] p[data-placeholder*="Leave a reply"]').first();
    this.submitReplyButton = this.page.getByRole('button', { name: 'Reply', exact: true }).first();
    this.replyEditor = this.page.getByRole('textbox', { name: 'You are in the content editor' });
    this.replyShowMoreButton = this.page.getByTestId('replyContent').getByRole('button', { name: 'Show more' });
    this.postsIFollow = this.page.locator('[aria-label="Show"]:has-text("Posts I follow")');
    this.sortByRecentActivity = this.page.locator('[aria-label="Sort by"]:has-text("Recent activity")');
  }

  /**
   * Gets the post container element for a given post text
   * @param postText - The text of the post
   * @returns Locator for the post container
   */
  private getPostContainer(postText: string): Locator {
    // Find post by text, then get the _postBody container
    return this.page
      .locator('p')
      .filter({ hasText: postText })
      .locator('xpath=./ancestor::div[contains(@class, "_postBody_")]')
      .first();
  }

  /**
   * Gets the reply container element for a given reply text
   * @param replyText - The text of the reply
   * @returns Locator for the reply container
   */
  private getReplyContainer(replyText: string): Locator {
    // Find reply by text in replyContent, then get the _reply container
    return this.page
      .locator('div[class*="replyContent"] p')
      .filter({ hasText: replyText })
      .locator('xpath=./ancestor::div[contains(@class, "_reply_")]')
      .first();
  }

  /**
   * Ensures an element is visible, enabled, and scrolled into view before interaction
   * @param locator - The locator to ensure is actionable
   */
  private async ensureElementIsActionable(locator: Locator): Promise<void> {
    // First ensure the element is visible
    await this.verifier.verifyTheElementIsVisible(locator, {
      assertionMessage: 'Element should be visible before interaction',
    });

    // Scroll into view if needed
    await locator.scrollIntoViewIfNeeded();

    // Ensure element is enabled
    await locator.waitFor({ state: 'visible', timeout: 1000 });
  }

  /**
   * Waits for like/unlike action to complete by waiting for API response and DOM updates
   * @param text - The text of the post or reply
   * @param isReply - Whether this is a reply (true) or post (false)
   */
  private async waitForLikeActionComplete(text: string, isReply: boolean): Promise<void> {
    // Wait for any feed-related API response (like/unlike actions typically trigger feed updates)
    // Note: Like actions might not have a specific endpoint, so we wait for the like count to update
    // We'll wait for the like count element to appear/update, which indicates the action completed

    const likeCountLocator = isReply ? this.likeCountLocatorForReply(text) : this.likeCountLocator(text);

    // Wait for like count to stabilize (either appear if it didn't exist, or update if it did)
    // We use a timeout to ensure we don't wait forever if the count doesn't change
    try {
      // Wait for the element to be visible, or wait a bit if it doesn't exist (0 likes)
      await likeCountLocator.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {
        // If element doesn't exist, it might be 0 likes - that's okay, just wait a bit
        return Promise.resolve();
      });
    } catch {
      console.log('Error waiting for like count to stabilize');
    }
  }

  /**
   * Gets the timestamp text for a specific post
   * @param postText - The text of the post to find timestamp for
   */
  async getPostTimestamp(postText: string): Promise<void> {
    (await this.getPostTimestampLocator(postText).textContent()) || '';
  }

  /**
   * Opens the options menu for a post
   * @param postText - Text of the post to open options for
   */
  async openPostOptionsMenu(postText: string): Promise<void> {
    await test.step('Open post options menu', async () => {
      await this.clickOnElement(this.getPostOptionsMenuLocator(postText));
    });
  }

  /**
   * Clicks the delete option in the options menu
   */
  async clickDeleteOption(): Promise<void> {
    await test.step('Click delete option', async () => {
      await this.clickOnElement(this.deleteButton);
    });
  }

  /**
   * Confirms the delete action in the confirmation dialog
   */
  async confirmDelete(): Promise<void> {
    await test.step('Confirm delete', async () => {
      await this.clickOnElement(this.deleteConfirmButton);
    });
  }

  /**
   * Clicks the inline image preview to open lightbox
   */
  async clickInlineImagePreview(postText: string): Promise<void> {
    await test.step('Click on inline image preview', async () => {
      await this.clickOnElement(this.getLightboxButtonLocator(postText).first());
    });
  }

  /**
   * Closes the image preview lightbox
   */
  async closeImagePreview(): Promise<void> {
    await test.step('Close image preview', async () => {
      await this.clickOnElement(this.closeButton);
    });
  }

  /**
   * Waits for and verifies that a post is visible
   * @param expectedText - Expected text of the post
   */
  async waitForPostToBeVisible(expectedText: string): Promise<void> {
    console.log('Waiting for post to be visible: ', expectedText);
    await test.step(`Wait for post to be visible: ${expectedText}`, async () => {
      const postLocator = this.getFeedTextLocator(expectedText).first();
      await this.verifier.verifyTheElementIsVisible(postLocator, {
        timeout: 30000,
        assertionMessage: `Post with text "${expectedText}" should be visible`,
      });
      await postLocator.scrollIntoViewIfNeeded().catch(() => {});
    });
  }

  /**
   * Verifies that the inline image preview is visible
   */
  async verifyInlineImagePreviewVisible(): Promise<void> {
    await test.step('Verify inline image preview is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.inlineImagePreview.first());
    });
  }

  async markPostAsFavourite(): Promise<void> {
    await test.step(`Mark post as favourite: `, async () => {
      await this.hoverOverElementInJavaScript(this.likeButton);
      //verify the favourite button is visible
      await this.verifier.verifyTheElementIsVisible(this.favoriteButton, {
        assertionMessage: `verify the favourite button is visible`,
      });
      await this.clickOnElement(this.favoriteButton, { delay: 1000 });
    });
  }

  async removePostFromFavourite(postText: string): Promise<void> {
    await test.step(`Remove post from favourite: ${postText}`, async () => {
      await this.hoverOverElementInJavaScript(this.likeButton);

      await this.verifier.verifyTheElementIsVisible(this.unfavoriteButton, {
        assertionMessage: `Post "${postText}" should be in favourited state`,
      });
      await this.clickOnElement(this.unfavoriteButton, { delay: 1000 });
    });
  }

  async verifyPostIsFavorited(postText: string): Promise<void> {
    await test.step(`Verify post is favorited: ${postText}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.unfavoriteButton, {
        assertionMessage: `Post "${postText}" should be in favourited state`,
      });
    });
  }

  async verifyPostIsNotFavorited(postText: string): Promise<void> {
    await test.step(`Verify post is not favorited: ${postText}`, async () => {
      await this.hoverOverElementInJavaScript(this.likeButton);
      await this.verifier.verifyTheElementIsVisible(this.favoriteButton, {
        assertionMessage: `Post "${postText}" should be in unfavorited state`,
      });
    });
  }

  /**
   * Validates that a post contains the expected text
   * @param postText - The expected text content to validate
   */
  async validatePostText(postText: string): Promise<void> {
    await test.step(`Validating post contains text: "${postText}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.postTextLocator(postText), {
        assertionMessage: `Post "${postText}" should be visible`,
      });
    });
  }

  /**
   * Validates that a post contains the expected text
   * @param postText - The expected text content to validate
   */
  async validatePostNotVisible(postText: string): Promise<void> {
    await test.step(`Validating post contains text: "${postText}"`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.postTextLocator(postText), {
        assertionMessage: `Post "${postText}" should not be visible`,
      });
    });
  }

  async clickInfoIcon(fileId: string): Promise<void> {
    await test.step('Click info icon', async () => {
      await this.imageButton.hover();
      console.log('Waiting for API: ', `${API_ENDPOINTS.content.files}/${fileId}`);
      const fileApiPromise = this.page.waitForResponse(
        response =>
          response.url().includes(`${API_ENDPOINTS.content.files}/${fileId}`) &&
          response.request().method() === 'POST' &&
          response.status() === 200
      );
      await this.clickOnElement(this.infoIcon);

      await fileApiPromise;
    });
  }

  async verifyImageButtonIsNotVisible(): Promise<void> {
    await test.step('Verify image button is not visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.successMessage('Deleted file successfully'));
      await this.verifier.verifyTheElementIsNotVisible(this.imageButton);
    });
  }

  /**
   * Adds a reply to a specific post
   * @param postText - The text of the post to reply to
   * @param replyText - The reply text to add
   */
  async addReplyToPost(replyText: string): Promise<void> {
    await test.step(`Add reply to post`, async () => {
      // Click reply button
      //add API wait for response
      const replyApiPromise = this.page.waitForResponse(
        response =>
          response.url().includes(API_ENDPOINTS.feed.rudderstack) &&
          response.request().method() === 'POST' &&
          response.status() === 200
      );

      await this.clickOnElement(this.replyButton, { stepInfo: 'Clicking on reply button' });

      await replyApiPromise;
      await this.verifier.verifyTheElementIsVisible(this.replyInput, {
        assertionMessage: `Reply input should be visible`,
      });

      await this.fillInElement(this.replyEditor, replyText);

      // Click submit reply button
      await this.clickOnElement(this.submitReplyButton);
    });
  }

  /**
   * Verifies that a reply is visible under a specific post
   * @param postText - The text of the original post
   * @param replyText - The text of the reply to verify
   */
  async verifyReplyIsVisible(replyText: string): Promise<void> {
    await test.step(`Verify reply is visible under post`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.replyLocator(replyText), {
        assertionMessage: `Reply "${replyText}" should be visible under post`,
      });
    });
  }

  async verifyReplyIsNotVisible(replyText: string): Promise<void> {
    await test.step(`Verify reply is not visible under post`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.replyLocator(replyText), {
        assertionMessage: `Reply "${replyText}" should not be visible under post`,
      });
    });
  }

  /**
   *
   * @param postText Click reply show more button
   */

  async clickReplyShowMoreButton(): Promise<void> {
    await test.step(`Click reply show more button`, async () => {
      await this.hoverOverElementInJavaScript(this.replyShowMoreButton);
      await this.clickOnElement(this.replyShowMoreButton);
    });
  }

  async clickEditButton(): Promise<void> {
    await test.step(`Click edit button`, async () => {
      await this.clickOnElement(this.editButton);
    });
  }

  async verifyVersionImageIsDisplayed(fileId: string): Promise<void> {
    await test.step(`Verify version image is displayed for fileId: ${fileId}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.versionImageLocator(fileId), {
        assertionMessage: `Version image with fileId ${fileId} should be visible`,
      });
    });
  }

  async clickOnInfoIcon(fileId: string): Promise<void> {
    await test.step(`Click on info icon for fileId: ${fileId}`, async () => {
      await this.clickOnElement(this.infoIcon);
    });
  }

  async verifyPostsIFollow(): Promise<void> {
    await test.step('Verify posts i follow', async () => {
      await this.verifier.verifyTheElementIsVisible(this.postsIFollow);
    });
  }

  async verifySortByRecentActivity(): Promise<void> {
    await test.step('Verify sort by recent activity', async () => {
      await this.verifier.verifyTheElementIsVisible(this.sortByRecentActivity);
    });
  }

  async verifyCampaignLinkDisplayed(linkText: string, description: string): Promise<void> {
    await test.step(`Verify campaign link "${linkText}" is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.feedLinkWithDescription(description), {
        assertionMessage: `Shared Description "${description}" should be visible`,
      });
      await this.verifier.verifyTheElementIsVisible(this.sharefeedLink(linkText), {
        assertionMessage: `Campaign link "${linkText}" should be visible`,
      });
    });
  }

  async verifyCampaignLinkNotDisplayed(linkText: string, description: string): Promise<void> {
    await test.step(`Verify campaign link "${linkText}" is not displayed`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.feedLinkWithDescription(description), {
        assertionMessage: `Shared Description "${description}" should not be visible`,
      });

      await this.verifier.verifyTheElementIsNotVisible(this.sharefeedLink(linkText), {
        assertionMessage: `Campaign link "${linkText}" should not be visible`,
      });
    });
  }

  async verifySocialCampaignShareButtonIsNotVisible(description: string): Promise<void> {
    await test.step('Verify share button is not visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.shareSocialCampaignButton(description), {
        assertionMessage: 'Share button should not be visible',
      });
    });
  }

  async verifySocialCampaignShareButtonIsVisible(description: string): Promise<void> {
    await test.step('Verify share button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareSocialCampaignButton(description), {
        assertionMessage: 'Share button should be visible',
      });
    });
  }

  /**
   * Likes a feed post by clicking the like button
   * @param postText - The text of the post to like
   */
  async likeFeedPost(postText: string): Promise<void> {
    await test.step(`Like feed post: ${postText}`, async () => {
      // Ensure post is visible first
      await this.waitForPostToBeVisible(postText);

      const likeButton = this.likeButtonForPost(postText);

      // Ensure button is actionable (visible, scrolled into view, enabled)
      await this.ensureElementIsActionable(likeButton);

      // Click the like button
      await this.clickOnElement(likeButton);

      // Wait for like action to complete (API response and DOM updates)
      await this.waitForLikeActionComplete(postText, false);
    });
  }

  /**
   * Unlikes a feed post by clicking the like button again
   * @param postText - The text of the post to unlike
   */
  async unlikeFeedPost(postText: string): Promise<void> {
    await test.step(`Unlike feed post: ${postText}`, async () => {
      // Ensure post is visible first
      await this.waitForPostToBeVisible(postText);

      const likeButton = this.likeButtonForPost(postText);

      // Ensure button is actionable (visible, scrolled into view, enabled)
      await this.ensureElementIsActionable(likeButton);

      // Click the like button to unlike
      await this.clickOnElement(likeButton);

      // Wait for unlike action to complete (API response and DOM updates)
      await this.waitForLikeActionComplete(postText, false);
    });
  }

  /**
   * Likes a reply post by clicking the like button
   * @param replyText - The text of the reply to like
   */
  async likeFeedReply(replyText: string): Promise<void> {
    await test.step(`Like feed reply: ${replyText}`, async () => {
      // Ensure reply is visible first
      await this.verifier.verifyTheElementIsVisible(this.replyLocator(replyText), {
        timeout: 1500,
        assertionMessage: `Reply "${replyText}" should be visible`,
      });

      const likeButton = this.likeButtonForReply(replyText);

      // Ensure button is actionable (visible, scrolled into view, enabled)
      await this.ensureElementIsActionable(likeButton);

      // Click the like button
      await this.clickOnElement(likeButton);

      // Wait for like action to complete (API response and DOM updates)
      await this.waitForLikeActionComplete(replyText, true);
    });
  }

  /**
   * Unlikes a reply post by clicking the like button again
   * @param replyText - The text of the reply to unlike
   */
  async unlikeFeedReply(replyText: string): Promise<void> {
    await test.step(`Unlike feed reply: ${replyText}`, async () => {
      // Ensure reply is visible first
      await this.verifier.verifyTheElementIsVisible(this.replyLocator(replyText), {
        timeout: 1500,
        assertionMessage: `Reply "${replyText}" should be visible`,
      });

      const likeButton = this.likeButtonForReply(replyText);

      // Ensure button is actionable (visible, scrolled into view, enabled)
      await this.ensureElementIsActionable(likeButton);

      // Click the like button to unlike
      await this.clickOnElement(likeButton);

      // Wait for unlike action to complete (API response and DOM updates)
      await this.waitForLikeActionComplete(replyText, true);
    });
  }

  /**
   * Verifies the like count on a feed post
   * @param postText - The text of the post to check like count for
   * @param expectedCount - Optional expected count (if provided, will verify exact count)
   */
  async verifyLikeCountOnPost(postText: string, expectedCount?: number): Promise<void> {
    await test.step(`Verify like count on post: ${postText}`, async () => {
      // Ensure post is visible first
      await this.waitForPostToBeVisible(postText);

      const likeCountLocator = this.likeCountLocator(postText);

      // Wait for like count element to stabilize (either appear or update)
      // If expectedCount is 0 or undefined, element might not exist, which is okay
      if (expectedCount === 0 || expectedCount === undefined) {
        // Try to wait for element, but don't fail if it doesn't exist (0 likes)
        try {
          await likeCountLocator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {
            // Element doesn't exist - likely 0 likes, which is valid
            return;
          });
        } catch {
          // If element doesn't exist and we're not expecting a count, that's fine
          if (expectedCount === undefined) {
            return;
          }
        }
      } else {
        // If we expect a count > 0, wait for element to be visible
        await likeCountLocator.waitFor({ state: 'visible', timeout: 5000 });
      }

      // Check if like count element exists
      const count = await likeCountLocator.count();
      if (count === 0) {
        if (expectedCount === undefined || expectedCount === 0) {
          // Element doesn't exist and we're okay with that (0 likes or no expectation)
          return;
        } else {
          // We expected a count but element doesn't exist
          throw new Error(
            `Expected like count ${expectedCount} for post "${postText}", but like count element is not visible`
          );
        }
      }

      // Verify element is visible
      await this.verifier.verifyTheElementIsVisible(likeCountLocator, {
        assertionMessage: `Like count should be visible for post "${postText}"`,
      });

      // If expected count is provided, verify it matches
      if (expectedCount !== undefined) {
        // Wait for text content to be available and stable
        await likeCountLocator.waitFor({ state: 'visible', timeout: 1000 });
        const countText = await likeCountLocator.textContent();
        // Extract number from text like "1 reaction" or just "1"
        const match = countText?.match(/(\d+)/);
        const actualCount = match ? parseInt(match[1], 10) : 0;
        if (actualCount !== expectedCount) {
          throw new Error(`Expected like count ${expectedCount}, but got ${actualCount} for post "${postText}"`);
        }
      }
    });
  }

  /**
   * Verifies the like count on a reply post
   * @param replyText - The text of the reply to check like count for
   * @param expectedCount - Optional expected count (if provided, will verify exact count)
   */
  async verifyLikeCountOnReply(replyText: string, expectedCount?: number): Promise<void> {
    await test.step(`Verify like count on reply: ${replyText}`, async () => {
      // Ensure reply is visible first
      await this.verifier.verifyTheElementIsVisible(this.replyLocator(replyText), {
        timeout: 1000,
        assertionMessage: `Reply "${replyText}" should be visible`,
      });

      const likeCountLocator = this.likeCountLocatorForReply(replyText);

      // Wait for like count element to stabilize (either appear or update)
      // If expectedCount is 0 or undefined, element might not exist, which is okay
      if (expectedCount === 0 || expectedCount === undefined) {
        // Try to wait for element, but don't fail if it doesn't exist (0 likes)
        try {
          await likeCountLocator.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {
            // Element doesn't exist - likely 0 likes, which is valid
            return;
          });
        } catch {
          // If element doesn't exist and we're not expecting a count, that's fine
          if (expectedCount === undefined) {
            return;
          }
        }
      } else {
        // If we expect a count > 0, wait for element to be visible
        await likeCountLocator.waitFor({ state: 'visible', timeout: 1000 });
      }

      // Check if like count element exists
      const count = await likeCountLocator.count();
      if (count === 0) {
        if (expectedCount === undefined || expectedCount === 0) {
          // Element doesn't exist and we're okay with that (0 likes or no expectation)
          return;
        } else {
          // We expected a count but element doesn't exist
          throw new Error(
            `Expected like count ${expectedCount} for reply "${replyText}", but like count element is not visible`
          );
        }
      }

      // Verify element is visible
      await this.verifier.verifyTheElementIsVisible(likeCountLocator, {
        assertionMessage: `Like count should be visible for reply "${replyText}"`,
      });

      // If expected count is provided, verify it matches
      if (expectedCount !== undefined) {
        // Wait for text content to be available and stable
        await likeCountLocator.waitFor({ state: 'visible', timeout: 1000 });
        const countText = await likeCountLocator.textContent();
        // Extract number from text (for replies it's just the number like "1")
        const match = countText?.match(/(\d+)/);
        const actualCount = match ? parseInt(match[1], 10) : 0;
        if (actualCount !== expectedCount) {
          throw new Error(`Expected like count ${expectedCount}, but got ${actualCount} for reply "${replyText}"`);
        }
      }
    });
  }

  /**
   * Gets a locator for a post by user name
   * @param userName - The name of the user who created the post
   * @returns Locator for the post container
   */
  readonly getPostByUserLocator = (userName: string): Locator =>
    this.page.locator('div[class*="postContent"]').filter({ hasText: userName }).first();

  /**
   * Scrolls to a post made by a specific user
   * Reuses waitForPostToBeVisible pattern but searches by user name instead of post text
   * @param userName - The name of the user who created the post
   */
  async scrollToPostByUser(userName: string): Promise<void> {
    await test.step(`Scroll to post made by user: ${userName}`, async () => {
      const postLocator = this.getPostByUserLocator(userName);
      // Reuse the same pattern as waitForPostToBeVisible
      await this.verifier.verifyTheElementIsVisible(postLocator, {
        timeout: 1000,
        assertionMessage: `Post by user "${userName}" should be visible`,
      });
      await postLocator.scrollIntoViewIfNeeded().catch(() => {});
    });
  }
}
