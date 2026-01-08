import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class EditFileComponent extends BaseComponent {
  readonly fileDescriptionInput: Locator;
  readonly updateButton: Locator;
  readonly crossButton: Locator;
  readonly getFileDescriptionCounter: (count: number) => Locator;
  constructor(page: Page) {
    super(page);
    this.fileDescriptionInput = page.getByRole('textbox', { name: 'File description' });
    this.updateButton = page.getByRole('button', { name: 'Update' });
    this.crossButton = page.locator('button.close').first();
    this.getFileDescriptionCounter = (count: number) =>
      this.page
        .locator('div')
        .filter({ hasText: `${count}/250` })
        .first();
  }
  async fillFileDescription(description: string): Promise<void> {
    await test.step('Filling file description', async () => {
      await this.fillInElement(this.fileDescriptionInput, description);
    });
  }

  async clickOnUpdateButton(): Promise<void> {
    await test.step('Clicking on update button', async () => {
      await this.clickOnElement(this.updateButton);
    });
  }
  async clickOnCrossButton(): Promise<void> {
    await test.step('Clicking on cross button', async () => {
      await this.clickOnElement(this.crossButton);
    });
  }

  async verifyFileDescriptionIsFilledCount(count: number): Promise<void> {
    await test.step(`Verifying file description counter shows ${count}/250`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getFileDescriptionCounter(count), {
        assertionMessage: `File description counter should show ${count}/250`,
      });
    });
  }

  async verifyInputBoxHasValueOf(characterCount: number): Promise<void> {
    await test.step(`Verifying input box has value with ${characterCount} characters`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.fileDescriptionInput, {
        assertionMessage: 'File description input should be visible',
      });
      const inputValue = await this.fileDescriptionInput.inputValue();
      if (inputValue.length !== characterCount) {
        throw new Error(
          `Input box should have value with ${characterCount} characters, but got ${inputValue.length} characters. Value: "${inputValue}"`
        );
      }
    });
  }
}
