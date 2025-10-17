import { expect, Locator, Page, Response, test } from '@playwright/test';

import { FeedPostApiResponse } from '@content/ui/components/createFeedPostComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseComponent } from '@core/ui/components/baseComponent';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';

export interface QuestionOptions {
  title: string;
  body?: string;
  attachments?: {
    files: string[];
  };
}

export interface QuestionResult {
  questionTitle: string;
  questionBody?: string;
  attachmentCount: number;
  questionId?: string;
}

export interface ICreateQuestionActions {
  createAndPostQuestion: (options: QuestionOptions) => Promise<QuestionResult>;
  editQuestion: (currentTitle: string, newTitle: string, newBody?: string) => Promise<void>;
  createQuestion: (title: string, body?: string) => Promise<void>;
  uploadFiles: (files: string[]) => Promise<void>;
  removeAttachedFile: (index?: number) => Promise<void>;
  clickAskQuestionButton: () => Promise<Response>;
  openQuestionOptionsMenu: (questionTitle: string) => Promise<void>;
  clickEditOption: () => Promise<void>;
  updateQuestionText: (title: string, body?: string) => Promise<void>;
  clickUpdateButton: () => Promise<void>;
  selectQuestionType: () => Promise<void>;
  enterQuestionTitle: (title: string) => Promise<void>;
  enterQuestionBody: (body: string) => Promise<void>;
  addAttachment: (filePath: string) => Promise<void>;
}

export interface ICreateQuestionAssertions {
  verifyQuestionEditorVisible: () => Promise<void>;
  verifyQACreationModalIsVisible: () => Promise<void>;
  verifyTipTapEditorIsVisible: () => Promise<void>;
  verifyQuestionCreatedSuccessfully: (questionTitle: string) => Promise<void>;
  verifyQuestionVisibleInQAList: (questionTitle: string) => Promise<void>;
  verifyQuestionContentDisplayedAsPlainText: (questionBody: string) => Promise<void>;
  verifyNoAttachmentsDisplayed: () => Promise<void>;
}

