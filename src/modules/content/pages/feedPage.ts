import { BasePage } from '@core/pages/basePage';
import { Page } from '@playwright/test';
import { CreateFeedPostComponent, FeedPostOptions, FeedPostResult } from '../components/createFeedPostComponent';
import { ListFeedComponent } from '../components/listFeedComponent';

// Re-export the interfaces and types for backwards compatibility
export { FeedPostOptions, FeedPostResult };

export interface IFeedActions {
  // High-level user flows
  createAndPublishPost: (options: FeedPostOptions) => Promise<FeedPostResult>;
  editPost: (currentText: string, newText: string) => Promise<void>;
  deletePost: (postText: string) => Promise<void>;
  
  // Content creation flow
  createPostWithAttachments: (text: string, files?: string[], removeCount?: number) => Promise<FeedPostResult>;
}

export interface IFeedAssertions {
  // High-level verification flows
  verifyPostDetails: (postText: string, expectedAttachmentCount: number) => Promise<void>;
  verifyPostCreationFlow: (expectedText: string) => Promise<void>;
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
  async createAndPublishPost(options: FeedPostOptions): Promise<FeedPostResult> {
    return await this.createFeedPostComponent.createAndPublishPost(options);
  }

  async editPost(currentText: string, newText: string): Promise<void> {
    await this.createFeedPostComponent.editPost(currentText, newText);
  }

  async deletePost(postText: string): Promise<void> {
    await this.listFeedComponent.deletePost(postText);
  }

  async createPostWithAttachments(text: string, files?: string[], removeCount?: number): Promise<FeedPostResult> {
    const options: FeedPostOptions = {
      text,
      ...(files && { attachments: { files, removeCount } })
    };
    return await this.createAndPublishPost(options);
  }

  // High-level verification methods
  async verifyPostDetails(postText: string, expectedAttachmentCount: number): Promise<void> {
    await this.listFeedComponent.verifyPostDetails(postText, expectedAttachmentCount);
  }

  async verifyPostCreationFlow(expectedText: string): Promise<void> {
    await this.createFeedPostComponent.verifyPostCreated(expectedText);
  }

  /**
   * Gets the timestamp for a specific post
   * @param postText - The text of the post to find timestamp for
   */
  async getPostTimestamp(postText: string): Promise<void> {
    await this.listFeedComponent.getPostTimestamp(postText);
  }
  
} 