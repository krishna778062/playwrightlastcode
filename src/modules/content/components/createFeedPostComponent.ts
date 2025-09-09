import { faker } from '@faker-js/faker';
import { expect, Locator, Page, Response, test } from '@playwright/test';
import { addListener } from 'process';

import { BaseComponent } from '@core/components/baseComponent';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { FileUtil } from '@core/utils/fileUtil';

export interface FeedPostOptions {
  text: string;
  attachments?: {
    files: string[];
  };
}

export interface FeedPostResult {
  postText: string;
  attachmentCount: number;
  postId?: string;
}

export interface FeedPostApiResponse {
  apiName: string;
  status: string;
  message: string;
  result: {
    feedId: string;
  };
  responseTimeStamp: number;
  delay: number;
}

export interface ICreateFeedPostActions {
  createAndPost: (options: FeedPostOptions) => Promise<FeedPostResult>;
  editPost: (currentText: string, newText: string) => Promise<void>;
  editPostWithTopicAndUserName: (params: {
    currentText: string;
    newText: string;
    topicName: string;
    userName: string;
  }) => Promise<void>;
  clickShareThoughtsButton: () => Promise<void>;
  createPost: (text: string) => Promise<void>;
  uploadFiles: (files: string[]) => Promise<void>;
  removeAttachedFile: (index?: number) => Promise<void>;
  clickPostButton: () => Promise<void>;
  openPostOptionsMenu: (postText: string) => Promise<void>;
  clickEditOption: () => Promise<void>;
  updatePostText: (text: string) => Promise<void>;
  clickUpdateButton: () => Promise<void>;
}

export interface ICreateFeedPostAssertions {
  verifyEditorVisible: () => Promise<void>;
}

