import test, { Locator, Page } from '@playwright/test';

import { BasePage } from '@/src/core/ui/pages/basePage';

export class ContentPreviewPage extends BasePage {
  readonly contentThreeDotsMenu: Locator;
  readonly settingsMenuButton: Locator;
  readonly makeMustReadOption: Locator;
  readonly surveyDialog: Locator;
  readonly dismissButton: Locator;
  readonly skipButton: Locator;

  constructor(page: Page, contentUrl?: string) {
    super(page, contentUrl || '');

    this.contentThreeDotsMenu = this.page.getByRole('button', { name: 'Category option' });
    this.settingsMenuButton = this.page.getByRole('button', { name: 'Category option' });
    this.makeMustReadOption = this.page.getByRole('button', { name: "Make 'must read'" });
    this.surveyDialog = this.page.getByRole('dialog', { name: 'Survey participation prompt' });
    this.dismissButton = this.surveyDialog.getByLabel('Dismiss');
    this.skipButton = this.page.getByRole('button', { name: 'Skip this step' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the home page is loaded', async () => {
      await this.expect(
        this.page.locator('.type--h1'),
        'Expected to find Content title on content detail page'
      ).toBeVisible({
        timeout: 35_000,
      });
    });
  }

  async clickOnSkipThisStepButton(): Promise<void> {
    await test.step('Click on skip this step button', async () => {
      if (await this.skipButton.isVisible({ timeout: 2000 })) {
        await this.skipButton.click({ timeout: 2000 });
      }
    });
  }

  async closeSurveyPrompt(): Promise<void> {
    await test.step('Close survey prompt if present', async () => {
      if (await this.dismissButton.isVisible({ timeout: 2000 })) {
        await this.dismissButton.click({ timeout: 2000 });
      }
    });
  }

  async clickOnContentThreeDotsMenu(): Promise<void> {
    await test.step('Click on content three dots menu', async () => {
      await this.contentThreeDotsMenu.waitFor({ state: 'attached' });
      await this.contentThreeDotsMenu.click({ timeout: 2000 });
    });
  }

  async selectMustReadFromMenuOptions(): Promise<void> {
    await test.step('Click on make must read option', async () => {
      await this.makeMustReadOption.waitFor({ state: 'attached' });
      await this.makeMustReadOption.click({ timeout: 3000 });
    });
  }

  async navigateToContentDetail(contentId: string, siteId: string): Promise<void> {
    await test.step('Navigate to content detail page', async () => {
      const contentUrl = `${process.env.FRONTEND_BASE_URL || 'https://el.qa.simpplr.xyz'}/site/${siteId}/page/${contentId}`;
      await this.page.goto(contentUrl);

      // Verify we're on the correct page and not redirected to login
      const currentUrl = this.page.url();
      if (currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('sso')) {
        console.log('Detected login redirect, attempting to navigate again...');
        await this.page.goto(contentUrl);
      }
    });
  }
}
