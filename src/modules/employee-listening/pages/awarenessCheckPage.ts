import { expect, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';

// Type definitions for awareness check functionality
export interface AwarenessCheckOptions {
  stepInfo?: string;
  timeout?: number;
}

export interface AwarenessQuestionData {
  question: string;
  answers: string[];
  correctness: string[];
}

import { AwarenessCheckDisplayComponent } from '@employee-listening/components/awarenessCheckDisplayComponent';
import { AwarenessCheckFormComponent } from '@employee-listening/components/awarenessCheckFormComponent';
import { AwarenessCheckMenuComponent } from '@employee-listening/components/awarenessCheckMenuComponent';

import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { CreateComponent } from '@/src/modules/content/components/createComponent';
// Import content creation related classes and types
import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { PageCreationOptions, PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';

export interface IAwarenessCheckActions {
  selectMustReadOption(options?: AwarenessCheckOptions): Promise<void>;
  enableAwarenessCheck(options?: AwarenessCheckOptions): Promise<void>;
  enterAwarenessQuestions(questions: AwarenessQuestionData[], options?: AwarenessCheckOptions): Promise<void>;
  enterSingleQuestion(question: string, options?: AwarenessCheckOptions): Promise<void>;
  editAwarenessQuestions(questions: AwarenessQuestionData[], options?: AwarenessCheckOptions): Promise<void>;
  clickMakeMustReadButton(options?: AwarenessCheckOptions): Promise<void>;
  hoverOverThreeDotIcon(options?: AwarenessCheckOptions): Promise<void>;
  clickMustReadHistoryButton(options?: AwarenessCheckOptions): Promise<void>;
  clickMoreButton(options?: AwarenessCheckOptions): Promise<void>;
  clickEditButton(options?: AwarenessCheckOptions): Promise<void>;
  clickButton(buttonText: string, options?: AwarenessCheckOptions): Promise<void>;
  clickUpdateButton(options?: AwarenessCheckOptions): Promise<void>;
  removeAwarenessCheck(options?: AwarenessCheckOptions): Promise<void>;
  chooseAnswer(answerText: string, options?: AwarenessCheckOptions): Promise<void>;
  clickFinishButton(options?: AwarenessCheckOptions): Promise<void>;
  clickAddAnotherQuestion(options?: AwarenessCheckOptions): Promise<void>;
  handleSkipStepIfVisible(options?: AwarenessCheckOptions): Promise<void>;
  loadRecentlyCreatedSite(options?: AwarenessCheckOptions): Promise<void>;
  createPage(options?: { pageTitle?: string; contentType?: PageContentType; stepInfo?: string }): Promise<{
    pageCreationPage: PageCreationPage;
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
  // Component instances
  readonly awarenessCheckFormComponent: AwarenessCheckFormComponent;
  readonly awarenessCheckMenuComponent: AwarenessCheckMenuComponent;
  readonly awarenessCheckDisplayComponent: AwarenessCheckDisplayComponent;

  // Page-specific locators (not in components)
  private readonly publishButton = this.page.getByRole('button', { name: 'Publish' });
  private readonly contentSuccessMessage = this.page.getByText("Created page successfully - it's published");

  // Legacy locator methods (for methods that haven't been fully refactored yet)
  private readonly questionFieldLocator = (index: number) => `input[id="questions_${index}_text"]`;
  private readonly answerFieldLocator = (questionIndex: number, answerIndex: number) =>
    `input[name="questions[${questionIndex}].options[${answerIndex}].text"]`;
  private readonly correctnessDropdownLocator = (questionIndex: number, answerIndex: number) =>
    `select[name="questions[${questionIndex}].options[${answerIndex}].correct"]`;

  constructor(page: Page) {
    super(page, '/site/c96eabdf-89cb-4631-be88-7c420c87965c/dashboard');

    // Initialize components
    this.awarenessCheckFormComponent = new AwarenessCheckFormComponent(page);
    this.awarenessCheckMenuComponent = new AwarenessCheckMenuComponent(page);
    this.awarenessCheckDisplayComponent = new AwarenessCheckDisplayComponent(page);
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

  // ==================== ACTION METHODS ===================

  async selectMustReadOption(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click must read button', async () => {
      await this.awarenessCheckMenuComponent.selectMustReadOption();
    });
  }

  async enableAwarenessCheck(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Enable awareness check', async () => {
      await this.awarenessCheckFormComponent.enableAwarenessCheck();
    });
  }

  async clickMakeMustReadButton(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Make must read', async () => {
      await this.awarenessCheckFormComponent.clickMakeMustRead();
    });
  }

  /**
   * Enters awareness check questions with answers and correctness
   */
  async enterAwarenessQuestions(questions: AwarenessQuestionData[], options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Entering ${questions.length} awareness check questions`, async () => {
      for (let i = 0; i < questions.length; i++) {
        console.log(`Processing Question ${i + 1}:`, questions[i]);

        // Fill the question input field using form component
        const questionInput = this.awarenessCheckFormComponent.getQuestionInput(i);
        await this.fillInElement(questionInput, questions[i].question, {
          stepInfo: `Fill question ${i + 1}: ${questions[i].question}`,
        });

        // Process answers for this question
        for (let j = 0; j < questions[i].answers.length; j++) {
          // Add answer field if needed (for the third and subsequent answers)
          if (j >= 2) {
            const addAnswerButton = this.page
              .locator('button.AnswerBuilder_addAnswerButton--_ibz1.AnswerBuilder_border--weT7a')
              .nth(i);
            await addAnswerButton.waitFor({ state: 'visible' });
            await addAnswerButton.click();
          }

          // Fill the answer input field using form component
          const answerInput = this.awarenessCheckFormComponent.getAnswerInput(i, j);
          await this.fillInElement(answerInput, questions[i].answers[j], {
            stepInfo: `Fill answer ${j + 1} for question ${i + 1}: ${questions[i].answers[j]}`,
          });

          // Define correctness dropdown locator
          const correctnessDropdownLocator = `select[name="questions[${i}].options[${j}].correct"]`;
          const correctnessDropdown = this.page.locator(correctnessDropdownLocator);

          console.log(`Correctness dropdown locator for Q${i + 1} A${j + 1}:`, correctnessDropdownLocator);

          // Ensure correctness exists for this answer (default to empty)
          const correctnessValue = questions[i].correctness[j] ?? ''; // Fix: Prevent undefined errors
          console.log(`Setting correctness for Q${i + 1} A${j + 1}:`, correctnessValue || 'default (not changed)');

          if (correctnessValue) {
            try {
              // Wait for correctness dropdown to be attached and selectable
              await correctnessDropdown.waitFor({
                state: 'attached',
                timeout: 5000,
              });

              // Ensure dropdown is visible before selecting correctness
              if (await correctnessDropdown.isVisible()) {
                await correctnessDropdown.selectOption({
                  value: correctnessValue,
                });
              } else {
                console.warn(`Dropdown not visible for Q${i + 1} A${j + 1}`);
              }

              // Verify the selected correctness value
              const selectedValue = await correctnessDropdown.inputValue();
              if (selectedValue !== correctnessValue) {
                console.warn(
                  `Mismatch: Expected correctness for Q${i + 1} A${
                    j + 1
                  } is '${correctnessValue}', but found '${selectedValue}'`
                );
              }
            } catch (error) {
              console.error(`Error setting correctness for Q${i + 1} A${j + 1}:`, error);
            }
          }
        }

        // Click "Add another question" only if it's not the last question
        if (i < questions.length - 1) {
          await this.awarenessCheckFormComponent.clickAddAnotherQuestion();
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
        console.log(`Processing Question ${i + 1}:`, questions[i]);

        // Fill the question input field
        const questionInput = this.awarenessCheckFormComponent.getQuestionInput(i);
        await this.fillInElement(questionInput, questions[i].question, {
          stepInfo: `Update question ${i + 1}: ${questions[i].question}`,
        });

        // Process answers for this question
        for (let j = 0; j < questions[i].answers.length; j++) {
          // Add answer field if needed (for the third and subsequent answers)
          if (j >= 2) {
            const addAnswerButton = this.page
              .locator('button.AnswerBuilder_addAnswerButton--_ibz1.AnswerBuilder_border--weT7a')
              .nth(i);
            await addAnswerButton.waitFor({ state: 'visible' });
            await addAnswerButton.click();
          }

          // Fill the answer input field using form component
          const answerInput = this.awarenessCheckFormComponent.getAnswerInput(i, j);
          await this.fillInElement(answerInput, questions[i].answers[j], {
            stepInfo: `Update answer ${j + 1} for question ${i + 1}: ${questions[i].answers[j]}`,
          });

          // Define correctness dropdown locator
          const correctnessDropdownLocator = `select[name="questions[${i}].options[${j}].correct"]`;
          const correctnessDropdown = this.page.locator(correctnessDropdownLocator);

          console.log(`Correctness dropdown locator for Q${i + 1} A${j + 1}:`, correctnessDropdownLocator);

          // Ensure correctness exists for this answer (default to empty)
          const correctnessValue = questions[i].correctness[j] ?? ''; // Fix: Prevent undefined errors
          console.log(`Setting correctness for Q${i + 1} A${j + 1}:`, correctnessValue || 'default (not changed)');

          if (correctnessValue) {
            try {
              // Wait for correctness dropdown to be attached and selectable
              await correctnessDropdown.waitFor({
                state: 'attached',
                timeout: 5000,
              });

              // Ensure dropdown is visible before selecting correctness
              if (await correctnessDropdown.isVisible()) {
                await correctnessDropdown.selectOption({
                  value: correctnessValue,
                });
              } else {
                console.warn(`Dropdown not visible for Q${i + 1} A${j + 1}`);
              }

              // Verify the selected correctness value
              const selectedValue = await correctnessDropdown.inputValue();
              if (selectedValue !== correctnessValue) {
                console.warn(
                  `Mismatch: Expected correctness for Q${i + 1} A${
                    j + 1
                  } is '${correctnessValue}', but found '${selectedValue}'`
                );
              }
            } catch (error) {
              console.error(`Error setting correctness for Q${i + 1} A${j + 1}:`, error);
            }
          }
        }

        // Click "Add another question" only if it's not the last question
        if (i < questions.length - 1) {
          await this.awarenessCheckFormComponent.clickAddAnotherQuestion();
        }
      }
    });
  }

  /**
   * Clicks the three dot icon\
   */
  async hoverOverThreeDotIcon(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click three dot icon (More button)', async () => {
      await this.awarenessCheckMenuComponent.hoverOverThreeDotIcon();
    });
  }

  /**
   * Clicks the must read history button
   */
  async clickMustReadHistoryButton(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click must read history button', async () => {
      await this.awarenessCheckMenuComponent.clickMustReadHistoryButton();
    });
  }

  /**
   * Clicks the three dot icon (More button)
   */
  async clickMoreButton(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click three dot icon (More button)', async () => {
      await this.awarenessCheckMenuComponent.clickMoreButton();
    });
  }

  /**
   * Clicks the edit button
   */
  async clickEditButton(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click edit button', async () => {
      await this.awarenessCheckMenuComponent.clickEditButton();
    });
  }

  /**
   * Clicks the update button
   */
  async clickUpdateButton(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click update button', async () => {
      await this.awarenessCheckMenuComponent.clickUpdateButton();
    });
  }

  /**
   * Clicks the remove button
   */
  async removeAwarenessCheck(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click remove button', async () => {
      await this.awarenessCheckMenuComponent.clickRemoveButton();
      await this.awarenessCheckMenuComponent.clickConfirmRemoveButton();
    });
  }
  /**
   * Clicks a button in a popup window
   */
  async clickButton(buttonText: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Click "${buttonText}" button in popup`, async () => {
      await this.awarenessCheckDisplayComponent.clickButton(buttonText);
    });
  }

  /**
   * Chooses an answer by clicking on it
   */
  async chooseAnswer(answerText: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Choose answer: ${answerText}`, async () => {
      await this.awarenessCheckDisplayComponent.chooseAnswer(answerText);
    });
  }
  /**
   * Clicks the finish button
   */
  async clickFinishButton(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click finish button', async () => {
      await this.awarenessCheckDisplayComponent.clickButton('Finish');
    });
  }

  /**
   * Clicks the "Add another question" button
   */
  async clickAddAnotherQuestion(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Click "Add another question" button', async () => {
      await this.awarenessCheckFormComponent.clickAddAnotherQuestion();
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
   * Handles the "Skip this step" button if it appears after publishing
   */
  async handleSkipStepIfVisible(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Handle Skip this step button if visible', async () => {
      const skipButton = this.page.getByRole('button', { name: 'Skip this step' });

      if (await skipButton.isVisible()) {
        await skipButton.click();
      }
      // If not visible, do nothing
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
  async createPage(options?: { pageTitle?: string; contentType?: PageContentType; stepInfo?: string }): Promise<{
    pageCreationPage: PageCreationPage;
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

      // Step 6: Fill page details and return the page creation page for publishing
      // Fill page details using the content module's proven method
      await pageCreationPage.actions.fillPageDetails({
        title: pageCreationOptions.title,
        description: pageCreationOptions.description,
        category: pageCreationOptions.category,
        contentType: pageCreationOptions.contentType,
      });

      // Step 7: Click Publish button of content creation page
      await this.clickOnElement(this.publishButton, {
        stepInfo: 'Click Publish button of content creation page',
      });

      await this.verifier.waitUntilElementIsVisible(this.contentSuccessMessage, {
        timeout: 7000,
        stepInfo: 'Wait until content success message is visible',
      });

      await this.verifier.waitUntilElementIsHidden(this.contentSuccessMessage, {
        timeout: 7000,
        stepInfo: 'Wait until content success message is hidden',
      });

      // Step 8: Handle "Skip this step" button if it appears
      await this.handleSkipStepIfVisible({
        stepInfo: 'Handle Skip this step button after publishing',
      });
      // Return the pageCreationPage instance so the test can handle publishing
      return {
        pageCreationPage,
        pageTitle,
      };
    });
  }

  /**
   * Verifies a question is visible on the screen
   */
  async verifyQuestionIsVisible(questionText: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Verify question "${questionText}" is visible`, async () => {
      const questionElement = this.awarenessCheckDisplayComponent.getQuestionByText(questionText);
      await expect(questionElement).toBeVisible();
    });
  }

  /**
   * Verifies a question is not visible on the screen
   */
  async verifyQuestionIsNotVisible(questionText: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Verify question "${questionText}" is not visible`, async () => {
      const questionElement = this.awarenessCheckDisplayComponent.getQuestionByText(questionText);
      await expect(questionElement).toHaveCount(0);
    });
  }

  /**
   * Verifies the three dot icon is not visible
   */
  async verifyThreeDotIconIsNotVisible(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Verify three dot icon is not visible', async () => {
      const isVisible = await this.awarenessCheckMenuComponent.isThreeDotIconVisible();
      expect(isVisible).toBe(false);
    });
  }

  /**
   * Verifies the edit button is not visible
   */
  async verifyEditButtonIsNotVisible(options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Verify edit button is not visible', async () => {
      const isVisible = await this.awarenessCheckMenuComponent.isEditButtonVisible();
      expect(isVisible).toBe(false);
    });
  }

  /**
   * Verifies a confirmation message is visible
   */
  async verifyConfirmationMessage(message: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Verify confirmation message: ${message}`, async () => {
      const messageElement = this.awarenessCheckDisplayComponent.getConfirmationMessage(message);
      await expect(messageElement).toBeVisible();
    });
  }

  /**
   * Verifies a popup window has the expected title
   */
  async verifyPopupTitle(title: string, options?: AwarenessCheckOptions): Promise<void> {
    await test.step(options?.stepInfo || `Verify popup title: ${title}`, async () => {
      const titleElement = this.awarenessCheckDisplayComponent.getPopupTitle(title);
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
