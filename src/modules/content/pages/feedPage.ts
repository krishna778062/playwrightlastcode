import { BasePage } from '@core/pages/basePage';
import { Locator, Page } from '@playwright/test';
import { FeedActionHelper } from '../helpers/feedActionHelper';
import { FeedAssertionHelper } from '../helpers/feedAssertionHelper';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

export class FeedPage extends BasePage<FeedActionHelper, FeedAssertionHelper> {
  // Share thoughts section
  readonly shareThoughtsButton: Locator;
  readonly feedEditor: Locator;
  readonly fileUploadInput: Locator;
  readonly attachedFiles: Locator;
  readonly deleteFileIcon: Locator;
  readonly postButton: Locator;

  // Feed content section
  readonly feedPosts: Locator;
  readonly inlineImagePreview: Locator;

  // Post options section
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly updateButton: Locator;
  readonly deleteConfirmDialog: Locator;
  readonly deleteConfirmButton: Locator;
  readonly closeButton: Locator;

  // Dynamic locator functions
  readonly getFeedTextLocator: (text: string) => Locator;
  readonly getPostTimestampLocator: (postText: string) => Locator;
  readonly getPostAttachmentsLocator: (postText: string) => Locator;
  readonly getLightboxButtonLocator: (postText: string) => Locator;
  readonly getPostOptionsMenuLocator: (postText: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FEED_PAGE);

    // Initialize share thoughts section locators
    this.shareThoughtsButton = page.getByRole('button', { name: 'Share your thoughts' });
    this.feedEditor = page.locator("div[aria-describedby='content-description']");
    this.fileUploadInput = page.locator("input[type='file']");
    this.attachedFiles = page.locator("div[class='FileItem-name']");
    this.deleteFileIcon = page.locator("button[class*='delete']");
    this.postButton = page.locator("div[class*='PostFormShareContainer'] button:text('Post')");

    // Initialize feed content section locators
    this.feedPosts = page.locator('.feed-post');
    this.inlineImagePreview = page.locator("div[class*='gallerySlide'] img");

    // Initialize post options section locators
    this.editButton = page.locator("div:text('Edit')");
    this.deleteButton = page.locator("div:text('Delete')");
    this.updateButton = page.getByRole('button', { name: 'Update' });
    this.deleteConfirmDialog = page.locator('div[role="dialog"]');
    this.deleteConfirmButton = page.getByRole('button', { name: 'Delete' });
    this.closeButton = page.locator("button[class*='closeBtn']");

    // Initialize dynamic locator functions
    this.getFeedTextLocator = (text: string) => 
      page.locator(`div[class*='postContent'] p:text("${text}")`);

    this.getPostTimestampLocator = (postText: string) => 
      page.locator("p")
        .filter({ hasText: postText })
        .locator("xpath=./ancestor::div[4]")
        .locator("div[class*='headerInne'] p a");

    this.getPostAttachmentsLocator = (postText: string) => 
      page.locator(`div[class*='postContent']`).filter({ hasText: postText })
        .locator('li');

    this.getLightboxButtonLocator = (postText: string) =>
      page.locator("p")
        .filter({ hasText: postText })
        .locator("xpath=./ancestor::div[3]")
        .locator("button[aria-label='Open image in lightbox']");

    this.getPostOptionsMenuLocator = (postText: string) =>
      page.locator("p")
        .filter({ hasText: postText })
        .locator("xpath=./ancestor::div[4]")
        .locator("button[class*='optionlauncher']");
  }

  override get actions(): FeedActionHelper {
    return new FeedActionHelper(this);
  }

  override get assertions(): FeedAssertionHelper {
    return new FeedAssertionHelper(this);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton);
  }

  async verifyInlineImagePerview(postText: string): Promise<void> {
    await this.actions.clickInlineImagePreview(postText);
    await this.assertions.verifyInlineImagePreviewVisible();
    await this.actions.closeImagePreview();
  }
} 