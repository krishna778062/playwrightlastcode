import { expect, Page, test } from '@playwright/test';

import { CreateFeedPostComponent, FeedPostOptions, FeedPostResult } from '@content/components/createFeedPostComponent';
import { ListFeedComponent } from '@content/components/listFeedComponent';
import { BasePage } from '@core/pages/basePage';

// Re-export the interfaces and types for backwards compatibility
export { FeedPostOptions, FeedPostResult };

export interface IFeedActions {
  // High-level user flows
  createAndPost: (options: FeedPostOptions) => Promise<FeedPostResult>;
  editPost: (currentText: string, newText: string) => Promise<void>;
  deletePost: (postText: string) => Promise<void>;
  favoriteUnfavoritePost: (favorite: boolean) => Promise<void>;
  // Content creation flow
  createPostWithAttachments: (text: string, files?: string[]) => Promise<FeedPostResult>;
  createfeedWithMentionUserNameAndTopic: (text: string, userName: string, topicName: string) => Promise<FeedPostResult>;
  markPostAsFavourite: () => Promise<void>;
  removePostFromFavourite: (postText: string) => Promise<void>;
}

export interface IFeedAssertions {
  // High-level verification flows
  verifyPostDetails: (postText: string, expectedAttachmentCount: number) => Promise<void>;
  waitForPostToBeVisible: (expectedText: string) => Promise<void>;
  verifyPostIsFavoritedUnfavorited: (favorite: boolean) => Promise<void>;
  verifyPostIsNotFavorited: (postText: string) => Promise<void>;
  verifyPostIsFavorited: (postText: string) => Promise<void>;
}

export class FeedPage extends BasePage implements IFeedActions, IFeedAssertions {
  private createFeedPostComponent: CreateFeedPostComponent;
  private listFeedComponent: ListFeedComponent;

  constructor(page: Page) {
    super(page);
    this.createFeedPostComponent = new CreateFeedPostComponent(page);
    this.listFeedComponent = new ListFeedComponent(page);
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
  async createfeedWithMentionUserNameAndTopic(
    text: string,
    userName: string,
    topicName: string
  ): Promise<FeedPostResult> {
    return await test.step(`Creating feed post with user mention "${userName}" and topic mention "${topicName}"`, async () => {
      // Format the text with mentions
      const textWithMentions = `${text} @${userName} #${topicName}`;

      const options: FeedPostOptions = {
        text: textWithMentions,
      };

      return await this.createAndPost(options);
    });
  }

  async favoriteUnfavoritePost(favorite: boolean): Promise<void> {
    await test.step(`Favoriting post with text ${favorite}`, async () => {
      await this.listFeedComponent.clickFavoriteUnfavoriteButton(favorite);
    });
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

  async verifyPostIsFavoritedUnfavorited(favorite: boolean): Promise<void> {
    await test.step(`Verify post is favorited: ${favorite}`, async () => {
      await this.listFeedComponent.verifyPostIsFavoritedUnfavorited(favorite);
    });
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
}
