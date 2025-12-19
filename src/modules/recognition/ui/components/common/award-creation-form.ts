import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class AwardCreationForm extends BasePage {
  awardNameInput: Locator;
  awardDescriptionInput: Locator;
  addBadgeButton: Locator;
  uploadBadgeInput: Locator;
  defaultAwardBadge: Locator;
  customBadgeImage: Locator;
  showMoreButton: Locator;
  nextButton: Locator;
  createButton: Locator;
  continueButton: Locator;
  awardPageContainer: Locator;
  skeletonButton: Locator;

  constructor(page: Page) {
    super(page);
    this.awardPageContainer = page.getByTestId('pageContainer-page');
    this.awardNameInput = page.getByRole('textbox', { name: 'Award name*' });
    this.awardDescriptionInput = page.getByRole('textbox', { name: 'Award description*' });
    this.addBadgeButton = page.getByRole('button', { name: 'Add badges' });
    this.uploadBadgeInput = page.locator('input[type="file"]');
    this.defaultAwardBadge = page.locator('[class*="BadgeSelector"] img').first();
    this.customBadgeImage = page.locator('[class*="BadgeSelector"] img[alt*="badge"]');
    this.showMoreButton = page.getByRole('button', { name: 'Show more' });
    this.nextButton = this.awardPageContainer.getByRole('button', { name: 'Next' });
    this.createButton = this.awardPageContainer.getByRole('button', { name: 'Create', exact: true });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.skeletonButton = page.getByTestId('skeleton').first();
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.awardNameInput);
  }
}
