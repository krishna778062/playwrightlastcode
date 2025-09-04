import {
  AwarenessCheckOptions,
  AwarenessQuestion,
  AwarenessQuestionData,
} from '@employee-listening/types/awareness-check.type';
import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

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
  // Locators
  readonly addAnswerButton: Locator;
  readonly addAnotherQuestionButton: Locator;
  readonly threeDotIcon: Locator;
  readonly editButton: Locator;
  readonly pageContent: Locator;

  // Locator strings
  private readonly questionFieldLocator = (index: number) => `input[id="questions_${index}_text"]`;
  private readonly answerFieldLocator = (questionIndex: number, answerIndex: number) =>
    `input[name="questions[${questionIndex}].options[${answerIndex}].text"]`;
  private readonly correctnessDropdownLocator = (questionIndex: number, answerIndex: number) =>
    `select[name="questions[${questionIndex}].options[${answerIndex}].correct"]`;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.addAnswerButton = this.page.locator('button.AnswerBuilder_addAnswerButton--_ibz1.AnswerBuilder_border--weT7a');
    this.addAnotherQuestionButton = this.page.locator('button:has-text("Add another question")');
    this.threeDotIcon = this.page.locator('[aria-label="More"]');
    this.editButton = this.page.locator('[aria-label="Edit"]');
    this.pageContent = this.page.locator('#page-content');
  }

  /**
   * Verifies the awareness check page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the awareness check page is loaded', async () => {
      // TODO: Add proper page load verification
      // This could be checking for a specific element that indicates the page is loaded
      await expect(this.pageContent).toBeVisible();
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

  // ==================== ASSERTION METHODS ====================

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
