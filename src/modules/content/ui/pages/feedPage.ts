import { expect, Locator, Page, test } from '@playwright/test';

import {
  CreateFeedPostComponent,
  FeedPostApiResponse,
  FeedPostOptions,
  FeedPostResult,
} from '@content/ui/components/createFeedPostComponent';
import {
  CreateQuestionComponent,
  QuestionOptions,
  QuestionResult,
} from '@content/ui/components/createQuestionComponent';
import { FilePreviewComponent } from '@content/ui/components/filePreviewComponent';
import { ListFeedComponent } from '@content/ui/components/listFeedComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ShareComponent } from '@/src/modules/content/ui/components/shareComponent';

// Re-export the interfaces and types for backwards compatibility
export { FeedPostOptions, FeedPostResult };

export interface IFeedActions {
  // High-level user flows
  createAndPost: (options: FeedPostOptions) => Promise<FeedPostResult>;
  createAndPostQuestion: (options: QuestionOptions) => Promise<QuestionResult>;
  editPost: (currentText: string, newText: string) => Promise<void>;
  deletePost: (postText: string) => Promise<void>;
  // Content creation flow
  createPostWithAttachments: (text: string, files?: string[]) => Promise<FeedPostResult>;
  createfeedWithMentionUserNameAndTopic: (params: {
    text: string;
    userName: string;
    topicName: string;
    siteName: string | string[];
    embedUrl: string;
  }) => Promise<FeedPostResult>;
  editPostWithTopicAndUserName: (params: {
    currentText: string;
    newText: string;
    topicName: string;
    userName: string;
  }) => Promise<void>;
  markPostAsFavourite: () => Promise<void>;
  removePostFromFavourite: (postText: string) => Promise<void>;
  clickInfoIcon: (fileId: string) => Promise<void>;
  verifyPreviewModalIsOpened: () => Promise<void>;
  clickDeleteButton: () => Promise<void>;
  clickShowMoreButton: () => Promise<void>;
  verifyVersionImageIsDisplayed: (fileId: string) => Promise<void>;
  uploadImage: (fileName: string) => Promise<string>;
  clickOnUploadButton: (fileId: string) => Promise<void>;
  clickOnCloseButton: () => Promise<void>;
  clickOnInfoIconOnImage: () => Promise<void>;
  clickOnEditVersionButton: () => Promise<void>;
  addReplyToPost: (replyText: string) => Promise<void>;
  clickReplyShowMoreButton: () => Promise<void>;
  clickOnDeleteReplyButton: () => Promise<void>;
  clickShareThoughtsButton: () => Promise<void>;
  enterQuestionTitle: (title: string) => Promise<void>;
  clickAskQuestionButton: () => Promise<string>;
  clickQuestionButton: () => Promise<void>;
  editQuestion: (questionTitle: string, newTitle: string) => Promise<void>;
  clickOnShowOption: (optionValue: string) => Promise<void>;
  clickOnSortByOption: (optionValue: string) => Promise<void>;
  selectShareOptionAsSiteFeed: () => Promise<void>;
  searchForSiteName: (siteName: string) => Promise<void>;
  enterFeedPostText: (text: string) => Promise<void>;
  clickBrowseFilesButton: () => Promise<void>;
  searchForFileInLibrary: (fileName: string) => Promise<void>;
  selectFileFromLibrary: (fileName: string) => Promise<void>;
  clickAttachButton: () => Promise<void>;
  clickPostButton: () => Promise<void>;
  clickOnCommentIcon: () => Promise<void>;
  clickOnCommentOptionsMenu: (commentText: string) => Promise<void>;
  openPostOptionsMenu: (postText: string) => Promise<void>;
  clickEditOption: () => Promise<void>;
  createPost: (text: string) => Promise<void>;
  updatePostText: (text: string) => Promise<void>;
  removeAttachedFile: (index?: number) => Promise<void>;
  clickUpdateButton: () => Promise<void>;
  addFileToPost: (filePath: string) => Promise<void>;
  waitForFileToAppear: () => Promise<void>;
  uploadFiles: (files: string[]) => Promise<void>;
  applyFormattingAndEnterText: (
    formatType: 'bold' | 'italic' | 'underline' | 'strike' | 'numberBullet' | 'dotBullet',
    text: string
  ) => Promise<void>;
  addLink: (linkText: string, linkUrl: string) => Promise<void>;
  selectEmoji: (emojiIndex?: number) => Promise<void>;
}

