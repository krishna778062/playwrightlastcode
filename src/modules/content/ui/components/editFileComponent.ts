import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface IEditFileActions {
  fillFileDescription: (description: string) => Promise<void>;
  clickOnUpdateButton: () => Promise<void>;
  clickOnCrossButton: () => Promise<void>;
}

export interface IEditFileAssertions {
  verifyFileDescriptionIsFilledCount: (count: number) => Promise<void>;
  verifyInputBoxHasValueOf: (characterCount: number) => Promise<void>;
}

export class EditFileComponent extends BaseComponent implements IEditFileActions, IEditFileAssertions {
  readonly fileDescriptionInput: Locator;
  readonly updateButton: Locator;
  readonly crossButton: Locator;
  constructor(page: Page) {
    super(page);
    this.fileDescriptionInput = page.getByRole('textbox', { name: 'File description' });
    this.updateButton = page.getByRole('button', { name: 'Update' });
    this.crossButton = page.locator('button.close').first();
  }

  get actions(): IEditFileActions {
    return this;
  }

  get assertions(): IEditFileAssertions {
    return this;
  }

  async fillFileDescription(description: string): Promise<void> {
    await test.step('Filling file description', async () => {
      await this.fillInElement(this.fileDescriptionInput, description);
    });
  }

  getFileDescriptionCounter(count: number): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: `${count}/250` })
      .first();
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
