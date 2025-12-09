import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

export interface IEditTemplatePageActions {
  editContent: (content: string) => Promise<void>;
  clickOnUpdateButton: () => Promise<void>;
}

export interface IEditTemplatePageAssertions {
  verifyContentHasProperCharacterCount: (characterCount: number) => Promise<void>;
}

export class EditTemplatePage extends BasePage implements IEditTemplatePageActions, IEditTemplatePageAssertions {
  readonly contentEditor: Locator;
  readonly updateButton: Locator;
  constructor(page: Page) {
    super(page);
    this.contentEditor = page.getByRole('textbox', { name: 'Page content' });
    this.updateButton = page.getByRole('button', { name: 'Update' });
  }

  get actions(): IEditTemplatePageActions {
    return this;
  }

  get assertions(): IEditTemplatePageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify edit template page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contentEditor, {
        assertionMessage: 'Content editor should be visible',
      });
    });
  }
  async editContent(content: string): Promise<void> {
    await test.step('Editing content', async () => {
      await this.fillInElement(this.contentEditor, content);
    });
  }
  async verifyContentHasProperCharacterCount(characterCount: number): Promise<void> {
    await test.step('Verifying content has proper character count', async () => {
      const contentText = await this.contentEditor.textContent();
      if (contentText?.length !== characterCount) {
        throw new Error(
          `Content should have ${characterCount} characters, but got ${contentText?.length} characters. Value: "${contentText}"`
        );
      }
    });
  }
  async clickOnUpdateButton(): Promise<void> {
    await test.step('Clicking on update button', async () => {
      await this.clickOnElement(this.updateButton);
    });
  }
}
