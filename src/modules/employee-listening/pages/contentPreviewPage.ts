import { Page } from '@playwright/test';

import { AwarenessCheckComponent } from '../components/awarenessCheckComponent';
import { MustReadComponent } from '../components/mustReadComponent';

/**
 * ContentPreviewPage for employee-listening module
 * Provides functionality for awareness check and must-read content features
 */
export class ContentPreviewPage {
  readonly awarenessCheckComponent: AwarenessCheckComponent;
  readonly mustReadComponent: MustReadComponent;

  constructor(
    readonly page: Page,
    readonly siteId?: string,
    readonly contentId?: string,
    readonly contentType?: string
  ) {
    this.awarenessCheckComponent = new AwarenessCheckComponent(page);
    this.mustReadComponent = new MustReadComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.mustReadComponent.closeSurveyPrompt();
  }

  /**
   * Configure must read from menu options
   */
  async clickOnContentThreeDotsMenu(): Promise<void> {
    return await this.mustReadComponent.clickOnContentThreeDotsMenu();
  }

  /**
   * Select must read from menu options
   */
  async selectMustReadFromMenuOptions(): Promise<void> {
    return await this.mustReadComponent.selectMustReadFromMenuOptions();
  }

  /**
   * Navigate to content detail page
   */
  async navigateToContentDetail(contentId: string, siteId: string): Promise<void> {
    const contentUrl = `${process.env.FRONTEND_BASE_URL || 'https://el.qa.simpplr.xyz'}/site/${siteId}/page/${contentId}`;
    await this.page.goto(contentUrl);

    // Verify we're on the correct page and not redirected to login
    const currentUrl = this.page.url();
    if (currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('sso')) {
      console.log('Detected login redirect, attempting to navigate again...');
      await this.page.goto(contentUrl);
    }
  }

  async clickShareThoughtsButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Share your thought' }).click();
  }

  async clickQuestionButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Question' }).click();
  }

  async createAndPostQuestion(options: { title: string }): Promise<void> {
    await this.page.getByRole('button', { name: 'Question' }).click();
  }
}
