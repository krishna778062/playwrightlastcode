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
  readonly embedUrlLocator: (embedUrl: string) => Locator;
  readonly feedLinkWithDescription = (description: string) => this.page.locator('p').filter({ hasText: description });
  readonly sharefeedLink = (linkText: string) => this.page.locator('a').filter({ hasText: linkText });
  readonly shareSocialCampaignButton = (description: string) =>
    this.page.locator(`xpath=//p[text()='${description}']/../../..//span[text()='Share']`);
  // Dynamic locator functions
  /**
   * Gets a locator for the post text content
   * @param text - The text content to find
   * @returns Locator for the post text
   */
  readonly getFeedTextLocator = (text: string): Locator =>
    this.page.locator("div[class*='postContent']").getByText(text, { exact: true });

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
  readonly replyContainer = this.page.locator('._reply_1ii4b_1');
  readonly replyContainerWrapper = this.page.locator('._container_q3xrp_1');

  readonly getReplyTimestampLocator = (replyText: string): Locator => {
    const reply = this.replyLocator(replyText);
    const replyContainer = reply.locator('..').locator('..').locator('._reply_1ii4b_1').first();
    return replyContainer.getByText(
      /Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|2025|2026|2027|2028|at|now|ago|minute|hour|day/i
    );
  };

  readonly getReplyBoxImageLocator = (replyText: string): Locator => {
    const reply = this.replyLocator(replyText);
    return reply.locator('..').locator('..').locator('._reply_1ii4b_1').getByRole('button', { name: 'Image PDF' });
  };

  /**
   * Gets a locator for the reply options menu
   * @param replyText - The text of the reply to find options menu for
   * @returns Locator for the reply options menu button
   */
  readonly getReplyOptionsMenuLocator = (replyText: string): Locator =>
    this.page
      .locator('div[class*="replyContent"]')
      .filter({ hasText: replyText })
      .locator("button[class*='optionlauncher']")
      .first();

  /**
   * Gets a locator for the reply form container for a specific post
   * @param postText - The text of the post
   * @returns Locator for the reply form container
   */
  readonly getReplyFormContainerForPost = (postText: string): Locator =>
    this.getFeedTextLocator(postText)
      .locator('..')
      .locator('..')
      .locator('div._Reply--form_qr1ju_6, div[class*="Reply--form"]')
      .first();

  /**
   * Gets a locator for the fake input button in reply form
   * @param postText - The text of the post
   * @returns Locator for the fake input button
   */

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
    this.favoriteButton = this.page.getByRole('button', { name: 'Favorite this post' }).first();
    this.deleteButton = this.page.locator("div:text('Delete')");
    this.editButton = this.page.locator("div:text('Edit')");
    this.deleteConfirmDialog = this.page.locator('div[role="dialog"]');
    this.deleteConfirmButton = this.page.getByRole('button', { name: 'Delete' });
    this.closeButton = this.page.locator("button[class*='closeBtn']");
    this.inlineImagePreview = this.page.locator("div[class*='gallerySlide'] img");
    this.unfavoriteButton = this.page.getByRole('button', { name: 'Unfavorite this post' }).first();
    this.likeButton = this.page.getByRole('button', { name: 'React to this post' }).first();
    this.replyButton = this.page.getByRole('button', { name: 'Reply on this post' }).first();
    this.replyButton = this.page.locator('p').filter({ hasText: 'Reply' }).first();
    this.replyInput = this.page.locator('div[class*="ProseMirror"] p[data-placeholder*="Leave a reply"]').first();
    this.submitReplyButton = this.page.getByRole('button', { name: 'Reply', exact: true }).first();
    this.replyEditor = this.page.getByRole('textbox', { name: 'You are in the content editor' });
    this.replyShowMoreButton = this.page.getByTestId('replyContent').getByRole('button', { name: 'Show more' });
    this.postsIFollow = this.page.locator('[aria-label="Show"]:has-text("Posts I follow")');
    this.sortByRecentActivity = this.page.locator('[aria-label="Sort by"]:has-text("Recent activity")');
    this.embedUrlLocator = (embedUrl: string): Locator => this.page.getByRole('link', { name: embedUrl }).first();
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
      await this.getFeedTextLocator(expectedText).scrollIntoViewIfNeeded();
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

  async markPostAsFavourite(): Promise<void> {
    await test.step(`Mark post as favourite`, async () => {
      await this.hoverOverElementInJavaScript(this.likeButton);
      //verify the favourite button is visible
      await this.verifier.verifyTheElementIsVisible(this.favoriteButton, {
        assertionMessage: `verify the favourite button is visible`,
      });
      await this.clickOnElement(this.favoriteButton);
    });
  }

  async removePostFromFavourite(postText: string): Promise<void> {
    await test.step(`Remove post from favourite: ${postText}`, async () => {
      await this.hoverOverElementInJavaScript(this.likeButton);

      await this.verifier.verifyTheElementIsVisible(this.unfavoriteButton, {
        assertionMessage: `Post "${postText}" should be in favourited state`,
      });
      await this.clickOnElement(this.unfavoriteButton);
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
        assertionMessage: `Post "${postText}" should be in favorited state`,
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
   * Validates that a post is not visible
   * @param postText - The text content of the post that should not be visible
   */
  async validatePostNotVisible(postText: string): Promise<void> {
    await test.step(`Validating post is not visible: "${postText}"`, async () => {
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
   * Submits a reply and returns the API response with feed ID
   * @returns Promise with feed ID from the response
   */
  async submitReplyAndGetResponse(): Promise<{ feedId: string }> {
    return await test.step('Submit reply and get response', async () => {
      const replyResponsePromise = this.page.waitForResponse(
        response =>
          response.url().includes(API_ENDPOINTS.feed.create) &&
          response.request().method() === 'POST' &&
          response.status() === 201
      );

      await this.clickOnElement(this.submitReplyButton.first());

      const replyResponse = await replyResponsePromise;
      const responseBody = await replyResponse.json();
      const feedId = responseBody.result?.feedId || '';
      return { feedId };
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
   * Opens the options menu for a reply
   * @param replyText - Text of the reply to open options for
   */
  async openReplyOptionsMenu(replyText: string): Promise<void> {
    await test.step('Open reply options menu', async () => {
      await this.clickOnElement(this.getReplyOptionsMenuLocator(replyText));
    });
  }

  /**
   * Clicks the edit option for a reply
   */
  async clickReplyEditOption(): Promise<void> {
    await test.step('Click reply edit option', async () => {
      await this.clickOnElement(this.editButton);
    });
  }

  /**
   * Clicks the delete option for a reply
   */
  async clickReplyDeleteOption(): Promise<void> {
    await test.step('Click reply delete option', async () => {
      await this.clickOnElement(this.deleteButton);
    });
  }

  /**
   * Verifies reply timestamp is displayed
   * @param replyText - The text of the reply
   */
  async verifyReplyTimestamp(replyText: string): Promise<void> {
    await test.step(`Verify reply timestamp for: ${replyText}`, async () => {
      // Find the reply by text
      const reply = this.replyLocator(replyText);
      await this.verifier.verifyTheElementIsVisible(reply, {
        assertionMessage: `Reply should be visible for: ${replyText}`,
      });

      // Find the reply container that contains this reply text
      const allReplyContainers = this.page.locator('._reply_1ii4b_1');
      const containerCount = await allReplyContainers.count();

      let timestamp: Locator | null = null;

      // Find the container that contains the reply text
      for (let i = 0; i < containerCount; i++) {
        const container = allReplyContainers.nth(i);
        const containerText = await container.textContent().catch(() => '');

        if (containerText?.includes(replyText)) {
          // Find timestamp using locator with filter
          timestamp = container
            .locator('*')
            .filter({
              hasText: /Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|2025|2026|at|now|ago|minute|hour|day/i,
            })
            .first();
          const timestampVisible = await timestamp.isVisible().catch(() => false);
          if (timestampVisible) {
            break;
          }
        }
      }

      if (!timestamp) {
        throw new Error(`Reply timestamp not found for reply: ${replyText}`);
      }

      await this.verifier.verifyTheElementIsVisible(timestamp, {
        assertionMessage: `Reply timestamp should be visible for reply: ${replyText}`,
      });
    });
  }

  /**
   * Verifies Box logo on reply attachments
   * @param replyText - The text of the reply
   */
  async verifyBoxLogoOnReplyAttachment(replyText: string): Promise<void> {
    await test.step(`Verify Box logo on reply attachments for: ${replyText}`, async () => {
      // Find the reply by text
      const reply = this.replyLocator(replyText);
      await this.verifier.verifyTheElementIsVisible(reply, {
        assertionMessage: `Reply should be visible for: ${replyText}`,
      });

      // Find the reply container that contains this reply text
      const allReplyContainers = this.page.locator('._reply_1ii4b_1');
      const containerCount = await allReplyContainers.count();

      let boxLogo: Locator | null = null;

      // Find the container that contains the reply text
      for (let i = 0; i < containerCount; i++) {
        const container = allReplyContainers.nth(i);
        const containerText = await container.textContent().catch(() => '');

        if (containerText?.includes(replyText)) {
          // Find Box image using getByRole
          boxLogo = container.getByRole('button', { name: 'Image PDF' });
          const boxLogoVisible = await boxLogo.isVisible().catch(() => false);
          if (boxLogoVisible) {
            break;
          }
        }
      }

      if (!boxLogo) {
        throw new Error(`Box logo not found for reply: ${replyText}`);
      }

      await this.verifier.verifyTheElementIsVisible(boxLogo, {
        assertionMessage: `Box logo should be visible on reply attachments for: ${replyText}`,
      });
    });
  }

  /**
   * Opens the reply editor for a specific post
   * @param postText - The text of the post to open reply editor for
   */
  async openReplyEditorForPost(postText: string): Promise<void> {
    await test.step(`Open reply editor for post: ${postText}`, async () => {
      const replyButton = this.page.getByRole('button', { name: 'Reply on this post' }).first();

      // Wait for reply button to be visible
      await this.verifier.verifyTheElementIsVisible(replyButton, {
        assertionMessage: 'Reply button should be visible for the post',
      });
      await replyButton.click();
      await this.verifier.verifyTheElementIsVisible(this.replyInput, {
        assertionMessage: 'Reply input should be visible',
      });
    });
  }
  async verifyEmbededUrlIsVisible(embedUrl: string): Promise<void> {
    await test.step('Verify embedded URL is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.embedUrlLocator(embedUrl), {
        assertionMessage: 'Embedded URL should be visible',
      });
    });
  }
}
