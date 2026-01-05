import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class AwardCreationForm extends BasePage {
  readonly awardNameInput: Locator;
  readonly awardDescriptionInput: Locator;
  readonly addBadgeButton: Locator;
  readonly uploadBadgeInput: Locator;
  readonly defaultAwardBadge: Locator;
  readonly customBadgeImage: Locator;
  readonly showMoreButton: Locator;
  readonly nextButton: Locator;
  readonly createButton: Locator;
  readonly continueButton: Locator;
  readonly awardPageContainer: Locator;
  readonly skeletonButton: Locator;
  readonly plusButton: Locator;
  readonly minusButton: Locator;
  readonly rangeValueInput: Locator;

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
    this.plusButton = page.getByTestId('i-add').last();
    this.minusButton = page.getByTestId('i-subtract').last();
    this.rangeValueInput = page.locator('input[class*="NumberInput"]').last();
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.awardNameInput);
  }

  /**
   * This method returns a locator for radio by name.
   * @param {string} buttonName - name of the radio button
   * @returns {Locator} - The locator for the radio button
   */
  async checkRadioButton(fieldName: string, radioButtonName: string): Promise<Locator> {
    const radioLocator = this.page.getByTestId(`field-${fieldName}`).getByRole('radio', { name: radioButtonName });
    await radioLocator.check();
    return radioLocator;
  }

  /**
   * Verify the helper text is visible on the page.
   * @param helperText - The helper text to verify.
   * @returns The locator for the helper text.
   */
  async verifyHelperTextOnPage(helperText: string): Promise<Locator> {
    const locator = this.page.getByText(helperText, { exact: false });
    await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    await this.verifier.verifyTheElementIsVisible(locator, {
      timeout: TIMEOUTS.MEDIUM,
      assertionMessage: `Helper text "${helperText}" should be visible on page`,
    });
    return locator;
  }
}