export interface IFeedAssertions {
  // High-level verification flows
  verifyPostDetails: (postText: string, expectedAttachmentCount: number) => Promise<void>;
  waitForPostToBeVisible: (expectedText: string) => Promise<void>;
  verifyPostIsNotFavorited: (postText: string) => Promise<void>;
  verifyPostIsFavorited: (postText: string) => Promise<void>;
  validatePostText: (postText: string) => Promise<void>;
  verifyImageButtonIsNotVisible: () => Promise<void>;
  verifyReplyIsVisible: (replyText: string) => Promise<void>;
  verifyReplyIsNotVisible: (replyText: string) => Promise<void>;
  verifyVersionImageIsDisplayed: (fileId: string) => Promise<void>;
  verifyVersionNumber: (expectedVersionNumber: string) => Promise<void>;
  verifyToastMessage: (message: string) => Promise<void>;
  verifyPostsIFollow: () => Promise<void>;
  verifySortByRecentActivity: () => Promise<void>;
  verifyAskQuestionButtonIsNotDisabled: () => Promise<void>;
  verifyQuestionCreatedSuccessfully: (questionTitle: string) => Promise<void>;
  verifyCampaignLinkDisplayed: (linkText: string, description: string) => Promise<void>;
  verifyCampaignLinkNotDisplayed: (linkText: string, description: string) => Promise<void>;
  verifySocialCampaignShareButtonIsNotVisible: (description: string) => Promise<void>;
  verifySocialCampaignShareButtonIsVisible: (description: string) => Promise<void>;
  verifyQuestionButtonIsNotVisible: () => Promise<void>;
  verifyNoResultMessage: () => Promise<void>;
  verifyFileIsAttached: (fileName: string) => Promise<void>;
  verifyQuestionButtonIsVisible: () => Promise<void>;
  verifyFeedSectionIsVisible: () => Promise<void>;
  verifyFeedSectionIsNotVisible: () => Promise<void>;
  verifySmartFeedBlocksAreNotVisible: () => Promise<void>;
  verifyCommentOptionsMenuVisible: (expectedOptions: string[]) => Promise<void>;
  verifyAttachedFileCount: (count: number) => Promise<void>;
  verifyUpdateButtonDisabled: () => Promise<void>;
  verifyPageNotFoundVisibility: (options?: { stepInfo?: string; timeout?: number }) => Promise<void>;
  verifyEmbededUrlIsVisible: (embedUrl: string) => Promise<void>;
}

export class FeedPage extends BasePage implements IFeedActions, IFeedAssertions {
  private createFeedPostComponent: CreateFeedPostComponent;
  private listFeedComponent: ListFeedComponent;
  private filePreviewComponent: FilePreviewComponent;
  private createQuestionComponent: CreateQuestionComponent;
  private shareComponent: ShareComponent;
  readonly shareThoughtsButton: Locator;
  readonly feedFilterSelect: Locator;
  readonly optionLocator: Locator;
  readonly sortByLocator: Locator;
  readonly sortByFilter: Locator;
  readonly celebrityFeedBlocks: Locator;
  readonly newHireFeedBlocks: Locator;
  readonly commentIcon: Locator;
  readonly commentOptionsMenu: Locator;
  readonly pageNotFoundHeading: Locator;

  constructor(page: Page, feedId?: string) {
    super(page, feedId ? PAGE_ENDPOINTS.getFeedPage(feedId) : '');
    this.createFeedPostComponent = new CreateFeedPostComponent(page);
    this.createQuestionComponent = new CreateQuestionComponent(page);
    this.listFeedComponent = new ListFeedComponent(page);
    this.filePreviewComponent = new FilePreviewComponent(page);
    this.shareComponent = new ShareComponent(page);
    // Share thoughts section
    this.shareThoughtsButton = this.page.locator('span', { hasText: 'Share your thought' });
    this.sortByFilter = this.page.locator('[id="feed_sort"]');
    this.sortByLocator = this.page.getByLabel('Sort by');
    // Feed filter dropdown
    this.feedFilterSelect = this.page.locator('select[id="feed_filter"]');
    this.optionLocator = this.page.getByLabel('Show', { exact: true });
    this.celebrityFeedBlocks = this.page.locator('strong:has-text("celebration")');
    this.newHireFeedBlocks = this.page.locator('strong:has-text("new hire")');
    this.commentIcon = this.page.getByRole('button', { name: 'Comment' });
    this.commentOptionsMenu = this.page.locator('[data-testid="comment-options-menu"]');
    this.pageNotFoundHeading = this.page.locator('h3', { hasText: 'Page not found' });
  }

