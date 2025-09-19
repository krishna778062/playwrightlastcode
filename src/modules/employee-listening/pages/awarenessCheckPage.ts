import {
  AwarenessCheckOptions,
  AwarenessQuestion,
  AwarenessQuestionData,
} from '@employee-listening/types/awareness-check.type';
import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { CreateComponent } from '@/src/modules/content/components/createComponent';
// Import content creation related classes and types
import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { PageCreationOptions, PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';

export interface IAwarenessCheckActions {
  toggleCheckbox(label: string, shouldCheck: boolean, options?: AwarenessCheckOptions): Promise<void>;
  enterAwarenessQuestions(questions: AwarenessQuestionData[], options?: AwarenessCheckOptions): Promise<void>;
  enterSingleQuestion(question: string, options?: AwarenessCheckOptions): Promise<void>;
  editAwarenessQuestions(questions: AwarenessQuestionData[], options?: AwarenessCheckOptions): Promise<void>;
  clickThreeDotIcon(options?: AwarenessCheckOptions): Promise<void>;
  clickButtonInPopup(buttonText: string, options?: AwarenessCheckOptions): Promise<void>;
  chooseAnswer(answerText: string, options?: AwarenessCheckOptions): Promise<void>;
  clickAddAnotherQuestion(options?: AwarenessCheckOptions): Promise<void>;
  loadRecentlyCreatedSite(options?: AwarenessCheckOptions): Promise<void>;
  createPageWithAwarenessCheck(options?: {
    pageTitle?: string;
    contentType?: PageContentType;
    stepInfo?: string;
  }): Promise<{
    pageId: string;
    siteId: string;
    pageTitle: string;
  }>;
}

export interface IAwarenessCheckAssertions {
  verifyQuestionIsVisible(questionText: string, options?: AwarenessCheckOptions): Promise<void>;
  verifyQuestionIsNotVisible(questionText: string, options?: AwarenessCheckOptions): Promise<void>;
  verifyThreeDotIconIsNotVisible(options?: AwarenessCheckOptions): Promise<void>;
  verifyEditButtonIsNotVisible(options?: AwarenessCheckOptions): Promise<void>;
  verifyConfirmationMessage(message: string, options?: AwarenessCheckOptions): Promise<void>;
  verifyPopupTitle(title: string, options?: AwarenessCheckOptions): Promise<void>;
}

export class AwarenessCheckPage extends BasePage implements IAwarenessCheckActions, IAwarenessCheckAssertions {
  // Locator strings
  private readonly questionFieldLocator = (index: number) => `input[id="questions_${index}_text"]`;
  private readonly threeDotIcon = this.page.getByRole('button', { name: 'Category option' });
  private readonly addAnotherQuestionButton = this.page.getByRole('button', { name: 'Add another question' });
  private readonly addAnswerButton = this.page.getByRole('button', { name: 'Add answer' });
  private readonly editButton = this.page.getByRole('button', { name: 'Edit' });
  private readonly answerFieldLocator = (questionIndex: number, answerIndex: number) =>
    `input[name="questions[${questionIndex}].options[${answerIndex}].text"]`;
  private readonly correctnessDropdownLocator = (questionIndex: number, answerIndex: number) =>
    `select[name="questions[${questionIndex}].options[${answerIndex}].correct"]`;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.getSiteDashboardPage('c96eabdf-89cb-4631-be88-7c420c87965c'));
  }

  /**
   * Verifies the page is loaded - now supports different page contexts
   * Since we work with dynamic page creation, we verify based on URL patterns
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the page is loaded', async () => {
      // Check if we're on a valid page by looking for common elements
      // This is more flexible than checking for a specific #page-content element
      const currentUrl = this.page.url();

      if (currentUrl.includes('/site/') && currentUrl.includes('/dashboard')) {
        // We're on a site dashboard - verify dashboard elements
        await expect(this.page.locator('main, [role="main"], .dashboard')).toBeVisible({ timeout: 10000 });
      } else if (currentUrl.includes('/site/') && currentUrl.includes('/content/')) {
        // We're on a content page - verify content elements
        await expect(this.page.locator('main, [role="main"], .content-view')).toBeVisible({ timeout: 10000 });
      } else if (currentUrl.includes('/home')) {
        // We're on home page - verify home elements
        await expect(this.page.locator('main, [role="main"], .home-page')).toBeVisible({ timeout: 10000 });
      } else {
        // Generic verification - just ensure page has loaded with main content
        await expect(this.page.locator('body')).toBeVisible({ timeout: 10000 });
        // Ensure we're not on an error page
        await expect(this.page.locator('text=error, text=Error, text=404, text=500')).toHaveCount(0);
      }
    });
  }

  // ==================== ACTION METHODS ====================

  /**
   * Toggles a checkbox by label
   */
  async toggleCheckbox(label: string, shouldCheck: boolean, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(
      options?.stepInfo || `Toggling checkbox "${label}" to ${shouldCheck ? 'checked' : 'unchecked'}`,
      async () => {
        const checkbox = this.page.getByLabel(label);

        if (shouldCheck) {
          await this.checkElement(checkbox, { stepInfo: `Check checkbox "${label}"` });
        } else {
          await this.clickOnElement(checkbox, { stepInfo: `Uncheck checkbox "${label}"` });
        }
      }
    );
  }

  /**
   * Enters awareness check questions with answers and correctness
   */
  async enterAwarenessQuestions(questions: AwarenessQuestionData[], options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Entering ${questions.length} awareness check questions`, async () => {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        // Fill the question input field
        const questionLocator = this.questionFieldLocator(i);
        await this.fillInElement(questionLocator, question.question, {
          stepInfo: `Fill question ${i + 1}: ${question.question}`,
        });

        // Process answers for this question
        for (let j = 0; j < question.answers.length; j++) {
          // Add answer field if needed (for the third and subsequent answers)
          if (j >= 2) {
            const addAnswerButton = this.addAnswerButton.nth(i);
            await addAnswerButton.waitFor({ state: 'visible' });
            await this.clickOnElement(addAnswerButton, {
              stepInfo: `Add answer field for question ${i + 1}`,
            });
          }

          // Fill the answer input field
          const answerLocator = this.answerFieldLocator(i, j);
          await this.fillInElement(answerLocator, question.answers[j], {
            stepInfo: `Fill answer ${j + 1} for question ${i + 1}: ${question.answers[j]}`,
          });

          // Set correctness if provided
          if (question.correctness[j]) {
            const correctnessLocator = this.correctnessDropdownLocator(i, j);
            await this.clickOnElement(correctnessLocator, {
              stepInfo: `Select correctness for answer ${j + 1} of question ${i + 1}`,
            });

            // TODO: Need to implement dropdown selection logic
            // This might require a more specific approach based on the actual dropdown implementation
          }
        }

        // Click "Add another question" only if it's not the last question
        if (i < questions.length - 1) {
          await this.clickAddAnotherQuestion({
            stepInfo: `Add another question after question ${i + 1}`,
          });
        }
      }
    });
  }

  /**
   * Edits existing awareness check questions
   */
  async editAwarenessQuestions(questions: AwarenessQuestionData[], options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Editing ${questions.length} awareness check questions`, async () => {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        // Update Question
        const questionLocator = this.questionFieldLocator(i);
        await this.fillInElement(questionLocator, question.question, {
          stepInfo: `Update question ${i + 1}: ${question.question}`,
        });

        // Update answers
        for (let j = 0; j < question.answers.length; j++) {
          const answerLocator = this.answerFieldLocator(i, j);
          await this.fillInElement(answerLocator, question.answers[j], {
            stepInfo: `Update answer ${j + 1} for question ${i + 1}: ${question.answers[j]}`,
          });

          // Update correctness
          if (question.correctness[j]) {
            const correctnessLocator = this.correctnessDropdownLocator(i, j);
            await this.clickOnElement(correctnessLocator, {
              stepInfo: `Update correctness for answer ${j + 1} of question ${i + 1}`,
            });

            // TODO: Need to implement dropdown selection logic
          }
        }
      }
    });
  }

  /**
   * Clicks the three dot icon (More button)
   */
  async clickThreeDotIcon(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click three dot icon (More button)', async () => {
      await this.clickOnElement(this.threeDotIcon, {
        stepInfo: 'Click three dot icon',
      });
    });
  }

  /**
   * Clicks a button in a popup window
   */
  async clickButtonInPopup(buttonText: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Click "${buttonText}" button in popup`, async () => {
      await this.clickOnButtonWithName(buttonText);
    });
  }

  /**
   * Chooses an answer by clicking on it
   */
  async chooseAnswer(answerText: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Choose answer: ${answerText}`, async () => {
      const answerElement = this.page.getByRole('heading', { name: answerText });
      await this.clickOnElement(answerElement, {
        stepInfo: `Click on answer: ${answerText}`,
      });
    });
  }

  /**
   * Clicks the "Add another question" button
   */
  async clickAddAnotherQuestion(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click "Add another question" button', async () => {
      await this.clickOnElement(this.addAnotherQuestionButton, {
        stepInfo: 'Click Add another question button',
      });
    });
  }

  /**
   * Enters a single question without answers (for admin edit scenario)
   */
  async enterSingleQuestion(question: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Enter single question: ${question}`, async () => {
      const questionLocator = this.questionFieldLocator(0);
      await this.fillInElement(questionLocator, question, {
        stepInfo: `Enter single question: ${question}`,
      });
    });
  }

  /**
   * Loads the recently created awareness check site
   * TODO: This method needs proper implementation based on the actual navigation logic
   * The original BDD code calls this.web.loadSentimentcheckSite() which seems to be
   * a navigation method that stores and retrieves URLs
   */
  async loadRecentlyCreatedSite(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Load recently created awareness check site', async () => {
      // TODO: Implement proper navigation logic
      // This should either:
      // 1. Navigate to a stored URL from previous test steps
      // 2. Navigate to a specific awareness check page
      // 3. Use some helper method to get the recently created site URL
      throw new Error('loadRecentlyCreatedSite method needs implementation - please provide navigation logic');
    });
  }

  /**
   * Creates a page with awareness check functionality using the reusable content creation workflow
   * This replaces the manual steps: Click Add Content -> Select Page -> Add -> Enter details -> Publish
   */
  async createPageWithAwarenessCheck(options?: {
    pageTitle?: string;
    contentType?: PageContentType;
    stepInfo?: string;
  }): Promise<{
    pageId: string;
    siteId: string;
    pageTitle: string;
  }> {
    return await test.step(options?.stepInfo || 'Create page with awareness check functionality', async () => {
      // Step 2: Click on Create button to open the create modal
      const createComponent = new CreateComponent(this.page);
      await this.clickOnElement(this.page.getByRole('button', { name: 'Create' }), {
        stepInfo: 'Click Create button from home page',
      });
      await createComponent.verifyTheCreateComponentIsVisible();

      // Step 3: Select Page content type and open Add Content Modal
      const addContentModal = await createComponent.selectContentTypeAndCreateContent(ContentType.PAGE, {
        stepInfo: 'Select Page content type',
      });

      // Step 4: Complete content creation form (select site, template, etc.)
      const pageCreationPage = (await addContentModal.completeContentCreationForm(ContentType.PAGE, {
        isFromHomePage: true, // We're creating from home page
      })) as PageCreationPage;

      // Step 5: Generate page creation options using TestDataGenerator (without cover image)
      const pageTitle = options?.pageTitle || `Awareness Check Test Page - ${new Date().getTime()}`;
      const contentType = options?.contentType || PageContentType.NEWS;

      const pageCreationOptions: PageCreationOptions = TestDataGenerator.generatePage(
        contentType,
        '', // Empty string to skip image upload
        'Uncategorized', // Default category
        {
          title: pageTitle,
          description: 'Test page content for awareness check functionality',
          coverImage: undefined, // Explicitly skip cover image
        }
      );

      // Step 6: Create and publish the page with increased timeout
      // Create and publish the page using the content module's proven method
      const { pageId, siteId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

      // Navigate to the created content page to continue with awareness check setup
      await this.page.goto(`/site/${siteId}/content/${pageId}`);

      return {
        pageId,
        siteId,
        pageTitle,
      };
    });
  }

  /**
   * Verifies a question is visible on the screen
   */
  async verifyQuestionIsVisible(questionText: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Verify question "${questionText}" is visible`, async () => {
      const questionElement = this.page.getByRole('heading', { name: questionText });
      await expect(questionElement).toBeVisible();
    });
  }

  /**
   * Verifies a question is not visible on the screen
   */
  async verifyQuestionIsNotVisible(questionText: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Verify question "${questionText}" is not visible`, async () => {
      const questionElement = this.page.getByRole('heading', { name: questionText });
      await expect(questionElement).toHaveCount(0);
    });
  }

  /**
   * Verifies the three dot icon is not visible
   */
  async verifyThreeDotIconIsNotVisible(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Verify three dot icon is not visible', async () => {
      await expect(this.threeDotIcon).toHaveCount(0);
    });
  }

  /**
   * Verifies the edit button is not visible
   */
  async verifyEditButtonIsNotVisible(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Verify edit button is not visible', async () => {
      await expect(this.editButton).toHaveCount(0);
    });
  }

  /**
   * Verifies a confirmation message is visible
   */
  async verifyConfirmationMessage(message: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Verify confirmation message: ${message}`, async () => {
      const messageElement = this.page.getByText("You've confirmed that you");
      const actualMessage = await messageElement.textContent();
      expect(actualMessage).toMatch(message);
    });
  }

  /**
   * Verifies a popup window has the expected title
   */
  async verifyPopupTitle(title: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Verify popup title: ${title}`, async () => {
      const titleElement = this.page.getByText(title);
      await expect(titleElement).toBeVisible();
    });
  }

  // ==================== CLEAN API GROUPING ====================

  get actions(): IAwarenessCheckActions {
    return this;
  }

  get assertions(): IAwarenessCheckAssertions {
    return this;
  }
}
