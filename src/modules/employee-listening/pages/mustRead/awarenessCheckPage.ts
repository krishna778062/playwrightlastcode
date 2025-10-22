import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class AwarenessCheckPage extends BaseComponent {
  readonly awarenessCheckToggle: Locator;
  readonly browseButton: Locator;
  readonly searchField: Locator;
  readonly searchIcon: Locator;
  readonly doneButton: Locator;

  readonly questionField: (index: number) => Locator;
  readonly answerField: (questionIndex: number, answerIndex: number) => Locator;
  readonly correctnessDropdown: (questionIndex: number, answerIndex: number) => Locator;
  readonly addAnswerButton: Locator;
  readonly addAnotherQuestionButton: Locator;

  readonly makeMustReadButton: Locator;
  readonly mustReadSuccessMessage: Locator;
  readonly dismissMustReadSuccessMessage: Locator;

  readonly awarenessCheckThreeDots: Locator;
  readonly editAwarenessCheckButton: Locator;
  readonly removeAwarenessCheckButton: Locator;
  readonly confirmRemoveAwarenessCheckButton: Locator;
  readonly updateAwarenessCheckButton: Locator;

  constructor(page: Page) {
    super(page);

    this.awarenessCheckToggle = this.page.getByRole('checkbox', { name: 'Enable Awareness check' });
    this.browseButton = this.page.getByRole('button', { name: 'Browse' });
    this.searchField = this.page.getByRole('textbox', { name: 'Search…' });
    this.searchIcon = this.page.getByRole('button', { name: 'Search' });
    this.doneButton = this.page.getByRole('button', { name: 'Done' });

    this.questionField = (index: number) => this.page.locator(`input#questions_${index}_text`);
    this.answerField = (questionIndex: number, answerIndex: number) =>
      this.page.locator(`input[name="questions[${questionIndex}].options[${answerIndex}].text"]`);
    this.correctnessDropdown = (questionIndex: number, answerIndex: number) =>
      this.page.locator(`select[name="questions[${questionIndex}].options[${answerIndex}].correct"]`);
    this.addAnswerButton = this.page.locator('button.AnswerBuilder_addAnswerButton--_ibz1.AnswerBuilder_border--weT7a');
    this.addAnotherQuestionButton = this.page.getByRole('button', { name: 'Add another question' });

    this.makeMustReadButton = this.page.getByRole('button', { name: 'Make must read' });
    this.mustReadSuccessMessage = this.page.getByText("Made content 'must read'");
    this.dismissMustReadSuccessMessage = this.page.getByRole('button', { name: 'Dismiss' });

    this.awarenessCheckThreeDots = this.page.getByRole('button', { name: 'More' });
    this.editAwarenessCheckButton = this.page.getByRole('menuitem', { name: 'Edit' });
    this.removeAwarenessCheckButton = this.page.getByRole('menuitem', { name: 'Remove' });
    this.confirmRemoveAwarenessCheckButton = this.page.getByRole('button', { name: 'Remove' });
    this.updateAwarenessCheckButton = this.page.getByRole('button', { name: 'Update' });
  }

  async enableAwarenessCheck(): Promise<void> {
    await test.step('Enable Awareness Check functionality', async () => {
      await this.clickOnElement(this.awarenessCheckToggle, {
        stepInfo: 'Click Awareness check checkbox to enable',
      });
    });
  }

  async selectAudience(audience: string): Promise<void> {
    await test.step('Select Audience', async () => {
      await this.clickOnElement(this.browseButton, {
        stepInfo: 'Click Browse button to select audience',
      });
      await this.fillInElement(this.searchField, audience, {
        stepInfo: `Search for audience: ${audience}`,
      });
      await this.clickOnElement(this.searchIcon, {
        stepInfo: 'Click Search icon to find audience',
        timeout: TIMEOUTS.LONG,
      });
      await this.checkElement(this.page.getByLabel(audience, { exact: true }).getByRole('checkbox'), {
        stepInfo: `Select for audience: ${audience}`,
      });
      await this.clickOnElement(this.doneButton, {
        stepInfo: 'Click Done button to finish selecting audience',
      });
    });
  }

  async enterAwarenessQuestions(
    questions: { question: string; answers: string[]; correctness: string[] }[]
  ): Promise<void> {
    await test.step('Enter awareness check questions with answers and correctness', async () => {
      for (let i = 0; i < questions.length; i++) {
        console.log(`Processing Question ${i + 1}:`, questions[i]);

        await this.fillInElement(this.questionField(i), questions[i].question, {
          stepInfo: `Enter question ${i + 1}: "${questions[i].question}"`,
        });

        for (let j = 0; j < questions[i].answers.length; j++) {
          if (j >= 2) {
            const addAnswerButton = this.addAnswerButton.nth(i);
            await addAnswerButton.waitFor({ state: 'visible' });
            await this.clickOnElement(addAnswerButton, {
              stepInfo: `Add answer field for question ${i + 1}, answer ${j + 1}`,
            });
          }

          await this.fillInElement(this.answerField(i, j), questions[i].answers[j], {
            stepInfo: `Enter answer ${j + 1} for question ${i + 1}: "${questions[i].answers[j]}"`,
          });

          const correctnessValue = questions[i].correctness[j] ?? '';
          console.log(`Setting correctness for Q${i + 1} A${j + 1}:`, correctnessValue || 'default (not changed)');

          if (correctnessValue) {
            try {
              const correctnessDropdown = this.correctnessDropdown(i, j);

              await correctnessDropdown.waitFor({
                state: 'attached',
                timeout: 5000,
              });

              if (await correctnessDropdown.isVisible()) {
                await correctnessDropdown.selectOption({ value: correctnessValue });

                const selectedValue = await correctnessDropdown.inputValue();
                if (selectedValue !== correctnessValue) {
                  console.warn(
                    `Mismatch: Expected correctness for Q${i + 1} A${j + 1} is '${correctnessValue}', but found '${selectedValue}'`
                  );
                }
              } else {
                console.warn(`Dropdown not visible for Q${i + 1} A${j + 1}`);
              }
            } catch (error) {
              console.error(`Error setting correctness for Q${i + 1} A${j + 1}:`, error);
            }
          }
        }

        if (i < questions.length - 1) {
          await this.clickOnElement(this.addAnotherQuestionButton, {
            stepInfo: `Add another question after question ${i + 1}`,
          });
        }
      }
    });
  }

  async editAwarenessQuestions(
    formattedQuestions: { question: string; answers: string[]; correctness: string[] }[]
  ): Promise<void> {
    await test.step('Edit existing awareness check questions', async () => {
      for (let i = 0; i < formattedQuestions.length; i++) {
        const questionData = formattedQuestions[i];

        await this.fillInElement(this.questionField(i), questionData.question, {
          stepInfo: `Update question ${i + 1}: "${questionData.question}"`,
        });

        const answers = questionData.answers;
        const correctnessValues = questionData.correctness;

        for (let j = 0; j < answers.length; j++) {
          const answer = answers[j];
          const correctness = correctnessValues[j];

          await this.fillInElement(this.answerField(i, j), answer, {
            stepInfo: `Update answer ${j + 1} for question ${i + 1}: "${answer}"`,
          });

          await this.correctnessDropdown(i, j).selectOption({ value: correctness });
        }
      }
    });
  }

  async clickOnMakeMustReadButton(): Promise<void> {
    await test.step('Click on make must read button', async () => {
      await this.clickOnElement(this.makeMustReadButton, { force: true });
      await this.verifier.verifyTheElementIsVisible(this.mustReadSuccessMessage, {
        assertionMessage: 'Must read success message should be visible',
      });
    });
  }

  async verifyAwarenessCheckQuestionIsCreated(question: string): Promise<void> {
    await test.step('Verify awareness check question is created', async () => {
      const awarenessCheckQuestion = this.page.getByRole('heading', { name: question });
      await this.verifier.verifyTheElementIsVisible(awarenessCheckQuestion, {
        assertionMessage: 'Awareness check question should be visible',
      });
    });
  }

  async clickOnAwarenessThreeDots(): Promise<void> {
    await test.step('Click on edit awareness check three dots', async () => {
      await this.clickOnElement(this.awarenessCheckThreeDots, { force: true });
    });
  }

  async clickOnEditAwarenessCheck(): Promise<void> {
    await test.step('Click on edit awareness check', async () => {
      await this.clickOnElement(this.editAwarenessCheckButton, { force: true });
    });
  }

  async clickOnRemoveAwarenessCheck(): Promise<void> {
    await test.step('Click on remove awareness check', async () => {
      await this.clickOnElement(this.removeAwarenessCheckButton, { force: true });
    });
  }

  async removeAwarenessCheck(): Promise<void> {
    await test.step('Verify awareness check question is removed', async () => {
      await this.clickOnElement(this.confirmRemoveAwarenessCheckButton, { force: true });
    });
  }

  async verifyAwarenessCheckQuestionIsRemoved(question: string): Promise<void> {
    await test.step('Verify awareness check question is removed', async () => {
      const awarenessCheckQuestion = this.page.getByRole('heading', { name: question });
      await this.verifier.verifyTheElementIsNotVisible(awarenessCheckQuestion, {
        assertionMessage: 'Awareness check question should not be visible',
      });
    });
  }
}
