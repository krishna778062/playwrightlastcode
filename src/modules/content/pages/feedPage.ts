import { BasePage } from '@core/pages/basePage';
import { Page } from '@playwright/test';
import { CreateFeedPostComponent, FeedPostOptions, FeedPostResult } from '../components/createFeedPostComponent';
import { ListFeedComponent } from '../components/listFeedComponent';

// Re-export the interfaces and types for backwards compatibility
export { FeedPostOptions, FeedPostResult };

export interface IFeedActions {
  createAndPublishPost: (options: FeedPostOptions) => Promise<FeedPostResult>;
  editPost: (currentText: string, newText: string) => Promise<void>;
  clickShareThoughtsButton: () => Promise<void>;
  createPost: (text: string) => Promise<void>;
  uploadFiles: (files: string[]) => Promise<void>;
  removeAttachedFile: () => Promise<void>;
  clickPostButton: () => Promise<void>;
  openPostOptionsMenu: (postText: string) => Promise<void>;
  clickEditOption: () => Promise<void>;
  updatePostText: (text: string) => Promise<void>;
  clickUpdateButton: () => Promise<void>;
  deletePost: (postText: string) => Promise<void>;
  clickDeleteOption: () => Promise<void>;
  confirmDelete: () => Promise<void>;
  clickInlineImagePreview: (postText: string) => Promise<void>;
  closeImagePreview: () => Promise<void>;
  verifyInlineImagePerview: (postText: string) => Promise<void>;
  getAllVisiblePosts: () => Promise<string[]>;
  verifyPostExists: (postText: string) => Promise<boolean>;
  getPostCount: () => Promise<number>;
  scrollToLoadMorePosts: () => Promise<void>;
}

export interface IFeedAssertions {
  verifyPostCreated: (expectedText: string) => Promise<void>;
  verifyEditorVisible: () => Promise<void>;
  verifyTimestampDisplayed: (postText: string) => Promise<void>;
  verifyFileAttachmentsCount: (postText: string, expectedCount: number) => Promise<void>;
  verifyDeleteConfirmDialog: (expectedText: string) => Promise<void>;
  verifyPostDeleted: () => Promise<void>;
  verifyInlineImagePreviewVisible: () => Promise<void>;
  verifyInlineImagePerview: (postText: string) => Promise<void>;
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

  // Delegate CreateFeedPostComponent methods
  async createAndPublishPost(options: FeedPostOptions): Promise<FeedPostResult> {
    return await this.createFeedPostComponent.createAndPublishPost(options);
  }

  async editPost(currentText: string, newText: string): Promise<void> {
    await this.createFeedPostComponent.editPost(currentText, newText);
  }

  async clickShareThoughtsButton(): Promise<void> {
    await this.createFeedPostComponent.clickShareThoughtsButton();
  }

  async createPost(text: string): Promise<void> {
    await this.createFeedPostComponent.createPost(text);
  }

  async uploadFiles(files: string[]): Promise<void> {
    await this.createFeedPostComponent.uploadFiles(files);
  }

  async removeAttachedFile(): Promise<void> {
    await this.createFeedPostComponent.removeAttachedFile();
  }

  async clickPostButton(): Promise<void> {
    await this.createFeedPostComponent.clickPostButton();
  }

  async clickEditOption(): Promise<void> {
    await this.createFeedPostComponent.clickEditOption();
  }

  async updatePostText(text: string): Promise<void> {
    await this.createFeedPostComponent.updatePostText(text);
  }

  async clickUpdateButton(): Promise<void> {
    await this.createFeedPostComponent.clickUpdateButton();
  }

  async verifyEditorVisible(): Promise<void> {
    await this.createFeedPostComponent.verifyEditorVisible();
  }

  // Delegate ListFeedComponent methods
  async deletePost(postText: string): Promise<void> {
    await this.listFeedComponent.deletePost(postText);
  }

  async clickDeleteOption(): Promise<void> {
    await this.listFeedComponent.clickDeleteOption();
  }

  async confirmDelete(): Promise<void> {
    await this.listFeedComponent.confirmDelete();
  }

  async clickInlineImagePreview(postText: string): Promise<void> {
    await this.listFeedComponent.clickInlineImagePreview(postText);
  }

  async closeImagePreview(): Promise<void> {
    await this.listFeedComponent.closeImagePreview();
  }

  async verifyInlineImagePerview(postText: string): Promise<void> {
    await this.listFeedComponent.verifyInlineImagePerview(postText);
  }

  async verifyTimestampDisplayed(postText: string): Promise<void> {
    await this.listFeedComponent.verifyTimestampDisplayed(postText);
  }

  async verifyFileAttachmentsCount(postText: string, expectedCount: number): Promise<void> {
    await this.listFeedComponent.verifyFileAttachmentsCount(postText, expectedCount);
  }

  async verifyDeleteConfirmDialog(expectedText: string): Promise<void> {
    await this.listFeedComponent.verifyDeleteConfirmDialog(expectedText);
  }

  async verifyPostDeleted(): Promise<void> {
    await this.listFeedComponent.verifyPostDeleted();
  }

  async verifyInlineImagePreviewVisible(): Promise<void> {
    await this.listFeedComponent.verifyInlineImagePreviewVisible();
  }

  async getAllVisiblePosts(): Promise<string[]> {
    return await this.listFeedComponent.getAllVisiblePosts();
  }

  async verifyPostExists(postText: string): Promise<boolean> {
    return await this.listFeedComponent.verifyPostExists(postText);
  }

  async getPostCount(): Promise<number> {
    return await this.listFeedComponent.getPostCount();
  }

  async scrollToLoadMorePosts(): Promise<void> {
    await this.listFeedComponent.scrollToLoadMorePosts();
  }

  // Shared methods - delegate to createFeedPostComponent (could be either, but createFeedPostComponent has them)
  async openPostOptionsMenu(postText: string): Promise<void> {
    await this.createFeedPostComponent.openPostOptionsMenu(postText);
  }

  async verifyPostCreated(expectedText: string): Promise<void> {
    await this.createFeedPostComponent.verifyPostCreated(expectedText);
  }
} 