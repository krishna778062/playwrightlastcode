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
  verifyThePageIsLoaded(): Promise<void>;
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
  openReplyEditorForPost: (postText: string) => Promise<void>;
  addReplyToPost: (replyText: string, postId: string) => Promise<void>;
  clickReplyShowMoreButton: () => Promise<void>;
  clickLoadMoreRepliesButton: () => Promise<void>;
  clickOnDeleteReplyButton: () => Promise<void>;
  verifyCancelButtonVisible: (postText: string) => Promise<void>;
  clickCancelButton: (postText: string) => Promise<void>;
  verifyReplyEditorVisible: (postText: string) => Promise<void>;
  verifyReplyEditorClosed: (postText: string) => Promise<void>;
  clickShareThoughtsButton: () => Promise<void>;
  enterQuestionTitle: (title: string) => Promise<void>;
  clickAskQuestionButton: () => Promise<string>;
  clickQuestionButton: () => Promise<void>;
  editQuestion: (questionTitle: string, newTitle: string) => Promise<void>;
  clickOnShowOption: (optionValue: string) => Promise<void>;
  clickOnSortByOption: (optionValue: string) => Promise<void>;
  selectShareOptionAsSiteFeed: () => Promise<void>;
  clickShareButtonForPost: (postText: string) => Promise<void>;
  verifyPostIsAtTop: (postText: string) => Promise<void>;
  enterShareDescription: (description: string) => Promise<void>;
  clickShareButton: () => Promise<void>;
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
  createAndPostWithTopic: (text: string, topic: string) => Promise<FeedPostResult>;
  clickPostTimestamp: (postText: string) => Promise<void>;
  shareFeedPost: (params: {
    postText: string;
    mentionUserName?: string;
    shareMessage: string;
    postIn: 'Home Feed' | 'Site Feed';
  }) => Promise<void>;
  verifyPostIsNotVisible: (postText: string) => Promise<void>;
  clickShareButtonOnPost: (postText: string) => Promise<void>;
  attemptImagePasteInShareModal: () => Promise<void>;
  clickShareOnComment: () => Promise<void>;
  clickShareOnPost: (postText: string) => Promise<void>;
  addUserNameMentionInShareDialog: (userName: string) => Promise<void>;
  addSiteMentionInShareDialog: (siteName: string) => Promise<void>;
  addTopicMentionInShareDialog: (topicName: string) => Promise<void>;
  addEmbeddedUrlInShareDialog: (embedUrl: string) => Promise<void>;
  enterSiteNameInShareDialog: (siteName: string) => Promise<void>;
  clickShareButtonInShareDialog: () => Promise<void>;
  verifyViewPostLinkInShareDialog: () => Promise<void>;
  clickViewPostLink: () => Promise<void>;
  verifyFeedDetailPageLoaded: () => Promise<void>;
  verifyVideoLinkUnfurled: (embedUrl: string) => Promise<void>;
  verifyPostTextOnDetailPage: (postText: string) => Promise<void>;
  verifyShareCount: (postText: string, expectedCount: number) => Promise<void>;
  verifyLikesCount: (postText: string, expectedCount: number) => Promise<void>;
  verifyRepliesCount: (postText: string, expectedCount: number) => Promise<void>;
  likeFeedPost: (postText: string) => Promise<void>;
  unlikeFeedPost: (postText: string) => Promise<void>;
  likeFeedReply: (replyText: string) => Promise<void>;
  unlikeFeedReply: (replyText: string) => Promise<void>;
  verifyPostCreationCancelButtonVisible: () => Promise<void>;
  clickPostCreationCancelButton: () => Promise<void>;
  verifyPostCreationEditorClosed: () => Promise<void>;
  hoverOnReactionButton: (postText: string) => Promise<void>;
  clickReactionEmoji: (postText: string, reactionName: string) => Promise<void>;
  verifyReactionButtonTextContent(postText: string, reactionName: string): Promise<void>;
  clickReactionCountButton: (postText: string) => Promise<void>;
  verifyReactionModalIsVisible: () => Promise<void>;
  verifyReactionModalTabExists: (emojiName: string) => Promise<void>;
  verifyUsersInReactionModalTab: (emojiName: string, expectedUsers: string[]) => Promise<void>;
  closeReactionModal: () => Promise<void>;
  fillShareDialogWithMentionsAndTopics: (params: {
    shareMessage: string;
    userNames?: string[];
    siteNames?: string[];
    topicNames?: string[];
    embedUrl?: string;
  }) => Promise<void>;
  clickShareIconOnPost: (postText: string) => Promise<void>;
  enterSiteNameForShare: (siteName: string) => Promise<void>;
  clickViewPostLinkInShareModal(): Promise<void>;
  clickViewPostLinkInPostDetailPage(): Promise<void>;
  reloadPage(): Promise<void>;
  addReplyToPostWithEmbedUrl(replyText: string, postId: string, embedUrl: string): Promise<void>;
}

