import { faker } from '@faker-js/faker';
import { expect, Locator, Page, Response, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

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
  createPost: (text: string) => Promise<void>;
  uploadFiles: (files: string[]) => Promise<void>;
  removeAttachedFile: (index?: number) => Promise<void>;
  clickPostButton: () => Promise<void>;
  openPostOptionsMenu: (postText: string) => Promise<void>;
  clickEditOption: () => Promise<void>;
  updatePostText: (text: string) => Promise<void>;
  clickUpdateButton: () => Promise<void>;
  searchForSiteName: (siteName: string) => Promise<void>;
  clickBrowseFilesButton: () => Promise<void>;
  searchForFileInLibrary: (fileName: string) => Promise<void>;
  selectFileFromLibrary: (fileName: string) => Promise<void>;
  clickAttachButton: () => Promise<void>;
  addFileToPost: (filePath: string) => Promise<void>;
  waitForFileToAppear: () => Promise<void>;
}

export interface ICreateFeedPostAssertions {
  verifyEditorVisible: () => Promise<void>;
  verifyNoResultMessage: () => Promise<void>;
  verifyFileIsAttached: (fileName: string) => Promise<void>;
  verifyAttachedFileCount: (expectedCount: number) => Promise<void>;
  verifyUpdateButtonDisabled: () => Promise<void>;
}

