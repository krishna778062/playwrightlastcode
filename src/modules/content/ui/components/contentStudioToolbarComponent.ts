import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface IContentStudioToolbarActions {
  clickEditCover: () => Promise<void>;
  clickAddImage: () => Promise<void>;
  getButton: (buttonName: string) => Locator;
}

export interface IContentStudioToolbarAssertions {
  verifyToolbarIsVisible: () => Promise<void>;
}

export class ContentStudioToolbarComponent
  extends BaseComponent
  implements IContentStudioToolbarActions, IContentStudioToolbarAssertions
{
  readonly toolbar: Locator;
  readonly editCoverButton: Locator;
  readonly addImageButton: Locator;

  constructor(page: Page) {
    super(page);

    this.toolbar = this.page.getByTestId('studio-toolbar');
    this.editCoverButton = this.toolbar.getByRole('button', { name: 'Edit cover' });
    this.addImageButton = this.toolbar.getByRole('button', { name: 'Add image' });
  }

  get actions(): IContentStudioToolbarActions {
    return this;
  }

  get assertions(): IContentStudioToolbarAssertions {
    return this;
  }

  /**
   * Clicks on the "Edit cover" button in the toolbar
   */
  async clickEditCover(): Promise<void> {
    await test.step('Click on Edit cover button in toolbar', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editCoverButton, {
        assertionMessage: 'Edit cover button should be visible',
      });
      await this.clickOnElement(this.editCoverButton);
    });
  }

  /**
   * Clicks on the "Add image" button in the toolbar
   */
  async clickAddImage(): Promise<void> {
    await test.step('Click on Add image button in toolbar', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addImageButton, {
        assertionMessage: 'Add image button should be visible',
      });
      await this.clickOnElement(this.addImageButton);
    });
  }

  /**
   * Gets a button locator by name (for dynamic toolbar buttons)
   * @param buttonName - The name of the button to find
   * @returns Locator for the button
   */
  getButton(buttonName: string): Locator {
    return this.toolbar.getByRole('button', { name: buttonName });
  }

  /**
   * Verifies that the Content Studio toolbar is visible
   */
  async verifyToolbarIsVisible(): Promise<void> {
    await test.step('Verify Content Studio toolbar is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.toolbar, {
        assertionMessage: 'Content Studio toolbar should be visible',
      });
    });
  }
}
