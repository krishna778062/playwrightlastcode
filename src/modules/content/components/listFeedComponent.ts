import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ListFeedComponent extends BaseComponent {
  // Post options section
  readonly deleteButton = this.page.locator("div:text('Delete')");
  readonly deleteConfirmDialog = this.page.locator('div[role="dialog"]');
  readonly deleteConfirmButton = this.page.getByRole('button', { name: 'Delete' });
  readonly closeButton = this.page.locator("button[class*='closeBtn']");
  readonly inlineImagePreview = this.page.locator("div[class*='gallerySlide'] img");

  // Dynamic locator functions
  /**
   * Gets a locator for the post text content
   * @param text - The text content to find
   * @returns Locator for the post text
   */
  readonly getFeedTextLocator = (text: string): Locator =>
    this.page.locator("div[class*='postContent']").getByText(text, { exact: true });

  /**
   * Gets a locator for the post timestamp
   * @param postText - The text of the post to find timestamp for
   * @returns Locator for the post timestamp
   */
  readonly getPostTimestampLocator = (postText: string): Locator =>
    this.page.locator(
      `xpath=//p[text()='${postText}']/ancestor::div[4]//div[contains(@class,'nameAndStatement')]/following-sibling::p/a`
    );

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
   * Gets a locator for the favorite/like button for a specific post
   * @param postText - The text of the post to find favorite button for
   * @returns Locator for the favorite button
   */
  readonly getFavoriteButtonLocator = (favorite: boolean): Locator =>
    this.page.locator(
      favorite ? "button[title='Favorite this post'] span i" : "button[title='Unfavorite this post'] span i"
    );

  readonly getFavoriteButton = this.page.locator("button[title='Favorite this post'] span i");

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
    await test.step(`Wait for post to be visible: ${expectedText}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getFeedTextLocator(expectedText), {
        timeout: 30000,
        assertionMessage: `Post with text "${expectedText}" should be visible`,
      });
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

  /**
   * Clicks the favorite/like button for a specific post
   * @param postText - The text of the post to favorite/unfavorite
   */
  async clickFavoriteUnfavoriteButton(favorite: boolean): Promise<void> {
    await test.step(`Click favorite button for post:`, async () => {
      await this.getFavoriteButton.click({ force: true });
      await this.clickOnElement(this.getFavoriteButtonLocator(favorite));
    });
  }

  /**
   * Verifies that a post is in favorited state
   * @param postText - The text of the post to verify
   */
  async verifyPostIsFavoritedUnfavorited(favorite: boolean): Promise<void> {
    await test.step(`Verify post is favorited: ${favorite}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getFavoriteButtonLocator(favorite), {
        assertionMessage: `Post "${favorite}" should be in favorited state`,
      });
    });
  }

  /**
   * Verifies that a post is not in favorited state
   * @param postText - The text of the post to verify
   */
  async verifyPostIsNotFavorited(postText: string): Promise<void> {
    await test.step(`Verify post is not favorited: ${postText}`, async () => {
      const favoritedIndicator = this.getFavoritedStateLocator(postText);
      await this.verifier.verifyTheElementIsNotVisible(favoritedIndicator, {
        assertionMessage: `Post "${postText}" should not be in favorited state`,
      });
    });
  }
}