  get actions(): IFeedActions {
    return this;
  }

  get assertions(): IFeedAssertions {
    return this;
  }

  /**
   * Verifies that the feed page is loaded by checking if share thoughts button is visible
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify feed page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton, {
        assertionMessage: 'Share thoughts button should be visible on feed page',
      });
    });
  }

  // High-level user flow methods
  async createAndPost(options: FeedPostOptions): Promise<FeedPostResult> {
    return await this.createFeedPostComponent.createAndPost(options);
  }

  async createAndPostQuestion(options: QuestionOptions): Promise<QuestionResult> {
    return await this.createQuestionComponent.createAndPostQuestion(options);
  }

  async editPost(currentText: string, newText: string, embedUrl?: string): Promise<void> {
    await this.createFeedPostComponent.editPost(currentText, newText, embedUrl);
  }

  async deletePost(postText: string): Promise<void> {
    await test.step(`Deleting post with text: ${postText}`, async () => {
      await this.listFeedComponent.openPostOptionsMenu(postText);
      await this.listFeedComponent.clickDeleteOption();
      await this.verifyDeleteFlow('Are you sure you want to delete this post?');
    });
  }

  async createPostWithAttachments(text: string, files?: string[]): Promise<FeedPostResult> {
    const options: FeedPostOptions = {
      text,
      ...(files && { attachments: { files } }),
    };
    return await this.createAndPost(options);
  }

  /**
   * Creates a feed post with user mention and topic mention
   * @param text - The base text for the post
   * @param userName - The user name to mention (e.g., "John Doe")
   * @param topicName - The topic name to mention (e.g., "Technology")
   * @returns Promise<FeedPostResult>
   */
  async createfeedWithMentionUserNameAndTopic(params: {
    text: string;
    userName: string;
    topicName: string;
    siteName: string | string[];
    embedUrl: string;
  }): Promise<FeedPostResult> {
    return await this.createFeedPostComponent.createfeedWithMentionUserNameAndTopic(params);
  }

  async editPostWithTopicAndUserName(params: {
    currentText: string;
    newText: string;
    topicName: string;
    userName: string;
  }): Promise<void> {
    return await this.createFeedPostComponent.editPostWithTopicAndUserName(params);
  }

  // High-level verification methods
  async verifyPostDetails(postText: string, expectedAttachmentCount: number): Promise<void> {
    await test.step(`Verify complete post details for: ${postText}`, async () => {
      // Verify timestamp is displayed
      await this.verifier.verifyTheElementIsVisible(this.listFeedComponent.getPostTimestampLocator(postText));

      // Verify file attachments count
      await expect(this.listFeedComponent.getPostAttachmentsLocator(postText)).toHaveCount(expectedAttachmentCount);

      // Verify inline image preview functionality
      await this.listFeedComponent.clickInlineImagePreview(postText);
      await this.listFeedComponent.verifyInlineImagePreviewVisible();
      await this.listFeedComponent.closeImagePreview();
    });
  }

  /**
   * Verifies the complete delete flow including confirmation dialog and final deletion
   * @param expectedText - Expected text in the confirmation dialog
   */
  private async verifyDeleteFlow(expectedText: string): Promise<void> {
    await test.step('Verify complete delete flow', async () => {
      // Verify delete confirmation dialog appears
      await this.verifier.verifyTheElementIsVisible(this.listFeedComponent.deleteConfirmDialog);
      await expect(this.listFeedComponent.deleteConfirmDialog).toContainText(expectedText);

      // Confirm deletion
      await this.listFeedComponent.confirmDelete();

      // Verify post is deleted (dialog disappears)
      await this.verifier.verifyTheElementIsNotVisible(this.listFeedComponent.deleteConfirmDialog);
    });
  }

  async waitForPostToBeVisible(expectedText: string): Promise<void> {
    await this.listFeedComponent.waitForPostToBeVisible(expectedText);
  }

  /**
   * Gets the timestamp for a specific post
   * @param postText - The text of the post to find timestamp for
   */
  async getPostTimestamp(postText: string): Promise<void> {
    await this.listFeedComponent.getPostTimestamp(postText);
  }

  //Favourite Post Methods
  async markPostAsFavourite(): Promise<void> {
    await test.step(`Marking post as favourite:`, async () => {
      await this.listFeedComponent.markPostAsFavourite();
    });
  }

  async removePostFromFavourite(postText: string): Promise<void> {
    await this.listFeedComponent.removePostFromFavourite(postText);
  }