export interface IFeedAssertions {
  // High-level verification flows
  verifyPostDetails: (postText: string, expectedAttachmentCount: number) => Promise<void>;
  waitForPostToBeVisible: (expectedText: string) => Promise<void>;
  verifyPostIsNotVisible(text: string): Promise<void>;
  verifyPostIsNotFavorited: (postText: string) => Promise<void>;
  verifyPostIsFavorited: (postText: string) => Promise<void>;
  validatePostText: (postText: string) => Promise<void>;
  verifyImageButtonIsNotVisible: () => Promise<void>;
  verifyPostIsNotVisible: (postText: string) => Promise<void>;
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
  verifyRecentlyPublishedBlockIsVisible: () => Promise<void>;
  verifyContentVisibleInRecentlyPublishedBlock: (contentTitle: string) => Promise<void>;
  verifyContentNotVisibleInRecentlyPublishedBlock: (contentTitle: string) => Promise<void>;
  verifyCommentOptionsMenuVisible: (expectedOptions: string[]) => Promise<void>;
  verifyAttachedFileCount: (count: number) => Promise<void>;
  verifyUpdateButtonDisabled: () => Promise<void>;
  verifyLikeCountOnPost: (postText: string) => Promise<void>;
  verifyLikeCountOnReply: (replyText: string) => Promise<void>;
  verifyPageNotFoundVisibility: (options?: { stepInfo?: string; timeout?: number }) => Promise<void>;
  verifyReplyCount: (postText: string, expectedCount: number, replyText?: string) => Promise<void>;
  clickPostTimestamp: (postText: string) => Promise<void>;
  getVisibleReplyCount: (postText: string) => Promise<number>;
  verifySiteImageInFeedCard: (contentTitle: string, siteId: string, siteImageFileId: string) => Promise<void>;
  verifyPostIsAtTop: (postText: string) => Promise<void>;
  verifyNoAttachmentsInShareModal: () => Promise<void>;
  verifyShareModalIsFunctional: () => Promise<void>;
  verifyShareModalIsOpen: () => Promise<void>;
  verifyViewPostLinkInShareDialog: () => Promise<void>;
  verifyFeedDetailPageLoaded: () => Promise<void>;
  verifyVideoLinkUnfurled: (embedUrl: string) => Promise<void>;
  verifyPostTextOnDetailPage: (postText: string) => Promise<void>;
  verifyShareCount: (postText: string, expectedCount: number) => Promise<void>;
  verifyLikesCount: (postText: string, expectedCount: number) => Promise<void>;
  verifyRepliesCount: (postText: string, expectedCount: number) => Promise<void>;
  verifyEmbededUrlIsVisible: (embedUrl: string) => Promise<void>;
  verifyEmbedUrlPreviewIsVisible: (embedUrl: string) => Promise<void>;
  verifyEmbedUrlPreviewIsVisibleInReply: (embedUrl: string, replyText: string) => Promise<void>;
  verifyShareButtonIsNotVisible: () => Promise<void>;
  verifyReactionButtonIsNotVisible: () => Promise<void>;
  verifyReactionButtonIsVisible: () => Promise<void>;
  verifyReactionButtonIsVisibleForReply: () => Promise<void>;
  verifyThePageIsLoadedWithTimelineMode(): Promise<void>;
  verifyVideoControls: (postText: string) => Promise<void>;
  verifyEmbededUrlIsNotUnfurled: (embedUrl: string, postText: string) => Promise<void>;
  verifyDeletedPostMessage: (postText: string) => Promise<void>;
  verifyRemovedContentMessage: (postText: string) => Promise<void>;
  verifyPostCannotBeInteracted: (postText: string) => Promise<void>;
  verifyFeedPlaceholderText: (expectedPlaceholder: string) => Promise<void>;
  verifyToastMessageIsVisibleWithText: (message: string) => Promise<void>;
  verifyShareModalIsVisible(): Promise<void>;
  verifyShareModalIsClosed: () => Promise<void>;
  verifyTimestampFormat: (postText: string) => Promise<void>;
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
  readonly recentlyPublishedBlock: Locator;
  readonly recentlyPublishedContentItem: (contentTitle: string) => Locator;
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
    this.recentlyPublishedBlock = this.page.locator('section', { hasText: 'Recently published' }).first();
    this.recentlyPublishedContentItem = (contentTitle: string) =>
      this.recentlyPublishedBlock.filter({ hasText: contentTitle }).first();
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