export class CreateQuestionComponent
  extends BaseComponent
  implements ICreateQuestionActions, ICreateQuestionAssertions
{
  // Question editor elements
  readonly questionEditor = this.page.locator("div[aria-describedby='question-description']");
  readonly questionTitleInput = this.page.getByRole('textbox', { name: 'Question*' });
  readonly questionBodyEditor = this.page.locator(
    "div[contenteditable='true'][data-placeholder*='question' i], div[contenteditable='true'][data-placeholder*='body' i]"
  );
  readonly fileUploadInput = this.page.locator("input[type='file']");
  readonly attachedFiles = this.page.locator("div[class='FileItem-name']");
  readonly deleteFileIcon = this.page.locator("button[class*='delete']");
  readonly askQuestionButton = this.page.getByRole('button', { name: 'Ask question' });

  readonly editButton = this.page.locator("div[role='menuitem'] > div").filter({ hasText: /^Edit$/ });
  readonly updateButton = this.page.getByRole('button', { name: 'Update' });

  // Question type selection
  readonly questionTypeButton = this.page.locator(
    "button:has-text('Question'), div[role='button']:has-text('Question')"
  );

  // File upload section
  readonly fileItemNameSelector = "div[class='FileItem-name']";
  readonly deleteButtonSelector = "button[class*='delete']";

  // Dynamic locator functions
  /**
   * Gets a locator for the question text content
   * @param text - The text content to find
   * @returns Locator for the question text
   */
  readonly getQuestionTextLocator = (text: string): Locator =>
    this.page.locator("div[class*='questionContent'], div[class*='postContent']").getByText(text, { exact: true });

  /**
   * Gets a locator for the post options menu
   * @param postText - The text of the post to find options menu for
   * @returns Locator for the options menu button
   */
  readonly getQuestionOptionsMenuLocator = (postText: string): Locator =>
    this.page
      .locator('p')
      .filter({ hasText: postText })
      .locator('xpath=./ancestor::div[4]')
      .locator("button[class*='optionlauncher']")
      .first();

  constructor(page: Page) {
    super(page);
  }

  get actions(): ICreateQuestionActions {
    return this;
  }

  get assertions(): ICreateQuestionAssertions {
    return this;
  }

  /**
   * Verifies that the question creation page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify question creation page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.questionTitleInput, {
        timeout: TIMEOUTS.DEFAULT,
        assertionMessage: 'Question title input should be visible',
      });
    });
  }

  // High-level user flow methods
  async createAndPostQuestion(options: QuestionOptions): Promise<QuestionResult> {
    return await test.step(`Creating and posting question: ${options.title}`, async () => {
      await this.createQuestion(options.title, options.body);

      if (options.attachments?.files) {
        await this.uploadFiles(options.attachments.files);
      }

      // Publish the question and get the response
      const postResponse = await this.clickAskQuestionButton();

      // Parse the response to get the question ID
      const feedResponseBody = (await postResponse.json()) as FeedPostApiResponse;
      const questionId = feedResponseBody.result.feedId;
      console.log('questionId', questionId);

      return {
        questionTitle: options.title,
        questionBody: options.body,
        attachmentCount: options.attachments?.files?.length || 0,
        questionId,
      };
    });
  }

  async editQuestion(currentTitle: string, newTitle: string, newBody?: string): Promise<void> {
    await test.step(`Editing question from "${currentTitle}" to "${newTitle}"`, async () => {
      await this.openQuestionOptionsMenu(currentTitle);
      await this.clickEditOption();
      await this.verifyQuestionEditorVisible();
      await this.updateQuestionText(newTitle);
      await this.clickUpdateButton();
    });
  }

  // Content creation flow methods
  async createQuestion(title: string, body?: string): Promise<void> {
    await test.step(`Creating question with title: ${title}`, async () => {
      await this.enterQuestionTitle(title);

      if (body) {
        await this.enterQuestionBody(body);
      }
    });
  }

  async uploadFiles(files: string[]): Promise<void> {
    await test.step(`Uploading ${files.length} files`, async () => {
      for (const file of files) {
        await this.addAttachment(file);
      }
    });
  }

  async removeAttachedFile(index: number = 0): Promise<void> {
    await test.step(`Removing attached file at index ${index}`, async () => {
      const deleteButton = this.page.locator(this.deleteButtonSelector).nth(index);
      await this.clickOnElement(deleteButton);
    });
  }

  async clickAskQuestionButton(): Promise<Response> {
    return await test.step(`Creating feed post and wait for api response`, async () => {
      // Wait for button to be enabled
      await expect(this.askQuestionButton, 'Ask question button should be enabled').toBeEnabled({ timeout: 10_000 });

      const postResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.askQuestionButton, { delay: 3_000 }),
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

  async openQuestionOptionsMenu(questionTitle: string): Promise<void> {
    await test.step(`Opening options menu for question: ${questionTitle}`, async () => {
      const optionsMenu = this.getQuestionOptionsMenuLocator(questionTitle);
      await this.clickOnElement(optionsMenu);
    });
  }

  async clickEditOption(): Promise<void> {
    await test.step('Click Edit option', async () => {
      await this.clickOnElement(this.editButton);
    });
  }

  async updateQuestionText(title: string, body?: string): Promise<void> {
    await test.step(`Updating question text to: ${title}`, async () => {
      await this.enterQuestionTitle(title);

      if (body) {
        await this.enterQuestionBody(body);
      }
    });
  }

  async clickUpdateButton(): Promise<void> {
    await test.step('Click Update button', async () => {
      await this.clickOnElement(this.updateButton);
    });
  }

  async selectQuestionType(): Promise<void> {
    await test.step('Select Question type', async () => {
      await this.clickOnElement(this.questionTypeButton);
    });
  }

  async enterQuestionTitle(title: string): Promise<void> {
    await test.step(`Enter question title: ${title}`, async () => {
      await this.fillInElement(this.questionTitleInput, title);
    });
  }

  async enterQuestionBody(body: string): Promise<void> {
    await test.step(`Enter question body: ${body}`, async () => {
      await this.fillInElement(this.questionBodyEditor, body);
    });
  }

  async addAttachment(filePath: string): Promise<void> {
    await test.step(`Add attachment: ${filePath}`, async () => {
      await this.fileUploadInput.setInputFiles(filePath);
    });
  }

  // Assertion methods
  async verifyQuestionEditorVisible(): Promise<void> {
    await test.step('Verify question editor is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.questionTitleInput, {
        assertionMessage: 'Question editor should be visible',
      });
    });
  }

  async verifyQACreationModalIsVisible(): Promise<void> {
    await test.step('Verify Q&A creation modal is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.questionTitleInput, {
        assertionMessage: 'Q&A creation modal should be visible',
      });
    });
  }

  async verifyTipTapEditorIsVisible(): Promise<void> {
    await test.step('Verify TipTap editor is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.questionBodyEditor, {
        assertionMessage: 'TipTap editor should be visible',
      });
    });
  }

  async verifyQuestionCreatedSuccessfully(questionTitle: string): Promise<void> {
    await test.step(`Verify question created successfully: ${questionTitle}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getQuestionTextLocator(questionTitle), {
        timeout: TIMEOUTS.DEFAULT,
        assertionMessage: `Question "${questionTitle}" should be created successfully`,
      });
    });
  }

  async verifyQuestionVisibleInQAList(questionTitle: string): Promise<void> {
    await test.step(`Verify question visible in Q&A list: ${questionTitle}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getQuestionTextLocator(questionTitle), {
        assertionMessage: `Question "${questionTitle}" should be visible in Q&A list`,
      });
    });
  }

  async verifyQuestionContentDisplayedAsPlainText(questionBody: string): Promise<void> {
    await test.step(`Verify question content displayed as plain text: ${questionBody}`, async () => {
      await this.verifier.verifyTheElementIsVisible(
        this.page.locator("div[class*='questionContent'], div[class*='postContent']").getByText(questionBody),
        {
          assertionMessage: `Question body "${questionBody}" should be displayed as plain text`,
        }
      );
    });
  }

  async verifyNoAttachmentsDisplayed(): Promise<void> {
    await test.step('Verify no attachments are displayed', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.attachedFiles, {
        assertionMessage: 'No attachments should be displayed',
      });
    });
  }

  async verifyAskQuestionButtonIsNotDisabled(): Promise<void> {
    await test.step('Verify Ask question button is not disabled', async () => {
      await this.verifier.verifyTheElementIsVisible(this.askQuestionButton, {
        assertionMessage: 'Ask question button should be visible',
      });
      await expect(this.askQuestionButton, 'Ask question button should not be disabled').not.toBeDisabled();
    });
  }
}
