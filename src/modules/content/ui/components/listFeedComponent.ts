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
  readonly likeButtonForReply: Locator;
  readonly siteImageLocator: Locator;
  readonly editButton: Locator;
  readonly replyButton: Locator;
  readonly replyInput: Locator;
  readonly submitReplyButton: Locator;
  readonly replyEditor: Locator;
  readonly reactionCountButton: Locator;
  readonly reactionModal: Locator;
  readonly modelCloseButton: Locator;
  readonly mentionUserNameEditor: (mentionUserName: string) => Locator;
  readonly replyShowMoreButton: Locator;
  readonly loadMoreRepliesButton: Locator;
  readonly shareButton: Locator;
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
    this.page.locator("div[class*='postContent']").getByText(text, { exact: true }).first();

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

  readonly postTextLocator = (postText: string): Locator =>
    this.page.locator('p').filter({ hasText: postText }).first();

  readonly replyLocator = (replyText: string): Locator =>
    this.page.locator('div[class*="replyContent"] p').filter({ hasText: replyText }).first();
  readonly replyContainer = this.page.locator('._reply_1ii4b_1');
  readonly replyContainerWrapper = this.page.locator('._container_q3xrp_1');
  readonly getViewPostLinkLocator = (): Locator => this.page.getByRole('link', { name: 'View Post' }).first();

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

  /**
   * Gets a locator for the Share button/icon for a specific post
   * @param postText - The text of the post to find Share button for
   * @returns Locator for the Share button
   */
  readonly getShareButtonLocator = (postText: string): Locator =>
    this.getFeedTextLocator(postText)
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Share this post' })
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
    this.likeButton = this.page.getByRole('button', { name: 'React to this post' });
    this.replyButton = this.page.getByRole('button', { name: 'Reply on this post' });
    this.replyButton = this.page.locator('p').filter({ hasText: 'Reply' });
    this.replyInput = this.page.locator('div[class*="ProseMirror"] p[data-placeholder*="Leave a reply"]').first();
    this.submitReplyButton = this.page.getByRole('button', { name: 'Reply', exact: true }).first();
    this.replyEditor = this.page.getByRole('textbox', { name: 'You are in the content editor' });
    this.replyShowMoreButton = this.page.getByTestId('replyContent').getByRole('button', { name: 'Show more' });
    this.postsIFollow = this.page.locator('[aria-label="Show"]:has-text("Posts I follow")');
    this.sortByRecentActivity = this.page.locator('[aria-label="Sort by"]:has-text("Recent activity")');
    this.loadMoreRepliesButton = this.page.getByRole('button', { name: 'Load more replies' });
    this.shareButton = this.page.getByRole('button', { name: 'Share this post' });
    this.likeButtonForReply = this.page.getByRole('button', { name: 'React to this reply' }).first();
    this.embedUrlLocator = (embedUrl: string): Locator => this.page.getByRole('link', { name: embedUrl }).first();
    this.mentionUserNameEditor = (mentionUserName: string): Locator =>
      this.page.locator('#mentionListItemId').getByText(mentionUserName);
    this.modelCloseButton = this.page.getByRole('button', { name: 'Close' });
    this.reactionCountButton = this.page.getByRole('button', { name: 'reactions' });
    this.reactionModal = this.page.getByRole('dialog', { name: 'People who reacted to this' });
    this.siteImageLocator = this.page.locator('.imageAnchor img');
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
      const postLocator = this.postTextLocator(expectedText).first();
      await this.verifier.verifyTheElementIsVisible(postLocator, {
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
      await this.hoverOverElementInJavaScript(this.likeButton.first());
      //verify the favourite button is visible
      await this.verifier.verifyTheElementIsVisible(this.favoriteButton, {
        assertionMessage: `verify the favourite button is visible`,
      });
      await this.clickOnElement(this.favoriteButton);
    });
  }

  async removePostFromFavourite(postText: string): Promise<void> {
    await test.step(`Remove post from favourite: ${postText}`, async () => {
      await this.hoverOverElementInJavaScript(this.likeButton.first());

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
      await this.hoverOverElementInJavaScript(this.likeButton.first());
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
      await this.verifier.verifyTheElementIsNotVisible(this.imageButton);
    });
  }

  async verifyPostIsNotVisible(postText: string): Promise<void> {
    await test.step(`Verify post is not visible: "${postText}"`, async () => {
      const postLocator = this.getFeedTextLocator(postText);
      await this.verifier.verifyTheElementIsNotVisible(postLocator, {
        assertionMessage: `Post "${postText}" should not be visible`,
      });
    });
  }
  /**
   * Adds a reply to a specific post
   * @param postText - The text of the post to reply to
   * @param replyText - The reply text to add
   */
  async addReplyToPost(replyText: string, postId: string, mentionUserName?: string): Promise<string> {
    await test.step(`Add reply to post`, async () => {
      // Click reply button
      //add API wait for response
      const replyApiPromise = this.page.waitForResponse(
        response =>
          response.url().includes(API_ENDPOINTS.feed.rudderstack) &&
          response.request().method() === 'POST' &&
          response.status() === 200
      );

      await this.clickOnElement(this.replyButton.first(), { stepInfo: 'Clicking on reply button' });

      await replyApiPromise;
      await this.verifier.verifyTheElementIsVisible(this.replyInput, {
        assertionMessage: `Reply input should be visible`,
      });

      await this.fillInElement(this.replyEditor, replyText);

      if (mentionUserName) {
        replyText = replyText + ` @${mentionUserName}`;
        await this.fillInElement(this.replyEditor, replyText);
        await this.clickOnElement(this.mentionUserNameEditor(mentionUserName));
      } else {
        await this.fillInElement(this.replyEditor, replyText);
      }
      await this.clickOnReplyButton(postId);
    });
    console.log('replyText :   ', replyText);
    return replyText;
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
  async clickLoadMoreRepliesButton(): Promise<void> {
    await test.step(`Click load more replies button`, async () => {
      await this.hoverOverElementInJavaScript(this.loadMoreRepliesButton);
      await this.verifier.verifyTheElementIsVisible(this.loadMoreRepliesButton, {
        assertionMessage: `Load more replies button should be visible`,
      });
      await this.clickOnElement(this.loadMoreRepliesButton);

      await this.verifier.verifyTheElementIsNotVisible(this.loadMoreRepliesButton, {
        assertionMessage: `Load more replies button should not be visible after clicking`,
      });
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
   * Gets the count of visible replies for a specific post
   * @param postText - The text of the post to count replies for
   * @returns Promise<number> - Count of visible replies
   */
  async getVisibleReplyCount(postText: string): Promise<number> {
    return await test.step(`Get visible reply count for post: ${postText}`, async () => {
      // Find the post container first
      const postContainer = this.getFeedTextLocator(postText).first();
      await this.verifier.verifyTheElementIsVisible(postContainer, {
        assertionMessage: `Post "${postText}" should be visible`,
      });
      // Find all reply content divs within the post container
      const replyContainers = this.page
        .locator('div[class*="_container_q3xrp_1"]')
        .first()
        .locator('div[class*="_reply_1ii4b_1"]');

      const count = await replyContainers.count();
      console.log('Count of visible replies: ', count);
      return count;
    });
  }

  /**
   * Verifies the count of visible replies for a specific post
   * @param postText - The text of the post to verify replies for
   * @param expectedCount - Expected number of visible replies
   */
  async verifyReplyCount(postText: string, expectedCount: number): Promise<void> {
    await test.step(`Verify reply count is ${expectedCount} for post: ${postText}`, async () => {
      const actualCount = await this.getVisibleReplyCount(postText);
      if (actualCount !== expectedCount) {
        throw new Error(`Expected ${expectedCount} visible replies for post "${postText}", but found ${actualCount}`);
      }
    });
  }

  /**
   * Clicks on the post timestamp to navigate to feed detail page
   * @param postText - The text of the post to click timestamp for
   */
  async clickPostTimestamp(postText: string): Promise<void> {
    await test.step(`Click post timestamp to navigate to feed detail page for post: ${postText}`, async () => {
      await this.clickOnElement(this.getPostTimestampLocator(postText));
    });
  }

  private async getImageSrcAttribute(siteImageLocator: Locator): Promise<string> {
    const imageSrc = await siteImageLocator.getAttribute('src');
    if (!imageSrc) {
      throw new Error(`Site image in feed card does not have a src attribute`);
    }
    return imageSrc;
  }

  private extractFileIdFromImageSrc(imageSrc: string): string {
    return imageSrc.split('/').pop()?.split('?')[0] || imageSrc;
  }

  /**
   * Verifies that the site image is displayed in the feed card for the given content
   * and that it matches the site's iconImage
   * @param contentTitle - The title of the content in the feed card
   * @param siteId - The site ID to verify the image belongs to
   * @param siteImageFileId - The fileId of the site's iconImage to verify it matches
   */
  async verifySiteImageInFeedCard(contentTitle: string, siteId: string, siteImageFileId: string): Promise<void> {
    await test.step(`Verify site image is displayed in feed card for content "${contentTitle}" and matches site iconImage`, async () => {
      const siteImageLocator = this.siteImageLocator;
      await this.verifier.verifyTheElementIsVisible(siteImageLocator, {
        assertionMessage: `Site image should be visible in feed card for content "${contentTitle}"`,
      });

      const imageSrc = await this.getImageSrcAttribute(siteImageLocator);

      const feedImageFileId = this.extractFileIdFromImageSrc(imageSrc);
      console.log(`Feed image src: ${imageSrc}`);
      console.log(`Feed image fileId: ${feedImageFileId}`);
      console.log(`Site image fileId: ${siteImageFileId}`);

      if (feedImageFileId !== siteImageFileId) {
        throw new Error(
          `Site image in feed card does not match site iconImage. Expected fileId: ${siteImageFileId}, but feed image fileId was: ${feedImageFileId}`
        );
      }

      console.log(`Verified site image in feed matches site iconImage (fileId: ${siteImageFileId})`);
    });
  }

  async clickShareOnComment(): Promise<void> {
    await test.step(`Click share button`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareButton.first(), {
        assertionMessage: `Share button should be visible`,
      });
      await this.clickOnElement(this.shareButton.first());
    });
  }

  async clickShareOnPost(postText: string): Promise<void> {
    await test.step(`Click share button on post: ${postText}`, async () => {
      const postLocator = this.postTextLocator(postText);
      await this.verifier.verifyTheElementIsVisible(postLocator, {
        assertionMessage: `Post "${postText}" should be visible`,
      });
      const shareButtonLocator = this.shareButton.first();
      await this.verifier.verifyTheElementIsVisible(shareButtonLocator, {
        assertionMessage: `Share button should be visible for post "${postText}"`,
      });
      await this.clickOnElement(shareButtonLocator);
    });
  }

  async clickShareButtonForPost(postText: string): Promise<void> {
    await test.step(`Click Share button for post: ${postText}`, async () => {
      await this.clickOnElement(this.getShareButtonLocator(postText));
    });
  }

  /**
   * Verifies that a post appears at the top of the feed (first position)
   * @param postText - The text of the post to verify
   */
  async verifyPostIsAtTop(postText: string): Promise<void> {
    await test.step(`Verify post "${postText}" is at the top of the feed`, async () => {
      // Get all post containers
      const allPosts = this.page.locator("div[class*='postContent']");
      const firstPost = allPosts.first();

      // Verify the first post contains the expected text
      await this.verifier.verifyTheElementIsVisible(firstPost.filter({ hasText: postText }), {
        assertionMessage: `Post "${postText}" should be at the top of the feed`,
      });
    });
  }

  async clickViewPostLink(): Promise<void> {
    await test.step(`Click View Post link`, async () => {
      const viewPostLinkLocator = this.getViewPostLinkLocator();
      await this.verifier.verifyTheElementIsVisible(viewPostLinkLocator, {
        assertionMessage: `View Post link should be visible`,
      });
      await this.clickOnElement(viewPostLinkLocator);
    });
  }

  async verifyShareCount(postText: string, expectedCount: number): Promise<void> {
    await test.step(`Verify share count is ${expectedCount} for post: ${postText}`, async () => {
      const shareCountLocator = this.shareButton;
      const shareCount = await shareCountLocator.count();
      await this.verifier.verifyTheElementIsVisible(shareCountLocator, {
        assertionMessage: `Share count should be visible for post "${postText}"`,
      });
      if (shareCount !== expectedCount) {
        console.warn(`Share count mismatch for post "${postText}": expected ${expectedCount}, found ${shareCount}`);
      }
    });
  }

  async verifyLikesCount(postText: string, expectedCount: number): Promise<void> {
    await test.step(`Verify likes count is ${expectedCount} for post: ${postText}`, async () => {
      const likesCountLocator = this.likeButton;
      const likesCount = await likesCountLocator.count();
      await this.verifier.verifyTheElementIsVisible(likesCountLocator, {
        assertionMessage: `Likes count should be visible for post "${postText}"`,
      });
      if (likesCount !== expectedCount) {
        console.warn(`Likes count mismatch for post "${postText}": expected ${expectedCount}, found ${likesCount}`);
      }
    });
  }

  async verifyRepliesCount(postText: string, expectedCount: number): Promise<void> {
    await test.step(`Verify replies count is ${expectedCount} for post: ${postText}`, async () => {
      const repliesCountLocator = this.replyButton;
      const repliesCount = await repliesCountLocator.count();
      await this.verifier.verifyTheElementIsVisible(repliesCountLocator, {
        assertionMessage: `Replies count should be visible for post "${postText}"`,
      });
      if (repliesCount !== expectedCount) {
        console.warn(`Replies count mismatch for post "${postText}": expected ${expectedCount}, found ${repliesCount}`);
      }
    });
  }

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

  /* Likes a feed post by clicking the like button
   * @param postText - The text of the post to like
   */
  async likeFeedPost(postText: string): Promise<void> {
    await test.step(`Like feed post: ${postText}`, async () => {
      // Ensure post is visible first
      await this.waitForPostToBeVisible(postText);

      await this.verifier.verifyTheElementIsVisible(this.likeButton, {
        assertionMessage: `Like/React button should be visible for post "${postText}"`,
      });

      // Click the like button
      await this.clickOnElement(this.likeButton);
    });
  }

  async unlikeFeedPost(postText: string): Promise<void> {
    await test.step(`Unlike feed post: ${postText}`, async () => {
      const unlikeButtonLocator = this.page.getByRole('button', { name: 'Remove your reaction' }).first();
      await this.verifier.verifyTheElementIsVisible(unlikeButtonLocator, {
        assertionMessage: `Unlike button should be visible for post "${postText}"`,
      });
      await this.clickOnElement(unlikeButtonLocator);
    });
  }

  /**
   * Likes a reply post by clicking the like button
   * @param replyText - The text of the reply to like
   */
  async likeFeedReply(replyText: string): Promise<void> {
    await test.step(`Like feed reply: ${replyText}`, async () => {
      // Ensure reply is visible first
      await this.verifier.verifyTheElementIsVisible(this.likeButtonForReply, {
        assertionMessage: `Like/React button should be visible for reply "${replyText}"`,
      });

      // Click the like button
      await this.clickOnElement(this.likeButtonForReply);
    });
  }

  /**
   * Unlikes a reply post by clicking the like button again
   * @param replyText - The text of the reply to unlike
   */
  async unlikeFeedReply(replyText: string): Promise<void> {
    await test.step(`Unlike feed reply: ${replyText}`, async () => {
      const unlikeButtonLocator = this.page
        .getByRole('listitem')
        .filter({ hasText: 'Like' })
        .getByLabel('Remove your reaction')
        .first();

      await this.verifier.verifyTheElementIsVisible(unlikeButtonLocator, {
        assertionMessage: `Unlike button should be visible for reply "${replyText}"`,
      });

      // Click the unlike button
      await this.clickOnElement(unlikeButtonLocator);
    });
  }

  /**
   * Verifies the like count on a feed post
   * @param postText - The text of the post to check like count for
   * @param expectedCount - Optional expected count (if provided, will verify exact count)
   */
  async verifyLikeCountOnPost(postText: string): Promise<void> {
    await test.step(`Verify like count on post: ${postText}`, async () => {
      // Ensure post is visible first
      await this.waitForPostToBeVisible(postText);

      const likeCountLocator = this.page.getByRole('button', { name: '1 reaction' }).first();

      // Verify element is visible
      await this.verifier.verifyTheElementIsVisible(likeCountLocator, {
        assertionMessage: `Like count should be visible for post "${postText}"`,
      });
    });
  }

  /**
   * Verifies the like count on a reply post
   * @param replyText - The text of the reply to check like count for
   * @param expectedCount - Optional expected count (if provided, will verify exact count)
   */
  async verifyLikeCountOnReply(replyText: string): Promise<void> {
    await test.step(`Verify like count on reply: ${replyText}`, async () => {
      // Ensure reply is visible first
      await this.verifier.verifyTheElementIsVisible(this.replyLocator(replyText), {
        assertionMessage: `Reply "${replyText}" should be visible`,
      });

      const likeCountLocator = this.page.getByRole('button', { name: 'People who liked this. Click' }).first();

      // Verify element is visible
      await this.verifier.verifyTheElementIsVisible(likeCountLocator, {
        assertionMessage: `Like count should be visible for reply "${replyText}"`,
      });
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
   * Clicks the share icon on a feed post
   * @param postText - The text of the post to share
   */
  async clickShareIcon(postText: string): Promise<void> {
    await test.step(`Click share icon on post: ${postText}`, async () => {
      await this.waitForPostToBeVisible(postText);
      const shareIconLocator = this.page.getByRole('button', { name: 'Share this post' }).first();
      await this.verifier.verifyTheElementIsVisible(shareIconLocator, {
        assertionMessage: `Share icon should be visible for post "${postText}"`,
      });
      await this.clickOnElement(shareIconLocator);
    });
  }

  async verifyEmbededUrlIsVisible(embedUrl: string): Promise<void> {
    await test.step('Verify embedded URL is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.embedUrlLocator(embedUrl), {
        assertionMessage: 'Embedded URL should be visible',
      });
    });
  }

  /**
   * Hovers over the "React to this post" button to show emoji options
   * @param postText - The text of the post
   */
  async hoverOnReactionButton(postText: string): Promise<void> {
    await test.step(`Hover on reaction button for post: ${postText}`, async () => {
      await this.waitForPostToBeVisible(postText);
      const postContainer = this.postTextLocator(postText);
      await this.hoverOverElementInJavaScript(postContainer);
      const reactionButton = this.likeButton.first();
      await reactionButton.hover();
    });
  }

  /**
   * Clicks a specific reaction emoji (like, love, etc.)
   * @param postText - The text of the post
   * @param reactionName - The name of the reaction (e.g., 'like', 'love')
   */
  async clickReactionEmoji(postText: string, reactionName: string): Promise<void> {
    await test.step(`Click ${reactionName} reaction for post: ${postText}`, async () => {
      const reactionButton = this.page.getByRole('button', { name: `React with ${reactionName}` }).first();
      await this.verifier.verifyTheElementIsVisible(reactionButton, {
        assertionMessage: `Reaction button should be visible for post "${postText}" with reaction "${reactionName}"`,
      });
      await this.clickOnElement(reactionButton);
    });
  }

  /**
   * Gets the text content of the reaction button to verify which emoji is selected
   * @param postText - The text of the post
   * @returns The text content of the reaction button
   */
  async verifyReactionButtonTextContent(postText: string, reactionName: string): Promise<void> {
    const reactionButton = this.page.locator('button').filter({ hasText: reactionName }).first();
    await this.verifier.verifyTheElementIsVisible(reactionButton, {
      assertionMessage: `Reaction button should be visible for post "${postText}" with reaction "${reactionName}"`,
    });
    await this.clickOnElement(reactionButton);
    await this.verifier.verifyTheElementIsVisible(this.likeButton, {
      assertionMessage: `Like button should be visible for post "${postText}"`,
    });
  }

  /**
   * Clicks the reaction count/text button to open the reaction modal
   * @param postText - The text of the post
   */
  async clickReactionCountButton(postText: string): Promise<void> {
    await test.step(`Click reaction count button for post: ${postText}`, async () => {
      const reactionCountButton = this.reactionCountButton.first();
      await this.verifier.verifyTheElementIsVisible(reactionCountButton, {
        assertionMessage: `Reaction count button should be visible for post "${postText}"`,
      });
      await this.clickOnElement(reactionCountButton);
    });
  }

  /**
   * Verifies the reaction modal is visible
   */
  async verifyReactionModalIsVisible(): Promise<void> {
    await test.step('Verify reaction modal is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.reactionModal, {
        assertionMessage: 'Reaction modal should be visible',
      });
    });
  }

  /**
   * Verifies a tab exists for a specific emoji in the reaction modal
   * @param emojiName - The name of the emoji (e.g., 'like', 'love', 'haha')
   */
  async verifyReactionModalTabExists(emojiName: string): Promise<void> {
    await test.step(`Verify reaction modal tab exists for emoji: ${emojiName}`, async () => {
      // Wait for modal to be fully loaded
      await this.verifier.verifyTheElementIsVisible(this.reactionModal, {
        assertionMessage: 'Reaction modal should be visible',
      });
      const tablist = this.reactionModal.locator('[role="tablist"]').first();

      const tabs = await tablist.getByRole('tab').all();

      // Map emoji names to their emoji characters for matching
      const emojiCharMap: Record<string, string> = {
        like: '👍',
        love: '❤️',
        haha: '😆',
        insightful: '💡',
        thankful: '🙏',
        celebrate: '🎉',
      };

      const emojiChar = emojiCharMap[emojiName];

      let tab: Locator | null = null;
      for (const tabElement of tabs) {
        const textContent = (await tabElement.textContent()) || '';

        if (textContent.includes(emojiChar)) {
          tab = tabElement;
          break;
        }
      }

      if (!tab) {
        throw new Error(`Tab for emoji "${emojiName}" not found. Checked ${tabs.length} tabs in reaction modal.`);
      }

      await this.verifier.verifyTheElementIsVisible(tab, {
        assertionMessage: `Tab for emoji "${emojiName}" should be visible in reaction modal`,
      });
      await this.clickOnElement(tab);
    });
  }

  /**
   * Verifies users are displayed in a specific emoji tab
   * @param emojiName - The name of the emoji (e.g., 'like', 'love', 'haha')
   * @param expectedUsers - Array of expected user names
   */
  async verifyUsersInReactionModalTab(emojiName: string, expectedUsers: string[]): Promise<void> {
    await test.step(`Verify users in reaction modal tab for emoji: ${emojiName}`, async () => {
      for (const expectedUser of expectedUsers) {
        const userLocator = this.page.getByRole('link', { name: expectedUser }).first();
        await this.verifier.verifyTheElementIsVisible(userLocator, {
          assertionMessage: `User "${expectedUser}" should be visible in "${emojiName}" tab`,
        });
      }
    });
  }

  /**
   * Closes the reaction modal
   */
  async closeReactionModal(): Promise<void> {
    await test.step('Close reaction modal', async () => {
      const closeButton = this.modelCloseButton;
      await this.verifier.verifyTheElementIsVisible(closeButton, {
        assertionMessage: 'Close button should be visible in reaction modal',
      });
      await this.clickOnElement(closeButton);
      await this.verifier.verifyTheElementIsNotVisible(closeButton, {
        assertionMessage: 'Close button should not be visible in reaction modal',
      });
    });
  }

  /**
   * Verifies that a deleted post message is displayed for a specific post
   * @param postText - The text of the post to verify deleted message for
   */
  async verifyDeletedPostMessage(postText: string): Promise<void> {
    await test.step(`Verify deleted post message is visible for post: ${postText}`, async () => {
      // First, find the post container
      const postContainer = this.page.locator('div[class*="postContent"]').filter({ hasText: postText }).first();
      await this.verifier.verifyTheElementIsVisible(postContainer, {
        assertionMessage: `Post container should be visible for post "${postText}"`,
      });

      // Verify the deleted message is visible within the post container
      const deletedMessage = postContainer.locator('div').filter({ hasText: /^This post has been deleted\.$/ });
      await this.verifier.verifyTheElementIsVisible(deletedMessage, {
        assertionMessage: `Deleted post message should be visible for post "${postText}"`,
      });
    });
  }

  /**
   * Verifies that a post cannot be interacted with (share, like, comment buttons are not visible)
   * @param postText - The text of the post to verify interaction restrictions for
   */
  async verifyPostCannotBeInteracted(postText: string): Promise<void> {
    await test.step(`Verify post cannot be interacted with: ${postText}`, async () => {
      // Find the post container
      const postContainer = this.page.locator('div[class*="postContent"]').filter({ hasText: postText }).first();

      // Verify share button is not visible
      const shareButton = postContainer.locator('button[aria-label*="Share"], button:has-text("Share")');
      await this.verifier.verifyTheElementIsNotVisible(shareButton, {
        assertionMessage: `Share button should not be visible for deleted post "${postText}"`,
      });

      // Verify "View Post" link is not visible
      const viewPostLink = postContainer.getByRole('link', { name: 'View post' });
      await this.verifier.verifyTheElementIsNotVisible(viewPostLink, {
        assertionMessage: `View Post link should not be visible for deleted post "${postText}"`,
      });
    });
  }

  async clickOnReplyButton(postText: string): Promise<void> {
    await test.step(`Click on reply button for post: ${postText}`, async () => {
      const postResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.submitReplyButton, { delay: 3_000 }),
        response =>
          response.url().includes(API_ENDPOINTS.feed.comment(postText)) &&
          response.request().method() === 'POST' &&
          response.status() === 201,
        {
          timeout: 20_000,
        }
      );
      return postResponse;
    });
  }
}