  async verifyPostIsFavorited(postText: string): Promise<void> {
    await this.listFeedComponent.verifyPostIsFavorited(postText);
  }

  async verifyPostIsNotFavorited(postText: string): Promise<void> {
    await test.step(`Verify post is not favorited: ${postText}`, async () => {
      await this.listFeedComponent.verifyPostIsNotFavorited(postText);
    });
  }

  async validatePostText(postText: string): Promise<void> {
    await this.listFeedComponent.validatePostText(postText);
  }

  // File preview methods
  async clickInfoIcon(fileId: string): Promise<void> {
    await this.listFeedComponent.clickInfoIcon(fileId);
  }

  async verifyPreviewModalIsOpened(): Promise<void> {
    await this.filePreviewComponent.verifyPreviewModalIsOpened();
  }

  async clickDeleteButton(): Promise<void> {
    await this.filePreviewComponent.clickDeleteButton();
  }

  async clickOnDeleteReplyButton(): Promise<void> {
    await this.listFeedComponent.clickDeleteOption();
    await this.listFeedComponent.confirmDelete();
  }

  async verifyImageButtonIsNotVisible(): Promise<void> {
    await this.listFeedComponent.verifyImageButtonIsNotVisible();
  }

  async clickShowMoreButton(): Promise<void> {
    await this.filePreviewComponent.clickShowMoreButton();
  }

  async verifyVersionImageIsDisplayed(fileId: string): Promise<void> {
    await this.listFeedComponent.verifyVersionImageIsDisplayed(fileId);
  }

  async verifyVersionNumber(expectedVersionNumber: string): Promise<void> {
    await this.filePreviewComponent.verifyVersionNumber(expectedVersionNumber);
  }

  async verifyToastMessage(message: string): Promise<void> {
    await this.listFeedComponent.verifyToastMessageIsVisibleWithText(message);
  }

  async uploadImage(fileName: string): Promise<string> {
    return await this.filePreviewComponent.uploadImage(fileName);
  }

  async clickOnUploadButton(fileId: string): Promise<void> {
    await this.filePreviewComponent.clickOnUploadButton(fileId);
  }

  async clickOnCloseButton(): Promise<void> {
    await this.filePreviewComponent.clickOnCloseButton();
  }

  async clickOnInfoIconOnImage(): Promise<void> {
    await this.filePreviewComponent.clickOnInfoIconOnImage();
  }

  async clickOnEditVersionButton(): Promise<void> {
    await this.filePreviewComponent.clickOnEditVersionButton();
  }

  async addReplyToPost(replyText: string): Promise<void> {
    await this.listFeedComponent.addReplyToPost(replyText);
  }

  async verifyReplyIsVisible(replyText: string): Promise<void> {
    await this.listFeedComponent.verifyReplyIsVisible(replyText);
  }

  async clickReplyShowMoreButton(): Promise<void> {
    await this.listFeedComponent.clickReplyShowMoreButton();
  }

  async verifyReplyIsNotVisible(replyText: string): Promise<void> {
    await this.listFeedComponent.verifyReplyIsNotVisible(replyText);
  }

  async verifyPostsIFollow(): Promise<void> {
    await this.listFeedComponent.verifyPostsIFollow();
  }

  async verifySortByRecentActivity(): Promise<void> {
    await this.listFeedComponent.verifySortByRecentActivity();
  }

  async clickOnShowOption(optionValue: string): Promise<void> {
    await test.step(`Click on show option: ${optionValue}`, async () => {
      // Wait for the select element to be present
      await this.verifier.verifyTheElementIsVisible(this.feedFilterSelect, {
        assertionMessage: 'Feed filter dropdown should be visible',
      });

      // Click on the select element to open dropdown
      await this.clickOnElement(this.feedFilterSelect);

      // Find and click the specific option
      await this.optionLocator.selectOption(`${optionValue}`);

      // Click on select again to close dropdown
      await this.clickOnElement(this.feedFilterSelect);
    });
  }

  async clickOnSortByOption(optionValue: string): Promise<void> {
    await test.step(`Click on show option: ${optionValue}`, async () => {
      // Wait for the select element to be present
      await this.verifier.verifyTheElementIsVisible(this.sortByFilter, {
        assertionMessage: 'Sort by dropdown should be visible',
      });
      await this.clickOnElement(this.sortByFilter);

      await this.sortByLocator.selectOption(`${optionValue}`);

      // Click on select again to close dropdown
      await this.clickOnElement(this.sortByFilter);
    });
  }