export class CreateFeedPostComponent
  extends BaseComponent
  implements ICreateFeedPostActions, ICreateFeedPostAssertions
{
  // Share thoughts section
  readonly shareThoughtsButton = this.page.getByRole('button', { name: 'Share your thoughts' });
  readonly feedEditor = this.page.locator("div[aria-describedby='content-description']");
  readonly fileUploadInput = this.page.locator("input[type='file']");
  readonly attachedFiles = this.page.locator("div[class='FileItem-name']");
  readonly deleteFileIcon = this.page.locator("button[class*='delete']");
  readonly postButton = this.page.locator("div[class*='PostFormShareContainer']").getByRole('button', { name: 'Post' });

  // Post editing section
  readonly editButton = this.page.getByText('Edit', { exact: true });
  readonly updateButton = this.page.getByRole('button', { name: 'Update' });

  // File upload section
  readonly fileItemNameSelector = "div[class='FileItem-name']";
  readonly deleteButtonSelector = "button[class*='delete']";

  // Dropdown selection - parameterized
  readonly getDropdownOption = (name: string) =>
    this.page.locator("div[class*='ListingItem-module__details'] div p").filter({ hasText: name });

  // Topic dropdown selection - parameterized
  readonly addtopicfromList = (topicName: string) =>
    this.page.locator("div[role='menuitem'] div p").filter({ hasText: topicName });

  // Dropdown selection - parameterized
  readonly addSiteNameFromList = (name: string) =>
    this.page.locator("div[class*='ListingItem-module__details'] p").filter({ hasText: name });

  // Dynamic locator functions
  /**
   * Gets a locator for the post text content
   * @param text - The text content to find
   * @returns Locator for the post text
   */
  readonly getFeedTextLocator = (text: string): Locator =>
    this.page.locator("div[class*='postContent']").getByText(text, { exact: true });

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

  constructor(page: Page) {
    super(page);
  }

  get actions(): ICreateFeedPostActions {
    return this;
  }

  get assertions(): ICreateFeedPostAssertions {
    return this;
  }

  /**
   * Verifies that the feed page is loaded by checking if share thoughts button is visible
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton);
  }

  /**
   * Creates and publishes a new feed post
   * @param options - Options for creating the post including text and attachments
   * @returns Result containing post text, attachment count and timestamp
   */
  async createAndPost(options: FeedPostOptions): Promise<FeedPostResult> {
    return await test.step(`Creating and publishing feed post with text: ${options.text}`, async () => {
      // Open editor
      await this.clickShareThoughtsButton();

      // Add post content
      await this.createPost(options.text);

      // Handle attachments if provided
      if (options.attachments) {
        await this.uploadFiles(options.attachments.files);
      }

      // Publish the page
      const postResponse = await this.createFeedPost();

      //json body
      const feedResponseBody = (await postResponse.json()) as FeedPostApiResponse;

      //fetch the page id from the response
      const postId = feedResponseBody.result.feedId;
      console.log('postId', postId);

      // Wait for post to appear
      // Note: Waiting is handled by list component to avoid duplication
      const attachmentCount = options.attachments ? options.attachments.files.length : 0;

      return {
        postText: options.text,
        attachmentCount,
        postId,
      };
    });
  }

  /**
   * Edits an existing post with new text
   * @param currentText - Current text of the post to edit
   * @param newText - New text to update the post with
   */
  async editPost(currentText: string, newText: string): Promise<void> {
    await test.step(`Editing post from "${currentText}" to "${newText}"`, async () => {
      await this.openPostOptionsMenu(currentText);
      await this.clickEditOption();
      await this.verifyEditorVisible();
      await this.updatePostText(newText);
      await this.clickUpdateButton();
      // Note: Post verification should be done at test/page level to avoid duplication
    });
  }

  /**
   * Edits an existing post with new text
   * @param currentText - Current text of the post to edit
   * @param newText - New text to update the post with
   */
  async editPostWithTopicAndUserName(params: {
    currentText: string;
    newText: string;
    topicName: string;
    userName: string;
  }): Promise<void> {
    const { currentText, newText, topicName, userName } = params;
    await test.step(`Editing post from "${currentText}" to "${newText}"`, async () => {
      const topicName2 = faker.company.name();
      await this.openPostOptionsMenu(currentText);
      await this.clickEditOption();
      await this.verifyEditorVisible();
      await this.updatePostText(newText);
      await this.addTopicMention(topicName);
      await this.addTopicMention(topicName2);
      await this.addUserNameMention(userName);
      await this.clickUpdateButton();
      // Note: Post verification should be done at test/page level to avoid duplication
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

  /**
   * Creates a new post with specified text
   * @param text - Text content for the post
   */
  async createPost(text: string): Promise<void> {
    await test.step('Create a post', async () => {
      await this.fillInElement(this.feedEditor, text);
    });
  }

  /**
   * Uploads files to the post
   * @param files - Array of file paths to upload
   */
  async uploadFiles(files: string[]): Promise<void> {
    await test.step('Upload files to feed post', async () => {
      // Setup request promises for upload requests
      const responsePromises = [];
      for (let i = 0; i < files.length; i++) {
        const responsePromise = this.page.waitForResponse(
          response =>
            response.request().url().includes('X-Amz-SignedHeaders=host') &&
            response.request().method() === 'PUT' &&
            response.status() === 200,
          { timeout: 35000 }
        );
        responsePromises.push(responsePromise);
      }
      const filePaths = files.map(file => FileUtil.getFilePath(__dirname, '..', 'test-data', 'static-files', file));
      await this.fileUploadInput.setInputFiles(filePaths);
      await this.page.waitForSelector(this.fileItemNameSelector, { state: 'visible', timeout: TIMEOUTS.VERY_LONG });
      await expect(this.attachedFiles).toHaveCount(files.length);

      // Wait for all upload requests to complete
      await Promise.all(responsePromises);
    });
  }

  /**
   * Removes an attached file from the post by index
   * @param index - Zero-based index of the file to remove (default: 0 for first file)
   */
  async removeAttachedFile(index: number = 0): Promise<void> {
    await test.step(`Remove attached file at index ${index}`, async () => {
      await this.page.waitForSelector(this.deleteButtonSelector, { state: 'visible', timeout: 30000 });

      // Verify at least one delete button is available
      await this.verifier.verifyCountOfElementsIsGreaterThan(this.deleteFileIcon, 0, {
        timeout: 30000,
        assertionMessage: 'No delete buttons found - expected at least one attached file',
      });

      const deleteButtons = await this.deleteFileIcon.all();
      if (index < 0 || index >= deleteButtons.length) {
        throw new Error(`Invalid index ${index}. Available files: 0-${deleteButtons.length - 1}`);
      }
      const initialCount = await this.attachedFiles.count();
      await this.clickOnElement(deleteButtons[index]);
      await this.verifier.verifyCountOfElementsIsEqualTo(this.attachedFiles, initialCount - 1, {
        timeout: 10000,
        assertionMessage: `Expected ${initialCount - 1} files after removing attachment at index ${index}, but count verification failed`,
      });
    });
  }

  /**
   * Clicks the post button to publish
   */
  async clickPostButton(): Promise<void> {
    await test.step('Click post button', async () => {
      await this.clickOnElement(this.postButton);
    });
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
   * Clicks the edit option in the options menu
   */
  async clickEditOption(): Promise<void> {
    await test.step('Click edit option', async () => {
      await this.clickOnElement(this.editButton);
    });
  }

  /**
   * Updates the post text in the editor
   * @param text - New text for the post
   */
  async updatePostText(text: string): Promise<void> {
    await test.step('Update post text', async () => {
      await this.feedEditor.clear();
      await this.fillInElement(this.feedEditor, text);
    });
  }

  /**
   * Clicks the update button to save changes
   */
  async clickUpdateButton(): Promise<void> {
    await test.step('Click update button', async () => {
      await this.clickOnElement(this.updateButton);
    });
  }

  /**
   * Verifies that the post editor is visible
   */
  async verifyEditorVisible(): Promise<void> {
    await test.step('Verify editor is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.feedEditor);
    });
  }

  /**
   * Adds a user or site mention to the post
   * @param userName - The user or site name to mention
   */
  async addUserNameMention(userName: string): Promise<void> {
    await test.step(`Adding user mention: @${userName}`, async () => {
      await this.typeInElement(this.feedEditor, ` @${userName}`);
      await this.getDropdownOption(userName).waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.getDropdownOption(userName));
    });
  }

  /**
   * Adds a user or site mention to the post
   * @param userName - The user or site name to mention
   */
  async addSiteName(userName: string): Promise<void> {
    await test.step(`Adding user mention: @${userName}`, async () => {
      await this.typeInElement(this.feedEditor, ` @${userName}`);
      await this.addSiteNameFromList(userName).waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.addSiteNameFromList(userName));
    });
  }

  /**
   * Adds a topic mention to the post
   * @param topicName - The topic name to mention
   */
  async addTopicMention(topicName: string): Promise<void> {
    await test.step(`Adding topic mention: #${topicName}`, async () => {
      await this.typeInElement(this.feedEditor, ` #${topicName}`);
      await this.clickOnElement(this.addtopicfromList(topicName));
    });
  }
  async createFeedPost(): Promise<Response> {
    return await test.step(`Creating feed post and wait for api response`, async () => {
      const postResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.postButton, { delay: 3_000 }),
        response =>
          response.url().includes(API_ENDPOINTS.feed.create) &&
          response.request().method() === 'POST' &&
          response.status() === 201,
        {
          timeout: 20_000,
        }
      );
      return postResponse;
    });
  }

  /**
   * Adds an embedded URL to the post
   * @param embedUrl - The URL to embed
   */
  async addEmbedUrl(embedUrl?: string): Promise<void> {
    if (embedUrl) {
      await test.step(`Adding embedded URL: ${embedUrl}`, async () => {
        await this.typeInElement(this.feedEditor, ` ${embedUrl}`);
      });
    }
  }

  /**
   * Creates and publishes a new feed post with user and topic mentions
   * @param title - The base text for the post
   * @param userName - The user name to mention
   * @param topicName - The topic name to mention
   * @returns Result containing post text, attachment count and post ID
   */
  async createfeedWithMentionUserNameAndTopic(params: {
    text: string;
    userName: string;
    topicName: string;
    siteName: string | string[];
    embedUrl: string;
  }): Promise<FeedPostResult> {
    const { text: title, userName, topicName, siteName, embedUrl } = params;
    return await test.step(`Creating feed post with user mention "${userName}" and topic mention "${topicName}"`, async () => {
      // Open editor
      await this.clickShareThoughtsButton();

      const topicName2 = faker.company.name();
      // Add post content
      await this.createPost(title);
      await this.addTopicMention(topicName);
      await this.addTopicMention(topicName2);
      await this.addUserNameMention(userName);
      for (const site of siteName) {
        await this.addSiteName(site);
      }
      await this.addEmbedUrl(embedUrl);

      // Publish the page
      const postResponse = await this.createFeedPost();

      //json body
      const feedResponseBody = (await postResponse.json()) as FeedPostApiResponse;
      const siteNamesText = Array.isArray(siteName) ? siteName.map(site => `@${site}`).join(' ') : `@${siteName}`;
      const postText = `${title} #${topicName} #${topicName2} @${userName} ${siteNamesText}`;
      //fetch the page id from the response
      const postId = feedResponseBody.result.feedId;
      console.log('postText :   ', postText);

      return {
        postText: postText,
        attachmentCount: 0,
        postId,
      };
    });
  }
}
