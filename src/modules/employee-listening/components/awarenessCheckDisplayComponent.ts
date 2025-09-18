import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class AwarenessCheckDisplayComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get question element by text
   */
  getQuestionByText(questionText: string): Locator {
    return this.page.getByRole('heading', { name: questionText });
  }

  /**
   * Get answer element by text
   */
  getAnswerByText(answerText: string): Locator {
    return this.page.getByRole('radio', { name: answerText });
  }

  /**
   * Get confirmation message element
   */
  getConfirmationMessage(message: string): Locator {
    return this.page.getByText(message);
  }

  /**
   * Get popup title element
   */
  getPopupTitle(title: string): Locator {
    return this.page.getByRole('heading', { name: title });
  }

  /**
   * Check if question is visible
   */
  async isQuestionVisible(questionText: string): Promise<boolean> {
    return await this.getQuestionByText(questionText).isVisible();
  }

  /**
   * Check if answer is visible
   */
  async isAnswerVisible(answerText: string): Promise<boolean> {
    return await this.getAnswerByText(answerText).isVisible();
  }

  /**
   * Choose an answer by clicking on it
   */
  async chooseAnswer(answerText: string): Promise<void> {
    await this.getAnswerByText(answerText).click();
  }
  /**
   * Click button in popup
   */
  async clickButton(buttonText: string): Promise<void> {
    await this.page.getByRole('button', { name: buttonText }).click();
  }
}