  /**
   * Clicks the share thoughts button to open post editor
   */
  async clickShareThoughtsButton(): Promise<void> {
    await test.step('Click on Share your thoughts button', async () => {
      await this.clickOnElement(this.shareThoughtsButton);
    });
  }

  async enterQuestionTitle(title: string): Promise<void> {
    await this.createQuestionComponent.enterQuestionTitle(title);
  }

  async verifyAskQuestionButtonIsNotDisabled(): Promise<void> {
    await this.createQuestionComponent.verifyAskQuestionButtonIsNotDisabled();
  }

  async clickAskQuestionButton(): Promise<string> {
    // Publish the page
    const postResponse = await this.createQuestionComponent.clickAskQuestionButton();

    //json body
    const feedResponseBody = (await postResponse.json()) as FeedPostApiResponse;

    //fetch the page id from the response
    const postId = feedResponseBody.result.feedId;
    console.log('postId', postId);
    return postId;
  }

  async verifyQuestionCreatedSuccessfully(questionTitle: string): Promise<void> {
    await this.createQuestionComponent.verifyQuestionCreatedSuccessfully(questionTitle);
  }

  async clickQuestionButton(): Promise<void> {
    await this.createFeedPostComponent.clickQuestionButton();
  }

  async editQuestion(questionTitle: string, newTitle: string): Promise<void> {
    await this.createQuestionComponent.editQuestion(questionTitle, newTitle);
  }

  async verifyCampaignLinkDisplayed(linkText: string, description: string): Promise<void> {
    await this.listFeedComponent.verifyCampaignLinkDisplayed(linkText, description);
  }

  async verifyCampaignLinkNotDisplayed(linkText: string, description: string): Promise<void> {
    await this.listFeedComponent.verifyCampaignLinkNotDisplayed(linkText, description);
  }

  async verifySocialCampaignShareButtonIsNotVisible(description: string): Promise<void> {
    await this.listFeedComponent.verifySocialCampaignShareButtonIsNotVisible(description);
  }

  async verifySocialCampaignShareButtonIsVisible(description: string): Promise<void> {
    await this.listFeedComponent.verifySocialCampaignShareButtonIsVisible(description);
  }

  /**
   * Clicks on a specific option in the feed filter dropdown
   * @param optionValue - The text value of the option to select
   */
  /**
   * Selects "site feed" option from share dropdown in post creation
   */
  async selectShareOptionAsSiteFeed(): Promise<void> {
    await this.shareComponent.selectShareOptionAsSiteFeed();
  }

  async verifyQuestionButtonIsNotVisible(): Promise<void> {
    await this.createFeedPostComponent.verifyQuestionButtonIsNotVisible();
  }

  /**
   * Searches for a site name without selecting it (to verify access)
   * @param siteName - The site name to search for
   */
  async searchForSiteName(siteName: string): Promise<void> {
    await this.createFeedPostComponent.searchForSiteName(siteName);
  }

  /**
   * Verifies "No results" message is displayed when searching for inaccessible sites
   */
  async verifyNoResultMessage(): Promise<void> {
    await this.createFeedPostComponent.verifyNoResultMessage();
  }

  /**
   * Enters text into the post editor
   * @param text - The text to enter in the post
   */
  async enterFeedPostText(text: string): Promise<void> {
    await this.createFeedPostComponent.createPost(text);
  }

  /**
   * Clicks the "browse files" button to open file library
   */
  async clickBrowseFilesButton(): Promise<void> {
    await this.createFeedPostComponent.clickBrowseFilesButton();
  }

  /**
   * Searches for a file in the file library
   * @param fileName - The name of the file to search for (e.g., ".mp4")
   */
  async searchForFileInLibrary(fileName: string): Promise<void> {
    await this.createFeedPostComponent.searchForFileInLibrary(fileName);
  }

  /**
   * Selects a file from the file library by clicking its checkbox
   * @param fileName - The name of the file to select
   */
  async selectFileFromLibrary(fileName: string): Promise<void> {
    await this.createFeedPostComponent.selectFileFromLibrary(fileName);
  }

  /**
   * Clicks the "Attach" button to attach selected files from library
   */
  async clickAttachButton(): Promise<void> {
    await this.createFeedPostComponent.clickAttachButton();
  }

  /**
   * Verifies that a file is attached to the post
   * @param fileName - The name of the file to verify
   */
  async verifyFileIsAttached(fileName: string): Promise<void> {
    await this.createFeedPostComponent.verifyFileIsAttached(fileName);
  }

