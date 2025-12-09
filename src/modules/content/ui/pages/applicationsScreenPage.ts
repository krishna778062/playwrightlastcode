import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IApplicationScreenPageActions {
  clickOnApplication: () => Promise<void>;
  clickOnTopics: () => Promise<void>;
}

export class ApplicationScreenPage extends BasePage implements IApplicationScreenPageActions {
  // Application Settings locators (moved from ApplicationSettingsComponent)
  readonly applicationButton: Locator;
  readonly topicsButton: Locator;
  readonly pageHeading: Locator;
  readonly clickOnApplicationButton: Locator;
  readonly disableQuestionAndAnswer: Locator;
  readonly enableQuestionAndAnswer: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APPLICATION_SETTINGS);
    // Initialize Application Settings locators
    this.applicationButton = page.getByRole('button', { name: 'Application' });
    this.pageHeading = page.getByRole('heading', { name: 'Application settings' });
    this.topicsButton = page.locator('[data-testid="landing-page-item"]:has-text("Topics")');
    this.clickOnApplicationButton = page.getByRole('button', { name: 'Application' });
    this.pageHeading = page.getByRole('heading', { name: 'Application settings' });
    this.disableQuestionAndAnswer = page.locator('#isQuestionAnswerEnabled_false');
    this.enableQuestionAndAnswer = page.locator('#isQuestionAnswerEnabled_true');
  }

  // Actions
  get actions(): IApplicationScreenPageActions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify application settings page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageHeading, {
        assertionMessage: 'Application settings page should be visible',
      });
    });
  }

  async clickOnApplication(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.clickOnElement(this.applicationButton);
    });
  }

  async clickOnTopics(): Promise<void> {
    await test.step('Clicking on topics', async () => {
      await this.clickOnElement(this.topicsButton);
    });
  }

  async disableQuestionAndAnswerFeature(): Promise<void> {
    await test.step('Disabling question and answer feature', async () => {
      await this.clickOnElement(this.disableQuestionAndAnswer);
    });
  }

  async enableQuestionAndAnswerFeature(): Promise<void> {
    await test.step('Enabling question and answer feature', async () => {
      await this.clickOnElement(this.enableQuestionAndAnswer);
    });
  }
}