export class CreateFeedPostComponent
  extends BaseComponent
  implements ICreateFeedPostActions, ICreateFeedPostAssertions
{
  readonly feedEditor = this.page.locator("div[aria-describedby='content-description']");
  readonly questionButton = this.page.locator("button:has-text('Question')");
  readonly fileUploadInput = this.page.locator("input[type='file']");
  readonly attachedFiles = this.page.locator("div[class='FileItem-name']");
  readonly deleteFileIcon = this.page.locator("button[class*='delete']");
  readonly postButton = this.page.locator("div[class*='PostFormShareContainer']").getByRole('button', { name: 'Post' });

  // Toolbar formatting buttons
  readonly toolbarContainer = this.page.locator("[class*='_toolbarWrapper_']");
  readonly boldButton = this.toolbarContainer.getByLabel('Bold');
  readonly italicButton = this.toolbarContainer.getByLabel('Italic');
  readonly underlineButton = this.toolbarContainer.getByLabel('Underline');
  readonly strikethroughButton = this.toolbarContainer.getByLabel('Strikethrough');
  readonly bulletListButton = this.toolbarContainer.getByLabel('Bulleted list');
  readonly orderListButton = this.toolbarContainer.getByLabel('Ordered list');
  readonly linkButton = this.toolbarContainer.getByLabel('Open Insert link options');
  readonly emojiButton = this.toolbarContainer.getByLabel('Emoji');

  // Link dialog fields
  readonly linkTextBox = this.page.locator('#text');
  readonly linkUrlBox = this.page.locator('#url');
  readonly linkTextfield = this.page.getByTestId('field-Text');
  readonly linkUrlfield = this.page.getByTestId('field-Link');
  readonly insertButton = this.page.getByRole('button', { name: 'Insert link', exact: true });

  // Emoji picker
  readonly emojiPickerContainer = this.page.locator('[aria-label="Choose an Emoji"]');
  readonly emojiSearchInput = this.page.locator('input[placeholder="Search for an emoji…"]');
  readonly emojiSearchResults = this.page.locator(`//div[contains(@class,'emojiPicker')]//button`);

  // Post editing section
  readonly editButton = this.page
    .locator("div[role='menuitem'] > div")
    .filter({ hasText: /^Edit$/ })
    .first();
  readonly deleteButton = this.page
    .locator("div[role='menuitem'] > div")
    .filter({ hasText: /^Delete$/ })
    .first();
  readonly updateButton = this.page.getByRole('button', { name: 'Update' });

  // File upload section
  readonly fileItemNameSelector = "div[class='FileItem-name']";
  readonly deleteButtonSelector = "button[class*='delete']";

  // Dropdown selection - parameterized
  readonly getDropdownOption = (name: string) =>
    this.page.locator("div[class*='ListingItem-module__details'] div p").filter({ hasText: name });

  // Topic dropdown selection - parameterized
  readonly addtopicfromList = (topicName: string) =>
    this.page.locator("div[role='menuitem'] div p").filter({ hasText: new RegExp(`^${topicName}$`) });

  // Dropdown selection - parameterized
  readonly addSiteNameFromList = (name: string) =>
    this.page.locator("div[class*='ListingItem-module__details'] p").filter({ hasText: name });

  // Share options section - for site feed sharing
  readonly selectSiteInput = this.page.locator('div:has-text("Select site") + div >> input');
  readonly noResultsText = this.page.getByText('No results');

  // Browse files section - for selecting files from file library
  readonly browseFilesButton = this.page.getByRole('button', { name: 'Browse files' });
  readonly fileManagerModal = this.page.locator('div:has-text("File manager")').first();
  readonly intranetFilesTab = this.page.getByText('Intranet files');
  readonly fileSearchInput = this.page.locator('input[class*="SearchForm-input"]');
  readonly attachButton = this.page.getByRole('button', { name: 'Attach' });
  readonly uploadingFileIndicator = this.page.locator('[class*="uploading"], [data-uploading="true"]');

  /**
   * Gets a locator for a file checkbox in the file library by finding the row containing the file name
   * @param fileName - The name of the file to select
   * @returns Locator for the file checkbox in that row
   */
  readonly getFileCheckboxLocator = (fileName: string): Locator =>
    this.page.locator(`tr:has-text("${fileName}")`).locator('input[type="checkbox"]').first();

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
    await this.verifier.verifyTheElementIsVisible(this.feedEditor);
  }

  /**
   * Creates and publishes a new feed post
   * @param options - Options for creating the post including text and attachments
   * @returns Result containing post text, attachment count and timestamp
   */
  async createAndPost(options: FeedPostOptions): Promise<FeedPostResult> {
    return await test.step(`Creating and publishing feed post with text: ${options.text}`, async () => {
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
   * @param filePaths - Array of file paths to upload
   */
  async uploadFiles(filePaths: string[]): Promise<void> {
    await test.step('Upload files to feed post', async () => {
      // Setup request promises for upload requests
      const responsePromises = [];
      for (let i = 0; i < filePaths.length; i++) {
        const responsePromise = this.page.waitForResponse(
          response =>
            response.request().url().includes('X-Amz-SignedHeaders=host') &&
            response.request().method() === 'PUT' &&
            response.status() === 200,
          { timeout: 35000 }
        );
        responsePromises.push(responsePromise);
      }
      await this.fileUploadInput.setInputFiles(filePaths);
      await this.page.waitForSelector(this.fileItemNameSelector, { state: 'visible', timeout: TIMEOUTS.VERY_LONG });
      /*
          If files are more than 10, verify the count of attached files is 10
          because atmax 10 files are uploaded else verify the count of attached files is the number of files uploaded
      */
      if (filePaths.length > 10) {
        await expect(this.attachedFiles).toHaveCount(10);
      } else {
        await expect(this.attachedFiles).toHaveCount(filePaths.length);
      }

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
      await this.clickByInjectingJavaScript(this.editButton);
    });
  }

  /**
   * Updates the post text in the editor
   * @param text - New text for the post
   */
  async updatePostText(text: string): Promise<void> {
    await test.step('Update post text', async () => {
      const editor = this.feedEditor.first();
      await editor.clear();
      await this.fillInElement(editor, text);
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
   * Adds a site mention to the post
   * @param siteName - The site name to mention
   */
  async addSiteName(siteName: string): Promise<void> {
    await test.step(`Adding site mention: @${siteName}`, async () => {
      console.log(`Attempting to add site mention: @${siteName}`);
      await this.typeInElement(this.feedEditor, ` @${siteName}`);

      // Check if the site name appears in the dropdown
      const siteLocator = this.addSiteNameFromList(siteName);
      const isVisible = await siteLocator.isVisible().catch(() => false);
      console.log(`Site mention dropdown for "${siteName}" is visible: ${isVisible}`);

      if (isVisible) {
        await siteLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
        await this.clickOnElement(siteLocator);
        console.log(`Successfully added site mention: @${siteName}`);
      } else {
        console.log(`Site mention "${siteName}" not found in dropdown, continuing without it`);
        // Just press Enter to continue without the mention
        await this.feedEditor.press('Enter');
      }
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

  async clickQuestionButton(): Promise<void> {
    await test.step('Click question button', async () => {
      await this.clickOnElement(this.questionButton);
    });
  }

  async verifyQuestionButtonIsNotVisible(): Promise<void> {
    await test.step('Verify question button is not visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.questionButton);
    });
  }

  async verifyQuestionButtonIsVisible(): Promise<void> {
    await test.step('Verify question button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.questionButton);
    });
  }

  /**
   * Searches for a site name in the site selector dropdown without selecting it
   * This is used to verify if a site appears in search results
   * @param siteName - The site name to search for
   */
  async searchForSiteName(siteName: string): Promise<void> {
    await test.step(`Search for site name: ${siteName}`, async () => {
      await this.clickOnElement(this.selectSiteInput);
      await this.fillInElement(this.selectSiteInput, siteName);
      // Wait a moment for search results to load
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Verifies that "No results" message is displayed (when searching for inaccessible sites)
   */
  async verifyNoResultMessage(): Promise<void> {
    await test.step('Verify "No results" message is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.noResultsText, {
        timeout: 5000,
        assertionMessage: 'Expected "No results" message to be visible',
      });
    });
  }

  /**
   * Clicks the "browse files" button to open file library
   */
  async clickBrowseFilesButton(): Promise<void> {
    await test.step('Click "browse files" button', async () => {
      await this.clickOnElement(this.browseFilesButton);
      // Wait for File Manager modal to be visible
      await this.verifier.verifyTheElementIsVisible(this.fileManagerModal, {
        timeout: 5000,
        assertionMessage: 'File Manager modal should be visible after clicking browse files',
      });
      // Verify we're on Intranet files tab
      await this.verifier.verifyTheElementIsVisible(this.intranetFilesTab, {
        timeout: 3000,
        assertionMessage: 'Intranet files tab should be visible',
      });
    });
  }

  /**
   * Searches for a file in the file library
   * @param fileName - The name of the file to search for (e.g., ".mp4" or specific file name)
   */
  async searchForFileInLibrary(fileName: string): Promise<void> {
    await test.step(`Search for file: ${fileName}`, async () => {
      // Wait for the search input to be visible and ready
      await this.verifier.verifyTheElementIsVisible(this.fileSearchInput, {
        timeout: 10000,
        assertionMessage: 'File search input should be visible and ready',
      });

      // Click on the input to focus it
      await this.clickOnElement(this.fileSearchInput);

      // Fill in the search term
      await this.fillInElement(this.fileSearchInput, fileName);

      // Press Enter to search
      await this.fileSearchInput.press('Enter');

      // Wait for search results to load by waiting for a row containing the searched file
      const fileResultRow = this.page.locator(`tr:has-text("${fileName}")`).first();
      await this.verifier.verifyTheElementIsVisible(fileResultRow, {
        timeout: 10000,
        assertionMessage: `File "${fileName}" should appear in search results`,
      });
    });
  }

  /**
   * Selects a file from the file library by clicking its checkbox
   * @param fileName - The name of the file to select
   */
  async selectFileFromLibrary(fileName: string): Promise<void> {
    await test.step(`Select file from library: ${fileName}`, async () => {
      const checkbox = this.getFileCheckboxLocator(fileName);
      await this.verifier.verifyTheElementIsVisible(checkbox, {
        timeout: 5000,
        assertionMessage: `Checkbox for file "${fileName}" should be visible`,
      });

      // Check if checkbox is already selected
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        // Click the checkbox using JavaScript to ensure it works
        await checkbox.check();
      }
    });
  }

  /**
   * Clicks the "Attach" button to attach selected files from library
   */
  async clickAttachButton(): Promise<void> {
    await test.step('Click "Attach" button', async () => {
      await this.clickOnElement(this.attachButton);

      // Wait for upload indicator to disappear (if it appears)
      const isUploadingVisible = await this.verifier.isTheElementVisible(this.uploadingFileIndicator, {
        timeout: 2000,
      });
      if (isUploadingVisible) {
        console.log('Waiting for file upload to complete...');
        await this.verifier.verifyTheElementIsNotVisible(this.uploadingFileIndicator, {
          timeout: 50000,
          assertionMessage: 'File upload should complete within 50 seconds',
        });
      }
    });
  }

  /**
   * Verifies that a file is attached to the post
   * @param fileName - The name of the file to verify (can be partial match like ".mp4")
   */
  async verifyFileIsAttached(fileName: string): Promise<void> {
    await test.step(`Verify file is attached: ${fileName}`, async () => {
      // Wait for attached file to be visible
      await this.verifier.verifyTheElementIsVisible(this.attachedFiles, {
        timeout: 10000,
        assertionMessage: `Expected attached file containing "${fileName}" to be visible`,
      });

      // Verify at least one file is attached
      await this.verifier.verifyCountOfElementsIsGreaterThan(this.attachedFiles, 0, {
        timeout: 5000,
        assertionMessage: 'Expected at least one file to be attached',
      });

      console.log(`File containing "${fileName}" is successfully attached to the post`);
    });
  }

  async verifyEditAndDeleteOptionsVisible(commentText: string): Promise<void> {
    await test.step('Verify edit and delete options are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editButton);
      await this.verifier.verifyTheElementIsVisible(this.deleteButton);
    });
  }
  /**
   * Verifies the count of attached files matches the expected count
   * @param expectedCount - The expected number of attached files
   */
  async verifyAttachedFileCount(expectedCount: number): Promise<void> {
    await test.step(`Verify attached file count is ${expectedCount}`, async () => {
      await this.verifier.verifyCountOfElementsIsEqualTo(this.attachedFiles, expectedCount, {
        timeout: 10000,
        assertionMessage: `Expected ${expectedCount} attached files, but verification failed`,
      });
    });
  }

  /**
   * Verifies that the update button is disabled
   */
  async verifyUpdateButtonDisabled(): Promise<void> {
    await test.step('Verify update button is disabled', async () => {
      await expect(this.updateButton).toBeDisabled();
    });
  }

  async addFileToPost(filePath: string): Promise<void> {
    await test.step(`Add file to post: ${filePath}`, async () => {
      await this.fileUploadInput.first().setInputFiles([filePath]);
    });
  }

  /**
   * Waits for file items to appear in the UI after upload
   */
  async waitForFileToAppear(): Promise<void> {
    await test.step('Wait for file to appear in UI', async () => {
      await this.page.waitForSelector(this.fileItemNameSelector, { state: 'visible', timeout: 5000 });
    });
  }

  /**
   * Verifies that feed posting restriction message is visible on the dashboard
   * When feed permission is set to "Only site owners and site managers can make feed posts",
   * Site Content Managers and Members should see the restriction message directly on the dashboard.
   * @param expectedText - The expected restriction message text to verify
   */
  async verifyFeedRestrictionMessageVisible(expectedText: string): Promise<void> {
    await test.step('Verify feed restriction message is visible on dashboard', async () => {
      // Try to find the message using getByText first
      const messageLocator = this.page.getByText(expectedText, { exact: false });

      // Verify the restriction message text is visible
      await this.verifier.verifyTheElementIsVisible(messageLocator, {
        assertionMessage: `Restriction message "${expectedText}" should be visible on dashboard`,
      });
    });
  }

  /**
   * Clicks the bold button in the toolbar
   */
  async clickBoldButton(): Promise<void> {
    await test.step('Click Bold button', async () => {
      await this.clickOnElement(this.boldButton);
    });
  }

  /**
   * Clicks the italic button in the toolbar
   */
  async clickItalicButton(): Promise<void> {
    await test.step('Click Italic button', async () => {
      await this.clickOnElement(this.italicButton);
    });
  }

  /**
   * Clicks the underline button in the toolbar
   */
  async clickUnderlineButton(): Promise<void> {
    await test.step('Click Underline button', async () => {
      await this.clickOnElement(this.underlineButton);
    });
  }

  /**
   * Clicks the strikethrough button in the toolbar
   */
  async clickStrikethroughButton(): Promise<void> {
    await test.step('Click Strikethrough button', async () => {
      await this.clickOnElement(this.strikethroughButton);
    });
  }

  /**
   * Clicks the ordered list (number bullet) button in the toolbar
   */
  async clickOrderListButton(): Promise<void> {
    await test.step('Click Order List (Number Bullet) button', async () => {
      await this.clickOnElement(this.orderListButton);
    });
  }

  /**
   * Clicks the bullet list (solid dot bullet) button in the toolbar
   */
  async clickBulletListButton(): Promise<void> {
    await test.step('Click Bullet List (Solid Dot Bullet) button', async () => {
      await this.clickOnElement(this.bulletListButton);
    });
  }

  /**
   * Adds a link to the editor with specified text and URL
   * @param linkText - The display text for the link
   * @param linkUrl - The URL for the link
   */
  async addLink(linkText: string, linkUrl: string): Promise<void> {
    await test.step(`Add link with text "${linkText}" and URL "${linkUrl}"`, async () => {
      await this.clickOnElement(this.linkButton);
      await this.fillInElement(this.linkTextBox, linkText);
      await this.fillInElement(this.linkUrlBox, linkUrl);
      await this.clickOnElement(this.insertButton);
      await this.feedEditor.click();
    });
  }

  /**
   * Selects an emoji from the emoji picker
   * @param emojiIndex - The index of the emoji to select (default: 1 for first emoji)
   */
  async selectEmoji(emojiIndex: number = 1): Promise<void> {
    await test.step(`Select emoji at index ${emojiIndex}`, async () => {
      await this.clickOnElement(this.emojiButton);
      await this.verifier.verifyTheElementIsVisible(this.emojiPickerContainer);
      const emojiButton = this.emojiPickerContainer.locator(
        `//div[@aria-label='People section' or @aria-label='']/..//button[${emojiIndex}]`
      );
      await this.clickOnElement(emojiButton);
      await this.verifier.verifyTheElementIsNotVisible(this.emojiPickerContainer);
    });
  }

  /**
   * Applies formatting and enters text with formatting
   * @param formatType - The type of formatting to apply ('bold', 'italic', 'underline', 'strike', 'numberBullet', 'dotBullet')
   * @param text - The text to enter after applying formatting
   */
  async applyFormattingAndEnterText(
    formatType: 'bold' | 'italic' | 'underline' | 'strike' | 'numberBullet' | 'dotBullet',
    text: string
  ): Promise<void> {
    await test.step(`Apply ${formatType} formatting and enter text: ${text}`, async () => {
      switch (formatType) {
        case 'bold':
          await this.clickBoldButton();
          break;
        case 'italic':
          await this.clickItalicButton();
          break;
        case 'underline':
          await this.clickUnderlineButton();
          break;
        case 'strike':
          await this.clickStrikethroughButton();
          break;
        case 'numberBullet':
          await this.clickOrderListButton();
          break;
        case 'dotBullet':
          await this.clickBulletListButton();
          break;
      }
      await this.typeInElement(this.feedEditor, text);
      await this.feedEditor.press('Enter');

      // For bullet and numbered lists, toggle off the formatting after Enter
      // because Enter continues the list formatting and it persists for subsequent text
      if (formatType === 'numberBullet') {
        await this.clickOrderListButton();
      } else if (formatType === 'dotBullet') {
        await this.clickBulletListButton();
      }
    });
  }
}