  /**
   * Clicks the Post button to publish the feed post
   */
  async clickPostButton(): Promise<void> {
    await this.createFeedPostComponent.clickPostButton();
  }

  /**
   * Verifies that the Question button is visible in the post editor
   */
  async verifyQuestionButtonIsVisible(): Promise<void> {
    await this.createFeedPostComponent.verifyQuestionButtonIsVisible();
  }

  async verifyFeedSectionIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton, {
      assertionMessage: 'Feed section should be visible',
    });
  }

  async verifyFeedSectionIsNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.shareThoughtsButton, {
      assertionMessage: 'Feed section should not be visible',
    });
  }

  async verifySmartFeedBlocksAreNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.celebrityFeedBlocks, {
      assertionMessage: 'Smart feed blocks should not be visible',
    });
    await this.verifier.verifyTheElementIsNotVisible(this.newHireFeedBlocks, {
      assertionMessage: 'Smart feed blocks should not be visible',
    });
  }

  async clickOnCommentIcon(): Promise<void> {
    await test.step('Click on comment icon', async () => {
      await this.clickOnElement(this.commentIcon);
    });
  }

  async clickOnCommentOptionsMenu(commentText: string): Promise<void> {
    await test.step(`Click on comment options menu for: ${commentText}`, async () => {
      const commentElement = this.page.locator(`text=${commentText}`).first();
      const optionsButton = commentElement.locator('..').getByRole('button', { name: 'Options' });
      await this.clickOnElement(optionsButton);
    });
  }

  async verifyCommentOptionsMenuVisible(expectedOptions: string[]): Promise<void> {
    await test.step(`Verify comment options menu contains: ${expectedOptions.join(', ')}`, async () => {
      for (const option of expectedOptions) {
        await this.verifier.verifyTheElementIsVisible(this.commentOptionsMenu.getByRole('button', { name: option }), {
          assertionMessage: `Comment option "${option}" should be visible`,
        });
      }
    });
  }

  async verifyAttachedFileCount(count: number): Promise<void> {
    await this.createFeedPostComponent.verifyAttachedFileCount(count);
  }

  async verifyUpdateButtonDisabled(): Promise<void> {
    await this.createFeedPostComponent.verifyUpdateButtonDisabled();
  }

  async openPostOptionsMenu(postText: string): Promise<void> {
    await this.createFeedPostComponent.openPostOptionsMenu(postText);
  }

  async clickEditOption(): Promise<void> {
    await this.createFeedPostComponent.clickEditOption();
  }

  async createPost(text: string): Promise<void> {
    await this.createFeedPostComponent.createPost(text);
  }

  async updatePostText(text: string): Promise<void> {
    await this.createFeedPostComponent.updatePostText(text);
  }

  async removeAttachedFile(index: number = 0): Promise<void> {
    await this.createFeedPostComponent.removeAttachedFile(index);
  }

  async clickUpdateButton(): Promise<void> {
    await this.createFeedPostComponent.clickUpdateButton();
  }

  async addFileToPost(filePath: string): Promise<void> {
    await this.createFeedPostComponent.addFileToPost(filePath);
  }

  async waitForFileToAppear(): Promise<void> {
    await this.createFeedPostComponent.waitForFileToAppear();
  }

  async uploadFiles(files: string[]): Promise<void> {
    await this.createFeedPostComponent.uploadFiles(files);
  }

  async applyFormattingAndEnterText(
    formatType: 'bold' | 'italic' | 'underline' | 'strike' | 'numberBullet' | 'dotBullet',
    text: string
  ): Promise<void> {
    await this.createFeedPostComponent.applyFormattingAndEnterText(formatType, text);
  }

  async addLink(linkText: string, linkUrl: string): Promise<void> {
    await this.createFeedPostComponent.addLink(linkText, linkUrl);
  }

  async selectEmoji(emojiIndex: number = 1): Promise<void> {
    await this.createFeedPostComponent.selectEmoji(emojiIndex);
  }

  async verifyPageNotFoundVisibility(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Verify the page - Page not found`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageNotFoundHeading, {
        assertionMessage: 'Page not found heading should be visible',
        timeout: options?.timeout || TIMEOUTS.SHORT,
      });
    });
  }

  async verifyEmbededUrlIsVisible(embedUrl: string): Promise<void> {
    await this.listFeedComponent.verifyEmbededUrlIsVisible(embedUrl);
  }
}
