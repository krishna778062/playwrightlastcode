import { expect, Page, test } from '@playwright/test';

import { CreateFeedPostComponent, FeedPostOptions, FeedPostResult } from '@content/components/createFeedPostComponent';
import { FilePreviewComponent } from '@content/components/filePreviewComponent';
import { ListFeedComponent } from '@content/components/listFeedComponent';
import { BasePage } from '@core/pages/basePage';

// Re-export the interfaces and types for backwards compatibility
export { FeedPostOptions, FeedPostResult };

export interface IFeedActions {
  // High-level user flows
  createAndPost: (options: FeedPostOptions) => Promise<FeedPostResult>;
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
  clickInfoIcon: () => Promise<void>;
  verifyPreviewModalIsOpened: () => Promise<void>;
  clickDeleteButton: () => Promise<void>;
  clickShowMoreButton: () => Promise<void>;
}

export interface IFeedAssertions {
  // High-level verification flows
  verifyPostDetails: (postText: string, expectedAttachmentCount: number) => Promise<void>;
  waitForPostToBeVisible: (expectedText: string) => Promise<void>;
  verifyPostIsNotFavorited: (postText: string) => Promise<void>;
  verifyPostIsFavorited: (postText: string) => Promise<void>;
  validatePostText: (postText: string) => Promise<void>;
  verifyImageButtonIsNotVisible: () => Promise<void>;
}

export class FeedPage extends BasePage implements IFeedActions, IFeedAssertions {
  private createFeedPostComponent: CreateFeedPostComponent;
  private listFeedComponent: ListFeedComponent;
  private filePreviewComponent: FilePreviewComponent;

  constructor(page: Page) {
    super(page);
    this.createFeedPostComponent = new CreateFeedPostComponent(page);
    this.listFeedComponent = new ListFeedComponent(page);
    this.filePreviewComponent = new FilePreviewComponent(page);
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
    await this.createFeedPostComponent.verifyThePageIsLoaded();
  }

  // High-level user flow methods
  async createAndPost(options: FeedPostOptions): Promise<FeedPostResult> {
    return await this.createFeedPostComponent.createAndPost(options);
  }

  async editPost(currentText: string, newText: string): Promise<void> {
    await this.createFeedPostComponent.editPost(currentText, newText);
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
  async clickInfoIcon(): Promise<void> {
    await this.listFeedComponent.clickInfoIcon();
  }

  async verifyPreviewModalIsOpened(): Promise<void> {
    await this.filePreviewComponent.verifyPreviewModalIsOpened();
  }

  async clickDeleteButton(): Promise<void> {
    await this.filePreviewComponent.clickDeleteButton();
  }

  async verifyImageButtonIsNotVisible(): Promise<void> {
    await this.listFeedComponent.verifyImageButtonIsNotVisible();
  }

  async clickShowMoreButton(): Promise<void> {
    await this.filePreviewComponent.clickShowMoreButton();
  }
}
