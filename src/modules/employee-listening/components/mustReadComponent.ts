import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class MustReadComponent extends BaseComponent {
  // Must Read specific elements
  readonly contentThreeDotsMenu: Locator;

  // Settings menu and options
  readonly settingsMenuButton: Locator;
  readonly makeMustReadOption: Locator;

  constructor(page: Page) {
    super(page);
    this.contentThreeDotsMenu = this.page.getByRole('button', { name: 'Category option' });
    // Settings menu locators
    this.settingsMenuButton = this.page.getByRole('button', { name: 'Category option' });
    this.makeMustReadOption = this.page.getByRole('button', { name: "Make 'must read'" });
  }

  async closeSurveyPrompt(): Promise<void> {
    await test.step('Close survey prompt if present', async () => {
      const surveyDialog = this.page.getByRole('dialog', { name: 'Survey participation prompt' });
      const dismissButton = surveyDialog.getByLabel('Dismiss');

      if (await dismissButton.isVisible({ timeout: 2000 })) {
        await this.clickOnElement(dismissButton, { force: true });
      }
    });
  }
  /**
   * Click on content three dots menu
   */
  async clickOnContentThreeDotsMenu(): Promise<void> {
    await test.step('Click on content three dots menu', async () => {
      await this.clickOnElement(this.contentThreeDotsMenu, { force: true });
    });
  }

  /**
   * Select from menu options for must read
   */
  async selectMustReadFromMenuOptions(): Promise<void> {
    await test.step('Click on make must read option', async () => {
      await this.clickOnElement(this.makeMustReadOption, { force: true });
    });
  }
}
