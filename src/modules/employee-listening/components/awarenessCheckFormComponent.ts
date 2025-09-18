import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class AwarenessCheckFormComponent extends BaseComponent {
  // Form elements
  readonly enableAwarenessCheckbox: Locator;
  readonly addAnotherQuestionButton: Locator;
  readonly addAnswerButton: Locator;
  readonly makeMustReadButton: Locator;

  constructor(page: Page) {
    super(page);
    this.enableAwarenessCheckbox = this.page.getByRole('checkbox', { name: 'Enable Awareness check' });
    this.addAnotherQuestionButton = this.page.getByRole('button', { name: 'Add another question' });
    this.addAnswerButton = this.page.getByRole('button', { name: 'Add answer' });
    this.makeMustReadButton = this.page.getByRole('button', { name: 'Make must read' });
  }

  /**
   * Get question input field by index
   */
  getQuestionInput(index: number): Locator {
    return this.page.locator(`input[id="questions_${index}_text"]`);
  }

  /**
   * Get answer input field by question and answer index
   */
  getAnswerInput(questionIndex: number, answerIndex: number): Locator {
    return this.page.locator(`input[name="questions[${questionIndex}].options[${answerIndex}].text"]`);
  }

  /**
   * Get correctness dropdown by question and answer index
   */
  getCorrectnessDropdown(questionIndex: number, answerIndex: number): Locator {
    return this.page.locator(`select[id="questions_${questionIndex}_answers_${answerIndex}_correctness"]`);
  }

  /**
   * Enable awareness check checkbox
   */
  async enableAwarenessCheck(): Promise<void> {
    await this.enableAwarenessCheckbox.check();
  }

  /**
   * Click add another question button
   */
  async clickAddAnotherQuestion(): Promise<void> {
    await this.addAnotherQuestionButton.click();
  }

  /**
   * Click add answer button
   */
  async clickAddAnswer(): Promise<void> {
    await this.addAnswerButton.click();
  }

  /**
   * Click make must read button
   */
  async clickMakeMustRead(): Promise<void> {
    await this.makeMustReadButton.click();
  }
}
