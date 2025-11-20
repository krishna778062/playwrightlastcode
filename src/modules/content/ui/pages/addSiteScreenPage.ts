import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

export interface IAddSiteScreenActions {
  clickOnRemoveAudienceButton: () => Promise<void>;
  clickOnIUnderstandCheckbox: () => Promise<void>;
  clickOnContinueButton: () => Promise<void>;
  clickOnBrowseButton: () => Promise<void>;
}

export interface IAddSiteScreenAssertions {}

export class AddSiteScreenPage extends BasePage {
  readonly removeAudienceButton = this.page.getByRole('button', { name: 'Remove audience' });
  readonly iUnderstandCheckbox = this.page.getByRole('checkbox', { name: 'I understand' });
  readonly continueButton = this.page.getByRole('button', { name: 'Continue' });
  readonly browseButton = this.page.getByRole('button', { name: 'Browse' });
  readonly addSiteHeading = this.page.getByRole('heading', { name: 'Add site' });

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ADD_SITE_SCREEN_PAGE);
  }

  get actions(): IAddSiteScreenActions {
    return this;
  }
  get assertions(): IAddSiteScreenAssertions {
    return this;
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