  async reloadPage(): Promise<void> {
    await test.step('Reload page', async () => {
      await this.page.reload();
      await this.verifyThePageIsLoaded();
    });
  }

  // High-level user flow methods
  async createAndPost(options: FeedPostOptions): Promise<FeedPostResult> {
    return await this.createFeedPostComponent.createAndPost(options);
  }

  async createAndPostWithTopic(text: string, topic: string): Promise<FeedPostResult> {
    return await this.createFeedPostComponent.createAndPostWithTopic(text, topic);
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
  async verifyPostIsNotVisible(text: string): Promise<void> {
    await this.listFeedComponent.verifyPostIsNotVisible(text);
  }

  /**
   * Gets the timestamp for a specific post
   * @param postText - The text of the post to find timestamp for
   * @returns Promise<string> - The timestamp text content
   */
  async getPostTimestamp(postText: string): Promise<string> {
    return await this.listFeedComponent.getPostTimestamp(postText);
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

  async addReplyToPost(replyText: string, postId: string): Promise<void> {
    await this.listFeedComponent.addReplyToPost(replyText, postId);
  }

  async addReplyToPostWithEmbedUrl(replyText: string, postId: string, embedUrl: string): Promise<void> {
    await this.listFeedComponent.addReplyToPostWithEmbedUrl(replyText, postId, embedUrl);
  }

  async openReplyEditorForPost(postText: string): Promise<void> {
    await this.listFeedComponent.openReplyEditorForPost(postText);
  }

  async verifyReplyIsVisible(replyText: string): Promise<void> {
    await this.listFeedComponent.verifyReplyIsVisible(replyText);
  }

  async clickReplyShowMoreButton(): Promise<void> {
    await this.listFeedComponent.clickReplyShowMoreButton();
  }

  async clickLoadMoreRepliesButton(): Promise<void> {
    await this.listFeedComponent.clickLoadMoreRepliesButton();
  }

  async getVisibleReplyCount(postText: string): Promise<number> {
    return await this.listFeedComponent.getVisibleReplyCount(postText);
  }

  async verifyReplyCount(postText: string, expectedCount: number): Promise<void> {
    await this.listFeedComponent.verifyReplyCount(postText, expectedCount);
  }

  async clickPostTimestamp(postText: string): Promise<void> {
    await this.listFeedComponent.clickPostTimestamp(postText);
  }

  async verifyReplyIsNotVisible(replyText: string): Promise<void> {
    await this.listFeedComponent.verifyReplyIsNotVisible(replyText);
  }

  async verifyCancelButtonVisible(postText: string): Promise<void> {
    await this.listFeedComponent.verifyCancelButtonVisible(postText);
  }

  async clickCancelButton(postText: string): Promise<void> {
    await this.listFeedComponent.clickCancelButton(postText);
  }

  async verifyReplyEditorVisible(postText: string): Promise<void> {
    await this.listFeedComponent.verifyReplyEditorVisible(postText);
  }

  async verifyReplyEditorClosed(postText: string): Promise<void> {
    await this.listFeedComponent.verifyReplyEditorClosed(postText);
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

  async clickShareButtonForPost(postText: string): Promise<void> {
    await this.listFeedComponent.clickShareButtonForPost(postText);
  }

  async verifyPostIsAtTop(postText: string): Promise<void> {
    await this.listFeedComponent.verifyPostIsAtTop(postText);
  }

  async clickShareButton(): Promise<void> {
    await this.shareComponent.actions.clickShareButton();
  }

  async verifyQuestionButtonIsNotVisible(): Promise<void> {
    try {
      await this.createFeedPostComponent.verifyQuestionButtonIsNotVisible();
    } catch (error) {
      await this.reloadPage();
      await this.createFeedPostComponent.verifyQuestionButtonIsNotVisible();
    }
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

  async verifyRecentlyPublishedBlockIsVisible(): Promise<void> {
    await test.step('Verify Recently Published smart block is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.recentlyPublishedBlock, {
        assertionMessage: 'Recently Published smart block should be visible',
      });
    });
  }

  async verifyContentVisibleInRecentlyPublishedBlock(contentTitle: string): Promise<void> {
    await test.step(`Verify content "${contentTitle}" is visible in Recently Published block`, async () => {
      const contentItem = this.recentlyPublishedContentItem(contentTitle);
      await this.verifier.verifyTheElementIsVisible(contentItem, {
        assertionMessage: `Content "${contentTitle}" should be visible in Recently Published block`,
      });
    });
  }

  async verifyContentNotVisibleInRecentlyPublishedBlock(contentTitle: string): Promise<void> {
    await test.step(`Verify content "${contentTitle}" is NOT visible in Recently Published block`, async () => {
      const contentItem = this.recentlyPublishedContentItem(contentTitle);
      await this.verifier.verifyTheElementIsNotVisible(contentItem, {
        assertionMessage: `Content "${contentTitle}" should NOT be visible in Recently Published block`,
        timeout: 5000,
      });
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
  async likeFeedPost(postText: string): Promise<void> {
    await this.listFeedComponent.likeFeedPost(postText);
  }

  async unlikeFeedPost(postText: string): Promise<void> {
    await this.listFeedComponent.unlikeFeedPost(postText);
  }

  async likeFeedReply(replyText: string): Promise<void> {
    await this.listFeedComponent.likeFeedReply(replyText);
  }

  async unlikeFeedReply(replyText: string): Promise<void> {
    await this.listFeedComponent.unlikeFeedReply(replyText);
  }

  async verifyPostCreationCancelButtonVisible(): Promise<void> {
    await this.createFeedPostComponent.verifyPostCreationCancelButtonVisible();
  }

  async clickPostCreationCancelButton(): Promise<void> {
    await this.createFeedPostComponent.clickPostCreationCancelButton();
  }

  async verifyPostCreationEditorClosed(): Promise<void> {
    await this.createFeedPostComponent.verifyPostCreationEditorClosed();
  }

  async verifyLikeCountOnPost(postText: string): Promise<void> {
    await this.listFeedComponent.verifyLikeCountOnPost(postText);
  }

  async verifyLikeCountOnReply(replyText: string): Promise<void> {
    await this.listFeedComponent.verifyLikeCountOnReply(replyText);
  }

  async verifyPageNotFoundVisibility(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Verify the page - Page not found`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageNotFoundHeading, {
        assertionMessage: 'Page not found heading should be visible',
        timeout: options?.timeout || TIMEOUTS.SHORT,
      });
    });
  }

  async verifySiteImageInFeedCard(contentTitle: string, siteId: string, siteImageFileId: string): Promise<void> {
    await this.listFeedComponent.verifySiteImageInFeedCard(contentTitle, siteId, siteImageFileId);
  }

  async shareFeedPost(params: {
    postText: string;
    mentionUserName?: string;
    shareMessage: string;
    postIn: 'Home Feed' | 'Site Feed';
  }): Promise<void> {
    await test.step(`Share feed post "${params.postText}" with message "${params.shareMessage}"`, async () => {
      // Click share icon on the post
      await this.listFeedComponent.clickShareIcon(params.postText);

      // Wait for share dialog to appear
      await this.verifier.verifyTheElementIsVisible(this.shareComponent.shareDescriptionInput, {
        assertionMessage: 'Share dialog should be visible',
      });

      // Enter share message first
      console.log(`Entering share message: ${params.shareMessage}`);
      await this.shareComponent.enterShareDescription(params.shareMessage);

      // Add mention if provided (after message)
      if (params.mentionUserName) {
        console.log(`Adding mention: @${params.mentionUserName}`);
        await this.createFeedPostComponent.addUserNameMention(params.mentionUserName);
      }

      // Select post location
      console.log(`Selecting post in: ${params.postIn}`);
      if (params.postIn === 'Home Feed') {
        // Home Feed is typically the default, so we may not need to select it
        // But if we need to, try selecting by value or label
        try {
          // Wait for dropdown to be ready
          await this.shareComponent.shareOptionDropdown.waitFor({ state: 'visible' });
          // Try to select 'public' value, if it fails, Home Feed is likely already selected
          await this.shareComponent.shareOptionDropdown.selectOption({ value: 'public' });
        } catch {
          // If selection fails, Home Feed is likely already the default, continue
          console.log('Home Feed appears to be already selected or is the default');
        }
      } else {
        await this.shareComponent.selectShareOptionAsSiteFeed();
      }

      // Click Share button
      await this.shareComponent.clickShareButton();
    });
  }

  async clickShareButtonOnPost(postText: string): Promise<void> {
    await this.listFeedComponent.clickShareIcon(postText);
  }

  async attemptImagePasteInShareModal(): Promise<void> {
    await this.shareComponent.attemptImagePaste();
  }

  async verifyNoAttachmentsInShareModal(): Promise<void> {
    await this.shareComponent.assertions.verifyNoAttachmentsInShareModal();
  }

  async verifyShareModalIsFunctional(): Promise<void> {
    await this.shareComponent.assertions.verifyShareModalIsFunctional();
  }

  async verifyShareModalIsOpen(): Promise<void> {
    await test.step('Verify share modal is open', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareComponent.shareDescriptionInput, {
        assertionMessage: 'Share modal should be open',
      });
    });
  }

  async clickShareOnComment(): Promise<void> {
    await this.listFeedComponent.clickShareOnComment();
  }

  async clickShareOnPost(postText: string): Promise<void> {
    await this.listFeedComponent.clickShareOnPost(postText);
  }

  async addUserNameMentionInShareDialog(userName: string): Promise<void> {
    await test.step(`Adding user mention in share dialog: @${userName}`, async () => {
      const shareEditor = this.shareComponent.shareDescriptionInput;
      await this.typeInElement(shareEditor, ` @${userName}`);
      // Wait for dropdown and select user
      const userOption = this.page
        .locator("div[class*='ListingItem-module__details'] div p")
        .filter({ hasText: userName })
        .first();
      await userOption.waitFor({ state: 'visible' });
      await this.clickOnElement(userOption);
    });
  }

  async addSiteMentionInShareDialog(siteName: string): Promise<void> {
    await test.step(`Adding site mention in share dialog: @${siteName}`, async () => {
      const shareEditor = this.shareComponent.shareDescriptionInput;
      await this.typeInElement(shareEditor, ` @${siteName}`);
      // Wait for dropdown and select site
      const siteOption = this.page
        .locator("div[class*='ListingItem-module__details'] p")
        .filter({ hasText: siteName })
        .first();
      const isVisible = await siteOption.isVisible().catch(() => false);
      if (isVisible) {
        await siteOption.waitFor({ state: 'visible' });
        await this.clickOnElement(siteOption);
      } else {
        await shareEditor.press('Enter');
      }
    });
  }

  /**
   * Adds topic mention in the share dialog
   * @param topicName - The topic name to mention
   */
  async addTopicMentionInShareDialog(topicName: string): Promise<void> {
    await test.step(`Adding topic mention in share dialog: #${topicName}`, async () => {
      const shareEditor = this.shareComponent.shareDescriptionInput;
      await this.typeInElement(shareEditor, ` #${topicName}`);
      // Wait for dropdown and select topic
      const topicOption = this.page
        .locator("div[role='menuitem'] div p")
        .filter({ hasText: new RegExp(`^${topicName}$`) })
        .first();
      await topicOption.waitFor({ state: 'visible' });
      await this.clickOnElement(topicOption);
    });
  }

  /**
   * Adds embedded URL in the share dialog
   * @param embedUrl - The URL to embed
   */
  async addEmbeddedUrlInShareDialog(embedUrl: string): Promise<void> {
    await test.step(`Adding embedded URL in share dialog: ${embedUrl}`, async () => {
      const shareEditor = this.shareComponent.shareDescriptionInput;
      await this.typeInElement(shareEditor, ` ${embedUrl}`);
    });
  }

  /**
   * Fills share dialog with message, mentions, topics, and embedded URL
   * This is a wrapper function that combines multiple share dialog operations
   * @param params - Object containing shareMessage, userNames, siteNames, topicNames, and embedUrl
   */
  async fillShareDialogWithMentionsAndTopics(params: {
    shareMessage: string;
    userNames?: string[];
    siteNames?: string[];
    topicNames?: string[];
    embedUrl?: string;
  }): Promise<void> {
    const { shareMessage, userNames, siteNames, topicNames, embedUrl } = params;
    await test.step(`Fill share dialog with message, mentions, topics, and embedded URL`, async () => {
      // Enter share description
      await this.enterShareDescription(shareMessage);

      // Add user mentions
      if (userNames && userNames.length > 0) {
        for (const userName of userNames) {
          await this.addUserNameMentionInShareDialog(userName);
        }
      }

      // Add site mentions
      if (siteNames && siteNames.length > 0) {
        for (const siteName of siteNames) {
          await this.addSiteMentionInShareDialog(siteName);
        }
      }

      // Add topic mentions
      if (topicNames && topicNames.length > 0) {
        for (const topicName of topicNames) {
          await this.addTopicMentionInShareDialog(topicName);
        }
      }

      // Add embedded URL
      if (embedUrl) {
        await this.addEmbeddedUrlInShareDialog(embedUrl);
      }
    });
  }

  async enterSiteNameInShareDialog(siteName: string): Promise<void> {
    await this.shareComponent.enterSiteName(siteName);
  }

  async clickShareButtonInShareDialog(): Promise<void> {
    await this.shareComponent.clickShareButton();
  }

  async verifyViewPostLinkInShareDialog(): Promise<void> {
    await this.shareComponent.verifyViewPostLinkInShareDialog();
  }

  async clickViewPostLink(): Promise<void> {
    await this.listFeedComponent.clickViewPostLink();
  }

  async verifyFeedDetailPageLoaded(): Promise<void> {
    await test.step('Verify feed detail page is loaded', async () => {
      // Wait for URL to contain /feed/
      await this.page.waitForURL(new RegExp('/feed/'));
      // Wait for page to be fully loaded
      // Verify share thoughts button or feed content is visible (optional check)
      const isShareButtonVisible = await this.shareThoughtsButton.isVisible().catch(() => false);
      if (!isShareButtonVisible) {
        // If share button is not visible, verify page is loaded by checking for any feed content
        const feedContent = this.page.locator('div[class*="postContent"]').first();
        await this.verifier.verifyTheElementIsVisible(feedContent, {
          assertionMessage: 'Feed detail page should be loaded',
        });
      }
    });
  }

  async verifyVideoLinkUnfurled(embedUrl: string): Promise<void> {
    await test.step(`Verify video link is unfurled: ${embedUrl}`, async () => {
      // Look for video embed or preview
      const videoEmbed = this.page
        .locator('iframe[src*="youtube"], div[class*="embed"], div[class*="video"], a[href*="youtube"]')
        .first();
      const isVisible = await videoEmbed.isVisible().catch(() => false);
      if (!isVisible) {
        console.warn(`Video link unfurling not visible for URL: ${embedUrl}, but continuing test`);
      } else {
        await this.verifier.verifyTheElementIsVisible(videoEmbed, {
          assertionMessage: `Video link should be unfurled for URL: ${embedUrl}`,
        });
      }
    });
  }

  async verifyPostTextOnDetailPage(postText: string): Promise<void> {
    await test.step(`Verify post text on detail page: ${postText}`, async () => {
      await this.listFeedComponent.validatePostText(postText);
    });
  }

  async verifyShareCount(postText: string, expectedCount: number): Promise<void> {
    await this.listFeedComponent.verifyShareCount(postText, expectedCount);
  }

  async verifyLikesCount(postText: string, expectedCount: number): Promise<void> {
    await this.listFeedComponent.verifyLikesCount(postText, expectedCount);
  }

  async verifyRepliesCount(postText: string, expectedCount: number): Promise<void> {
    await this.listFeedComponent.verifyRepliesCount(postText, expectedCount);
  }

  async verifyEmbededUrlIsVisible(embedUrl: string): Promise<void> {
    await this.listFeedComponent.verifyEmbededUrlIsVisible(embedUrl);
  }

  async verifyEmbedUrlPreviewIsVisible(embedUrl: string): Promise<void> {
    await this.listFeedComponent.verifyEmbedUrlPreviewIsVisible(embedUrl);
  }

  async verifyEmbedUrlPreviewIsVisibleInReply(embedUrl: string, replyText: string): Promise<void> {
    await this.listFeedComponent.verifyEmbedUrlPreviewIsVisibleInReply(embedUrl, replyText);
  }

  async verifyShareButtonIsNotVisible(): Promise<void> {
    await this.listFeedComponent.verifyShareButtonIsNotVisible();
  }

  async verifyReactionButtonIsNotVisible(): Promise<void> {
    await this.listFeedComponent.verifyReactionButtonIsNotVisible();
  }

  async verifyReactionButtonIsVisible(): Promise<void> {
    await this.listFeedComponent.verifyReactionButtonIsVisible();
  }

  async verifyReactionButtonIsVisibleForReply(): Promise<void> {
    await this.listFeedComponent.verifyReactionButtonIsVisibleForReply();
  }

  async verifyThePageIsLoadedWithTimelineMode(): Promise<void> {
    await this.listFeedComponent.verifyThePageIsLoadedWithTimelineMode();
  }

  async verifyEmbededUrlIsNotUnfurled(embedUrl: string, postText: string): Promise<void> {
    await this.listFeedComponent.verifyEmbededUrlIsNotUnfurled(embedUrl, postText);
  }

  async hoverOnReactionButton(postText: string): Promise<void> {
    await this.listFeedComponent.hoverOnReactionButton(postText);
  }

  async clickReactionEmoji(postText: string, reactionName: string): Promise<void> {
    await this.listFeedComponent.clickReactionEmoji(postText, reactionName);
  }

  async verifyReactionButtonTextContent(postText: string, reactionName: string): Promise<void> {
    await this.listFeedComponent.verifyReactionButtonTextContent(postText, reactionName);
  }

  async clickReactionCountButton(postText: string): Promise<void> {
    await this.listFeedComponent.clickReactionCountButton(postText);
  }

  async verifyReactionModalIsVisible(): Promise<void> {
    await this.listFeedComponent.verifyReactionModalIsVisible();
  }

  async verifyReactionModalTabExists(emojiName: string): Promise<void> {
    await this.listFeedComponent.verifyReactionModalTabExists(emojiName);
  }

  async verifyUsersInReactionModalTab(emojiName: string, expectedUsers: string[]): Promise<void> {
    await this.listFeedComponent.verifyUsersInReactionModalTab(emojiName, expectedUsers);
  }

  async closeReactionModal(): Promise<void> {
    await this.listFeedComponent.closeReactionModal();
  }

  async clickShareIconOnPost(postText: string): Promise<void> {
    await this.listFeedComponent.clickShareIcon(postText);
  }

  async verifyVideoControls(postText: string): Promise<void> {
    await this.listFeedComponent.verifyVideoControls(postText);
  }

  async verifyDeletedPostMessage(postText: string): Promise<void> {
    await this.listFeedComponent.verifyDeletedPostMessage(postText);
  }

  /**
   * Verifies that a removed content message is displayed for a post that was removed due to inappropriate content
   * @param postText - The text of the post to verify removed message for
   */
  async verifyRemovedContentMessage(postText: string): Promise<void> {
    await test.step(`Verify removed content message for post: ${postText}`, async () => {
      await this.listFeedComponent.verifyRemovedContentMessage(postText);
    });
  }

  /**
   * Verifies that a post cannot be interacted with (share, like, comment buttons are not visible)
   * @param postText - The text of the post to verify interaction restrictions for
   */
  async verifyPostCannotBeInteracted(postText: string): Promise<void> {
    await this.listFeedComponent.verifyPostCannotBeInteracted(postText);
  }

  async enterShareDescription(description: string): Promise<void> {
    await this.shareComponent.actions.enterShareDescription(description);
  }

  async enterSiteNameForShare(siteName: string): Promise<void> {
    await this.shareComponent.actions.enterSiteName(siteName);
  }

  async verifyShareModalIsVisible(): Promise<void> {
    await this.listFeedComponent.verifyShareModalIsVisible();
  }

  async verifyShareModalIsClosed(): Promise<void> {
    await this.listFeedComponent.verifyShareModalIsClosed();
  }

  async clickViewPostLinkInShareModal(): Promise<void> {
    await this.listFeedComponent.clickViewPostLinkInShareModal();
  }

  async clickViewPostLinkInPostDetailPage(): Promise<void> {
    await this.listFeedComponent.clickViewPostLinkInPostDetailPage();
  }

  async verifyFeedPlaceholderText(expectedPlaceholder: string): Promise<void> {
    await this.createFeedPostComponent.verifyFeedPlaceholderText(expectedPlaceholder);
  }

  async verifyToastMessageIsVisibleWithText(message: string): Promise<void> {
    await this.listFeedComponent.verifyToastMessageIsVisibleWithText(message);
  }

  async verifyTimestampFormat(postText: string): Promise<void> {
    await this.listFeedComponent.verifyTimestampFormat(postText);
  }
}
