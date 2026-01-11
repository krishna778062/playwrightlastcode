import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

export class AddSiteScreenPage extends BasePage {
  readonly removeAudienceButton: Locator;
  readonly iUnderstandCheckbox: Locator;
  readonly continueButton: Locator;
  readonly browseButton: Locator;
  readonly addSiteHeading: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ADD_SITE_SCREEN_PAGE);

    // Initialize locators
    this.removeAudienceButton = this.page.getByRole('button', { name: 'Remove audience' });
    this.iUnderstandCheckbox = this.page.getByRole('checkbox', { name: 'I understand' });
    this.continueButton = this.page.getByRole('button', { name: 'Continue' });
    this.browseButton = this.page.getByRole('button', { name: 'Browse' });
    this.addSiteHeading = this.page.getByRole('heading', { name: 'Add site' });
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.addSiteHeading, {
      assertionMessage: 'Add site heading should be visible on add site screen page',
    });
  }

  async clickOnRemoveAudienceButton(): Promise<void> {
    await test.step('Click on Remove audience button', async () => {
      await this.clickOnElement(this.removeAudienceButton);
    });
  }

  async clickOnIUnderstandCheckbox(): Promise<void> {
    await test.step('Check I understand checkbox', async () => {
      await this.checkElement(this.iUnderstandCheckbox);
    });
  }

  async clickOnContinueButton(): Promise<void> {
    await test.step('Click on Continue button', async () => {
      await this.clickOnElement(this.continueButton);
    });
  }

  async clickOnBrowseButton(): Promise<void> {
    await test.step('Click on browse button', async () => {
      await this.clickOnElement(this.browseButton);
    });
  }
}
